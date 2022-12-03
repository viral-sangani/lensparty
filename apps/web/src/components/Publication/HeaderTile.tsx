import Follow from '@components/Shared/Follow';
import Slug from '@components/Shared/Slug';
import SuperFollow from '@components/Shared/SuperFollow';
import UserPreview from '@components/Shared/UserPreview';
import getAttribute from '@lib/getAttribute';
import getAvatar from '@lib/getAvatar';
import clsx from 'clsx';
import dayjs from 'dayjs';
import type { MetadataAttributeOutput, Profile } from 'lens';
import Link from 'next/link';
import type { FC } from 'react';
import { useState } from 'react';

interface Props {
  profile: Profile;
  isCommunity?: boolean;
  showBio?: boolean;
  showFollow?: boolean;
  followStatusLoading?: boolean;
  isFollowing?: boolean;
  isSmall?: boolean;
  linkToProfile?: boolean;
  showStatus?: boolean;
  showUserPreview?: boolean;
  timestamp?: string | number | Date;
  attributes?: MetadataAttributeOutput[];
}

const HeaderTile: FC<Props> = ({
  profile,
  isCommunity = false,
  attributes = [],
  showBio = false,
  showFollow = false,
  followStatusLoading = false,
  isFollowing = false,
  isSmall = false,
  linkToProfile = true,
  showStatus = false,
  showUserPreview = true,
  timestamp
}) => {
  const [following, setFollowing] = useState(isFollowing);

  const statusEmoji = getAttribute(profile?.attributes, 'statusEmoji');
  const statusMessage = getAttribute(profile?.attributes, 'statusMessage');
  const hasStatus = statusEmoji && statusMessage;

  const UserAvatar = () => (
    <img
      src={getAvatar(profile)}
      loading="lazy"
      className={clsx(
        isSmall ? 'w-8 h-8' : 'w-14 h-14',
        'bg-gray-200 rounded-full border dark:border-gray-700/80'
      )}
      height={isSmall ? 40 : 56}
      width={isSmall ? 40 : 56}
      alt={profile?.handle}
    />
  );

  const UserName = () => (
    <>
      <Slug gradient={false} className="text-base" slug={profile?.handle} prefix="c/" />
      {showStatus && hasStatus ? (
        <div className="flex items-center text-gray-500">
          <span className="mx-1.5">·</span>
          <span className="text-xs flex items-center space-x-1 max-w-[10rem]">
            <span>{statusEmoji}</span>
            <span className="truncate">{statusMessage}</span>
          </span>
        </div>
      ) : null}
    </>
  );

  const MemberName = () => {
    if (isCommunity) {
      let handleMetadata = attributes.find((attribute) => {
        return attribute.traitType === 'postedByHandle';
      }) as MetadataAttributeOutput;
      if (handleMetadata) {
        return (
          <>
            <Slug gradient={false} className="text-sm" slug={handleMetadata.value as string} prefix="u/" />
            {showStatus && hasStatus ? (
              <div className="flex items-center text-gray-500">
                <span className="mx-1.5">·</span>
                <span className="text-xs flex items-center space-x-1 max-w-[10rem]">
                  <span>{statusEmoji}</span>
                  <span className="truncate">{statusMessage}</span>
                </span>
              </div>
            ) : null}
          </>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  const UserInfo: FC = () => {
    return (
      <UserPreview
        isBig={!isSmall}
        profile={profile}
        followStatusLoading={followStatusLoading}
        showUserPreview={showUserPreview}
      >
        <Link href={isCommunity ? `/c/${profile.handle}` : `/u/${profile.handle}`}>
          <div className="flex items-center space-x-3">
            <UserAvatar />
            <div className="flex flex-row space-x-2 dark:text-white text-gray-800">
              {isCommunity ? (
                <div className="flex flex-row items-center">
                  <span className="mr-0">
                    <UserName />
                  </span>
                  <div className="flex flex-row items-center">
                    <span className="mx-1 text-xs">{' | '}Posted by</span> <MemberName />
                  </div>
                </div>
              ) : (
                <span className="mr-0">
                  <span className="mr-0 text-xs">Posted by</span> <UserName />
                </span>
              )}
            </div>
          </div>
        </Link>
      </UserPreview>
    );
  };

  return (
    <div className="w-full flex flex-row justify-between items-center space-x-1">
      <div className="flex flex-row justify-between w-full">
        {<UserInfo />}
        {timestamp && <span className="text-sm text-gray-500">{dayjs(new Date(timestamp)).fromNow()}</span>}
      </div>
      {showFollow &&
        (followStatusLoading ? (
          <div className="w-10 h-8 rounded-lg shimmer" />
        ) : following ? null : profile?.followModule?.__typename === 'FeeFollowModuleSettings' ? (
          <SuperFollow profile={profile} setFollowing={setFollowing} />
        ) : (
          <Follow profile={profile} setFollowing={setFollowing} />
        ))}
    </div>
  );
};

export default HeaderTile;
