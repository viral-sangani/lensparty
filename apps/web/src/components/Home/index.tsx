import NewPost from '@components/Composer/Post/New';
import ExploreFeed from '@components/Explore/Feed';
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

import EnableDispatcher from './EnableDispatcher';
import PopularCommunities from './PopularCommunities';
import Timeline from './Timeline';

const Home: NextPage = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);

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
                {currentProfile ? (
                  <>
                    <NewPost />
                    <Timeline />
                  </>
                ) : (
                  <ExploreFeed />
                )}
              </GridItemEight>
              <GridItemFour>
                {currentProfile ? <EnableDispatcher /> : null}
                <PopularCommunities />
                <Footer />
              </GridItemFour>
            </GridLayout>
          </GridItemNine>
        </GridLayout>
      </div>
    </>
  );
};

export default Home;
