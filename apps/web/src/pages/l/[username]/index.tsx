import ViewProfile from '@components/Profile';
import { useEffect } from 'react';
import { useProfileTypeStore } from 'src/store/profile-type';

type Props = {};

function CommunityProfile({}: Props) {
  const setProfileType = useProfileTypeStore((state) => state.setProfileType);

  useEffect(() => {
    setProfileType('COMMUNITY');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ViewProfile isCommunity />;
}

export default CommunityProfile;
