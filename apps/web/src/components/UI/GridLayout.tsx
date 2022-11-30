import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  classNameChild?: string;
}

export const GridLayout: FC<Props> = ({ children, className = '', classNameChild = '' }) => {
  return (
    <div className={`${className} mx-auto flex-grow pb-2 px-3 sm:px-5 lg:px-0 `}>
      <div className={`grid grid-cols-12 lg:gap-8 ${classNameChild}`}>{children}</div>
    </div>
  );
};

export const GridItemFour: FC<Props> = ({ children, className = '' }) => {
  return <div className={`lg:col-span-4 md:col-span-12 col-span-12 ${className}`}>{children}</div>;
};

export const GridItemThree: FC<Props> = ({ children, className = '' }) => {
  return <div className={`lg:col-span-3 md:col-span-12 col-span-12 ${className}`}>{children}</div>;
};

export const GridItemEight: FC<Props> = ({ children, className = '' }) => {
  return <div className={`lg:col-span-8 md:col-span-12 col-span-12 mb-5 ${className}`}>{children}</div>;
};

export const GridItemNine: FC<Props> = ({ children, className = '' }) => {
  return <div className={`lg:col-span-9 md:col-span-12 col-span-12 mb-5 ${className}`}>{children}</div>;
};
