import { Button } from '@components/UI/Button';
import { Modal } from '@components/UI/Modal';
import { ArrowCircleRightIcon } from '@heroicons/react/outline';
import type { FC } from 'react';
import { useState } from 'react';
import { useAppStore } from 'src/store/app';

import Logout from '../Logout';

const LogoutButton: FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const currentProfile = useAppStore((state) => state.currentProfile);

  if (!currentProfile) {
    return null;
  }

  return (
    <>
      <Modal
        title="Logout"
        icon={<ArrowCircleRightIcon className="w-5 h-5 text-brand" />}
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      >
        <Logout />
      </Modal>
      <Button
        variant="super"
        onClick={() => {
          setShowLoginModal(!showLoginModal);
        }}
      >
        Logout
      </Button>
    </>
  );
};

export default LogoutButton;
