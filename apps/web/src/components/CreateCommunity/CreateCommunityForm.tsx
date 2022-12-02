import ChooseFile from '@components/Shared/ChooseFile';
import { Button } from '@components/UI/Button';
import { Card } from '@components/UI/Card';
import { Form, useZodForm } from '@components/UI/Form';
import { Input } from '@components/UI/Input';
import { Spinner } from '@components/UI/Spinner';
import { TextArea } from '@components/UI/TextArea';
import { PlusIcon } from '@heroicons/react/outline';
import getIPFSLink from '@lib/getIPFSLink';
import imageProxy from '@lib/imageProxy';
import uploadToIPFS from '@lib/uploadToIPFS';
import axios from 'axios';
import { COVER, SIGN_WALLET } from 'data/constants';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/app';
import { object, string } from 'zod';

type Props = {};

const createCommunitySchema = object({
  name: string().max(100, { message: 'Name should not exceed 100 characters' }),
  bio: string().max(260, { message: 'Bio should not exceed 260 characters' })
});

function CreateCommunityForm({}: Props) {
  const [cover, setCover] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const currentProfile = useAppStore((state) => state.currentProfile);

  const form = useZodForm({
    schema: createCommunitySchema,
    defaultValues: {
      name: '',
      bio: ''
    }
  });

  const createCommunity = async (name: string, bio: string) => {
    if (!currentProfile) {
      return toast.error(SIGN_WALLET);
    }
    setIsUploading(true);

    let createProfileResponse = await axios.post(
      'http://localhost:3001/createProfile',
      null,
      {
        params: {
          handle: name,
          profilePictureUri: cover,
          bio,
          lensToken: localStorage.getItem('accessToken')
        }
      }
      // { headers: { 'Access-Control-Allow-Origin': '*' } }
    );

    console.log(createProfileResponse.data);

    // Upload to Arweave using Bundlr

    setIsUploading(false);
  };

  const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    setUploading(true);
    try {
      console.log('uploading');
      const attachment = await uploadToIPFS(evt.target.files);
      if (attachment[0]?.item) {
        console.log(attachment[0].item);
        setCover(attachment[0].item);
      }
    } finally {
      setUploading(false);
    }
  };

  const isLoading = isUploading;

  return (
    <Card className="p-5">
      <Form
        form={form}
        className="space-y-4"
        onSubmit={({ name, bio }) => {
          createCommunity(name, bio);
        }}
      >
        {/* {error && <ErrorMessage className="mb-3" title="Transaction failed!" error={error} />} */}
        <Input label="Name" type="text" placeholder="EthIndia" {...form.register('name')} />
        <TextArea
          label="Bio"
          placeholder="Tell us something about this community!"
          rows={5}
          {...form.register('bio')}
        />
        <div className="space-y-1.5">
          <div className="label">Community Profile Pic</div>
          <div className="space-y-3">
            {cover && (
              <div>
                <img
                  className="w-60 h-60 rounded-lg"
                  src={imageProxy(getIPFSLink(cover), COVER)}
                  alt={cover}
                />
              </div>
            )}
            <div className="flex items-center space-x-3">
              <ChooseFile onChange={(evt: ChangeEvent<HTMLInputElement>) => handleUpload(evt)} />
              {uploading && <Spinner size="sm" />}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            className="ml-auto"
            type="submit"
            disabled={isLoading}
            icon={isLoading ? <Spinner size="xs" /> : <PlusIcon className="w-4 h-4" />}
          >
            Create Community
          </Button>
          {/* {txHash ? <IndexStatus txHash={txHash} /> : null} */}
        </div>
      </Form>
    </Card>
  );
}

export default CreateCommunityForm;
