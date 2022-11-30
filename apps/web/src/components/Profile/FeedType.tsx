import TabButton from '@components/UI/TabButton';
import { ChatAlt2Icon, FilmIcon, PencilAltIcon, PhotographIcon } from '@heroicons/react/outline';
import type { ProfileStats } from 'lens';
import type { Dispatch, FC } from 'react';

import MediaFilter from './Filters/MediaFilter';

interface Props {
  stats: ProfileStats;
  setFeedType: Dispatch<string>;
  feedType: string;
}

const FeedType: FC<Props> = ({ stats, setFeedType, feedType }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex overflow-x-auto gap-3 px-5 pb-2 mt-3 sm:px-0 sm:mt-0 md:pb-0">
        <TabButton
          name="Feed"
          icon={<PencilAltIcon className="w-4 h-4" />}
          active={feedType === 'FEED'}
          count={stats?.totalPosts + stats?.totalMirrors}
          onClick={() => {
            setFeedType('FEED');
          }}
        />
        <TabButton
          name="Replies"
          icon={<ChatAlt2Icon className="w-4 h-4" />}
          active={feedType === 'REPLIES'}
          count={stats?.totalComments}
          onClick={() => {
            setFeedType('REPLIES');
          }}
        />
        <TabButton
          name="Media"
          icon={<FilmIcon className="w-4 h-4" />}
          active={feedType === 'MEDIA'}
          onClick={() => {
            setFeedType('MEDIA');
          }}
        />
        <TabButton
          name="NFTs"
          icon={<PhotographIcon className="w-4 h-4" />}
          active={feedType === 'NFT'}
          onClick={() => {
            setFeedType('NFT');
          }}
        />
      </div>
      <div>{feedType === 'MEDIA' && <MediaFilter />}</div>
    </div>
  );
};

export default FeedType;
