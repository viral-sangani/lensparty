import { StarIcon } from '@heroicons/react/solid';
import type { FC } from 'react';

type Props = {
  title: string;
};

const Badge: FC<Props> = ({ title }) => {
  return (
    <div className="px-1.5 text-xs flex items-center space-x-1 text-white rounded-md border shadow-sm bg-brand-500 border-brand-600">
      <StarIcon className="h-3 w-3" />
      <div>{title}</div>
    </div>
  );
};

export default Badge;
