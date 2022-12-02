import create from 'zustand';

export type ProfileType = 'USER' | 'COMMUNITY';

interface ProfileTypeStore {
  profileType: ProfileType;
  setProfileType: (profileType: ProfileType) => void;
}

export const useProfileTypeStore = create<ProfileTypeStore>((set) => ({
  profileType: 'USER',
  setProfileType: (profileType) => set(() => ({ profileType }))
}));
