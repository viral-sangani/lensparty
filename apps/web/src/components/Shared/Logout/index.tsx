import { Button } from '@components/UI/Button';
import { useDisconnectXmtp } from '@components/utils/hooks/useXmtpClient';
import resetAuthData from '@lib/resetAuthData';
import { APP_NAME } from 'data/constants';
import { useRouter } from 'next/router';
import type { FC } from 'react';
import { useAppPersistStore, useAppStore } from 'src/store/app';
import { useDisconnect } from 'wagmi';

const Logout: FC = () => {
  const router = useRouter();
  const currentProfile = useAppStore((state) => state.currentProfile);
  const disconnectXmtp = useDisconnectXmtp();
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile);
  const setProfileId = useAppPersistStore((state) => state.setProfileId);
  const { disconnect } = useDisconnect();

  if (!currentProfile) {
    return null;
  }

  const logout = () => {
    disconnectXmtp();
    setCurrentProfile(null);
    setProfileId(null);
    resetAuthData();
    disconnect?.();
    router.push('/');
  };

  return (
    <div className="p-5">
      <div className="space-y-5">
        <div className="space-y-1">
          <div className="text-xl font-bold">Please sign the message.</div>
          <div className="text-sm text-gray-500">
            {APP_NAME} uses this signature to verify that you&rsquo;re the owner of this address.
            <Button variant="super" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;
