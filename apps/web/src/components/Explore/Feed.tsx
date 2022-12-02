import SinglePublication from '@components/Publication/SinglePublication';
import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer';
import { EmptyState } from '@components/UI/EmptyState';
import { ErrorMessage } from '@components/UI/ErrorMessage';
import InfiniteLoader from '@components/UI/InfiniteLoader';
import type { LensPublication } from '@generated/types';
import { CollectionIcon } from '@heroicons/react/outline';
import { SCROLL_THRESHOLD } from 'data/constants';
import { CustomFiltersTypes, PublicationSortCriteria, useExploreFeedQuery } from 'lens';
import type { FC } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAppStore } from 'src/store/app';

interface Props {
  focus?: any;
  feedType?: PublicationSortCriteria;
}

const Feed: FC<Props> = ({ focus, feedType = PublicationSortCriteria.Latest }) => {
  const currentProfile = useAppStore((state) => state.currentProfile);

  // Variables
  const request = {
    sortCriteria: feedType,
    noRandomize: feedType === 'LATEST',
    // customFilters: [CustomFiltersTypes.Gardeners],
    metadata: focus ? { mainContentFocus: focus } : null,
    limit: 10,
    sources: ['lensparty']
  };
  const reactionRequest = currentProfile ? { profileId: currentProfile?.id } : null;
  const profileId = currentProfile?.id ?? null;

  const { data, loading, error, fetchMore } = useExploreFeedQuery({
    variables: { request, reactionRequest, profileId }
  });

  const publications = data?.explorePublications?.items;
  const pageInfo = data?.explorePublications?.pageInfo;
  const hasMore = pageInfo?.next && publications?.length !== pageInfo.totalCount;

  const loadMore = async () => {
    await fetchMore({
      variables: { request: { ...request, cursor: pageInfo?.next }, reactionRequest, profileId }
    });
  };

  if (loading) {
    return <PublicationsShimmer />;
  }

  if (publications?.length === 0) {
    return (
      <EmptyState
        message={<div>No posts yet!</div>}
        icon={<CollectionIcon className="w-8 h-8 text-brand" />}
      />
    );
  }

  if (error) {
    return <ErrorMessage title="Failed to load explore feed" error={error} />;
  }

  return (
    <InfiniteScroll
      dataLength={publications?.length ?? 0}
      scrollThreshold={SCROLL_THRESHOLD}
      hasMore={hasMore}
      next={loadMore}
      loader={<InfiniteLoader />}
    >
      {publications?.map((publication, index: number) => (
        <SinglePublication key={`${publication.id}_${index}`} publication={publication as LensPublication} />
      ))}
    </InfiniteScroll>
  );
};

export default Feed;
