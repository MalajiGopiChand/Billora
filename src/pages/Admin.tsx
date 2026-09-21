import { useEffect, useState } from 'react';
import { Crown, RefreshCw, UsersRound, Plus, Clock, Edit2, MessageSquare, Mail } from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { listContactMessages } from '@/lib/firestore';
import styles from './Admin.module.css';

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

  const load = async () => { 
    setLoading(true); setError(''); setGrantMsg('');
    try {
      const [usersSnap, subsSnap, contactMessages] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'subscriptions')),
        listContactMessages()
      ]);
      
      setMessages(contactMessages);

      const now = new Date();
      const getDate = (val: any) => val?.toDate ? val.toDate() : (val ? new Date(val) : new Date(0));
      
      const activeSubscriptions = subsSnap.docs.filter((item) => item.data().status === 'active' && getDate(item.data().expiresAt) > now);
      
      const allUsers = usersSnap.docs.map(item => ({ uid: item.id, email: item.data().email || '' }));
      
      const clientList = usersSnap.docs.map((item) => {
        const sub = subsSnap.docs.find((s) => s.id === item.id)?.data();
        const isActive = sub?.status === 'active' && getDate(sub.expiresAt) > now;
        return { 
          uid: item.id, 
          email: item.data().email || '', 
          createdAt: item.data().createdAt ? getDate(item.data().createdAt).toISOString() : null, 
          subscription: isActive ? 'active' : (sub?.status || 'none')
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
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + parseInt(grantDuration)); 
      
      await setDoc(doc(db, 'subscriptions', targetUser.uid), {
        uid: targetUser.uid,
        email: targetUser.email,
        plan: `manual_grant_${grantDuration}m`,
        status: 'active',
        amount: Number(grantAmount),
        startedAt: now,
        expiresAt: expiresAt,
        grantedBy: 'admin',
        updatedAt: now
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

  useEffect(() => { load(); }, []);
  const stats = overview ? [['Registered Clients', overview.clients, UsersRound], ['Active Subscriptions', overview.activeSubscriptions, Crown]] as const : [];
  
  return <><div className={styles.top}><div><p>Owner control centre</p><h2>Admin portal</h2><span>Track subscriptions, handle clients and read messages.</span></div><button onClick={load} className="secondary-button" disabled={loading}><RefreshCw className={loading ? styles.spin : ''} size={16}/>Refresh data</button></div>
    
  <div className={styles.tabs}>
    <button className={activeTab === 'overview' ? styles.activeTab : ''} onClick={() => setActiveTab('overview')}>Overview</button>
    <button className={activeTab === 'clients' ? styles.activeTab : ''} onClick={() => setActiveTab('clients')}>Clients & Access</button>
    <button className={activeTab === 'messages' ? styles.activeTab : ''} onClick={() => setActiveTab('messages')}>Messages {messages.length > 0 && <span>({messages.length})</span>}</button>
  </div>
  
  {error && <p className={styles.error}>{error}</p>}
  {loading ? <div className="page-loader">Loading secure admin records...</div> : overview && <>
    
    {activeTab === 'overview' && (
      <>
        <section className={styles.stats}>{stats.map(([label, value, Icon]) => <article key={label}><span><Icon size={19}/></span><p>{label}</p><strong>{value}</strong></article>)}</section>
        <section className={styles.card}><div><h3>Recent client accounts</h3><p>All recently registered clients.</p></div><div className="table-scroll" style={{ marginTop: 15 }}><table className="data-table"><thead><tr><th>Email</th><th>Created</th><th>Subscription</th></tr></thead><tbody>{overview.recentClients.map((client) => <tr key={client.uid}><td>{client.email}</td><td>{client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-IN') : '-'}</td><td><span className={styles.status}>{client.subscription}</span></td></tr>)}</tbody></table></div></section>
      </>
    )}

    {activeTab === 'clients' && (
      <>
        <section className={styles.card} style={{ marginBottom: 20 }}><div><h3>Grant or Edit Access</h3><p>Manually grant free access after receiving offline payment. Records the amount paid.</p></div><form onSubmit={handleGrantAccess} style={{ display: 'flex', gap: 10, marginTop: 15, flexWrap: 'wrap' }}><input type="email" placeholder="User email address" required value={grantEmail} onChange={e => setGrantEmail(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #c9d4df', background: '#fff', color: '#1e3045', width: '250px', fontSize: '13px' }} /><select value={grantDuration} onChange={e => setGrantDuration(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #c9d4df', background: '#fff', color: '#1e3045', fontSize: '13px' }}><option value="1">1 Month</option><option value="6">6 Months</option><option value="12">1 Year</option></select><input type="number" placeholder="Amount received (₹)" value={grantAmount} onChange={e => setGrantAmount(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #c9d4df', background: '#fff', color: '#1e3045', width: '160px', fontSize: '13px' }} /><button disabled={granting} className="primary-button" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Plus size={16}/> {granting ? 'Processing...' : 'Grant / Update'}</button></form>{grantMsg && <p style={{ marginTop: 10, fontSize: 13, color: grantMsg.includes('Success') ? '#16a34a' : '#dc2626' }}>{grantMsg}</p>}</section>
        
        <section className={styles.card} style={{ marginBottom: 20 }}><div><h3><Clock size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }}/> Pending Approvals</h3><p>Clients who signed up but do not have an active subscription.</p></div><div className="table-scroll" style={{ marginTop: 15 }}><table className="data-table"><thead><tr><th>Email</th><th>Created</th><th>Action</th></tr></thead><tbody>{overview.pendingClients.length > 0 ? overview.pendingClients.map((client) => <tr key={client.uid}><td>{client.email}</td><td>{client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-IN') : '-'}</td><td><button className="secondary-button" onClick={() => { setGrantEmail(client.email); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Edit2 size={14}/> Edit Subscription</button></td></tr>) : <tr><td colSpan={3} className="empty-cell">No pending approvals.</td></tr>}</tbody></table></div></section>
      </>
    )}

    {activeTab === 'messages' && (
      <section className={styles.card}>
        <div><h3>Contact Us Messages</h3><p>Messages received from the Contact Support page.</p></div>
        <div className={styles.messageList}>
          {messages.length === 0 ? <p className="empty-cell" style={{ marginTop: 20 }}>No messages yet.</p> : 
            messages.map(msg => (
              <div key={msg.id} className={styles.messageItem}>
                <div className={styles.msgHeader}>
                  <strong><Mail size={14}/> {msg.email}</strong>
                  <span>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString('en-IN') : 'Unknown date'}</span>
                </div>
                <h4>{msg.subject}</h4>
                <p>{msg.message}</p>
              </div>
            ))
          }
        </div>
      </section>
    )}

  </>}</>;
}
