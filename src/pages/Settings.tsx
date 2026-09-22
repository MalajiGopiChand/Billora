import { useEffect, useState, type FormEvent } from 'react';
import { Save, Store, UserCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCompanySettings, saveCompanySettings } from '../lib/firestore';
import type { CompanySettings } from '../types';
import styles from './Settings.module.css';

const blank: CompanySettings = { companyName: '', phone: '', address: '', terms: '' };

export function Settings() {
  const { user, isAdmin } = useAuth();
  const [form, setForm] = useState(blank);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      getCompanySettings(user.uid).then((settings) => settings && setForm(settings));
    }
  }, [user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setStatus('');

    try {
      await saveCompanySettings(user.uid, form);
      setStatus('Shop profile and invoice details saved successfully.');
    } catch {
      setStatus('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* 1. User Identity Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.heroIcon}>
          <UserCircle size={32} />
        </div>
        <div className={styles.heroText}>
          <p>Account & Profile</p>
          <h2>{user?.email}</h2>
          <span className={styles.roleBadge}>
            {isAdmin ? 'System Administrator' : 'Shop Owner Workspace'}
          </span>
        </div>
      </section>

      {/* 2. Shop Details Card */}
      <section className={styles.card}>
        <h3>
          <Store size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom', color: '#4f46e5' }} />
          Shop Details & Invoice Settings
        </h3>
        <p className={styles.cardDesc}>
          These details are automatically printed on every A4 and A5 invoice.
        </p>

        {status && (
          <div className={styles.successBox} style={{ marginBottom: 18 }}>
            <CheckCircle2 size={16} />
            <span>{status}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={submit}>
          <label>
            Shop / Business Name
            <input
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="e.g. Sri Lakshmi Provision Stores"
              required
            />
          </label>

          <label>
            Shop Phone / Helpline
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
            />
          </label>

          <label>
            Shop Full Address
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Shop No., Street, Market / Area, City, State, PIN"
            />
          </label>

          <label>
            Default Invoice Terms & Conditions
            <textarea
              rows={4}
              value={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
              placeholder="1. Goods once sold will not be accepted back.&#10;2. Interest @ 18% p.a. charged after 15 days."
            />
          </label>

          <button type="submit" className="primary-button" disabled={saving} style={{ alignSelf: 'flex-start', padding: '12px 24px' }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Shop Details'}
          </button>
        </form>
      </section>
    </div>
  );
}
