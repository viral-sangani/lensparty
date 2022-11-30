import NotificationIcon from '@components/Notification/NotificationIcon';
import Sidebar from '@components/Sidebar/Sidebar';
import { Disclosure } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import hasPrideLogo from '@lib/hasPrideLogo';
import clsx from 'clsx';
import type { Profile } from 'lens';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FC } from 'react';
import { useAppStore } from 'src/store/app';

import MenuItems from './MenuItems';
import Search from './Search';
import ThemeToggle from './ThemeToggle';

const Navbar: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const router = useRouter();

  const onProfileSelected = (profile: Profile) => {
    router.push(`/u/${profile?.handle}`);
  };

  interface NavItemProps {
    url: string;
    name: string;
    current: boolean;
  }

  const NavItem = ({ url, name, current }: NavItemProps) => {
    return (
      <Link href={url} aria-current={current ? 'page' : undefined}>
        <Disclosure.Button
          className={clsx(
            'w-full text-left px-2 md:px-3 py-1 rounded-md font-bold cursor-pointer text-sm tracking-wide',
            {
              'text-black dark:text-white bg-gray-200 dark:bg-gray-800': current,
              'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800':
                !current
            }
          )}
        >
          {name}
        </Disclosure.Button>
      </Link>
    );
  };

  return (
    <Disclosure
      as="header"
      className="sticky top-0 z-10 w-full bg-white border-b dark:bg-gray-900 dark:border-b-gray-700/80"
    >
      {({ open }) => (
        <>
          <div className="container px-5 mx-auto max-w-screen-xl">
            <div className="flex relative justify-between items-center h-14 sm:h-16">
              <div className="flex justify-start items-center">
                <Disclosure.Button className="inline-flex justify-center items-center mr-4 text-gray-500 rounded-md sm:hidden focus:outline-none">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block w-6 h-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block w-6 h-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
                <Link href="/">
                  <img
                    height={50}
                    width={100}
                    src={currentProfile && hasPrideLogo(currentProfile) ? '/pride.svg' : '/logo.png'}
                    alt="Logo"
                  />
                </Link>
              </div>
              <div className="hidden sm:block sm:ml-6">
                <div className="flex items-center space-x-4">
                  <div className="hidden lg:block">
                    <Search onProfileSelected={onProfileSelected} />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                {currentProfile ? <NotificationIcon /> : null}
                <ThemeToggle />
                <MenuItems />
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="flex flex-col p-3 space-y-2">
              <div className="mb-2">
                <Search hideDropdown onProfileSelected={onProfileSelected} />
                <Sidebar />
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
