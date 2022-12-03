import Feed from '@components/Comment/Feed';
import Footer from '@components/Shared/Footer';
import Sidebar from '@components/Sidebar/Sidebar';
import { Card } from '@components/UI/Card';
import {
  GridItemEight,
  GridItemFour,
  GridItemNine,
  GridItemThree,
  GridLayout
} from '@components/UI/GridLayout';
import MetaTags from '@components/utils/MetaTags';
import { APP_NAME } from 'data/constants';
import { usePublicationQuery } from 'lens';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Custom404 from 'src/pages/404';
import Custom500 from 'src/pages/500';
import { useAppStore } from 'src/store/app';

import FullPublication from './FullPublication';
import OnchainMeta from './OnchainMeta';
import RelevantPeople from './RelevantPeople';
import PublicationPageShimmer from './Shimmer';

const ViewPublication: NextPage = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);

  const {
    query: { id }
  } = useRouter();

  const { data, loading, error } = usePublicationQuery({
    variables: {
      request: { publicationId: id },
      reactionRequest: currentProfile ? { profileId: currentProfile?.id } : null,
      profileId: currentProfile?.id ?? null
    },
    skip: !id
  });

  if (error) {
    return <Custom500 />;
  }

  if (loading || !data) {
    return <PublicationPageShimmer />;
  }

  if (!data.publication) {
    return <Custom404 />;
  }

  const { publication } = data as any;

  return (
    <div className="dark:bg-gray-900 bg-white">
      <GridLayout className="lg:mx-20 md:mx-10 mx-0">
        <MetaTags
          title={
            publication.__typename && publication?.profile?.handle
              ? `${publication.__typename} by u/${publication.profile.handle} • ${APP_NAME}`
              : APP_NAME
          }
        />
        <GridItemThree>
          <Sidebar className="hidden md:block" />
        </GridItemThree>
        <GridItemNine className="mt-8">
          <GridLayout>
            <GridItemEight className="space-y-5">
              <Card>
                <FullPublication publication={publication} />
              </Card>
              <Feed publication={publication} />
            </GridItemEight>
            <GridItemFour className="space-y-5">
              <RelevantPeople publication={publication} />
              <OnchainMeta publication={publication} />
              <Footer />
            </GridItemFour>
          </GridLayout>
        </GridItemNine>
      </GridLayout>
    </div>
  );
};

export default ViewPublication;
