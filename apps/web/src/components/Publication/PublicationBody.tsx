import Attachments from '@components/Shared/Attachments';
import IFramely from '@components/Shared/IFramely';
import Markup from '@components/Shared/Markup';
import type { LensPublication } from '@generated/types';
import { EyeIcon } from '@heroicons/react/outline';
import getURLs from '@lib/getURLs';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FC } from 'react';

interface Props {
  publication: LensPublication;
}

const PublicationBody: FC<Props> = ({ publication }) => {
  const { pathname } = useRouter();
  const showMore = publication?.metadata?.content?.length > 450 && pathname !== '/posts/[id]';
  publication.metadata.name;
  const Title = ({ text }: { text: string }) => {
    return <div className="text-2xl mb-2 font-bold text-black dark:text-gray-200">{text}</div>;
  };

  return (
    <div className="break-words pb-2">
      {/* Title */}
      {publication.metadata.name && (
        <Title
          text={
            publication.metadata.name?.includes('.lens') || publication.metadata.name?.includes('.test')
              ? ''
              : publication.metadata.name!
          }
        />
      )}
      <Markup
        className={clsx(
          { 'line-clamp-5': showMore },
          'whitespace-pre-wrap break-words leading-md linkify text-md dark:text-gray-200 text-black'
        )}
      >
        {publication?.metadata?.content}
      </Markup>
      {showMore && (
        <div className="mt-4 text-sm text-gray-500 font-bold flex items-center space-x-1">
          <EyeIcon className="h-4 w-4" />
          <Link href={`/posts/${publication?.id}`}>Show more</Link>
        </div>
      )}
      {publication?.metadata?.media?.length > 0 ? (
        <Attachments attachments={publication?.metadata?.media} publication={publication} />
      ) : (
        publication?.metadata?.content &&
        getURLs(publication?.metadata?.content)?.length > 0 && (
          <IFramely url={getURLs(publication?.metadata?.content)[0]} />
        )
      )}
    </div>
  );
};

export default PublicationBody;
