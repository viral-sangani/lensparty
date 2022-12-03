import { DEFAULT_COLLECT_TOKEN } from 'data/constants';
import { CollectModules } from 'lens';
import create from 'zustand';

interface FollowModuleState {
  selectedFollowModuel: CollectModules;
  setSelectedCollectModule: (selectedModule: CollectModules) => void;
  amount: null | string;
  setAmount: (amount: null | string) => void;

  payload: any;
  setPayload: (payload: any) => void;
  reset: () => void;
}

export const useCollectModuleStore = create<FollowModuleState>((set) => ({
  selectedFollowModuel: CollectModules.FreeCollectModule,
  setSelectedCollectModule: (selectedFollowModuel) => set(() => ({ selectedFollowModuel })),
  amount: null,
  setAmount: (amount) => set(() => ({ amount })),

  payload: { freeCollectModule: { followerOnly: false } },
  setPayload: (payload) => set(() => ({ payload })),
  reset: () =>
    set(() => ({
      selectedFollowModuel: CollectModules.FreeCollectModule,
      amount: null,
      selectedCurrency: DEFAULT_COLLECT_TOKEN,
      referralFee: null,
      collectLimit: null,
      hasTimeLimit: false,
      followerOnly: false,
      payload: { freeCollectModule: { followerOnly: false } }
    }))
}));
