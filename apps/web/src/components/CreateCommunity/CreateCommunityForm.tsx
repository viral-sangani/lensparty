import ChooseFile from '@components/Shared/ChooseFile';
import IndexStatus from '@components/Shared/IndexStatus';
import { Button } from '@components/UI/Button';
import { Card } from '@components/UI/Card';
import { Form, useZodForm } from '@components/UI/Form';
import { Input } from '@components/UI/Input';
import { Spinner } from '@components/UI/Spinner';
import { TagInput } from '@components/UI/TagInput';
import { TextArea } from '@components/UI/TextArea';
import { Toggle } from '@components/UI/Toggle';
import { CollectionIcon, PhotographIcon, PlusIcon, XIcon } from '@heroicons/react/outline';
import getIPFSLink from '@lib/getIPFSLink';
import getTokenImage from '@lib/getTokenImage';
import imageProxy from '@lib/imageProxy';
import onError from '@lib/onError';
import uploadToIPFS from '@lib/uploadToIPFS';
import axios from 'axios';
import { COVER, DEFAULT_COLLECT_TOKEN, SIGN_WALLET } from 'data/constants';
import type { Erc20 } from 'lens';
import { useEnabledCurrencyModulesWithProfileQuery } from 'lens';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [txHash, setTxHash] = useState('');
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [collectFees, setCollectFees] = useState(false);

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [nftCollection, setNftCollection] = useState('');

  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_COLLECT_TOKEN);
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState('WMATIC');
  const [nftGating, setNftGating] = useState(false);
  const { data: currencyData, loading } = useEnabledCurrencyModulesWithProfileQuery({
    variables: { request: { profileId: currentProfile?.id } },
    skip: !currentProfile?.id
  });

  const [tags, setTags] = useState<string[]>([]);

  const form = useZodForm({
    schema: createCommunitySchema,
    defaultValues: {
      name: '',
      bio: ''
    }
  });

  const createCommunity = async (name: string, bio: string) => {
    if (cover === '') {
      onError({
        message: 'Please add a profile image for your community'
      });
    } else if (collectFees && amount === '') {
      onError({
        message: 'Please add amount value'
      });
    } else if (nftGating && nftCollection === '') {
      onError({
        message: 'Please add NFT collection address'
      });
    } else if (collectFees && amount === '') {
      onError({
        message: 'Please add amount value'
      });
    } else {
      try {
        if (!currentProfile) {
          return toast.error(SIGN_WALLET);
        }
        setIsUploading(true);

        let createProfileResponse = await axios.post('http://localhost:3001/createProfile', {
          handle: name,
          profilePictureUri: cover,
          bio,
          lensToken: localStorage.getItem('accessToken'),
          // join tags and create a list
          tag: tags ? tags.join(',') : '',
          feeFollowModule: collectFees
            ? {
                amount: {
                  currency: selectedCurrency,
                  value: amount
                },
                recipient: recipient
              }
            : null,
          nftCollection: nftGating ? nftCollection : null
        });
        let tx = createProfileResponse.data.data.txHash;
        setTxHash(tx);
        setIsIndexing(true);
        await axios.get(`http://localhost:3001/hastransactionbeenindexed?txHash=${tx}`);
        setIsIndexing(false);
        setIsUploading(false);
        router.push(`/c/${name}.test`);
      } catch (error) {
        onError(error);
        setIsIndexing(false);
        setIsUploading(false);
      }
    }
  };

  const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    setUploading(true);
    try {
      const attachment = await uploadToIPFS(evt.target.files);
      if (attachment[0]?.item) {
        console.log(attachment[0].item);
        setCover(attachment[0].item);
      }
    } finally {
      setUploading(false);
    }
  };

  const isLoading = isUploading || uploading || isIndexing || loading;

  if (loading) {
    return (
      <Card>
        <div className="p-5 py-10 space-y-2 text-center">
          <Spinner size="md" className="mx-auto" />
          <div>Loading super follow settings</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <span className="text-2xl">Create Community</span>
      <Form
        form={form}
        className="space-y-4 mt-4"
        onSubmit={({ name, bio }) => {
          createCommunity(name, bio);
        }}
      >
        {/* {error && <ErrorMessage className="mb-3" title="Transaction failed!" error={error} />} */}
        <Input required label="Name" type="text" placeholder="EthIndia" {...form.register('name')} />
        <TextArea
          required
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

        <div className="space-y-1.5">
          <div className="label">Enter the Tags</div>
          <div className="space-y-3">
            <TagInput setTags={setTags} placeholder="Enter the tags" className="w-full" />
          </div>
          {tags && (
            <div className="flex flex-row space-x-2 pt-2 flex-nowrap">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex flex-row items-center bg-gray-600 px-2 py-0.5  text-sm rounded-lg"
                >
                  <XIcon
                    className="w-4 h-4 mr-1 cursor-pointer"
                    // on click remove the item from tags
                    onClick={() => {
                      setTags(tags.filter((item) => item !== tag));
                    }}
                  />
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-2 pt-3">
            <div className="flex items-center space-x-2">
              <CollectionIcon className="h-4 w-4 text-brand-500" />
              <span>Collect Fees?</span>
            </div>
            <div className="flex items-center space-x-2">
              <Toggle on={collectFees} setOn={() => setCollectFees(!collectFees)} />
              <div className="text-gray-500 dark:text-gray-400 text-sm font-bold">
                Get paid whenever someone follows this account?
              </div>
            </div>
          </div>
          {collectFees && (
            <div className="flex flex-col space-y-2">
              <div className="pt-2">
                <div className="label">Select Currency</div>
                <select
                  className="w-full bg-white rounded-xl border border-gray-300 outline-none dark:bg-gray-800 disabled:bg-gray-500 disabled:bg-opacity-20 disabled:opacity-60 dark:border-gray-700/80 focus:border-brand-500 focus:ring-brand-400"
                  onChange={(e) => {
                    const currency = e.target.value.split('-');
                    setSelectedCurrency(currency[0]);
                    setSelectedCurrencySymbol(currency[1]);
                  }}
                >
                  {currencyData?.enabledModuleCurrencies?.map((currency: Erc20) => (
                    <option key={currency.address} value={`${currency.address}-${currency.symbol}`}>
                      {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Follow amount"
                type="number"
                step="0.0001"
                min="0"
                required={false}
                max="100000"
                name="amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                prefix={
                  <img
                    className="w-6 h-6"
                    height={24}
                    width={24}
                    src={getTokenImage(selectedCurrencySymbol)}
                    alt={selectedCurrencySymbol}
                  />
                }
                placeholder="5"
              />
              <Input
                name="recipient"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                }}
                label="Funds recipient"
                type="text"
                placeholder="0x3A5bd...5e3"
                required={false}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-2 pt-3">
            <div className="flex items-center space-x-2">
              <PhotographIcon className="h-4 w-4 text-brand-500" />
              <span>NFT gating?</span>
            </div>
            <div className="flex items-center space-x-2">
              <Toggle on={nftGating} setOn={() => setNftGating(!nftGating)} />
              <div className="text-gray-500 dark:text-gray-400 text-sm font-bold">
                Only NFT holders can follow this account.
              </div>
            </div>
          </div>
          {nftGating && (
            <div className="flex flex-col space-y-2">
              <Input
                label="NFT collection Address"
                type="text"
                placeholder="0x3A5bd...5e3"
                name="nftColection"
                value={nftCollection}
                onChange={(e) => {
                  setNftCollection(e.target.value);
                }}
              />
            </div>
          )}
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
          {txHash ? <IndexStatus txHash={txHash} /> : null}
        </div>
      </Form>
    </Card>
  );
}

export default CreateCommunityForm;
