'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineX } from 'react-icons/hi';

interface ImageGalleryProps {
  images: { public_id: string; url: string; alt: string }[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const currentImage = images[selectedIndex];
  const isGradient = (url: string) => url && !url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:');

  const goTo = (index: number) => {
    if (index < 0) setSelectedIndex(images.length - 1);
    else if (index >= images.length) setSelectedIndex(0);
    else setSelectedIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !zoom) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gray-100 rounded-sm flex items-center justify-center text-gray-300">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div
          ref={imageRef}
          className="relative aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden cursor-crosshair group"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onClick={() => setIsFullscreen(true)}
        >
          <AnimatePresence mode="wait">
            {isGradient(currentImage.url) ? (
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-full h-full ${currentImage.url}`}
              />
            ) : (
              <motion.img
                key={selectedIndex}
                src={currentImage.url}
                alt={currentImage.alt || 'Product image'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
                style={
                  zoom
                    ? {
                        transform: 'scale(2)',
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : undefined
                }
              />
            )}
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(selectedIndex - 1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                aria-label="Previous image"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(selectedIndex + 1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                aria-label="Next image"
              >
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={img.public_id}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-16 h-20 rounded-sm overflow-hidden border-2 transition-all ${
                  index === selectedIndex
                    ? 'border-black opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                {isGradient(img.url) ? (
                  <div className={`w-full h-full ${img.url}`} />
                ) : (
                  <img
                    src={img.url}
                    alt={img.alt || 'Thumbnail'}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white z-10"
              aria-label="Close"
            >
              <HiOutlineX className="w-8 h-8" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(selectedIndex - 1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <HiOutlineChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(selectedIndex + 1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <HiOutlineChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {isGradient(currentImage.url) ? (
              <motion.div
                key={selectedIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`max-w-[90vw] max-h-[90vh] w-full h-full ${currentImage.url}`}
              />
            ) : (
              <motion.img
                key={selectedIndex}
                src={currentImage.url}
                alt={currentImage.alt || 'Product image'}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-[90vw] max-h-[90vh] object-contain"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
