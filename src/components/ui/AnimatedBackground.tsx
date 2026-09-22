import React from 'react';
import { AnimatedGridPattern } from './animated-grid-pattern';
import styles from './AnimatedBackground.module.css';

interface AnimatedBackgroundProps {
  showGrid?: boolean;
  className?: string;
}

export function AnimatedBackground({ showGrid = true, className = '' }: AnimatedBackgroundProps) {
  return (
    <div className={`${styles.container} ${className}`} aria-hidden="true">
      {/* Floating fluid aurora mesh orbs */}
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />
      <div className={`${styles.orb} ${styles.orb4}`} />

      {/* Optical clarity overlay */}
      <div className={styles.vignette} />

      {/* Animated SVG Grid Pattern with motion squares */}
      {showGrid && (
        <div className={styles.gridLayer}>
          <AnimatedGridPattern
            width={48}
            height={48}
            numSquares={45}
            maxOpacity={0.45}
            duration={3.5}
            repeatDelay={0.4}
            className="text-indigo-600/30"
          />
        </div>
      )}
    </div>
  );
}
