import type { ApolloCache } from '@apollo/client';
import type { LensPublication } from '@generated/types';
import { ArrowSmDownIcon } from '@heroicons/react/solid';
import { publicationKeyFields } from '@lib/keyFields';
import onError from '@lib/onError';
import { SIGN_WALLET } from 'data/constants';
import { motion } from 'framer-motion';
import { ReactionTypes, useAddReactionMutation, useRemoveReactionMutation } from 'lens';
import { useRouter } from 'next/router';
import type { FC } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/app';

interface Props {
  publication: LensPublication;
  isFullPublication: boolean;
}

const DownVote: FC<Props> = ({ publication }) => {
  const { pathname } = useRouter();
  const isMirror = publication.__typename === 'Mirror';
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [downvoted, setDownvoted] = useState(
    (isMirror ? publication?.mirrorOf?.reaction : publication?.reaction) === 'UPVOTE'
  );
  console.log('publication?.stats?.totalDownvotes', publication?.stats);
  const [count, setCount] = useState(
    isMirror ? publication?.mirrorOf?.stats?.totalDownvotes : publication?.stats?.totalDownvotes
  );

  const updateCache = (cache: ApolloCache<any>, type: ReactionTypes.Upvote | ReactionTypes.Downvote) => {
    if (pathname === '/posts/[id]') {
      cache.modify({
        id: publicationKeyFields(isMirror ? publication?.mirrorOf : publication),
        fields: {
          stats: (stats) => ({
            ...stats,
            totalUpvotes: type === ReactionTypes.Upvote ? stats.totalUpvotes + 1 : stats.totalUpvotes - 1
          })
        }
      });
    }
  };

  const [addReaction] = useAddReactionMutation({
    onCompleted: () => {},
    onError: (error) => {
      setDownvoted(!downvoted);
      setCount(count - 1);
      onError(error);
    },
    update: (cache) => updateCache(cache, ReactionTypes.Upvote)
  });

  const [removeReaction] = useRemoveReactionMutation({
    onCompleted: () => {},
    onError: (error) => {
      setDownvoted(!downvoted);
      setCount(count + 1);
      onError(error);
    },
    update: (cache) => updateCache(cache, ReactionTypes.Downvote)
  });

  const createDownvote = () => {
    if (!currentProfile) {
      return toast.error(SIGN_WALLET);
    }

    const variable = {
      variables: {
        request: {
          profileId: currentProfile?.id,
          reaction: ReactionTypes.Upvote,
          publicationId: publication.__typename === 'Mirror' ? publication?.mirrorOf?.id : publication?.id
        }
      }
    };

    if (downvoted) {
      setDownvoted(false);
      setCount(count - 1);
      removeReaction(variable);
    } else {
      setDownvoted(true);
      setCount(count + 1);
      addReaction(variable);
    }
  };

  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={createDownvote} aria-label="DownVote">
      <span
        className={`flex items-center space-x-2 dark:text-gray-400 text-gray-500 hover:bg-blue-300 hover:bg-opacity-20 px-2 py-1 rounded-xl ${
          downvoted ? 'text-red-600' : 'text-gray-500'
        }`}
      >
        <span className="">
          <span className="">
            <ArrowSmDownIcon className={`w-7 h-7 ${downvoted ? 'text-red-500' : 'text-gray-500'}`} />
          </span>
        </span>
        <span className="text-[11px] sm:text-sm">{count}</span>
      </span>
    </motion.button>
  );
};

export default DownVote;
