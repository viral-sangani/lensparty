import QueuedPublication from '@components/Publication/QueuedPublication';
import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer';
import { EmptyState } from '@components/UI/EmptyState';
import { ErrorMessage } from '@components/UI/ErrorMessage';
import InfiniteLoader from '@components/UI/InfiniteLoader';
import { CollectionIcon } from '@heroicons/react/outline';
import { SCROLL_THRESHOLD, SERVER_WALLET_ADDRESS } from 'data/constants';
import type { Profile } from 'lens';
import { useProfilesQuery } from 'lens';
import type { FC } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAppStore } from 'src/store/app';
import { useCommunityFilterStore } from 'src/store/community-filter';
import { useTimelineStore } from 'src/store/timeline';
import { useTransactionPersistStore } from 'src/store/transaction';

import SingleCommunity from './SingleCommunity';

const CommunitiesList: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const txnQueue = useTransactionPersistStore((state) => state.txnQueue);
  const seeThroughProfile = useTimelineStore((state) => state.seeThroughProfile);
  const currFilter = useCommunityFilterStore((state) => state.currFilter);

  // Variables
  const profileId = seeThroughProfile?.id ?? currentProfile?.id;
  const request = { ownedBy: [SERVER_WALLET_ADDRESS], limit: 50 };
  const reactionRequest = currentProfile ? { profileId } : null;

  const { data, loading, error, fetchMore } = useProfilesQuery({
    variables: { request }
  });

  let communities = data?.profiles.items;
  let popularCommunities: Profile[] = [];
  let superCommunities: Profile[] = [];

  const pageInfo = data?.profiles?.pageInfo;
  const hasMore = pageInfo?.next && communities?.length !== pageInfo.totalCount;

  const loadMore = async () => {
    await fetchMore({
      variables: { request: { ...request, cursor: pageInfo?.next }, reactionRequest, profileId }
    });
  };

  if (loading) {
    return <PublicationsShimmer />;
  }

  if (communities?.length === 0) {
    return (
      <EmptyState
        message={<div>No posts yet!</div>}
        icon={<CollectionIcon className="w-8 h-8 text-brand" />}
      />
    );
  }

  if (error) {
    return <ErrorMessage title="Failed to load timeline" error={error} />;
  }

  if (currFilter === 'POPULAR' && communities) {
    // filter and remove all communities with zero followers;
    popularCommunities = communities.filter((community) => community.stats.totalFollowers > 0) as Profile[];
    popularCommunities.sort((a, b) => b.stats.totalFollowers - a.stats.totalFollowers);
  } else if (currFilter === 'SUPER' && communities) {
    superCommunities = communities.filter(
      (community) => community.followModule?.__typename === 'FeeFollowModuleSettings'
    ) as Profile[];
  }

  return (
    <InfiniteScroll
      dataLength={communities?.length ?? 0}
      scrollThreshold={SCROLL_THRESHOLD}
      hasMore={hasMore}
      next={loadMore}
      loader={<InfiniteLoader />}
    >
      {txnQueue.map(
        (txn) =>
          txn?.type === 'NEW_POST' && (
            <div key={txn.id}>
              <QueuedPublication txn={txn} />
            </div>
          )
      )}
      {(currFilter === 'POPULAR'
        ? (popularCommunities as Profile[])
        : currFilter === 'SUPER'
        ? superCommunities
        : communities
      )?.map((community, index: number) => (
        <SingleCommunity key={index} profile={community as Profile} />
      ))}
    </InfiniteScroll>
  );
};

export default CommunitiesList;
