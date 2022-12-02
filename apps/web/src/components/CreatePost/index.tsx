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
import Custom404 from 'src/pages/404';
import { useAppStore } from 'src/store/app';

import CreatePostForm from './CreatePostForm';

type Props = {};

function CreatePost({}: Props) {
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
              <GridItemEight className="space-y-5">{currentProfile && <CreatePostForm />}</GridItemEight>
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
}

export default CreatePost;
