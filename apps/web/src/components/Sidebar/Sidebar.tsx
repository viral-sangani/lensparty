import BetaWarning from '@components/Home/BetaWarning';
import Slug from '@components/Shared/Slug';
import {
  HandIcon,
  HomeIcon,
  PencilAltIcon,
  PlusCircleIcon,
  SparklesIcon,
  TrendingUpIcon
} from '@heroicons/react/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FC, ReactNode } from 'react';

interface MenuProps {
  children: ReactNode;
  current: boolean;
  url: string;
}

const Menu: FC<MenuProps> = ({ children, current, url }) => (
  <Link
    href={url}
    className={clsx(
      'flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-brand-100 hover:text-brand dark:hover:bg-opacity-20 dark:bg-opacity-20 hover:bg-opacity-100',
      { 'bg-brand-100 text-brand font-bold': current }
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

  return (
    <div
      className={`mt-8 py-3 rounded-lg lg:px-3 mb-4 space-y-1.5 sm:px-0 dark:bg-black bg-white ${
        className ?? ''
      }`}
    >
      <Menu current={pathname == '/settings/dispatcher'} url="/settings/dispatcher">
        <PencilAltIcon className="w-4 h-4 text-brand-500" />
        <div className="text-brand-500">Create Post</div>
      </Menu>
      <Menu current={pathname == '/settings'} url="/settings">
        <HomeIcon className="w-4 h-4 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Home</div>
      </Menu>
      <Menu current={pathname == '/settings/account'} url="/settings/account">
        <TrendingUpIcon className="w-4 h-4 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Popular</div>
      </Menu>
      <Menu current={pathname == '/settings/interests'} url="/settings/interests">
        <PlusCircleIcon className="w-4 h-4 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Create Community</div>
      </Menu>

      <Menu current={pathname == '/settings/allowance'} url="/settings/allowance">
        <HandIcon className="w-4 h-4 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Repor Bug</div>
      </Menu>
      <Menu current={pathname == '/settings/cleanup'} url="/settings/cleanup">
        <SparklesIcon className="w-4 h-4 dark:text-gray-200 text-black" />
        <Slug className="text-base" slug="Something New" />
      </Menu>

      <BetaWarning />
    </div>
  );
};

export default Sidebar;
