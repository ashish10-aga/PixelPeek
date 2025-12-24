import React, { memo, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useIntersectionObserver } from "../hooks/useCustomHooks";

/**
 * Lazy Image Component with intersection observer
 */
export const LazyImage = memo(({ src, alt, style, crossOrigin, blur }) => {
  const imgRef = useRef(null);
  const isVisible = useIntersectionObserver(imgRef, { threshold: 0.1 });

  const containerStyle = useMemo(() => ({
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    ...style,
  }), [style]);

  const imageStyle = useMemo(() => ({
    ...containerStyle,
    filter: blur !== undefined ? `blur(${blur}px)` : undefined,
  }), [containerStyle, blur]);

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : undefined}
      alt={alt}
      style={imageStyle}
      crossOrigin={crossOrigin}
      loading="lazy"
    />
  );
});

LazyImage.displayName = "LazyImage";

/**
 * Animated HintPanel Component
 */
export const HintPanel = memo(({ hint, blurAmount }) => {
  const hintMemo = useMemo(() => hint, [hint]);

  return (
    <motion.div
      className="hint-panel"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
      key={hint}
    >
      <div className="hint-label">
        💡 HINT
      </div>
      <div className="hint-text">
        {hintMemo || "..."}
      </div>
    </motion.div>
  );
});

HintPanel.displayName = "HintPanel";

/**
 * Game Image Container with fallback states
 */
export const GameImageContainer = memo(({ loading, imageUrl, blur, alt }) => {
  const handleImageError = useCallback(() => {
    console.error("Failed to load image");
  }, []);

  const containerStyle = useMemo(() => ({
    width: "380px",
    height: "380px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }), []);

  if (loading) {
    return (
      <motion.div
        className="game-image-container"
        initial={{ opacity: 0.8, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={containerStyle}
      >
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
          fontFamily: '"Press Start 2P", monospace',
          color: "#FFA500",
        }}>
          SCAN
        </div>
      </motion.div>
    );
  }

  if (!imageUrl) {
    return (
      <motion.div
        className="game-image-container"
        initial={{ opacity: 0.8, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={containerStyle}
      >
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
          fontFamily: '"Press Start 2P", monospace',
          color: "#FF3333",
        }}>
          NO DATA
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="game-image-container"
      initial={{ opacity: 0.8, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={containerStyle}
    >
      <LazyImage
        src={imageUrl}
        alt={alt}
        blur={blur}
        crossOrigin="anonymous"
      />
    </motion.div>
  );
});

GameImageContainer.displayName = "GameImageContainer";

export default {
  LazyImage,
  HintPanel,
  GameImageContainer
};
