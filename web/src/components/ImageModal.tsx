import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
  scale: number;
  onScaleChange: Dispatch<SetStateAction<number>>;
  onNext?: () => void;
  onPrevious?: () => void;
  images?: { imageUrl: string }[];
  currentIndex?: number;
  onImageSelect?: (index: number) => void;
}

export default function ImageModal({
  imageUrl,
  onClose,
  scale,
  onScaleChange,
  onNext,
  onPrevious,
  images,
  currentIndex = 0,
  onImageSelect
}: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          onNext?.();
          break;
        case 'ArrowLeft':
          onPrevious?.();
          break;
        case '+':
        case '=':
          onScaleChange((prev) => Math.min(prev + 0.5, 3));
          break;
        case '-':
        case '_':
          onScaleChange((prev) => Math.max(prev - 0.5, 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious, onScaleChange]);

  if (!imageUrl || imageUrl.trim() === '') {
    onClose();
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative flex-1 w-full flex items-center justify-center px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10 hover:bg-opacity-70 flex items-center justify-center z-50"
          onClick={onClose}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>

        {/* Navigation buttons - always visible */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black bg-opacity-50 rounded-full w-12 h-12 hover:bg-opacity-70 flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-50"
          onClick={onPrevious}
          disabled={!onPrevious}
          aria-label="Previous image"
        >
          <FaChevronLeft />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl bg-black bg-opacity-50 rounded-full w-12 h-12 hover:bg-opacity-70 flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-50"
          onClick={onNext}
          disabled={!onNext}
          aria-label="Next image"
        >
          <FaChevronRight />
        </button>

        {/* Main Image */}
        <div
          className="relative max-h-[calc(100vh-200px)] max-w-[calc(100vw-64px)] overflow-auto"
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          <div
            className="relative"
            style={{
              minWidth: `${100 * scale}%`,
              minHeight: `${100 * scale}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Image
              src={imageUrl}
              alt="Menu fullscreen"
              width={1000}
              height={1000}
              className="object-contain w-full h-full transition-transform duration-200"
            />
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex gap-4 absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            className="bg-white px-4 py-2 rounded hover:bg-gray-100"
            onClick={() => onScaleChange((prev) => Math.min(prev + 0.5, 3))}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            className="bg-white px-4 py-2 rounded hover:bg-gray-100"
            onClick={() => onScaleChange((prev) => Math.max(prev - 0.5, 1))}
            aria-label="Zoom out"
          >
            -
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
          Use arrow keys to navigate • +/- to zoom • ESC to close
        </div>
      </div>

      {/* Thumbnails */}
      {images && images.length > 1 && (
        <div className="w-full h-24 bg-black bg-opacity-50 flex items-center justify-center gap-2 p-2 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => onImageSelect?.(index)}
              className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                currentIndex === index
                  ? 'ring-2 ring-primary scale-105'
                  : 'opacity-70 hover:opacity-100'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={img.imageUrl}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
