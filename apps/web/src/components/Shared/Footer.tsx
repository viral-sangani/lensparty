import { APP_NAME } from 'data/constants';
import type { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className={`mt-4 leading-7 text-sm sticky flex flex-wrap px-3 lg:px-0 gap-x-[12px]`}>
      <span className="font-bold text-gray-500 dark:text-gray-300">
        &copy; {new Date().getFullYear()} {APP_NAME}
      </span>
      {/* <Link href="/privacy">Privacy</Link> */}
      {/* <Link href="/thanks">Thanks</Link> */}
      {/*<a href="https://github.com/lensterxyz/lenster" target="_blank" rel="noreferrer noopener">
        GitHub
      </a> */}
      {/* <a
        className="pr-3 hover:font-bold"
        href={`https://vercel.com/?utm_source=${APP_NAME}&utm_campaign=oss`}
        target="_blank"
        rel="noreferrer noopener"
      >
        Powered by Netlify
      </a> */}
    </footer>
  );
};

export default Footer;
