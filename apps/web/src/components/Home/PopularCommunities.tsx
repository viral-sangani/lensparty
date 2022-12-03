import Follow from '@components/Shared/Follow';
import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer';
import Slug from '@components/Shared/Slug';
import SuperFollow from '@components/Shared/SuperFollow';
import UserPreview from '@components/Shared/UserPreview';
import { EmptyState } from '@components/UI/EmptyState';
import { ErrorMessage } from '@components/UI/ErrorMessage';
import { CollectionIcon } from '@heroicons/react/outline';
import getAvatar from '@lib/getAvatar';
import clsx from 'clsx';
import { SERVER_WALLET_ADDRESS } from 'data/constants';
import type { Profile } from 'lens';
import { useProfilesQuery } from 'lens';
import Link from 'next/link';
import { useState } from 'react';
import { useAppStore } from 'src/store/app';
import { useTimelineStore } from 'src/store/timeline';

type Props = {};

function PopularCommunities({}: Props) {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const seeThroughProfile = useTimelineStore((state) => state.seeThroughProfile);
  const [following, setFollowing] = useState(false);

  // Variables
  const profileId = seeThroughProfile?.id ?? currentProfile?.id;
  const request = { ownedBy: [SERVER_WALLET_ADDRESS], limit: 50 };

  const { data, loading, error } = useProfilesQuery({
    variables: { request }
  });

  let communities = data?.profiles.items;
  let popularCommunities: Profile[] = [];

  if (loading) {
    return <PublicationsShimmer />;
  }

  if (communities?.length === 0) {
    return (
      <EmptyState
        message={<div>No posts yet!</div>}
        icon={<CollectionIcon className="w-8 h-8 text-brand" />}
      />
    );
  }

  if (error) {
    return <ErrorMessage title="Failed to load timeline" error={error} />;
  }

  // filter and remove all communities with zero followers;
  popularCommunities = communities?.filter((community) => community.stats.totalFollowers > 0) as Profile[];
  popularCommunities.sort((a, b) => b.stats.totalFollowers - a.stats.totalFollowers);
  // keep top 5 entries
  popularCommunities = popularCommunities.slice(0, 5);

  const UserAvatar = ({ profile }: { profile: Profile }) => (
    <img
      src={getAvatar(profile)}
      loading="lazy"
      className={clsx('w-8 h-8', 'bg-gray-200 rounded-full border dark:border-gray-700/80')}
      height={56}
      width={56}
      alt={profile?.handle}
    />
  );

  const UserName = ({ profile }: { profile: Profile }) => (
    <Slug gradient={false} className="text-sm" slug={profile?.handle} prefix="c/" />
  );

  return (
    <div className="bg-black p-4 rounded-lg">
      <div className="pb-2">Top Communities</div>
      {popularCommunities?.map((profile, index) => {
        return (
          <UserPreview key={index} isBig={true} profile={profile} showUserPreview={true}>
            <article className="flex items-center flex-row hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer first:rounded-t-xl last:rounded-b-xl px-3 pt-3 pb-2 border-2 border-gray-200 dark:border-gray-800 rounded-xl mb-4">
              <Link href={`/c/${profile.handle}`}>
                <div className="flex items-start space-x-3">
                  <UserAvatar profile={profile} />
                </div>
              </Link>

              <div className="flex flex-col flex-1 ml-3 mb-2">
                <div className="flex flex-col justify-start items-start dark:text-white text-gray-800">
                  <span className="mr-0">
                    <UserName profile={profile} />
                  </span>

                  {/* Show bio */}
                  <span className="ml-0 text-sm">{profile.name}</span>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span>{profile.isFollowedByMe}</span>
                <div>
                  {following ? null : profile?.followModule?.__typename === 'FeeFollowModuleSettings' ? (
                    <SuperFollow showText={false} profile={profile} setFollowing={setFollowing} />
                  ) : (
                    <Follow showText={false} profile={profile} setFollowing={setFollowing} />
                  )}
                </div>
              </div>
            </article>
          </UserPreview>
        );
      })}
    </div>
  );
}

export default PopularCommunities;
