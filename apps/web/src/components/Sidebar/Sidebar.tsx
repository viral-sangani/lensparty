import {
  HandIcon,
  HomeIcon,
  PencilAltIcon,
  PlusCircleIcon,
  TrendingUpIcon,
  UserCircleIcon
} from '@heroicons/react/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FC, ReactNode } from 'react';
import { useAppStore } from 'src/store/app';

interface MenuProps {
  children: ReactNode;
  current: boolean;
  url: string;
  className?: string;
}

const Menu: FC<MenuProps> = ({ children, current, url, className }) => (
  <Link
    href={url}
    className={clsx(
      'mb-1.5 flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-brand-100 hover:text-brand dark:hover:bg-opacity-20 dark:bg-opacity-20 hover:bg-opacity-100',
      { 'bg-brand-100 text-brand font-bold': current },
      { className }
    )}
  >
    {children}
  </Link>
);

interface SidebarProps {
  className?: string;
}

const Sidebar: FC<SidebarProps> = ({ className }) => {
  const { pathname } = useRouter();
  const currentProfile = useAppStore((state) => state.currentProfile);

  return (
    <div className={`mt-8 py-3 rounded-lg lg:px-3 mb-4 sm:px-0 dark:bg-black bg-white ${className ?? ''}`}>
      <Link
        href={'/create-post'}
        className={`bg-brand-500 flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-brand-600 hover:text-brand dark:hover:bg-opacity-20 dark:bg-opacity-20 hover:bg-opacity-100`}
      >
        <PencilAltIcon className="w-4 h-4 text-brand-500" />
        <div className="dark:text-white text-black">Create Post</div>
      </Link>
      <div className="w-full divider my-3" />
      <Menu current={pathname == '/'} url="/">
        <HomeIcon className="w-4 h-4 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Home</div>
      </Menu>
      <Menu current={pathname == '/popular'} url="/popular">
        <TrendingUpIcon className="w-4 h-4 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Popular</div>
      </Menu>
      {currentProfile && (
        <>
          <Menu current={pathname == '/create-community'} url="/create-community">
            <PlusCircleIcon className="w-4 h-4 dark:text-gray-200 text-black" />
            <div className="dark:text-gray-200 text-black">Create Community</div>
          </Menu>
          <Menu current={pathname == `/profile`} url={`/u/${currentProfile.handle}`}>
            <UserCircleIcon className="w-4 h-4 dark:text-gray-200 text-black" />
            <div className="dark:text-gray-200 text-black">Profile</div>
          </Menu>
        </>
      )}
      <Menu current={pathname == '/report-bug'} url="/report-bug">
        <HandIcon className="w-4 h-4 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Repor Bug</div>
      </Menu>
    </div>
  );
};

export default Sidebar;
