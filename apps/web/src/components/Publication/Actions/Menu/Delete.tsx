import type { LensPublication } from '@generated/types';
import { Menu } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/outline';
import clsx from 'clsx';
import { useHidePublicationMutation } from 'lens';
import { useRouter } from 'next/router';
import type { FC } from 'react';

interface Props {
  publication: LensPublication;
}

const Delete: FC<Props> = ({ publication }) => {
  const { pathname, push } = useRouter();
  const [hidePost] = useHidePublicationMutation({
    onCompleted: () => {
      pathname === '/posts/[id]' ? push('/') : location.reload();
    }
  });

  return (
    <Menu.Item
      as="div"
      className={({ active }) =>
        clsx(
          { 'dropdown-active': active },
          'block px-4 py-1.5 text-sm text-red-500 m-2 rounded-lg cursor-pointer'
        )
      }
      onClick={() => {
        if (confirm('Are you sure you want to delete?')) {
          hidePost({
            variables: { request: { publicationId: publication?.id } }
          });
        }
      }}
    >
      <div className="flex items-center space-x-2">
        <TrashIcon className="w-4 h-4" />
        <div>Delete</div>
      </div>
    </Menu.Item>
  );
};

export default Delete;
