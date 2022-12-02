import { Spinner } from '@components/UI/Spinner';
import type { LensterAttachment } from '@generated/types';
import { VideoCameraIcon } from '@heroicons/react/outline';
import uploadToIPFS from '@lib/uploadToIPFS';
import { ALLOWED_IMAGE_TYPES, ALLOWED_MEDIA_TYPES, ALLOWED_VIDEO_TYPES } from 'data/constants';
import type { ChangeEvent, Dispatch, FC } from 'react';
import { useId, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  attachments: LensterAttachment[];
  setAttachments: Dispatch<LensterAttachment[]>;
}

const UploadVideoAttachment: FC<Props> = ({ attachments, setAttachments }) => {
  const [loading, setLoading] = useState(false);
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);

  const hasVideos = (files: any) => {
    let videos = 0;
    let images = 0;

    for (const file of files) {
      if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        videos = videos + 1;
      } else {
        images = images + 1;
      }
    }

    if (videos > 0) {
      if (videos > 1) {
        return true;
      }

      return images > 0 ? true : false;
    }

    return false;
  };

  const isTypeAllowed = (files: any) => {
    for (const file of files) {
      if (ALLOWED_MEDIA_TYPES.includes(file.type)) {
        return true;
      }
    }

    return false;
  };

  const handleAttachment = async (evt: ChangeEvent<HTMLInputElement>) => {
    console.log('here');
    evt.preventDefault();
    setLoading(true);

    try {
      // Count check
      if (evt.target.files && (hasVideos(evt.target.files) || evt.target.files.length > 4)) {
        return toast.error('Please choose either 1 video or up to 4 photos.');
      }

      // Type check
      if (isTypeAllowed(evt.target.files)) {
        const attachment = await uploadToIPFS(evt.target.files);
        if (attachment) {
          setAttachments(attachment);
          evt.target.value = '';
        }
      } else {
        return toast.error('File format not allowed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => {
        ref.current?.click();
      }}
      className="flex flex-row space-x-3 w-full py-3 px-3 rounded-xl border border-gray-700 hover:bg-brand-900 cursor-pointer"
    >
      {loading ? <Spinner size="sm" /> : <VideoCameraIcon className="w-6 h-6 text-brand" />}
      <span>Upload Video</span>
      <input
        id={`image_${id}`}
        type="file"
        multiple
        ref={ref}
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={handleAttachment}
        disabled={attachments.length >= 4}
      />
    </div>
  );
};

export default UploadVideoAttachment;
