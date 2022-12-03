import type { Profile } from 'lens';
import create from 'zustand';

interface CreatePostFromState {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

export const useCreatePostFormStore = create<CreatePostFromState>((set) => ({
  profile: null,
  setProfile: (profile) => set(() => ({ profile }))
}));
