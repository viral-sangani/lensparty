import TabButton from '@components/UI/TabButton';
import MetaTags from '@components/utils/MetaTags';
import { AtSymbolIcon, ChatAlt2Icon, LightningBoltIcon } from '@heroicons/react/outline';
import { APP_NAME } from 'data/constants';
import type { FC } from 'react';
import { useState } from 'react';
import Custom404 from 'src/pages/404';
import { useAppStore } from 'src/store/app';

import List from './List';

const Notification: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [feedType, setFeedType] = useState<'ALL' | 'MENTIONS' | 'COMMENTS'>('ALL');

  if (!currentProfile) {
    return <Custom404 />;
  }

  return (
    <div className="flex flex-grow justify-center px-0 sm:px-6 lg:px-8 py-8">
      <MetaTags title={`Notifications • ${APP_NAME}`} />
      <div className="max-w-4xl w-full space-y-3">
        <List feedType={'ALL'} />
      </div>
    </div>
  );
};

export default Notification;
