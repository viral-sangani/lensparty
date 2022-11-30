import clsx from 'clsx';
import type { FC } from 'react';

interface Props {
  slug: string;
  prefix?: string;
  className?: string;
  gradient?: boolean;
}

const Slug: FC<Props> = ({ slug, prefix, className = '', gradient = true }) => {
  return (
    <span
      className={
        gradient
          ? clsx(
              'text-transparent bg-clip-text bg-gradient-to-r from-brand-600 dark:from-brand-400 to-yellow-600 dark:to-yellow-400',
              className
            )
          : 'text-brand-600'
      }
    >
      {prefix}
      {slug}
    </span>
  );
};

export default Slug;
