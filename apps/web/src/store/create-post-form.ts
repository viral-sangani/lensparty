import type { Profile } from 'lens';
import create from 'zustand';

interface CreatePostFromState {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  openCommunityModal: boolean;
  setOpenCommunityModal: (openCommunityModal: boolean) => void;
}

export const useCreatePostFormStore = create<CreatePostFromState>((set) => ({
  profile: null,
  setProfile: (profile) => set(() => ({ profile })),
  openModal: false,
  setOpenModal: (openModal) => set(() => ({ openModal })),
  openCommunityModal: false,
  setOpenCommunityModal: (openCommunityModal) => set(() => ({ openCommunityModal }))
}));
