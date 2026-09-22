import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export function Login() {
  const { login } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); setBusy(true); try { await login(email, password); navigate('/dashboard'); } catch { setError('Unable to sign in. Check your email and password.'); } finally { setBusy(false); } };
  return <main className={styles.shell}><section className={styles.card}><div className={styles.brand}><img src="/logo.jpg" alt="Billora" className={styles.brandLogo} /> Billora</div><h1>Welcome back</h1><p>Sign in to your account to continue</p><form className={styles.form} onSubmit={submit}>{error && <p className={styles.error}>{error}</p>}<label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label><button disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button></form><p className={styles.footer}>New to Billora? <Link to="/register">Create an account</Link></p></section></main>;
}
