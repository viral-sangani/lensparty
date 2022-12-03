import type { LensPublication } from '@generated/types';
import clsx from 'clsx';
import type { ElectedMirror } from 'lens';
import type { FC } from 'react';
import { useAppStore } from 'src/store/app';
import { useReactionStore } from 'src/store/reactionStore';

import Analytics from './Analytics';
import Collect from './Collect';
import Comment from './Comment';
import Like from './Like';
import Mirror from './Mirror';

interface Props {
  publication: LensPublication;
  isFullPublication?: boolean;
  electedMirror?: ElectedMirror;
}

const PublicationActions: FC<Props> = ({ publication, electedMirror, isFullPublication = false }) => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const collectModuleType = publication?.collectModule.__typename;
  const canMirror = currentProfile ? publication?.canMirror?.result : true;

  const setTotalUpVotes = useReactionStore((state) => state.setTotalUpVotes);
  const setTotalDownVotes = useReactionStore((state) => state.setTotalDownVotes);
  const setHasUpVoted = useReactionStore((state) => state.setHasUpVoted);
  const setHasDownVoted = useReactionStore((state) => state.setHasDownVoted);

  const isMirror = publication.__typename === 'Mirror';
  setTotalUpVotes(isMirror ? publication?.mirrorOf?.stats?.totalUpvotes : publication?.stats?.totalUpvotes);
  setTotalDownVotes(
    isMirror ? publication?.mirrorOf?.stats?.totalDownvotes : publication?.stats?.totalDownvotes
  );
  setHasUpVoted((isMirror ? publication?.mirrorOf?.reaction : publication?.reaction) === 'UPVOTE');
  setHasDownVoted((isMirror ? publication?.mirrorOf?.reaction : publication?.reaction) === 'DOWNVOTE');

  return (
    <span
      className={clsx(
        'justify-between w-full flex gap-6 items-center pt-2 text-gray-500 sm:gap-8 border-t border-gray-200 dark:border-gray-700'
      )}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <div className="w-full">
        <Like publication={publication} isFullPublication={isFullPublication} />
      </div>
      <div className="w-full">
        <Comment publication={publication} isFullPublication={isFullPublication} />
      </div>
      <div className="w-full">
        {canMirror && <Mirror publication={publication} isFullPublication={isFullPublication} />}
      </div>
      <div className="w-full">
        {collectModuleType !== 'RevertCollectModuleSettings' && (
          <Collect
            electedMirror={electedMirror}
            publication={publication}
            isFullPublication={isFullPublication}
          />
        )}
      </div>
      <Analytics publication={publication} isFullPublication={isFullPublication} />
      {/* <PublicationMenu publication={publication} isFullPublication={isFullPublication} /> */}
    </span>
  );
};

export default PublicationActions;
