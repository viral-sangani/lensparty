import type { LensPublication } from '@generated/types';
import type { FC } from 'react';

import Collected from './Collected';
import Commented from './Commented';
import CommentedPublication from './CommentedPublication';
import Mirrored from './Mirrored';

interface Props {
  publication: LensPublication;
  showType?: boolean;
  showThread?: boolean;
}

const PublicationType: FC<Props> = ({ publication, showType, showThread = false }) => {
  const type = publication.__typename;
  const isCollected = Boolean(publication?.collectedBy);

  if (!showType) {
    return null;
  }

  return (
    <>
      {type === 'Mirror' && <Mirrored publication={publication} />}
      {type === 'Comment' && !showThread && <CommentedPublication publication={publication} />}
      {type === 'Comment' && showThread && !isCollected && <Commented publication={publication} />}
      {isCollected && <Collected publication={publication} />}
    </>
  );
};

export default PublicationType;
