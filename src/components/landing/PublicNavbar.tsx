import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './PublicNavbar.module.css';

interface PublicNavbarProps {
  onOpenDemo?: () => void;
}

export function PublicNavbar({ onOpenDemo }: PublicNavbarProps) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  const handleNavClick = (anchorId: string) => {
    setMobileMenuOpen(false);
    if (isHome) {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${anchorId}`);
    }
  };

  const handleDemoClick = () => {
    setMobileMenuOpen(false);
    if (onOpenDemo) {
      onOpenDemo();
    } else {
      navigate('/demo');
    }
  };

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : ''}`}>
      <div className={styles.navInner}>
        <Link to="/" className={styles.brand}>
          <img src="/logo.jpg" alt="Billora" className={styles.brandLogo} />
          <span className={styles.brandName}>Billora</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={styles.navLinks}>
          <a
            href={isHome ? '#home' : '/#home'}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                handleNavClick('home');
              }
            }}
          >
            Home
          </a>
          <a
            href={isHome ? '#features' : '/#features'}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                handleNavClick('features');
              }
            }}
          >
            Features
          </a>
          <a
            href={isHome ? '#how-it-works' : '/#how-it-works'}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                handleNavClick('how-it-works');
              }
            }}
          >
            How it works
          </a>
          <a
            href={isHome ? '#pricing' : '/#pricing'}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                handleNavClick('pricing');
              }
            }}
          >
            Pricing
          </a>
          <a
            href={isHome ? '#why-billora' : '/#why-billora'}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                handleNavClick('why-billora');
              }
            }}
          >
            About
          </a>
          <Link to="/contact">Contact</Link>
        </div>

        {/* Right Action Buttons */}
        <div className={styles.navActions}>
          <button onClick={handleDemoClick} className={styles.demoLinkBtn} type="button">
            <Sparkles size={14} /> Explore Demo
          </button>
          {user ? (
            <Link to={isAdmin ? '/admin' : '/dashboard'} className={styles.primaryNavBtn}>
              {isAdmin ? 'Admin Console' : 'Open Dashboard'} <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link to="/login" className={styles.signInBtn}>
                Sign in
              </Link>
              <Link to="/register" className={styles.primaryNavBtn}>
                Get Started <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobileMenuToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          type="button"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <a
            href={isHome ? '#home' : '/#home'}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                handleNavClick('home');
              } else {
                setMobileMenuOpen(false);
              }
            }}
          >
            Home
          </a>
          <a
            href={isHome ? '#features' : '/#features'}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                handleNavClick('features');
              } else {
                setMobileMenuOpen(false);
              }
            }}
          >
            Features
          </a>
          <a
            href={isHome ? '#how-it-works' : '/#how-it-works'}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                handleNavClick('how-it-works');
              } else {
                setMobileMenuOpen(false);
              }
            }}
          >
            How it works
          </a>
          <a
            href={isHome ? '#pricing' : '/#pricing'}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                handleNavClick('pricing');
              } else {
                setMobileMenuOpen(false);
              }
            }}
          >
            Pricing
          </a>
          <a
            href={isHome ? '#why-billora' : '/#why-billora'}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                handleNavClick('why-billora');
              } else {
                setMobileMenuOpen(false);
              }
            }}
          >
            About
          </a>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
          <div className={styles.mobileDrawerActions}>
            <button onClick={handleDemoClick} className={styles.mobileDemoBtn} type="button">
              <Sparkles size={14} /> Try Interactive Demo
            </button>
            {user ? (
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className={styles.mobileStartBtn}
                onClick={() => setMobileMenuOpen(false)}
              >
                Open Workspace
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={styles.mobileLoginBtn}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={styles.mobileStartBtn}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Workspace
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
