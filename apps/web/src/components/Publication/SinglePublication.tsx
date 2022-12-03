import EventType from '@components/Home/Timeline/EventType';
import type { LensPublication } from '@generated/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { ElectedMirror, FeedItem } from 'lens';
import { useRouter } from 'next/router';
import type { FC } from 'react';

import PublicationActions from './Actions';
import ModAction from './Actions/ModAction';
import HeaderTile from './HeaderTile';
import HiddenPublication from './HiddenPublication';
import PublicationBody from './PublicationBody';
import PublicationType from './Type';

dayjs.extend(relativeTime);

interface Props {
  publication: LensPublication;
  feedItem?: FeedItem;
  showType?: boolean;
  showActions?: boolean;
  showModActions?: boolean;
  showThread?: boolean;
}

const SinglePublication: FC<Props> = ({
  publication,
  feedItem,
  showType = true,
  showActions = true,
  showModActions = false,
  showThread = true
}) => {
  const { push } = useRouter();
  const isMirror = publication.__typename === 'Mirror';
  const firstComment = feedItem?.comments && feedItem.comments[0];
  const rootPublication = feedItem ? (firstComment ? firstComment : feedItem?.root) : publication;
  const profileAttributes = publication.profile.attributes;
  let isCommunity =
    profileAttributes &&
    profileAttributes?.filter((attribute) => {
      return attribute.key === 'profileType' && attribute.value === 'community';
    }).length > 0;
  const profile = feedItem
    ? rootPublication.profile
    : isMirror
    ? publication?.mirrorOf?.profile
    : publication?.profile;

  const { attributes } = publication.metadata;

  const timestamp = feedItem
    ? rootPublication.createdAt
    : isMirror
    ? publication?.mirrorOf?.createdAt
    : publication?.createdAt;

  return (
    <article className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer first:rounded-t-xl last:rounded-b-xl px-5 pt-5 pb-2 border-2 border-gray-200 dark:border-gray-800 rounded-xl mb-4">
      {feedItem ? (
        <EventType feedItem={feedItem} showType={showType} showThread={showThread} />
      ) : (
        <PublicationType publication={publication} showType={showType} showThread={showThread} />
      )}
      <div className="pb-1 w-full">
        <span onClick={(event) => event.stopPropagation()}>
          <HeaderTile
            isSmall={true}
            isCommunity={isCommunity ?? false}
            attributes={attributes}
            profile={profile ?? publication?.collectedBy?.defaultProfile}
            showStatus
            timestamp={timestamp}
          />
        </span>
      </div>
      <div
        className=""
        // className="ml-[53px]"
      >
        {publication?.hidden ? (
          <HiddenPublication type={publication.__typename} />
        ) : (
          <>
            <div
              onClick={() => {
                push(`/posts/${rootPublication?.id}`);
              }}
            >
              <PublicationBody publication={rootPublication as LensPublication} />
            </div>
            {showActions && (
              <PublicationActions
                publication={rootPublication as LensPublication}
                electedMirror={feedItem?.electedMirror as ElectedMirror}
              />
            )}
            {showModActions && <ModAction publication={rootPublication as LensPublication} />}
          </>
        )}
      </div>
    </article>
  );
};

export default SinglePublication;
