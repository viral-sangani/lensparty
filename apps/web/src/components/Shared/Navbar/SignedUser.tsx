import { useDisconnectXmtp } from '@components/utils/hooks/useXmtpClient';
import { Menu, Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  CogIcon,
  EmojiHappyIcon,
  LogoutIcon,
  MoonIcon,
  ShieldCheckIcon,
  SunIcon,
  SwitchHorizontalIcon,
  UserIcon
} from '@heroicons/react/outline';
import getAttribute from '@lib/getAttribute';
import getAvatar from '@lib/getAvatar';
import isGardener from '@lib/isGardener';
import resetAuthData from '@lib/resetAuthData';
import clsx from 'clsx';
import { APP_VERSION } from 'data/constants';
import type { Profile } from 'lens';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import type { FC } from 'react';
import { Fragment } from 'react';
import { useAppPersistStore, useAppStore } from 'src/store/app';
import { useGlobalModalStateStore } from 'src/store/modals';
import { useDisconnect } from 'wagmi';

import Slug from '../Slug';
import { NextLink } from './MenuItems';

const SignedUser: FC = () => {
  const router = useRouter();
  const profiles = useAppStore((state) => state.profiles);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile);
  const setProfileId = useAppPersistStore((state) => state.setProfileId);
  const setShowStatusModal = useGlobalModalStateStore((state) => state.setShowStatusModal);
  const { theme, setTheme } = useTheme();
  const { disconnect } = useDisconnect();
  const disconnectXmtp = useDisconnectXmtp();

  const statusEmoji = getAttribute(currentProfile?.attributes, 'statusEmoji');
  const statusMessage = getAttribute(currentProfile?.attributes, 'statusMessage');
  const hasStatus = statusEmoji && statusMessage;

  const logout = () => {
    disconnectXmtp();
    setCurrentProfile(null);
    setProfileId(null);
    resetAuthData();
    disconnect?.();
    router.push('/');
  };

  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            as="img"
            src={getAvatar(currentProfile as Profile)}
            className="w-8 h-8 rounded-full border cursor-pointer dark:border-gray-700/80"
            alt={currentProfile?.handle}
          />
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="absolute right-0 py-1 mt-2 w-48 bg-white rounded-xl border shadow-sm dark:bg-gray-900 focus:outline-none dark:border-gray-700/80"
            >
              <Menu.Item
                as={NextLink}
                href={`/u/${currentProfile?.handle}`}
                className={({ active }: { active: boolean }) =>
                  clsx({ 'dropdown-active': active }, 'menu-item')
                }
              >
                <div>Logged in as</div>
                <div className="truncate">
                  <Slug className="font-bold" slug={currentProfile?.handle} prefix="@" />
                </div>
              </Menu.Item>
              <div className="divider" />
              <Menu.Item
                as="a"
                onClick={() => setShowStatusModal(true)}
                className={({ active }: { active: boolean }) =>
                  clsx({ 'dropdown-active': active }, 'menu-item border dark:border-gray-700/80')
                }
              >
                <div className="flex items-center space-x-2">
                  {hasStatus ? (
                    <>
                      <span>{statusEmoji}</span>
                      <span className="truncate">{statusMessage}</span>
                    </>
                  ) : (
                    <>
                      <EmojiHappyIcon className="w-4 h-4" />
                      <span>Set status</span>
                    </>
                  )}
                </div>
              </Menu.Item>
              <div className="divider" />
              <Menu.Item
                as={NextLink}
                href={`/u/${currentProfile?.handle}`}
                className={({ active }: { active: boolean }) =>
                  clsx({ 'dropdown-active': active }, 'menu-item')
                }
              >
                <div className="flex items-center space-x-1.5">
                  <UserIcon className="w-4 h-4" />
                  <div>Your Profile</div>
                </div>
              </Menu.Item>
              <Menu.Item
                as={NextLink}
                href="/settings"
                className={({ active }: { active: boolean }) =>
                  clsx({ 'dropdown-active': active }, 'menu-item')
                }
              >
                <div className="flex items-center space-x-1.5">
                  <CogIcon className="w-4 h-4" />
                  <div>Settings</div>
                </div>
              </Menu.Item>
              {isGardener(currentProfile?.id) && (
                <Menu.Item
                  as={NextLink}
                  href="/mod"
                  className={({ active }: { active: boolean }) =>
                    clsx({ 'dropdown-active': active }, 'menu-item')
                  }
                >
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <div>Moderation</div>
                  </div>
                </Menu.Item>
              )}
              <Menu.Item
                as="a"
                onClick={logout}
                className={({ active }) => clsx({ 'dropdown-active': active }, 'menu-item')}
              >
                <div className="flex items-center space-x-1.5">
                  <LogoutIcon className="w-4 h-4" />
                  <div>Logout</div>
                </div>
              </Menu.Item>
              {profiles?.length > 1 && (
                <>
                  <div className="divider" />
                  <div className="overflow-auto m-2 max-h-36 no-scrollbar">
                    <div className="flex items-center px-4 pt-1 pb-2 space-x-1.5 text-sm font-bold text-gray-500">
                      <SwitchHorizontalIcon className="w-4 h-4" />
                      <div>Switch to</div>
                    </div>
                    {profiles.map((profile: Profile, index: number) => (
                      <div
                        key={profile?.id}
                        className="block text-sm text-gray-700 rounded-lg cursor-pointer dark:text-gray-200"
                      >
                        <button
                          type="button"
                          className="flex items-center py-1.5 px-4 space-x-2 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => {
                            const selectedProfile = profiles[index];
                            setCurrentProfile(selectedProfile);
                            setProfileId(selectedProfile.id);
                          }}
                        >
                          {currentProfile?.id === profile?.id && (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          )}
                          <img
                            className="w-5 h-5 rounded-full border dark:border-gray-700/80"
                            height={20}
                            width={20}
                            src={getAvatar(profile)}
                            alt={profile?.handle}
                          />
                          <div className="truncate">{profile?.handle}</div>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="divider" />
              <Menu.Item
                as="a"
                onClick={() => {
                  setTheme(theme === 'light' ? 'dark' : 'light');
                }}
                className={({ active }) => clsx({ 'dropdown-active': active }, 'menu-item')}
              >
                <div className="flex items-center space-x-1.5">
                  {theme === 'light' ? (
                    <>
                      <MoonIcon className="w-4 h-4" />
                      <div>Dark mode</div>
                    </>
                  ) : (
                    <>
                      <SunIcon className="w-4 h-4" />
                      <div>Light mode</div>
                    </>
                  )}
                </div>
              </Menu.Item>
              {currentProfile && (
                <>
                  <div className="divider" />
                  <div className="py-3 px-6 text-xs">
                    <a
                      href={`https://github.com/lensterxyz/lenster/releases/tag/v${APP_VERSION}`}
                      className="font-mono"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      v{APP_VERSION}
                    </a>
                  </div>
                </>
              )}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default SignedUser;
