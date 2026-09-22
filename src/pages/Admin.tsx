import { useEffect, useState } from 'react';
import { Crown, RefreshCw, UsersRound, Plus, Clock, Edit2, MessageSquare, Mail, Phone, CheckCircle2, Save, Building } from 'lucide-react';
import { collection, getDocs, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { listContactMessages, getContactNotice, saveContactNotice } from '@/lib/firestore';
import styles from './Admin.module.css';

const getDate = (val: any) => val?.toDate ? val.toDate() : (val ? new Date(val) : new Date(0));

type Overview = { 
  clients: number; 
  activeSubscriptions: number; 
  recentClients: Array<{ uid: string; email: string; createdAt: string | null; subscription: string }>;
  pendingClients: Array<{ uid: string; email: string; createdAt: string | null }>;
  allUsers: Array<{ uid: string; email: string }>;
};

export function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'messages'>('overview');
  const [overview, setOverview] = useState<Overview | null>(null); 
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');
  
  const [grantEmail, setGrantEmail] = useState(''); 
  const [grantDuration, setGrantDuration] = useState('12');
  const [grantAmount, setGrantAmount] = useState('0');
  const [granting, setGranting] = useState(false); 
  const [grantMsg, setGrantMsg] = useState('');

  // Contact Page Notice State
  const [contactNotice, setContactNotice] = useState('We typically respond within 2 hours. Support line active 9:00 AM - 9:00 PM IST.');
  const [supportPhone, setSupportPhone] = useState('+91 97055 27264');
  const [supportEmail, setSupportEmail] = useState('thegopichand@gmail.com');
  const [savingNotice, setSavingNotice] = useState(false);
  const [noticeFeedback, setNoticeFeedback] = useState('');

  const load = async () => { 
    setLoading(true); setError(''); setGrantMsg('');
    try {
      const [usersSnap, subsSnap, contactMessages, savedNotice] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'subscriptions')),
        listContactMessages(),
        getContactNotice()
      ]);
      
      setMessages(contactMessages);
      if (savedNotice) {
        if (savedNotice.notice) setContactNotice(savedNotice.notice);
        if (savedNotice.phone) setSupportPhone(savedNotice.phone);
        if (savedNotice.email) setSupportEmail(savedNotice.email);
      }

      const now = new Date();
      const activeSubscriptions = subsSnap.docs.filter((item) => getDate(item.data().expiresAt) > now && item.data().status !== 'cancelled');
      
      const allUsers = usersSnap.docs.map(item => ({ uid: item.id, email: item.data().email || '' }));
      
      const clientList = usersSnap.docs.map((item) => {
        const sub = subsSnap.docs.find((s) => s.id === item.id)?.data();
        const isActive = sub && getDate(sub.expiresAt) > now && sub.status !== 'cancelled';
        return { 
          uid: item.id, 
          email: item.data().email || '', 
          createdAt: item.data().createdAt ? getDate(item.data().createdAt).toISOString() : null, 
          subscription: isActive ? 'active' : (sub ? 'expired' : 'none')
        };
      });

      const recentClients = clientList.slice(0, 10);
      const pendingClients = clientList.filter(c => c.subscription !== 'active');
      
      setOverview({
        clients: usersSnap.size,
        activeSubscriptions: activeSubscriptions.length,
        recentClients,
        pendingClients,
        allUsers
      });
    } catch (err) { 
      setError('Admin reporting encountered an error reading the database.');
      console.error(err);
    } finally { 
      setLoading(false); 
    } 
  };

  const handleGrantAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!overview || !grantEmail) return;
    setGranting(true); setGrantMsg('');
    try {
      const targetUser = overview.allUsers.find(u => u.email.toLowerCase() === grantEmail.toLowerCase());
      if (!targetUser) {
        setGrantMsg('User not found. They must sign up first.');
        setGranting(false);
        return;
      }
      const now = new Date();
      const currentSnap = await getDoc(doc(db, 'subscriptions', targetUser.uid));
      const currentExpiry = currentSnap.exists() ? getDate(currentSnap.data()?.expiresAt) : now;
      const startFrom = currentExpiry > now ? currentExpiry : now;
      const expiresAt = new Date(startFrom);
      expiresAt.setMonth(expiresAt.getMonth() + parseInt(grantDuration)); 
      
      await setDoc(doc(db, 'subscriptions', targetUser.uid), {
        uid: targetUser.uid,
        email: targetUser.email,
        plan: `manual_grant_${grantDuration}m`,
        status: 'active',
        amount: Number(grantAmount),
        startedAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(expiresAt),
        grantedBy: 'admin',
        updatedAt: Timestamp.fromDate(now)
      }, { merge: true });
      
      setGrantMsg(`Successfully granted ${grantDuration} months access.`);
      setGrantEmail('');
      setGrantAmount('0');
      load(); 
    } catch (err) {
      console.error(err);
      setGrantMsg('Failed to grant access.');
    } finally {
      setGranting(false);
    }
  };

  const markResolved = async (id: string, currentlyRead: boolean) => {
    const newStatus = !currentlyRead;
    try {
      await setDoc(doc(db, 'contact_messages', id), { read: newStatus }, { merge: true });
      setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: newStatus } : m));
    } catch (err) {
      console.error(err);
      alert('Failed to update message status.');
    }
  };

  useEffect(() => { load(); }, []);
  const stats = overview ? [['Registered Clients', overview.clients, UsersRound], ['Active Subscriptions', overview.activeSubscriptions, Crown]] as const : [];
  
  return <><div className={styles.top}><div><p>Owner control centre</p><h2>Admin portal</h2><span>Track subscriptions, handle clients and read messages.</span></div><button onClick={load} className="secondary-button" disabled={loading}><RefreshCw className={loading ? styles.spin : ''} size={16}/>Refresh data</button></div>
    
  <div className={styles.tabs}>
    <button className={activeTab === 'overview' ? styles.activeTab : ''} onClick={() => setActiveTab('overview')}>Overview</button>
    <button className={activeTab === 'clients' ? styles.activeTab : ''} onClick={() => setActiveTab('clients')}>Clients & Access</button>
    <button className={activeTab === 'messages' ? styles.activeTab : ''} onClick={() => setActiveTab('messages')}>Messages {messages.filter(m => !m.read).length > 0 && <span>{messages.filter(m => !m.read).length} Unresolved</span>}</button>
  </div>
  
  {error && <p className={styles.error}>{error}</p>}
  {loading ? <div className="page-loader">Loading secure admin records...</div> : overview && <>
    
    {activeTab === 'overview' && (
      <>
        <section className={styles.stats}>{stats.map(([label, value, Icon]) => <article key={label}><span><Icon size={19}/></span><p>{label}</p><strong>{value}</strong></article>)}</section>
        <section className={styles.card}><div><h3>Recent client accounts</h3><p>All recently registered clients.</p></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Email</th><th>Created</th><th>Subscription</th></tr></thead><tbody>{overview.recentClients.map((client) => <tr key={client.uid}><td>{client.email}</td><td>{client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-IN') : '-'}</td><td><span className={styles.status}>{client.subscription}</span></td></tr>)}</tbody></table></div></section>
      </>
    )}

    {activeTab === 'clients' && (
      <>
        <section className={styles.card} style={{ marginBottom: 20 }}><div><h3>Grant or Edit Access</h3><p>Manually grant account access after receiving offline payment. Records the amount paid.</p></div>
          <form onSubmit={handleGrantAccess} className={styles.formRow}>
            <input type="email" placeholder="User email address" required value={grantEmail} onChange={e => setGrantEmail(e.target.value)} style={{ width: '250px' }} />
            <select value={grantDuration} onChange={e => setGrantDuration(e.target.value)}>
              <option value="1">1 Month</option>
              <option value="6">6 Months</option>
              <option value="12">1 Year</option>
            </select>
            <input type="number" placeholder="Amount received (₹)" value={grantAmount} onChange={e => setGrantAmount(e.target.value)} style={{ width: '160px' }} />
            <button disabled={granting} className="primary-button" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Plus size={16}/> {granting ? 'Processing...' : 'Grant / Update'}</button>
          </form>
          {grantMsg && <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: grantMsg.includes('Success') ? '#16a34a' : '#dc2626' }}>{grantMsg}</p>}
        </section>
        
        <section className={styles.card}><div><h3><Clock size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }}/> Pending Approvals</h3><p>Clients who signed up but do not have an active subscription.</p></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Email</th><th>Created</th><th>Action</th></tr></thead><tbody>{overview.pendingClients.length > 0 ? overview.pendingClients.map((client) => <tr key={client.uid}><td>{client.email}</td><td>{client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-IN') : '-'}</td><td><button className="secondary-button" onClick={() => { setGrantEmail(client.email); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Edit2 size={14}/> Edit Subscription</button></td></tr>) : <tr><td colSpan={3} className="empty-cell">No pending approvals.</td></tr>}</tbody></table></div></section>
      </>
    )}

    {activeTab === 'messages' && (
      <>
        {/* Set Contact Page Message Notice */}
        <section className={styles.card} style={{ marginBottom: 20 }}>
          <div>
            <h3><MessageSquare size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }}/> Set Contact Page Notice & Status Message</h3>
            <p>Whatever message you set here will be displayed live to visitors and shop owners on the Contact Us page.</p>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setSavingNotice(true);
            setNoticeFeedback('');
            try {
              await saveContactNotice(contactNotice, supportPhone, supportEmail);
              setNoticeFeedback('Contact page notice saved successfully! Live for all visitors.');
            } catch (err) {
              console.error(err);
              setNoticeFeedback('Failed to save notice.');
            } finally {
              setSavingNotice(false);
            }
          }} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Announcement / Status Notice shown on Contact Page
              </label>
              <textarea 
                rows={2} 
                value={contactNotice} 
                onChange={e => setContactNotice(e.target.value)} 
                placeholder="e.g. We typically respond within 2 hours. Support line active 9:00 AM - 9:00 PM IST."
                required 
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Direct Support Phone
                </label>
                <input 
                  type="text" 
                  value={supportPhone} 
                  onChange={e => setSupportPhone(e.target.value)} 
                  placeholder="+91 97055 27264" 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Direct Support Email
                </label>
                <input 
                  type="email" 
                  value={supportEmail} 
                  onChange={e => setSupportEmail(e.target.value)} 
                  placeholder="thegopichand@gmail.com" 
                />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button disabled={savingNotice} className="primary-button" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Save size={15}/> {savingNotice ? 'Saving Notice...' : 'Save & Publish Notice to Contact Page'}
              </button>
              {noticeFeedback && (
                <span style={{ fontSize: 13, fontWeight: 600, color: noticeFeedback.includes('success') ? '#16a34a' : '#dc2626' }}>
                  {noticeFeedback}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Customer & Visitor Messages Inbox */}
        <section className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <div>
              <h3>Customer & Visitor Inquiries</h3>
              <p>Real-time messages sent from the Contact Us page and Landing page.</p>
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Total: <strong>{messages.length}</strong> · Unresolved: <strong style={{ color: '#dc2626' }}>{messages.filter(m => !m.read).length}</strong>
            </div>
          </div>
          <div className={styles.messageList}>
            {messages.length === 0 ? <p className="empty-cell">No inquiries received yet.</p> : 
              messages.map(msg => (
                <div key={msg.id} className={`${styles.messageItem} ${msg.read ? styles.resolved : ''}`}>
                  <div className={styles.msgHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>
                        {msg.name || 'Visitor'} {msg.businessName && `(${msg.businessName})`}
                      </strong>
                      <span style={{ fontSize: 11, background: msg.read ? '#e2e8f0' : '#fee2e2', color: msg.read ? '#475569' : '#dc2626', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                        {msg.read ? 'Resolved' : 'Action Required'}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString('en-IN') : 'Recent'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 16, margin: '8px 0', flexWrap: 'wrap', fontSize: 13, color: '#334155' }}>
                    <a href={`mailto:${msg.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#2563eb', textDecoration: 'none' }}>
                      <Mail size={13}/> {msg.email}
                    </a>
                    {msg.phone && (
                      <a href={`tel:${msg.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#16a34a', textDecoration: 'none' }}>
                        <Phone size={13}/> {msg.phone}
                      </a>
                    )}
                  </div>

                  <h4 style={{ margin: '8px 0 4px 0', fontSize: 15, color: '#0f172a' }}>{msg.subject || 'General Inquiry'}</h4>
                  <p style={{ margin: '4px 0 14px 0', fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{msg.message}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    {msg.phone && (
                      <a href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="secondary-button" style={{ fontSize: 12, padding: '6px 12px' }}>
                        WhatsApp Customer
                      </a>
                    )}
                    <button onClick={() => markResolved(msg.id, msg.read)} className={styles.resolveBtn}>
                      {msg.read ? 'Mark as Unresolved' : '✓ Mark as Resolved'}
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </section>
      </>
    )}

  </>}</>;
}
