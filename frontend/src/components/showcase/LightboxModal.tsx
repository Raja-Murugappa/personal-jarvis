import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Attachment } from '@/types/attachment';
import { attachmentsApi } from '@/lib/api';

interface LightboxModalProps {
  images: Attachment[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function LightboxModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxModalProps) {
  const currentImage = images[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < images.length - 1) onNavigate(currentIndex + 1);
      }
    },
    [isOpen, currentIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !currentImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox Viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm select-none"
    >
      {/* Top bar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <span className="text-xs text-neutral-400 font-mono">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
          aria-label="Close lightbox"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 z-10 p-2.5 rounded-full bg-neutral-800/80 text-white hover:bg-neutral-700 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Image View */}
      <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center justify-center p-4">
        <img
          src={attachmentsApi.getFileUrl(currentImage.id)}
          alt={currentImage.alt_text || currentImage.original_name}
          className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
        />
        {/* Caption & Metadata */}
        <div className="mt-3 text-center max-w-xl">
          {currentImage.caption && (
            <p className="text-sm font-medium text-white">{currentImage.caption}</p>
          )}
          <p className="text-xs text-neutral-400 mt-0.5">
            {currentImage.original_name}
            {currentImage.width && currentImage.height
              ? ` • ${currentImage.width}×${currentImage.height}px`
              : ''}
          </p>
        </div>
      </div>

      {/* Next button */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 z-10 p-2.5 rounded-full bg-neutral-800/80 text-white hover:bg-neutral-700 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

