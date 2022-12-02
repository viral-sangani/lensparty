import { Card } from '@components/UI/Card';
import { PageLoading } from '@components/UI/PageLoading';
import { useProfileSettingsQuery } from 'lens';
import type { NextPage } from 'next';
import Custom404 from 'src/pages/404';
import Custom500 from 'src/pages/500';
import { useAppStore } from 'src/store/app';

import Picture from './Picture';
import Profile from './Profile';

const EditProfile: NextPage = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);

  const { data, loading, error } = useProfileSettingsQuery({
    variables: { request: { profileId: currentProfile?.id } },
    skip: !currentProfile?.id,
    onCompleted: (data) => {
      // @ts-ignore
      setSettingsType(data?.profile?.picture?.uri ? 'NFT' : 'AVATAR');
    }
  });

  if (error) {
    return <Custom500 />;
  }

  if (loading) {
    return <PageLoading message="Loading settings" />;
  }

  if (!currentProfile) {
    return <Custom404 />;
  }

  const profile = data?.profile;

  return (
    <>
      <Card className="space-y-5 p-5">
        <Picture profile={profile as any} />
      </Card>
      <Profile profile={profile as any} />
    </>
  );
};

export default EditProfile;
