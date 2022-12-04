import IndexStatus from '@components/Shared/IndexStatus';
import { Button } from '@components/UI/Button';
import { Card } from '@components/UI/Card';
import { ErrorMessage } from '@components/UI/ErrorMessage';
import { Form, useZodForm } from '@components/UI/Form';
import { Input } from '@components/UI/Input';
import { Spinner } from '@components/UI/Spinner';
import { TextArea } from '@components/UI/TextArea';
import useBroadcast from '@components/utils/hooks/useBroadcast';
import { PencilIcon } from '@heroicons/react/outline';
import getAttribute from '@lib/getAttribute';
import getProfileType from '@lib/getProfileType';
import getSignature from '@lib/getSignature';
import onError from '@lib/onError';
import splitSignature from '@lib/splitSignature';
import uploadToArweave from '@lib/uploadToArweave';
import { LensPeriphery } from 'abis';
import axios from 'axios';
import {
  APP_NAME,
  LENS_PERIPHERY,
  RELAY_ON,
  SERVER_API_ADDRESS,
  SIGN_WALLET,
  URL_REGEX
} from 'data/constants';
import type { CreatePublicSetProfileMetadataUriRequest, MediaSet } from 'lens';
import {
  Profile,
  useCreateSetProfileMetadataTypedDataMutation,
  useCreateSetProfileMetadataViaDispatcherMutation
} from 'lens';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/app';
import { v4 as uuid } from 'uuid';
import { useContractWrite, useSignTypedData } from 'wagmi';
import { object, string, union } from 'zod';

const editProfileSchema = object({
  name: string().max(100, { message: 'Name should not exceed 100 characters' }),
  website: union([string().regex(URL_REGEX, { message: 'Invalid website' }), string().max(0)]),
  twitter: string().max(100, {
    message: 'Twitter should not exceed 100 characters'
  }),
  bio: string().max(260, { message: 'Bio should not exceed 260 characters' })
});

interface Props {
  profile: Profile & { coverPicture: MediaSet };
}

