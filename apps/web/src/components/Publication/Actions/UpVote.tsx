import type { ApolloCache } from '@apollo/client';
import type { LensPublication } from '@generated/types';
import { ArrowSmUpIcon } from '@heroicons/react/solid';
import { publicationKeyFields } from '@lib/keyFields';
import nFormatter from '@lib/nFormatter';
import onError from '@lib/onError';
import { SIGN_WALLET } from 'data/constants';
import { motion } from 'framer-motion';
import { ReactionTypes, useAddReactionMutation, useRemoveReactionMutation } from 'lens';
import { useRouter } from 'next/router';
import type { FC } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/app';
import { useReactionStore } from 'src/store/reactionStore';

interface Props {
  publication: LensPublication;
  isFullPublication: boolean;
}

const UpVote: FC<Props> = ({ publication }) => {
  const { pathname } = useRouter();
  const isMirror = publication.__typename === 'Mirror';
  const currentProfile = useAppStore((state) => state.currentProfile);
  const hasUpVoted = useReactionStore((state) => state.hasUpVoted);
  const hasDownVoted = useReactionStore((state) => state.hasDownVoted);
  const totalUpVotes = useReactionStore((state) => state.totalUpVotes);
  const totalDownVotes = useReactionStore((state) => state.totalDownVotes);
  const setHasUpVoted = useReactionStore((state) => state.setHasUpVoted);
  const setHasDownVoted = useReactionStore((state) => state.setHasDownVoted);
  const setTotalUpVotes = useReactionStore((state) => state.setTotalUpVotes);
  const setTotalDownVotes = useReactionStore((state) => state.setTotalDownVotes);

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
      setHasUpVoted(!hasUpVoted);
      setTotalUpVotes(totalUpVotes - 1);
      onError(error);
    },
    update: (cache) => updateCache(cache, ReactionTypes.Upvote)
  });

  const [removeReaction] = useRemoveReactionMutation({
    onCompleted: () => {},
    onError: (error) => {
      setHasUpVoted(!hasUpVoted);
      setTotalUpVotes(totalUpVotes + 1);
      onError(error);
    },
    update: (cache) => updateCache(cache, ReactionTypes.Upvote)
  });

  const createUpvote = () => {
    if (!currentProfile) {
      return toast.error(SIGN_WALLET);
    }

    const upVoteVariable = {
      variables: {
        request: {
          profileId: currentProfile?.id,
          reaction: ReactionTypes.Upvote,
          publicationId: publication.__typename === 'Mirror' ? publication?.mirrorOf?.id : publication?.id
        }
      }
    };
    const downVoteVariable = {
      variables: {
        request: {
          profileId: currentProfile?.id,
          reaction: ReactionTypes.Downvote,
          publicationId: publication.__typename === 'Mirror' ? publication?.mirrorOf?.id : publication?.id
        }
      }
    };

    if (hasUpVoted) {
      console.log('1');
      setHasUpVoted(!hasUpVoted);
      setTotalUpVotes(totalUpVotes - 1);
      removeReaction(upVoteVariable);
    } else if (hasDownVoted) {
      setHasDownVoted(!hasDownVoted);
      setTotalDownVotes(totalDownVotes - 1);
      removeReaction(downVoteVariable);

      setHasUpVoted(!hasUpVoted);
      setTotalUpVotes(totalUpVotes + 1);
      addReaction(upVoteVariable);
    } else {
      setHasUpVoted(!hasUpVoted);
      setTotalUpVotes(totalUpVotes + 1);
      addReaction(upVoteVariable);
    }
  };

  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={createUpvote} aria-label="UpVote">
      <span
        className={`flex items-center space-x-2   hover:bg-blue-300 hover:bg-opacity-20 px-2 py-1 rounded-xl ${
          hasUpVoted ? 'text-brand-500' : 'text-gray-500'
        }`}
      >
        <span className="">
          <ArrowSmUpIcon className={`w-7 h-7 ${hasUpVoted ? 'text-brand-500' : 'text-gray-500'}`} />
        </span>
        <span className="text-[11px] sm:text-sm">{nFormatter(totalUpVotes)}</span>
      </span>
    </motion.button>
  );
};

export default UpVote;
