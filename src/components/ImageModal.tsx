import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
  scale: number;
  onScaleChange: Dispatch<SetStateAction<number>>;
}

export default function ImageModal({
  imageUrl,
  onClose,
  scale,
  onScaleChange
}: ImageModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-4 right-4 text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10"
          onClick={onClose}
        >
          ×
        </button>
        <div className="flex gap-4 absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            className="bg-white px-4 py-2 rounded"
            onClick={() => onScaleChange((prev) => Math.min(prev + 0.5, 3))}
          >
            +
          </button>
          <button
            className="bg-white px-4 py-2 rounded"
            onClick={() => onScaleChange((prev) => Math.max(prev - 0.5, 1))}
          >
            -
          </button>
        </div>
        <div className="overflow-auto max-h-[90vh] max-w-[90vw]">
          <Image
            src={imageUrl}
            alt="Menu fullscreen"
            width={1000}
            height={1000}
            className="object-contain transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
}
