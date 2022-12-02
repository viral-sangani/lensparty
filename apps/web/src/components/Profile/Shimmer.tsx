import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer';
import { GridItemEight, GridItemFour, GridLayout } from '@components/UI/GridLayout';
import type { FC } from 'react';

const ProfilePageShimmer: FC = () => {
  return (
    <GridLayout className="max-w-7xl w-full mx-auto mt-8">
      <GridItemFour>
        <div className="px-5 mb-4 space-y-9 sm:px-0">
          <div className="w-32 h-32 bg-gray-100 rounded-full sm:w-32 sm:h-32">
            <div className="w-32 h-32 rounded-full ring-8 sm:w-32 sm:h-32 dark:bg-gray-700 dark:ring-black shimmer" />
          </div>
          <div className="space-y-3">
            <div className="w-1/3 h-5 rounded-lg shimmer" />
            <div className="w-1/4 h-3 rounded-lg shimmer" />
          </div>
          <div className="space-y-5">
            <div className="flex gap-5 pb-1">
              <div className="space-y-2">
                <div className="w-7 h-7 rounded-lg shimmer" />
                <div className="w-20 h-3 rounded-lg shimmer" />
              </div>
              <div className="space-y-2">
                <div className="w-7 h-7 rounded-lg shimmer" />
                <div className="w-20 h-3 rounded-lg shimmer" />
              </div>
            </div>
            <div className="w-28 rounded-lg h-[34px] shimmer" />
            <div className="space-y-2">
              <div className="w-7/12 h-3 rounded-lg shimmer" />
              <div className="w-1/3 h-3 rounded-lg shimmer" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-lg shimmer" />
                <div className="w-20 h-3 rounded-lg shimmer" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-lg shimmer" />
                <div className="w-20 h-3 rounded-lg shimmer" />
              </div>
            </div>
          </div>
        </div>
      </GridItemFour>
      <GridItemEight>
        <PublicationsShimmer />
      </GridItemEight>
    </GridLayout>
  );
};

export default ProfilePageShimmer;
