import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

function authErrorMessage(err: unknown, fallback: string) {
  if (!(err instanceof FirebaseError) && !(typeof err === 'object' && err && 'code' in err)) return fallback;
  const code = String((err as { code: string }).code);
  if (code === 'auth/email-already-in-use') return 'This email is already registered. Sign in instead.';
  if (code === 'auth/invalid-email') return 'Enter a valid email address.';
  if (code === 'auth/weak-password') return 'Use at least 6 characters for the password.';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'Unable to sign in. Check your email and password.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Wait a moment and try again.';
  if (code === 'auth/operation-not-allowed') return 'Email sign-in is disabled for this project.';
  return fallback;
}

export function Register() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); if (password.length < 6) { setError('Use at least 6 characters for the password.'); return; } setBusy(true); try { await register(email, password); navigate('/subscription'); } catch (err) { setError(authErrorMessage(err, 'Unable to create account. Try another email or sign in.')); } finally { setBusy(false); } };
  return <main className={styles.shell}><section className={styles.card}><div className={styles.brand}><img src="/logo.jpg" alt="Billora" className={styles.brandLogo} /> Billora</div><h1>Create your shop account</h1><p>Your billing data will be private to this account.</p><form className={styles.form} onSubmit={submit}>{error && <p className={styles.error}>{error}</p>}<label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" /></label><button disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button></form><p className={styles.footer}>Already registered? <Link to="/login">Sign in</Link></p></section></main>;
}
