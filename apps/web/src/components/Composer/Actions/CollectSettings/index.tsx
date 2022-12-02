import { Modal } from '@components/UI/Modal';
import { Tooltip } from '@components/UI/Tooltip';
import GetModuleIcon from '@components/utils/GetModuleIcon';
import { CashIcon } from '@heroicons/react/outline';
import { getModule } from '@lib/getModule';
import type { FC } from 'react';
import { useState } from 'react';
import { useCollectModuleStore } from 'src/store/collect-module';

import CollectForm from './CollectForm';

const CollectSettings: FC = () => {
  const selectedCollectModule = useCollectModuleStore((state) => state.selectedCollectModule);
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className="flex flex-row space-x-3 w-full py-3 px-3 rounded-xl border border-gray-700 hover:bg-brand-900 cursor-pointer"
      onClick={() => {
        setShowModal(!showModal);
      }}
    >
      <Tooltip placement="top" content={getModule(selectedCollectModule).name}>
        <button type="button" aria-label="Choose Collect Module" className="flex flex-row space-x-3">
          <div className="text-brand">
            <GetModuleIcon module={selectedCollectModule} size={6} />
          </div>
          <span>{getModule(selectedCollectModule).name}</span>
        </button>
      </Tooltip>
      <Modal
        title="Collect settings"
        icon={<CashIcon className="w-5 h-5 text-brand" />}
        show={showModal}
        onClose={() => setShowModal(false)}
      >
        <CollectForm setShowModal={setShowModal} />
      </Modal>
    </div>
  );
};

export default CollectSettings;
