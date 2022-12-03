import ViewProfile from '@components/Profile';

type Props = {};

function CommunityProfile({}: Props) {
  return <ViewProfile isCommunity={true} />;
}

export default CommunityProfile;
