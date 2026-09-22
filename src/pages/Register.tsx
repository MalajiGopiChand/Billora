import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export function Register() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); if (password.length < 6) { setError('Use at least 6 characters for the password.'); return; } setBusy(true); try { await register(email, password); navigate('/dashboard'); } catch { setError('Unable to create account. This email may already be in use.'); } finally { setBusy(false); } };
  return <main className={styles.shell}><section className={styles.card}><div className={styles.brand}><img src="/logo.jpg" alt="Billora" className={styles.brandLogo} /> Billora</div><h1>Create your shop account</h1><p>Your billing data will be private to this account.</p><form className={styles.form} onSubmit={submit}>{error && <p className={styles.error}>{error}</p>}<label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" /></label><button disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button></form><p className={styles.footer}>Already registered? <Link to="/login">Sign in</Link></p></section></main>;
}
