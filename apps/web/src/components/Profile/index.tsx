import { GridItemEight, GridItemFour, GridLayout } from '@components/UI/GridLayout';
import MetaTags from '@components/utils/MetaTags';
import { APP_NAME } from 'data/constants';
import { useProfileQuery } from 'lens';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Custom404 from 'src/pages/404';
import Custom500 from 'src/pages/500';
import { useAppStore } from 'src/store/app';
import { useProfileTabStore } from 'src/store/profile-tab';
import { useProfileTypeStore } from 'src/store/profile-type';

import AllowanceSettings from './Allowance';
import Details from './Details';
import Feed from './Feed';
import FeedType from './FeedType';
import InterestsSettings from './Interests';
import NFTFeed from './NFTFeed';
import EditProfile from './Profile';
import ProfilePageShimmer from './Shimmer';

const ViewProfile: NextPage = () => {
  const profileType = useProfileTypeStore((state) => state.profileType);

  const {
    query: { username, type }
  } = useRouter();
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [feedType, setFeedType] = useState(
    type && ['feed', 'replies', 'media', 'nft'].includes(type as string)
      ? type.toString().toUpperCase()
      : 'FEED'
  );

  const currTab = useProfileTabStore((state) => state.currTab);

  const { data, loading, error } = useProfileQuery({
    variables: { request: { handle: username }, who: currentProfile?.id ?? null },
    skip: !username
  });

  if (error) {
    return <Custom500 />;
  }

  if (loading || !data) {
    return <ProfilePageShimmer />;
  }

  if (!data?.profile) {
    return <Custom404 />;
  }

  const profile = data?.profile;

  const renderTab = () => {
    console.log('currTab', currTab);
    switch (currTab) {
      case 'PROFILE':
        return (
          <>
            {profileType === 'USER' && (
              <FeedType stats={profile?.stats as any} setFeedType={setFeedType} feedType={feedType} />
            )}
            {(feedType === 'FEED' || feedType === 'REPLIES' || feedType === 'MEDIA') && (
              <Feed profile={profile as any} type={profileType === 'COMMUNITY' ? 'FEED' : feedType} />
            )}
            {profileType === 'USER' && feedType === 'NFT' && <NFTFeed profile={profile as any} />}
          </>
        );
      case 'EDITPROFILE':
        return <EditProfile />;
      case 'INTERESTS':
        return <InterestsSettings />;
      case 'ALLOWANCE':
        return <AllowanceSettings />;
      default:
        return <div>Profile</div>;
    }
  };

  return (
    <>
      {profile?.name ? (
        <MetaTags title={`${profile?.name} (@${profile?.handle}) • ${APP_NAME}`} />
      ) : (
        <MetaTags title={`@${profile?.handle} • ${APP_NAME}`} />
      )}
      <GridLayout className="max-w-7xl w-full mx-auto mt-8">
        <GridItemFour>
          <Details profile={profile as any} />
        </GridItemFour>
        <GridItemEight className="space-y-5">{renderTab()}</GridItemEight>
      </GridLayout>
    </>
  );
};

export default ViewProfile;
