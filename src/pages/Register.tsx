import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Package,
  Share2,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { PublicNavbar } from '@/components/landing/PublicNavbar';
import styles from './Auth.module.css';

function authErrorMessage(err: unknown, fallback: string) {
  if (!(err instanceof FirebaseError) && !(typeof err === 'object' && err && 'code' in err)) return fallback;
  const code = String((err as { code: string }).code);
  if (code === 'auth/email-already-in-use') return 'This email is already registered. Sign in instead.';
  if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
  if (code === 'auth/weak-password') return 'Password must be at least 6 characters long.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a moment and try again.';
  if (code === 'auth/operation-not-allowed') return 'Email registration is currently unavailable.';
  return fallback;
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreed) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    setBusy(true);
    try {
      await register(email, password);
      navigate('/subscription');
    } catch (err) {
      setError(authErrorMessage(err, 'Unable to create account. Try another email or sign in.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <PublicNavbar />

      <main className={styles.shell}>
        <AnimatedBackground />

        <div className={styles.authWrapper}>
          {/* Left Feature Showcase */}
          <aside className={styles.featureSide}>
            <div className={styles.badge}>
              <Sparkles size={14} /> Quick 30-Second Setup
            </div>
            <h2 className={styles.featureTitle}>
              Upgrade your shop with <br />
              <span className={styles.featureTitleGradient}>modern billing speed.</span>
            </h2>
            <p className={styles.featureDesc}>
              Join retail shops and businesses managing sales, customers, GST invoices, and stock seamlessly with Billora.
            </p>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Zap size={20} />
                </div>
                <div className={styles.featureItemContent}>
                  <h4>Rapid Checkout & Barcode Scan</h4>
                  <p>Add products, select customers, and create bills with minimum keystrokes.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Package size={20} />
                </div>
                <div className={styles.featureItemContent}>
                  <h4>Inventory & Low-Stock Alerts</h4>
                  <p>Never run out of bestsellers. Keep your product catalog organized and updated.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Share2 size={20} />
                </div>
                <div className={styles.featureItemContent}>
                  <h4>WhatsApp & Thermal Print</h4>
                  <p>Deliver digital receipts straight to customer phones or print instantly.</p>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className={styles.quoteCard}>
              <div className={styles.quoteStars}>★★★★★</div>
              <p className={styles.quoteText}>
                "The cleanest billing software we have used. Easy for counter staff to learn in minutes, and accounts are always balanced."
              </p>
              <div className={styles.quoteAuthor}>
                <div className={styles.quoteAvatar}>SP</div>
                <div className={styles.quoteAuthorInfo}>
                  <strong>Suresh Patel</strong>
                  <span>Supermarket & Provisions Store</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Signup Card */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.brandRow}>
                <Link to="/" className={styles.brand}>
                  <img src="/logo.jpg" alt="Billora" className={styles.brandLogo} />
                  <span>Billora</span>
                </Link>
                <span className={styles.badgePill}>
                  <ShieldCheck size={13} /> Encrypted
                </span>
              </div>
              <h1>Create your shop account</h1>
              <p>Get started today. Your billing data remains strictly private & secure.</p>
            </div>

            <form className={styles.form} onSubmit={submit}>
              {error && (
                <div className={styles.errorBox}>
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label htmlFor="reg-email" className={styles.inputLabel}>
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    id="reg-email"
                    type="email"
                    className={`${styles.textInput} ${styles.textInputNoRight}`}
                    placeholder="owner@yourshop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="reg-password" className={styles.inputLabel}>
                  <span>Password</span>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>Min 6 characters</span>
                </label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className={styles.textInput}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="reg-confirm-password" className={styles.inputLabel}>
                  Confirm Password
                </label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={styles.textInput}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.termsText}>
                <label className={styles.rememberMe}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span>
                    I agree to the <Link to="/">Terms of Service</Link> and <Link to="/">Privacy Policy</Link>
                  </span>
                </label>
              </div>

              <button type="submit" disabled={busy} className={styles.submitBtn}>
                {busy ? 'Setting up workspace...' : 'Create Shop Account'}
                <ArrowRight size={16} />
              </button>
            </form>

            <p className={styles.footer}>
              Already registered? <Link to="/login">Sign in here</Link>
            </p>

            <div className={styles.securityNote}>
              <CheckCircle2 size={14} style={{ color: '#10b981' }} /> 256-Bit SSL Cloud Backup • 100% Data Confidentiality
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
