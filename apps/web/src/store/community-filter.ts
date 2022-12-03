import create from 'zustand';

export type FilterType = 'ALL' | 'POPULAR' | 'SUPER';

interface CommunityFilterState {
  currFilter: FilterType;
  setCurrFilter: (currTab: FilterType) => void;
}

export const useCommunityFilterStore = create<CommunityFilterState>((set) => ({
  currFilter: 'POPULAR',
  setCurrFilter: (currFilter) => set(() => ({ currFilter }))
}));
