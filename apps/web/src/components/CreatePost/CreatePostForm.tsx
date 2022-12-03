/* eslint-disable simple-import-sort/imports */
import CollectSettings from '@components/Composer/Actions/CollectSettings';
import Giphy from '@components/Composer/Actions/Giphy';
import UploadImageAttachment from '@components/Composer/Actions/UploadImageAttachment';
import UploadVideoAttachment from '@components/Composer/Actions/UploadVideoAttachment';
import Editor from '@components/Composer/Editor';
import Attachments from '@components/Shared/Attachments';
import withLexicalContext from '@components/Shared/Lexical/withLexicalContext';
import { Button } from '@components/UI/Button';
import { Card } from '@components/UI/Card';
import { Input } from '@components/UI/Input';
import { Spinner } from '@components/UI/Spinner';
import type { LensterAttachment } from '@generated/types';
import type { IGif } from '@giphy/js-types';
import { PencilAltIcon } from '@heroicons/react/outline';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import getProfileType from '@lib/getProfileType';
import getTags from '@lib/getTags';
import getTextNftUrl from '@lib/getTextNftUrl';
import getUserLocale from '@lib/getUserLocale';
import onError from '@lib/onError';
import trimify from '@lib/trimify';
import uploadToArweave from '@lib/uploadToArweave';
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, APP_NAME, SIGN_WALLET } from 'data/constants';
import type { Profile } from 'lens';
import { PublicationMainFocus, ReferenceModules, useCreatePostViaDispatcherMutation } from 'lens';
import { $getRoot } from 'lexical';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/app';
import { useCollectModuleStore } from 'src/store/collect-module';
import { useCreatePostFormStore } from 'src/store/create-post-form';
import { usePublicationStore } from 'src/store/publication';
import { useReferenceModuleStore } from 'src/store/reference-module';
import { useTransactionPersistStore } from 'src/store/transaction';
import { v4 as uuid } from 'uuid';

interface Props {}

