import type { LensPublication } from '@generated/types';
import type { FC } from 'react';

import ThreadBody from '../ThreadBody';

interface Props {
  publication: LensPublication;
}

const Commented: FC<Props> = ({ publication }) => {
  const commentOn: LensPublication | any = publication?.commentOn;
  const mainPost = commentOn?.mainPost;

  return (
    <>
      {mainPost ? <ThreadBody publication={mainPost} /> : null}
      <ThreadBody publication={commentOn} />
    </>
  );
};

export default Commented;
