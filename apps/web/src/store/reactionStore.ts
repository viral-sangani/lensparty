import create from 'zustand';

export type TabType = 'PROFILE' | 'EDITPROFILE' | 'SETTINGS' | 'INTERESTS' | 'DISPATCHER' | 'ALLOWANCE';

interface ReactionState {
  totalUpVotes: number;
  totalDownVotes: number;
  hasUpVoted: boolean;
  hasDownVoted: boolean;
  setTotalUpVotes: (totalUpVotes: number) => void;
  setTotalDownVotes: (totalDownVotes: number) => void;
  setHasUpVoted: (hasUpVoted: boolean) => void;
  setHasDownVoted: (hasDownVoted: boolean) => void;
}

export const useReactionStore = create<ReactionState>((set) => ({
  totalUpVotes: 0,
  totalDownVotes: 0,
  hasUpVoted: false,
  hasDownVoted: false,
  setTotalUpVotes: (totalUpVotes) => set(() => ({ totalUpVotes })),
  setTotalDownVotes: (totalDownVotes) => set(() => ({ totalDownVotes })),
  setHasUpVoted: (hasUpVoted) => set(() => ({ hasUpVoted })),
  setHasDownVoted: (hasDownVoted) => set(() => ({ hasDownVoted }))
}));
