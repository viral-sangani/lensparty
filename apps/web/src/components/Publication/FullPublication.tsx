import type { LensPublication } from '@generated/types';
import getAppName from '@lib/getAppName';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { FC } from 'react';

import PublicationActions from './Actions';
import HeaderTile from './HeaderTile';
import HiddenPublication from './HiddenPublication';
import PublicationBody from './PublicationBody';
import PublicationStats from './PublicationStats';
import PublicationType from './Type';

dayjs.extend(relativeTime);

interface Props {
  publication: LensPublication;
}

const FullPublication: FC<Props> = ({ publication }) => {
  const isMirror = publication.__typename === 'Mirror';
  const profile = isMirror ? publication?.mirrorOf?.profile : publication?.profile;
  const timestamp = isMirror ? publication?.mirrorOf?.createdAt : publication?.createdAt;

  // Count check to show the publication stats only if the publication has a comment, like or collect
  const mirrorCount = isMirror
    ? publication?.mirrorOf?.stats?.totalAmountOfMirrors
    : publication?.stats?.totalAmountOfMirrors;
  const reactionCount = isMirror
    ? publication?.mirrorOf?.stats?.totalUpvotes
    : publication?.stats?.totalUpvotes;
  const collectCount = isMirror
    ? publication?.mirrorOf?.stats?.totalAmountOfCollects
    : publication?.stats?.totalAmountOfCollects;
  const showStats = mirrorCount > 0 || reactionCount > 0 || collectCount > 0;
  const profileAttributes = publication.profile.attributes;
  let isCommunity =
    profileAttributes &&
    profileAttributes?.filter((attribute) => {
      return attribute.key === 'profileType' && attribute.value === 'community';
    }).length > 0;

  const { attributes } = publication.metadata;

  return (
    <article className="px-5 pt-5 pb-2">
      <PublicationType publication={publication} showType />
      <div>
        <div className="flex justify-between pb-4 space-x-1.5">
          <HeaderTile
            timestamp={publication.createdAt}
            isCommunity={isCommunity ?? false}
            attributes={attributes}
            profile={profile ?? publication?.collectedBy?.defaultProfile}
            isSmall={true}
            showStatus
          />
        </div>
        <div className="">
          {publication?.hidden ? (
            <HiddenPublication type={publication.__typename} />
          ) : (
            <>
              <PublicationBody publication={publication} />
              <div className="text-sm text-gray-500 my-3">
                <span>{dayjs(new Date(timestamp)).format('hh:mm A · MMM D, YYYY')}</span>
                {publication?.appId ? <span> · Posted via {getAppName(publication?.appId)}</span> : null}
              </div>
              {showStats && (
                <>
                  <div className="divider" />
                  <PublicationStats publication={publication} />
                </>
              )}

              <PublicationActions publication={publication} isFullPublication />
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default FullPublication;
