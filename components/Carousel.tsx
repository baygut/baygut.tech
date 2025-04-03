import React, { useState, useEffect, useRef, TouchEvent, MouseEvent } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, X as CloseIcon } from 'lucide-react';

interface CarouselProps {
  images: string[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  title: string;
  hideNavigation?: boolean; // New prop to hide navigation arrows
  hideStatusDots?: boolean; // New prop to hide indicator dots
  tapToFullscreen?: boolean; // New prop to enable fullscreen modal viewing
  className?: string; // Optional className prop for custom styling
}

const Carousel: React.FC<CarouselProps> = ({
  images,
  autoSlide = false,
  autoSlideInterval = 3000,
  title,
  hideNavigation = false,
  hideStatusDots = false,
  tapToFullscreen = false,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Swipe functionality state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (px)
  const minSwipeDistance = 50;

  // Function to move to the next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  // Function to move to the previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  // Handle touch/swipe start
  const handleTouchStart = (e: TouchEvent | MouseEvent) => {
    // For touch events
    if ('touches' in e) {
      setTouchStart(e.touches[0].clientX);
      setTouchEnd(null);
      return;
    }
    // For mouse events
    setTouchStart(e.clientX);
    setTouchEnd(null);
  };

  // Handle touch/swipe move
  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    // For touch events
    if ('touches' in e) {
      setTouchEnd(e.touches[0].clientX);
      return;
    }
    // For mouse events
    setTouchEnd(e.clientX);
  };

  // Handle touch/swipe end
  const handleTouchEnd = (isModal = false) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Handle left swipe - go to next
      if (isModal) {
        setModalImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        nextSlide();
      }
    }

    if (isRightSwipe) {
      // Handle right swipe - go to previous
      if (isModal) {
        setModalImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else {
        prevSlide();
      }
    }

    // Reset
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Function to handle fullscreen modal
  const openModal = (index: number) => {
    if (!tapToFullscreen) return;
    setModalImageIndex(index);
    setIsModalOpen(true);
    // Pause autoSlide when modal is open
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Restart timer if autoSlide was enabled
    if (autoSlide) {
      timerRef.current = setInterval(nextSlide, autoSlideInterval);
    }
  };

  // Set up auto-sliding
  useEffect(() => {
    if (!autoSlide) return;

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, autoSlideInterval);
    };

    startTimer();

    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoSlide, autoSlideInterval]);

  // If there are no images or just one image, handle accordingly
  if (!images || images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className="relative h-64 md:h-80 w-full flex items-center justify-center">
        <img
          src={images[0]}
          alt={`${title} image`}
          className={`object-contain max-h-full max-w-full ${
            tapToFullscreen ? 'cursor-pointer' : ''
          }`}
          onClick={() => tapToFullscreen && openModal(0)}
        />

        {/* Fullscreen modal for single image */}
        {isModalOpen && tapToFullscreen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center"
            onClick={closeModal}
          >
            <div
              className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[0]}
                alt={`${title} - fullscreen image`}
                className="max-h-screen max-w-full object-contain"
              />

              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white/30 p-2 rounded-full hover:bg-white/50"
                aria-label="Close fullscreen view"
              >
                <CloseIcon size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="overflow-hidden w-full h-full relative">
        <div
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => handleTouchEnd()}
          onMouseDown={handleTouchStart}
          onMouseMove={touchStart ? handleTouchMove : undefined}
          onMouseUp={() => handleTouchEnd()}
          onMouseLeave={() => touchStart && handleTouchEnd()}
        >
          {images.map((image, index) => (
            <div key={index} className="min-w-full w-full h-full flex items-center justify-center">
              <img
                src={image}
                alt={`${title} - image ${index + 1}`}
                className={`object-contain max-h-full max-w-full aspect-video ${
                  tapToFullscreen ? 'cursor-pointer' : ''
                }`}
                onClick={() => openModal(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows - conditionally rendered */}
      {!hideNavigation && images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hover:bg-white"
            aria-label="Previous image"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hover:bg-white"
            aria-label="Next image"
          >
            <ChevronRightIcon size={20} />
          </button>
        </>
      )}

      {/* Indicator dots - conditionally rendered */}
      {!hideStatusDots && images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index ? 'bg-white w-4' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Fullscreen modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center"
          onClick={closeModal} // Add click handler to the overlay
        >
          <div
            className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => handleTouchEnd(true)}
            onMouseDown={handleTouchStart}
            onMouseMove={touchStart ? handleTouchMove : undefined}
            onMouseUp={() => handleTouchEnd(true)}
            onMouseLeave={() => touchStart && handleTouchEnd(true)}
          >
            <img
              src={images[modalImageIndex]}
              alt={`${title} - fullscreen image ${modalImageIndex + 1}`}
              className="max-h-screen max-w-full object-contain"
              draggable="false" // Prevent image dragging to enable clean swipe
            />

            {/* Image counter - shows current/total */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {modalImageIndex + 1}/{images.length}
            </div>

            {/* Modal navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute -left-20 top-1/2 -translate-y-1/2 bg-white/30 p-3 rounded-full hover:bg-white/50"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute -right-20 top-1/2 -translate-y-1/2 bg-white/30 p-3 rounded-full hover:bg-white/50"
                  aria-label="Next image"
                >
                  <ChevronRightIcon size={24} />
                </button>
              </>
            )}

            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white/30 p-2 rounded-full hover:bg-white/50"
              aria-label="Close fullscreen view"
            >
              <CloseIcon size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;
