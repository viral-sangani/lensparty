import Follow from '@components/Shared/Follow';
import Markup from '@components/Shared/Markup';
import Slug from '@components/Shared/Slug';
import SuperFollow from '@components/Shared/SuperFollow';
import UserPreview from '@components/Shared/UserPreview';
import getAttribute from '@lib/getAttribute';
import getAvatar from '@lib/getAvatar';
import clsx from 'clsx';
import dayjs from 'dayjs';
import type { Profile } from 'lens';
import Link from 'next/link';
import type { FC } from 'react';
import { useState } from 'react';

interface Props {
  profile: Profile;
  showBio?: boolean;
  showFollow?: boolean;
  followStatusLoading?: boolean;
  isFollowing?: boolean;
  isSmall?: boolean;
  linkToProfile?: boolean;
  showStatus?: boolean;
  showUserPreview?: boolean;
  timestamp?: string | number | Date;
}

const HeaderTile: FC<Props> = ({
  profile,
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
        isSmall ? 'w-6 h-6' : 'w-14 h-14',
        'bg-gray-200 rounded-full border dark:border-gray-700/80'
      )}
      height={isSmall ? 40 : 56}
      width={isSmall ? 40 : 56}
      alt={profile?.handle}
    />
  );

  const UserName = () => (
    <>
      <Slug gradient={false} className="text-sm" slug={profile?.handle} prefix="u/" />
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

  const UserInfo: FC = () => {
    return (
      <UserPreview
        isBig={!isSmall}
        profile={profile}
        followStatusLoading={followStatusLoading}
        showUserPreview={showUserPreview}
      >
        <div className="flex items-center space-x-3">
          <UserAvatar />
          <div className="flex flex-row space-x-2 text-sm dark:text-white text-gray-800">
            <span className="mr-0 text-sm">Posted by</span> <UserName />
            {showBio && profile?.bio && (
              <div className={clsx(!isSmall ? 'text-base' : 'text-sm', 'mt-2', 'linkify leading-6')}>
                <Markup>{profile?.bio}</Markup>
              </div>
            )}
          </div>
        </div>
      </UserPreview>
    );
  };

  return (
    <div className="flex justify-between items-center space-x-1">
      {linkToProfile ? (
        <Link href={`/u/${profile?.handle}`}>
          <UserInfo />
        </Link>
      ) : (
        <UserInfo />
      )}
      {timestamp && <span className="text-sm text-gray-500">{dayjs(new Date(timestamp)).fromNow()}</span>}
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
