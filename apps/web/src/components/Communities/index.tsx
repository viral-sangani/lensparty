import EnableDispatcher from '@components/Home/EnableDispatcher';
import Footer from '@components/Shared/Footer';
import Sidebar from '@components/Sidebar/Sidebar';
import {
  GridItemEight,
  GridItemFour,
  GridItemNine,
  GridItemThree,
  GridLayout
} from '@components/UI/GridLayout';
import MetaTags from '@components/utils/MetaTags';
import type { NextPage } from 'next';
import { useAppStore } from 'src/store/app';
import { useCommunityFilterStore } from 'src/store/community-filter';

import CommunitiesList from './CommunitiesList';

const Communities: NextPage = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const currFilter = useCommunityFilterStore((state) => state.currFilter);
  const setCurrFilter = useCommunityFilterStore((state) => state.setCurrFilter);

  return (
    <>
      <MetaTags />
      <div className="dark:bg-gray-900 bg-white">
        <GridLayout className="lg:mx-20 md:mx-10 mx-0">
          <GridItemThree>
            <Sidebar className="hidden md:block" />
          </GridItemThree>
          <GridItemNine className="mt-8">
            <GridLayout className="">
              <GridItemEight className="space-y-5">
                <div className="flex flex-row space-x-2">
                  <div
                    className={`${
                      currFilter === 'POPULAR' ? 'bg-brand-700' : 'bg-gray-700'
                    }  px-4 py-1 rounded-xl cursor-pointer`}
                    onClick={() => {
                      setCurrFilter('POPULAR');
                    }}
                  >
                    Popular Communities
                  </div>
                  <div
                    className={`${
                      currFilter === 'ALL' ? 'bg-brand-700' : 'bg-gray-700'
                    }  px-4 py-1 rounded-xl cursor-pointer`}
                    onClick={() => {
                      setCurrFilter('ALL');
                    }}
                  >
                    All Communities
                  </div>
                  <div
                    className={`${
                      currFilter === 'SUPER' ? 'bg-brand-700' : 'bg-gray-700'
                    }  px-4 py-1 rounded-xl cursor-pointer`}
                    onClick={() => {
                      setCurrFilter('SUPER');
                    }}
                  >
                    Super Communities
                  </div>
                </div>
                <CommunitiesList />
              </GridItemEight>
              <GridItemFour>
                {currentProfile ? <EnableDispatcher /> : null}
                <Footer />
              </GridItemFour>
            </GridLayout>
          </GridItemNine>
        </GridLayout>
      </div>
    </>
  );
};

export default Communities;
