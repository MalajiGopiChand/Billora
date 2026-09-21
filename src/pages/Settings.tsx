import { useEffect, useState, type FormEvent } from 'react';
import { Save, Store, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCompanySettings, saveCompanySettings } from '../lib/firestore';
import type { CompanySettings } from '../types';
import styles from './Settings.module.css';

const blank: CompanySettings = { companyName: '', phone: '', address: '', terms: '' };

export function Settings() {
  const { user, isAdmin } = useAuth(); 
  const [form, setForm] = useState(blank); 
  const [status, setStatus] = useState('');

  useEffect(() => { 
    if (user) getCompanySettings(user.uid).then((settings) => settings && setForm(settings)); 
  }, [user]);

  const submit = async (event: FormEvent) => { 
    event.preventDefault(); 
    if (!user) return; 
    await saveCompanySettings(user.uid, form); 
    setStatus('Shop profile saved successfully.'); 
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroIcon}><UserCircle size={32} /></div>
        <div className={styles.heroText}>
          <p>My Profile</p>
          <h2>{user?.email}</h2>
          <span>{isAdmin ? 'System Administrator' : 'Shop Owner'}</span>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h3><Store size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Shop Details</h3>
          <p>These details will appear on every printed invoice.</p>
          <form className={styles.form} onSubmit={submit}>
            <label>Shop or Company Name
              <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Your shop name" required />
            </label>
            <label>Business Phone
              <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone shown on invoices" />
            </label>
            <label>Address
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full shop address" rows={3} required />
            </label>
            <label>Default Terms and Conditions
              <textarea value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} placeholder="Payment terms, return policy, etc." rows={5} />
            </label>
            {status && <p className={styles.success}>{status}</p>}
            <button className="primary-button"><Save size={17} />Save profile</button>
          </form>
        </div>
      </section>
    </>
  );
}
