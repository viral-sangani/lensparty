/* eslint-disable simple-import-sort/imports */
import Message from '@components/Profile/Message';
import Follow from '@components/Shared/Follow';
import Markup from '@components/Shared/Markup';
import Slug from '@components/Shared/Slug';
import SuperFollow from '@components/Shared/SuperFollow';
import Unfollow from '@components/Shared/Unfollow';
import { Modal } from '@components/UI/Modal';
import { Tooltip } from '@components/UI/Tooltip';
import { HashtagIcon, LocationMarkerIcon, UsersIcon } from '@heroicons/react/outline';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import buildConversationId from '@lib/buildConversationId';
import { buildConversationKey } from '@lib/conversationKey';
import formatAddress from '@lib/formatAddress';
import getAttribute from '@lib/getAttribute';
import getAvatar from '@lib/getAvatar';
import isVerified from '@lib/isVerified';
import { STATIC_IMAGES_URL } from 'data/constants';
import type { Profile } from 'lens';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import type { FC, ReactElement } from 'react';
import { useState } from 'react';
import { useAppStore } from 'src/store/app';
import { useMessageStore } from 'src/store/message';
import Followerings from './Followerings';
import MutualFollowers from './MutualFollowers';
import MutualFollowersList from './MutualFollowers/List';
import ProfileSidebar from './ProfileSidebar';

interface Props {
  profile: Profile;
}

