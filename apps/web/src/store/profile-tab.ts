import create from 'zustand';

export type TabType = 'PROFILE' | 'EDITPROFILE' | 'SETTINGS' | 'INTERESTS' | 'DISPATCHER' | 'ALLOWANCE';

interface ProfileTabState {
  currTab: TabType;
  setCurrTab: (currTab: TabType) => void;
}

export const useProfileTabStore = create<ProfileTabState>((set) => ({
  currTab: 'PROFILE',
  setCurrTab: (currTab) => set(() => ({ currTab }))
}));