const Profile: FC<Props> = ({ profile }) => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [cover, setCover] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const profileType = getProfileType(profile);
  const [tx, setTx] = useState();
  const [isIndexing, setIsIndexing] = useState(false);

  const onCompleted = () => {
    toast.success('Profile updated successfully!');
  };

  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({ onError });

  const {
    data: writeData,
    isLoading: writeLoading,
    error,
    write
  } = useContractWrite({
    address: LENS_PERIPHERY,
    abi: LensPeriphery,
    functionName: 'setProfileMetadataURIWithSig',
    mode: 'recklesslyUnprepared',
    onSuccess: onCompleted,
    onError
  });

  const { broadcast, data: broadcastData, loading: broadcastLoading } = useBroadcast({ onCompleted });
  const [createSetProfileMetadataTypedData, { loading: typedDataLoading }] =
    useCreateSetProfileMetadataTypedDataMutation({
      onCompleted: async ({ createSetProfileMetadataTypedData }) => {
        try {
          const { id, typedData } = createSetProfileMetadataTypedData;
          const { profileId, metadata, deadline } = typedData.value;
          const signature = await signTypedDataAsync(getSignature(typedData));
          const { v, r, s } = splitSignature(signature);
          const sig = { v, r, s, deadline };
          const inputStruct = {
            user: currentProfile?.ownedBy,
            profileId,
            metadata,
            sig
          };

          if (!RELAY_ON) {
            return write?.({ recklesslySetUnpreparedArgs: [inputStruct] });
          }

          const {
            data: { broadcast: result }
          } = await broadcast({ request: { id, signature } });

          if ('reason' in result) {
            write?.({ recklesslySetUnpreparedArgs: [inputStruct] });
          }
        } catch {}
      },
      onError
    });

  const [createSetProfileMetadataViaDispatcher, { data: dispatcherData, loading: dispatcherLoading }] =
    useCreateSetProfileMetadataViaDispatcherMutation({ onCompleted, onError });

  const createViaDispatcher = async (request: CreatePublicSetProfileMetadataUriRequest) => {
    const { data } = await createSetProfileMetadataViaDispatcher({
      variables: { request }
    });
    if (data?.createSetProfileMetadataViaDispatcher?.__typename === 'RelayError') {
      createSetProfileMetadataTypedData({
        variables: { request }
      });
    }
  };

  useEffect(() => {
    if (profile?.coverPicture?.original?.url) {
      setCover(profile?.coverPicture?.original?.url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useZodForm({
    schema: editProfileSchema,
    defaultValues: {
      name: profile?.name ?? '',
      website: getAttribute(profile?.attributes, 'website'),
      twitter: getAttribute(profile?.attributes, 'twitter')?.replace('https://twitter.com/', ''),
      bio: profile?.bio ?? ''
    }
  });

  const editProfile = async (
    name: string,
    website?: string | null,
    twitter?: string | null,
    bio?: string | null
  ) => {
    if (!currentProfile) {
      return toast.error(SIGN_WALLET);
    }
    setIsUploading(true);
    const reqObj = {
      name,
      bio,
      cover_picture: cover ? cover : null,
      attributes: [
        { traitType: 'string', key: 'website', value: website },
        { traitType: 'string', key: 'twitter', value: twitter }
      ],
      version: '1.0.0',
      metadata_id: uuid(),
      appId: APP_NAME
    };

    if (profileType === 'COMMUNITY') {
      console.log(`reqObj`);
      console.log(profile.id);
      console.log('localStorage', localStorage.getItem('accessToken'));

      let createProfileResponse = await axios.post(`${SERVER_API_ADDRESS}/setProfileMetadata`, {
        profileId: profile.id,
        lensToken: localStorage.getItem('accessToken'),
        metadata: reqObj
      });
      let tx = createProfileResponse.data.data.txHash;
      setTx(tx);
      setIsIndexing(true);
      await axios.get(`${SERVER_API_ADDRESS}/hastransactionbeenindexed?txHash=${tx}`);
      setIsIndexing(false);
      setIsUploading(false);
    } else {
      const id = await uploadToArweave(reqObj).finally(() => setIsUploading(false));

      const request = {
        profileId: currentProfile?.id,
        metadata: `https://arweave.net/${id}`
      };

      if (currentProfile?.dispatcher?.canUseRelay) {
        createViaDispatcher(request);
      } else {
        createSetProfileMetadataTypedData({
          variables: { request }
        });
      }
    }
  };

  const isLoading =
    isUploading ||
    typedDataLoading ||
    dispatcherLoading ||
    signLoading ||
    writeLoading ||
    broadcastLoading ||
    isIndexing;

  const txHash =
    writeData?.hash ??
    broadcastData?.broadcast?.txHash ??
    (dispatcherData?.createSetProfileMetadataViaDispatcher.__typename === 'RelayerResult' &&
      dispatcherData?.createSetProfileMetadataViaDispatcher.txHash);

  return (
    <Card className="p-5">
      <Form
        form={form}
        className="space-y-4"
        onSubmit={({ name, website, twitter, bio }) => {
          editProfile(name, website, twitter, bio);
        }}
      >
        {error && <ErrorMessage className="mb-3" title="Transaction failed!" error={error} />}
        <Input label="Profile Id" type="text" value={profile?.id} disabled />
        <Input label="Name" type="text" placeholder="Gavin" {...form.register('name')} />
        <Input label="Website" type="text" placeholder="https://ethindia.com" {...form.register('website')} />
        <Input
          label="Twitter"
          type="text"
          prefix="https://twitter.com/"
          placeholder="gavin"
          {...form.register('twitter')}
        />
        <TextArea label="Bio" placeholder="Tell us something about you!" {...form.register('bio')} />

        <div className="flex flex-col space-y-2">
          <Button
            className="ml-auto"
            type="submit"
            disabled={isLoading}
            icon={isLoading ? <Spinner size="xs" /> : <PencilIcon className="w-4 h-4" />}
          >
            Save
          </Button>
          {txHash ? <IndexStatus txHash={txHash} /> : null}
        </div>
      </Form>
    </Card>
  );
};

export default Profile;
