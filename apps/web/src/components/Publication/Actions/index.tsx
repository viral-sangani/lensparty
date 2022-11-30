import type { LensPublication } from '@generated/types';
import clsx from 'clsx';
import type { ElectedMirror } from 'lens';
import type { FC } from 'react';
import { useAppStore } from 'src/store/app';

import Analytics from './Analytics';
import Collect from './Collect';
import Comment from './Comment';
import DownVote from './DownVote';
import Mirror from './Mirror';
import UpVote from './UpVote';

interface Props {
  publication: LensPublication;
  isFullPublication?: boolean;
  electedMirror?: ElectedMirror;
}

const PublicationActions: FC<Props> = ({ publication, electedMirror, isFullPublication = false }) => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const collectModuleType = publication?.collectModule.__typename;
  const canMirror = currentProfile ? publication?.canMirror?.result : true;

  return (
    <span
      className={clsx(
        'justify-between w-full flex gap-6 items-center mt-3 pt-2 -ml-2 text-gray-500 sm:gap-8 border-t border-gray-200 dark:border-gray-700'
      )}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <UpVote publication={publication} isFullPublication={isFullPublication} />
      <DownVote publication={publication} isFullPublication={isFullPublication} />
      <Comment publication={publication} isFullPublication={isFullPublication} />
      {canMirror && <Mirror publication={publication} isFullPublication={isFullPublication} />}
      {/* <Like publication={publication} isFullPublication={isFullPublication} /> */}
      {collectModuleType !== 'RevertCollectModuleSettings' && (
        <Collect
          electedMirror={electedMirror}
          publication={publication}
          isFullPublication={isFullPublication}
        />
      )}
      <Analytics publication={publication} isFullPublication={isFullPublication} />
      {/* <PublicationMenu publication={publication} isFullPublication={isFullPublication} /> */}
    </span>
  );
};

export default PublicationActions;
