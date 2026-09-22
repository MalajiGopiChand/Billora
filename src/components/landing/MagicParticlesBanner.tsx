import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Floating3DParticles } from '@/registry/magicui/floating-3d-particles';
import styles from './MagicParticlesBanner.module.css';

interface MagicParticlesBannerProps {
  onOpenDemo?: () => void;
}

export function MagicParticlesBanner({ onOpenDemo }: MagicParticlesBannerProps) {
  // Radiant luminous particles for deep SaaS background
  const particleColor = '#38bdf8';

  return (
    <div className={styles.bannerContainer}>
      {/* 3D Floating Particles Background */}
      <Floating3DParticles color={particleColor} particleCount={130} speed={0.0016} connectDistance={70} />

      {/* Ambient background glow highlights */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />

      <div className={styles.content}>
        <div className={styles.badge}>
          <Sparkles size={14} className={styles.sparkleIcon} />
          <span>Next-Generation Billing Intelligence</span>
        </div>

        <h2 className={styles.headline}>
          Build something magical for your business.
        </h2>

        <p className={styles.description}>
          Experience lightning-fast counter billing, automatic GST calculations, customer khata tracking, and live turnover analytics in one elegant workspace.
        </p>

        <div className={styles.btnGroup}>
          <Link to="/register" className={styles.getStartedBtn}>
            Get Started <ArrowRight size={17} />
          </Link>
          {onOpenDemo && (
            <button onClick={onOpenDemo} className={styles.demoBtn}>
              Explore 3D Simulator
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
