import Link from 'next/link';
import type { FC } from 'react';
import { useAppStore } from 'src/store/app';

import LoginButton from './LoginButton';
import ProfileButton from './ProfileButton';

export const NextLink = ({ href, children, ...rest }: Record<string, any>) => (
  <Link href={href} {...rest}>
    {children}
  </Link>
);

const MenuItems: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);

  if (!currentProfile) {
    return <LoginButton />;
  }

  return <ProfileButton />;
};

export default MenuItems;
