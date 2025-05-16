import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

function ZoomableImage({ src, alt, className }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const lensSize = 190; // Size of the magnifying lens in pixels
  const zoomFactor = 5; // Zoom magnification level

  // Handle mouse enter
  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  // Handle mouse move to update lens position
  const handleMouseMove = (e) => {
    if (!isZoomed || !containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();

    // Calculate cursor position relative to the container
    const cursorX = e.clientX - left;
    const cursorY = e.clientY - top;

    // Calculate lens position (centered on cursor)
    const lensX = Math.max(0, Math.min(width - lensSize, cursorX - lensSize / 2));
    const lensY = Math.max(0, Math.min(height - lensSize, cursorY - lensSize / 2));

    // Calculate background position for the zoomed image inside the lens
    // This is the magic that makes the zoom effect work correctly
    const bgX = (cursorX / width) * 100;
    const bgY = (cursorY / height) * 100;

    setPosition({
      lensX,
      lensY,
      bgX,
      bgY
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Regular image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover object-center"
      />

      {/* Magnifying lens */}
      {isZoomed && (
        <div
          className="absolute pointer-events-none z-10 rounded-full shadow-lg border-2 border-white overflow-hidden"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${position.lensX}px`,
            top: `${position.lensY}px`,
            backgroundImage: `url(${src})`,
            backgroundSize: `${zoomFactor * 100}%`,
            backgroundPosition: `${position.bgX}% ${position.bgY}%`,
            transition: 'background-position 0.05s ease-out'
          }}
        >
          {/* Lens border effect */}
          <div className="absolute inset-0 border border-gray-200 rounded-full opacity-50"></div>
        </div>
      )}
    </div>
  );
}

ZoomableImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string
};

ZoomableImage.defaultProps = {
  alt: 'Product image',
  className: ''
};

export default ZoomableImage;
