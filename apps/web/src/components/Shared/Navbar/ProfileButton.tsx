import getAvatar from '@lib/getAvatar';
import type { Profile } from 'lens';
import Link from 'next/link';
import type { FC } from 'react';
import { useAppStore } from 'src/store/app';

const ProfileButton: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);

  return (
    <Link href={`/u/${currentProfile?.handle}`}>
      <img
        className="w-8 h-8 rounded-full border cursor-pointer dark:border-gray-700/80"
        src={getAvatar(currentProfile as Profile)}
        alt={currentProfile?.handle}
      />
    </Link>
  );
};

export default ProfileButton;
