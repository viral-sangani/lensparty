import Follow from '@components/Shared/Follow';
import Slug from '@components/Shared/Slug';
import SuperFollow from '@components/Shared/SuperFollow';
import UserPreview from '@components/Shared/UserPreview';
import getAttribute from '@lib/getAttribute';
import getAvatar from '@lib/getAvatar';
import clsx from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Profile } from 'lens';
import Link from 'next/link';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

dayjs.extend(relativeTime);

interface Props {
  profile: Profile;
}

const SingleCommunity: FC<Props> = ({ profile }) => {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setFollowing(profile.isFollowedByMe);
  }, []);

  const UserAvatar = () => (
    <img
      src={getAvatar(profile)}
      loading="lazy"
      className={clsx('w-14 h-14', 'bg-gray-200 rounded-full border dark:border-gray-700/80')}
      height={56}
      width={56}
      alt={profile?.handle}
    />
  );

  const UserName = () => <Slug gradient={false} className="text-lg" slug={profile?.handle} prefix="c/" />;

  const tags = getAttribute(profile?.attributes, 'tags')?.split(',') || [];

  return (
    <article className="flex flex-row hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer first:rounded-t-xl last:rounded-b-xl px-5 pt-5 pb-2 border-2 border-gray-200 dark:border-gray-800 rounded-xl mb-4">
      <UserPreview isBig={true} profile={profile} showUserPreview={true}>
        <Link href={`/c/${profile.handle}`}>
          <div className="flex items-start space-x-3">
            <UserAvatar />
          </div>
        </Link>
      </UserPreview>
      <div className="flex flex-col flex-1 ml-3 mb-2">
        <div className="flex flex-col justify-start items-start dark:text-white text-gray-800">
          <span className="mr-0">
            <UserName />
          </span>

          {/* Show bio */}
          <span className="ml-0 text-sm">{profile.bio}</span>
        </div>
        <div className="flex flex-row space-x-4">
          <div className="flex flex-col mt-5">
            <span className="text-gray-500 text-sm">Followers</span>
            <span className="text-gray-800 dark:text-white text-lg">{profile.stats.totalFollowers}</span>
          </div>
          <div className="flex flex-col mt-5">
            <span className="text-gray-500 text-sm">Total Posts</span>
            <span className="text-gray-800 dark:text-white text-lg">{profile.stats.totalPublications}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end space-y-2">
        {/* render tags */}
        {tags.length > 0 && tags[0] !== '' && (
          <div className="flex flex-row flex-wrap space-x-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-sm text-gray-500 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        <span>{profile.isFollowedByMe}</span>
        <div>
          {following ? null : profile?.followModule?.__typename === 'FeeFollowModuleSettings' ? (
            <SuperFollow showText profile={profile} setFollowing={setFollowing} />
          ) : (
            <Follow profile={profile} setFollowing={setFollowing} />
          )}
        </div>
      </div>
    </article>
  );
};

export default SingleCommunity;
