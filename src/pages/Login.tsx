import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Zap, 
  Printer, 
  BarChart3, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { PublicNavbar } from '@/components/landing/PublicNavbar';
import styles from './Auth.module.css';

function authErrorMessage(err: unknown, fallback: string) {
  if (!(err instanceof FirebaseError) && !(typeof err === 'object' && err && 'code' in err)) return fallback;
  const code = String((err as { code: string }).code);
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Unable to sign in. Please verify your email and password.';
  }
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a moment and try again.';
  if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
  return fallback;
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Forgot password mode
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setBusy(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(authErrorMessage(err, 'Unable to sign in. Check your email and password.'));
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (!resetEmail) {
      setResetError('Please enter your registered email address.');
      return;
    }
    setResetBusy(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(`Password reset email sent to ${resetEmail}. Check your inbox!`);
    } catch (err) {
      setResetError(authErrorMessage(err, 'Failed to send reset email. Verify your email address.'));
    } finally {
      setResetBusy(false);
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
              <Zap size={14} /> Trusted by Retailers Across India
            </div>
            <h2 className={styles.featureTitle}>
              Your shop. Your bills. <br />
              <span className={styles.featureTitleGradient}>One simple workspace.</span>
            </h2>
            <p className={styles.featureDesc}>
              Log in to generate rapid invoices, reconcile daily ledger balances, and stay on top of your retail inventory.
            </p>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Zap size={20} />
                </div>
                <div className={styles.featureItemContent}>
                  <h4>10-Second Counter Billing</h4>
                  <p>Lightning-fast product search, barcode scanning, and instant checkout.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Printer size={20} />
                </div>
                <div className={styles.featureItemContent}>
                  <h4>Thermal & A4 Receipts</h4>
                  <p>Seamlessly print formatted bills on thermal roll or standard laser printers.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <BarChart3 size={20} />
                </div>
                <div className={styles.featureItemContent}>
                  <h4>Live Profit & Stock Reports</h4>
                  <p>Track cash collected, outstanding credit, and high-margin products daily.</p>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className={styles.quoteCard}>
              <div className={styles.quoteStars}>★★★★★</div>
              <p className={styles.quoteText}>
                "Billora transformed our daily billing speed. Counter queues are gone and closing daily accounts takes just 5 minutes."
              </p>
              <div className={styles.quoteAuthor}>
                <div className={styles.quoteAvatar}>RK</div>
                <div className={styles.quoteAuthorInfo}>
                  <strong>Ramesh Kumar</strong>
                  <span>Electronics & Retail Store Owner</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Auth Card */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.brandRow}>
                <Link to="/" className={styles.brand}>
                  <img src="/logo.jpg" alt="Billora" className={styles.brandLogo} />
                  <span>Billora</span>
                </Link>
                <span className={styles.badgePill}>
                  <ShieldCheck size={13} /> Secure
                </span>
              </div>

              {isResetMode ? (
                <>
                  <h1>Reset your password</h1>
                  <p>Enter your email to receive a password reset link</p>
                </>
              ) : (
                <>
                  <h1>Welcome back</h1>
                  <p>Sign in to your account to access your shop workspace</p>
                </>
              )}
            </div>

            {isResetMode ? (
              <form className={styles.form} onSubmit={handlePasswordReset}>
                {resetError && (
                  <div className={styles.errorBox}>
                    <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{resetError}</span>
                  </div>
                )}
                {resetSuccess && (
                  <div className={styles.successBox}>
                    <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{resetSuccess}</span>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label htmlFor="reset-email" className={styles.inputLabel}>
                    Registered Email
                  </label>
                  <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      id="reset-email"
                      type="email"
                      className={`${styles.textInput} ${styles.textInputNoRight}`}
                      placeholder="owner@yourshop.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <button type="submit" disabled={resetBusy} className={styles.submitBtn}>
                  {resetBusy ? 'Sending Reset Link...' : 'Send Reset Link'}
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className={styles.backToLoginBtn}
                  onClick={() => {
                    setIsResetMode(false);
                    setResetError('');
                    setResetSuccess('');
                  }}
                >
                  <ArrowLeft size={15} /> Back to Sign in
                </button>
              </form>
            ) : (
              <form className={styles.form} onSubmit={submit}>
                {error && (
                  <div className={styles.errorBox}>
                    <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{error}</span>
                  </div>
                )}
                {successMessage && (
                  <div className={styles.successBox}>
                    <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label htmlFor="login-email" className={styles.inputLabel}>
                    Email Address
                  </label>
                  <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      id="login-email"
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
                  <div className={styles.inputLabel}>
                    <label htmlFor="login-password">Password</label>
                  </div>
                  <div className={styles.inputWrapper}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className={styles.textInput}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
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

                <div className={styles.optionsRow}>
                  <label className={styles.rememberMe}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className={styles.forgotBtn}
                    onClick={() => {
                      setResetEmail(email);
                      setIsResetMode(true);
                      setError('');
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={busy} className={styles.submitBtn}>
                  {busy ? 'Signing in...' : 'Sign in to Workspace'}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            <p className={styles.footer}>
              New to Billora? <Link to="/register">Create shop account</Link>
            </p>

            <div className={styles.securityNote}>
              <ShieldCheck size={14} /> 256-Bit SSL Encryption • Your shop data is private & secure
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