const Details: FC<Props> = ({ profile }) => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [following, setFollowing] = useState(profile?.isFollowedByMe);
  const [showMutualFollowersModal, setShowMutualFollowersModal] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const addProfileAndSelectTab = useMessageStore((state) => state.addProfileAndSelectTab);

  const onMessageClick = () => {
    if (!currentProfile) {
      return;
    }
    const conversationId = buildConversationId(currentProfile.id, profile.id);
    const conversationKey = buildConversationKey(profile.ownedBy, conversationId);
    addProfileAndSelectTab(conversationKey, profile);
    router.push(`/messages/${conversationKey}`);
  };

  const MetaDetails = ({ children, icon }: { children: ReactElement; icon: ReactElement }) => (
    <div className="flex gap-2 items-center">
      {icon}
      <div className="truncate text-md">{children}</div>
    </div>
  );

  const followType = profile?.followModule?.__typename;

  return (
    <div className="px-5 mb-4 space-y-5 sm:px-0 flex flex-col">
      <div className="w-24 h-24 sm:w-52 sm:h-52 flex flex-row space-x-5 items-center">
        <img
          src={getAvatar(profile)}
          className="w-24 h-24 bg-gray-200 rounded-full ring-gray-50 sm:w-32 sm:h-32 dark:bg-gray-700 dark:ring-black"
          height={128}
          width={128}
          alt={profile?.handle}
        />
        <div className="flex flex-col">
          <div className="py-2 flex flex-col space-y-0">
            <div className="flex gap-1 items-center text-2xl font-bold">
              <div className="truncate">{profile?.name ?? profile?.handle}</div>
              {isVerified(profile?.id) && (
                <Tooltip content="Verified">
                  <BadgeCheckIcon className="w-6 h-6 text-brand" />
                </Tooltip>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {profile?.name ? (
                <Slug className="text-sm sm:text-base" slug={profile?.handle} prefix="@" />
              ) : (
                <Slug className="text-sm sm:text-base" slug={formatAddress(profile?.ownedBy)} />
              )}
              {currentProfile && currentProfile?.id !== profile?.id && profile?.isFollowing && (
                <div className="py-0.5 px-2 text-xs bg-gray-200 rounded-full dark:bg-gray-700">
                  Follows you
                </div>
              )}
            </div>
          </div>
          <Followerings profile={profile} />
        </div>
      </div>

      {profile?.bio && (
        <div className="mr-0 sm:mr-10 leading-md linkify text-md">
          <Markup>{profile?.bio}</Markup>
        </div>
      )}

      <div className="space-y-5">
        <div>
          {currentProfile?.id === profile?.id ? (
            <>
              <div className="w-full divider mb-4" />
              <ProfileSidebar className="hidden md:block" />
            </>
          ) : followType !== 'RevertFollowModuleSettings' ? (
            following ? (
              <div className="flex space-x-2">
                <Unfollow profile={profile} setFollowing={setFollowing} showText />
                {followType === 'FeeFollowModuleSettings' && (
                  <SuperFollow profile={profile} setFollowing={setFollowing} again />
                )}
                {currentProfile && <Message onClick={onMessageClick} />}
              </div>
            ) : followType === 'FeeFollowModuleSettings' ? (
              <div className="flex space-x-2">
                <SuperFollow profile={profile} setFollowing={setFollowing} showText />
                {currentProfile && <Message onClick={onMessageClick} />}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Follow profile={profile} setFollowing={setFollowing} showText />
                {currentProfile && <Message onClick={onMessageClick} />}
              </div>
            )
          ) : null}
        </div>
        {currentProfile?.id !== profile?.id && (
          <>
            <MutualFollowers setShowMutualFollowersModal={setShowMutualFollowersModal} profile={profile} />
            <Modal
              title="Followers you know"
              icon={<UsersIcon className="w-5 h-5 text-brand" />}
              show={showMutualFollowersModal}
              onClose={() => setShowMutualFollowersModal(false)}
            >
              <MutualFollowersList profileId={profile?.id} />
            </Modal>
          </>
        )}
        <div className="w-full divider" />
        <div className="space-y-2">
          <MetaDetails icon={<HashtagIcon className="w-4 h-4" />}>
            <Tooltip content={`#${parseInt(profile?.id)}`}>{profile?.id}</Tooltip>
          </MetaDetails>
          {getAttribute(profile?.attributes, 'location') && (
            <MetaDetails icon={<LocationMarkerIcon className="w-4 h-4" />}>
              {getAttribute(profile?.attributes, 'location') as any}
            </MetaDetails>
          )}
          {profile?.onChainIdentity?.ens?.name && (
            <MetaDetails
              icon={
                <img
                  src={`${STATIC_IMAGES_URL}/brands/ens.svg`}
                  className="w-4 h-4"
                  height={16}
                  width={16}
                  alt="ENS Logo"
                />
              }
            >
              {profile?.onChainIdentity?.ens?.name}
            </MetaDetails>
          )}
          {getAttribute(profile?.attributes, 'website') && (
            <MetaDetails
              icon={
                <img
                  src={`https://www.google.com/s2/favicons?domain=${getAttribute(
                    profile?.attributes,
                    'website'
                  )
                    ?.replace('https://', '')
                    .replace('http://', '')}`}
                  className="w-4 h-4 rounded-full"
                  height={16}
                  width={16}
                  alt="Website"
                />
              }
            >
              <a
                href={`https://${getAttribute(profile?.attributes, 'website')
                  ?.replace('https://', '')
                  .replace('http://', '')}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {getAttribute(profile?.attributes, 'website')?.replace('https://', '').replace('http://', '')}
              </a>
            </MetaDetails>
          )}
          {getAttribute(profile?.attributes, 'twitter') && (
            <MetaDetails
              icon={
                resolvedTheme === 'dark' ? (
                  <img
                    src={`${STATIC_IMAGES_URL}/brands/twitter-light.svg`}
                    className="w-4 h-4"
                    height={16}
                    width={16}
                    alt="Twitter Logo"
                  />
                ) : (
                  <img
                    src={`${STATIC_IMAGES_URL}/brands/twitter-dark.svg`}
                    className="w-4 h-4"
                    height={16}
                    width={16}
                    alt="Twitter Logo"
                  />
                )
              }
            >
              <a
                href={`https://twitter.com/${getAttribute(profile?.attributes, 'twitter')}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {getAttribute(profile?.attributes, 'twitter')?.replace('https://twitter.com/', '')}
              </a>
            </MetaDetails>
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;
