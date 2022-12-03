import NewPost from '@components/Composer/Post/New';
import CreatePostForm from '@components/CreatePost/CreatePostForm';
import { GridItemEight, GridItemFour, GridLayout } from '@components/UI/GridLayout';
import { Modal } from '@components/UI/Modal';
import MetaTags from '@components/utils/MetaTags';
import { UsersIcon } from '@heroicons/react/outline';
import getProfileType from '@lib/getProfileType';
import { APP_NAME } from 'data/constants';
import type { Profile } from 'lens';
import { useProfileQuery } from 'lens';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Custom404 from 'src/pages/404';
import Custom500 from 'src/pages/500';
import { useAppStore } from 'src/store/app';
import { useCreatePostFormStore } from 'src/store/create-post-form';
import { useProfileTabStore } from 'src/store/profile-tab';
import type { ProfileType } from 'src/store/profile-type';
import { useProfileTypeStore } from 'src/store/profile-type';

import AllowanceSettings from './Allowance';
import Details from './Details';
import Feed from './Feed';
import FeedType from './FeedType';
import InterestsSettings from './Interests';
import NFTFeed from './NFTFeed';
import EditProfile from './Profile';
import ProfilePageShimmer from './Shimmer';

type Props = {
  isCommunity?: boolean;
};

const ViewProfile: NextPage<Props> = ({ isCommunity = false }) => {
  console.log('isCommunity', isCommunity);
  const setProfileType = useProfileTypeStore((state) => state.setProfileType);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const setProfile = useCreatePostFormStore((state) => state.setProfile);
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
  setProfile(data.profile as Profile);
  const profile = data?.profile;

  if (
    (isCommunity && getProfileType(data?.profile as Profile) !== 'COMMUNITY') ||
    (!isCommunity && getProfileType(data?.profile as Profile) === 'COMMUNITY')
  ) {
    return <Custom404 />;
  }
  setProfileType(getProfileType(data?.profile as Profile) as ProfileType);

  const renderTab = () => {
    switch (currTab) {
      case 'PROFILE':
        return (
          <>
            {getProfileType(data?.profile as Profile) === 'USER' && (
              <FeedType stats={profile?.stats as any} setFeedType={setFeedType} feedType={feedType} />
            )}

            {(feedType === 'FEED' || feedType === 'REPLIES' || feedType === 'MEDIA') && (
              <>
                {data?.profile?.isFollowedByMe && (
                  <>
                    <NewPost />
                    <Modal
                      title="Followers you know"
                      icon={<UsersIcon className="w-5 h-5 text-brand" />}
                      show={showNewPostModal}
                      onClose={() => setShowNewPostModal(false)}
                    >
                      <CreatePostForm forCommunity={isCommunity} profile={data.profile as Profile} />
                    </Modal>
                  </>
                )}
                <Feed
                  profile={profile as any}
                  type={getProfileType(data?.profile as Profile) === 'COMMUNITY' ? 'FEED' : feedType}
                />
              </>
            )}
            {getProfileType(data?.profile as Profile) === 'USER' && feedType === 'NFT' && (
              <NFTFeed profile={profile as any} />
            )}
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
