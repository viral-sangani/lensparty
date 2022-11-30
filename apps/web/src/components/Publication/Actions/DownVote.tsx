import type { LensPublication } from '@generated/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { FC } from 'react';

interface Props {
  publication: LensPublication;
  isFullPublication: boolean;
}

const DownVote: FC<Props> = ({ publication, isFullPublication }) => {
  const iconClassName = isFullPublication ? 'w-[17px] sm:w-[20px]' : 'w-[15px] sm:w-[18px]';

  return (
    <motion.button whileTap={{ scale: 0.9 }} aria-label="DownVote">
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
              <path d="M20.901 10.566A1.001 1.001 0 0 0 20 10h-4V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v7H4a1.001 1.001 0 0 0-.781 1.625l8 10a1 1 0 0 0 1.562 0l8-10c.24-.301.286-.712.12-1.059zM12 19.399 6.081 12H10V4h4v8h3.919L12 19.399z" />
            </svg>
          </span>
          <span className="text-[11px] sm:text-xs">{89}</span>
        </span>
      </Link>
    </motion.button>
  );
};

export default DownVote;
