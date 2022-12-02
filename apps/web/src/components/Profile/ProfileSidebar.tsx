import { AdjustmentsIcon, PencilAltIcon, UserIcon } from '@heroicons/react/outline';
import type { FC, ReactNode } from 'react';
import type { TabType } from 'src/store/profile-tab';
import { useProfileTabStore } from 'src/store/profile-tab';

interface MenuProps {
  children: ReactNode;
  tab: TabType;
}

const Menu: FC<MenuProps> = ({ children, tab }) => {
  const currTab = useProfileTabStore((state) => state.currTab);
  const setCurrTab = useProfileTabStore((state) => state.setCurrTab);
  return (
    <div
      className={`${
        currTab === tab && 'bg-brand-100 text-brand font-bold'
      } flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-brand-100 hover:text-brand dark:hover:bg-opacity-20 dark:bg-opacity-20 hover:bg-opacity-100`}
      onClick={(e) => {
        e.preventDefault();
        setCurrTab(tab);
      }}
    >
      {children}
    </div>
  );
};

interface SidebarProps {
  className?: string;
}

const ProfileSidebar: FC<SidebarProps> = ({ className }) => {
  return (
    <div
      className={`mt-0 py-0 rounded-lg mb-0 space-y-1.5 sm:px-0 dark:bg-black bg-white ${className ?? ''}`}
    >
      <Menu tab={'PROFILE'}>
        <UserIcon className="w-5 h-5 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Profile</div>
      </Menu>
      <Menu tab={'EDITPROFILE'}>
        <PencilAltIcon className="w-5 h-5 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Edit Profile</div>
      </Menu>
      {/* <Menu tab={'INTERESTS'}>
        <FireIcon className="w-5 h-5 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Interests</div>
      </Menu> */}

      {/* <Menu tab={'DISPATCHER'}>
        <FingerPrintIcon className="w-5 h-5 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Dispatcher</div>
      </Menu> */}

      <Menu tab={'ALLOWANCE'}>
        <AdjustmentsIcon className="w-5 h-5 dark:text-gray-200 text-black" />
        <div className="dark:text-gray-200 text-black">Allowance</div>
      </Menu>
    </div>
  );
};

export default ProfileSidebar;
