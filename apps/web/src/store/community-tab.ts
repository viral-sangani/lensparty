import create from 'zustand';

export type TabType = 'COMMUNITY' | 'EDITCOMMUNITY' | 'SETTINGS' | 'INTERESTS' | 'DISPATCHER' | 'ALLOWANCE';

interface CommunityTabState {
  currTab: TabType;
  setCurrTab: (currTab: TabType) => void;
}

export const useCommunityTabStore = create<CommunityTabState>((set) => ({
  currTab: 'COMMUNITY',
  setCurrTab: (currTab) => set(() => ({ currTab }))
}));
