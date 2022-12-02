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
import Custom404 from 'src/pages/404';
import { useAppStore } from 'src/store/app';

import CreateCommunityForm from './CreateCommunityForm';

const CreateCommunity: NextPage = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);

  if (!currentProfile) {
    return <Custom404 />;
  }

  return (
    <>
      <MetaTags />
      <div className="dark:bg-gray-900  bg-white">
        <GridLayout className="lg:mx-20 md:mx-10 mx-0">
          <GridItemThree>
            <Sidebar className="hidden md:block" />
          </GridItemThree>
          <GridItemNine className="mt-8">
            <GridLayout className="">
              <GridItemEight className="space-y-5">{currentProfile && <CreateCommunityForm />}</GridItemEight>
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

export default CreateCommunity;
