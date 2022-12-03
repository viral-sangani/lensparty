import type { Profile } from 'lens';
import type { ProfileType } from 'src/store/profile-type';

const getProfileType = (profile: Profile): ProfileType => {
  let { attributes } = profile;

  let profileTypeAttribute = attributes?.filter((attribute) => attribute.key === 'profileType');
  const currType =
    profileTypeAttribute && profileTypeAttribute?.length > 0
      ? profileTypeAttribute.filter((data) => data.key == 'profileType' && data.value == 'community')
        ? 'COMMUNITY'
        : 'USER'
      : 'USER';
  return currType;
};

export default getProfileType;