const CreatePostForm: FC<Props> = () => {
  const profile = useCreatePostFormStore((state) => state.profile);
  let forCommunity: boolean = getProfileType(profile as Profile) === 'COMMUNITY';

  const currentProfile = useAppStore((state) => state.currentProfile);
  const publicationContent = usePublicationStore((state) => state.publicationContent);
  const setPublicationContent = usePublicationStore((state) => state.setPublicationContent);
  const payload = useCollectModuleStore((state) => state.payload);
  const [editor] = useLexicalComposerContext();
  const resetCollectSettings = useCollectModuleStore((state) => state.reset);
  const setTxnQueue = useTransactionPersistStore((state) => state.setTxnQueue);
  const txnQueue = useTransactionPersistStore((state) => state.txnQueue);
  const selectedReferenceModule = useReferenceModuleStore((state) => state.selectedReferenceModule);
  const onlyFollowers = useReferenceModuleStore((state) => state.onlyFollowers);
  const degreesOfSeparation = useReferenceModuleStore((state) => state.degreesOfSeparation);
  const [txHash, setTxHash] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publicationContentError, setPublicationContentError] = useState('');
  const [attachments, setAttachments] = useState<LensterAttachment[]>([]);

  useEffect(() => {
    editor.update(() => {
      $convertFromMarkdownString(publicationContent);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMainContent = () => {
    if (attachments.length > 0) {
      if (ALLOWED_IMAGE_TYPES.includes(attachments[0]?.type)) {
        return PublicationMainFocus.Image;
      } else if (ALLOWED_VIDEO_TYPES.includes(attachments[0]?.type)) {
        return PublicationMainFocus.Video;
      }
    } else {
      return PublicationMainFocus.TextOnly;
    }
  };

  const getAnimationUrl = () => {
    if (attachments.length > 0 && ALLOWED_VIDEO_TYPES.includes(attachments[0]?.type)) {
      return attachments[0]?.item;
    }
    return null;
  };

  const setGifAttachment = (gif: IGif) => {
    const attachment = {
      item: gif.images.original.url,
      type: 'image/gif',
      altTag: gif.title
    };
    setAttachments([...attachments, attachment]);
  };

  const onCompleted = () => {
    editor.update(() => {
      $getRoot().clear();
    });
    setPublicationContent('');
    setAttachments([]);
    resetCollectSettings();
  };

  const generateOptimisticPublication = ({ txHash, txId }: { txHash?: string; txId?: string }) => {
    return {
      id: uuid(),
      type: 'NEW_POST',
      txHash,
      txId,
      content: publicationContent,
      attachments
    };
  };

  const [createPostViaDispatcher] = useCreatePostViaDispatcherMutation({
    onCompleted: (data) => {
      onCompleted();
      if (data.createPostViaDispatcher.__typename === 'RelayerResult') {
        setTxnQueue([
          generateOptimisticPublication({ txId: data.createPostViaDispatcher.txId }),
          ...txnQueue
        ]);
      }
    },
    onError
  });

  const createPublication = async () => {
    if (!currentProfile) {
      return toast.error(SIGN_WALLET);
    }

    try {
      if (publicationContent.length === 0 && attachments.length === 0) {
        return setPublicationContentError(`Post should not be empty!`);
      }
      setPublicationContentError('');
      let textNftImageUrl = null;
      if (!attachments.length) {
        textNftImageUrl = await getTextNftUrl(
          publicationContent,
          currentProfile.handle,
          new Date().toLocaleString()
        );
      }

      const attributes = [
        {
          traitType: 'type',
          displayType: 'string',
          value: getMainContent()?.toLowerCase()
        },
        {
          displayType: 'string',
          traitType: 'postedBy',
          value: currentProfile.ownedBy
        },
        {
          displayType: 'string',
          traitType: 'postedByHandle',
          value: currentProfile.handle
        },
        {
          displayType: 'string',
          traitType: 'postedByProfileId',
          value: currentProfile.id
        }
      ];
      console.log('here :>> ');
      const id = await uploadToArweave({
        version: '2.0.0',
        metadata_id: uuid(),
        description: trimify(publicationContent),
        content: trimify(publicationContent),
        external_url: `https://lensparty.xyz/u/${currentProfile?.handle}`,
        image: attachments.length > 0 ? attachments[0]?.item : textNftImageUrl,
        imageMimeType: attachments.length > 0 ? attachments[0]?.type : 'image/svg+xml',
        name: `Posted by by u/${currentProfile?.handle} ${forCommunity && `in ${profile?.handle}`}`,
        tags: getTags(publicationContent),
        animation_url: getAnimationUrl(),
        mainContentFocus: getMainContent(),
        contentWarning: null,
        attributes,
        media: attachments,
        locale: getUserLocale(),
        createdOn: new Date(),
        appId: APP_NAME
      });
      if (forCommunity) {
        console.log('Request', {
          profileId: profile?.id,
          posterProfileId: currentProfile.id,
          collectModule: payload,
          lensToken: localStorage.getItem('accessToken'),
          contentURI: `https://arweave.net/${id}`
        });
        // let createPostResponse = await axios.post('http://localhost:3001/createPost', {
        //   profileId: profile?.id,
        //   posterProfileId: currentProfile.id,
        //   collectModule: payload,
        //   lensToken: localStorage.getItem('lensToken'),
        //   contentURI: `https://arweave.net/${id}`
        // });
        // console.log('createPostResponse.data', createPostResponse.data);
        // let tx = createPostResponse.data.data.txHash;
        // setTxHash(tx);
        // setIsIndexing(true);
        // console.log('WAITING...');
        // await axios.get(`http://localhost:3001/hastransactionbeenindexed?txHash=${tx}`);
        // setIsIndexing(false);
        // console.log('DOME...');
      } else {
        const request = {
          profileId: currentProfile?.id,
          contentURI: `https://arweave.net/${id}`,
          collectModule: payload,
          referenceModule:
            selectedReferenceModule === ReferenceModules.FollowerOnlyReferenceModule
              ? { followerOnlyReferenceModule: onlyFollowers ? true : false }
              : {
                  degreesOfSeparationReferenceModule: {
                    commentsRestricted: true,
                    mirrorsRestricted: true,
                    degreesOfSeparation
                  }
                }
        };

        await createPostViaDispatcher({ variables: { request } });
      }
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={'pb-3'}>
      {/* {error && <ErrorMessage className="mb-3" title="Transaction failed!" error={error} />} */}
      <div className="title w-full flex justify-center mt-5">
        <span className="text-2xl">Create Post</span>
      </div>
      <div className="px-5 mt-3">
        <Input label="Title" type="text" placeholder="EthIndia" />
      </div>
      <div className="mx-5 my-5 order border border-gray-300 dark:border-gray-700/80 rounded-xl">
        <Editor />
      </div>
      {publicationContentError && (
        <div className="px-5 pb-3 mt-1 text-sm font-bold text-red-500">{publicationContentError}</div>
      )}
      <div className="flex flex-col space-y-2 items-center sm:flex px-5">
        <div className="grid grid-rows-2 grid-cols-2 gap-2 w-full">
          <UploadImageAttachment attachments={attachments} setAttachments={setAttachments} />
          <UploadVideoAttachment attachments={attachments} setAttachments={setAttachments} />
          <Giphy setGifAttachment={(gif: IGif) => setGifAttachment(gif)} />
          <CollectSettings forCommunity={forCommunity} />
        </div>
        <div className="ml-auto pt-2 sm:pt-0">
          <Button
            disabled={isSubmitting}
            icon={isSubmitting ? <Spinner size="xs" /> : <PencilAltIcon className="w-4 h-4" />}
            onClick={createPublication}
          >
            {'Post'}
          </Button>
        </div>
      </div>
      <div className="px-5">
        <Attachments attachments={attachments} setAttachments={setAttachments} isNew />
      </div>
    </Card>
  );
};

export default withLexicalContext(CreatePostForm);
