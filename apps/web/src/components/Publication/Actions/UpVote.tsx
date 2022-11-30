import type { LensPublication } from '@generated/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { FC } from 'react';

interface Props {
  publication: LensPublication;
  isFullPublication: boolean;
}

const UpVote: FC<Props> = ({ publication, isFullPublication }) => {
  const iconClassName = isFullPublication ? 'w-[17px] sm:w-[20px]' : 'w-[15px] sm:w-[18px]';

  return (
    <motion.button whileTap={{ scale: 0.9 }} aria-label="UpVote">
      <Link href={`/posts/${publication.id}`}>
        <span className="flex items-center space-x-2 dark:text-gray-400 text-gray-500 hover:bg-blue-300 hover:bg-opacity-20 px-2 py-1 rounded-xl">
          <span className="">
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className={`fill-current ${iconClassName}`}
            >
              <path d="M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10zM15 12h-1v8h-4v-8H6.081L12 4.601 17.919 12H15z" />
            </svg>
          </span>
          <span className="text-[11px] sm:text-xs">{89}</span>
        </span>
      </Link>
    </motion.button>
  );
};

export default UpVote;
