import type { LensPublication } from '@generated/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/router';
import type { FC } from 'react';

import PublicationActions from './Actions';
import HeaderTile from './HeaderTile';
import HiddenPublication from './HiddenPublication';
import PublicationBody from './PublicationBody';

dayjs.extend(relativeTime);

interface Props {
  publication: LensPublication;
}

const ThreadBody: FC<Props> = ({ publication }) => {
  const { push } = useRouter();
  const isMirror = publication.__typename === 'Mirror';
  const profile = isMirror ? publication?.mirrorOf?.profile : publication?.profile;
  const timestamp = isMirror ? publication?.mirrorOf?.createdAt : publication?.createdAt;

  return (
    <article>
      <div className="flex justify-between space-x-1.5">
        <span onClick={(event) => event.stopPropagation()}>
          <HeaderTile
            isSmall
            profile={profile ?? publication?.collectedBy?.defaultProfile}
            timestamp={timestamp}
          />
        </span>
      </div>
      <div className="flex">
        <div className="mr-8 ml-3 bg-gray-300 border-gray-300 dark:bg-gray-700 dark:border-gray-700 border-[0.8px] my-[20px]" />
        <div
          className="pt-4 pb-5 !w-[85%] sm:w-full"
          onClick={() => {
            push(`/posts/${publication?.id}`);
          }}
        >
          {publication?.hidden ? (
            <HiddenPublication type={publication.__typename} />
          ) : (
            <>
              <PublicationBody publication={publication} />
              <PublicationActions publication={publication} />
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default ThreadBody;
