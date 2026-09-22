import { useEffect, useMemo, useState } from 'react';
import {
  Crown,
  RefreshCw,
  UsersRound,
  Plus,
  Clock,
  Edit2,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2,
  Save,
  Trash2,
  Search,
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  Check,
  Ban,
  UserX,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  listContactMessages,
  deleteContactMessage,
  getContactNotice,
  saveContactNotice,
} from '@/lib/firestore';
import { currency } from '@/lib/money';
import styles from './Admin.module.css';

const getDate = (val: any) => (val?.toDate ? val.toDate() : val ? new Date(val) : new Date(0));

const PLAN_CONFIG = {
  monthly: { name: 'Monthly Plan', billing: '₹499 / mo', defaultPrice: 499, mrrFactor: 1 },
  half_yearly: { name: '6 Months Plan', billing: '₹2,499 / 6 mo', defaultPrice: 2499, mrrFactor: 1 / 6 },
  yearly: { name: 'Yearly Plan', billing: '₹3,499 / yr', defaultPrice: 3499, mrrFactor: 1 / 12, featured: true },
};

type ClientRecord = {
  uid: string;
  email: string;
  createdAt: string | null;
  subscriptionStatus: 'active' | 'expired' | 'cancelled' | 'none';
  plan: string;
  amount: number;
  expiresAt: Date | null;
  startedAt: Date | null;
  grantedBy?: string;
  paymentId?: string;
  orderId?: string;
  isGateway: boolean;
};

type TransactionRecord = {
  id: string;
  uid: string;
  email: string;
  plan: string;
  amount: number;
  paymentId?: string;
  orderId?: string;
  date: Date;
  isGateway: boolean;
  status: 'active' | 'expired' | 'cancelled';
};

type OverviewData = {
  totalClients: number;
  activeSubscriptions: number;
  totalRevenue: number;
  gatewayRevenue: number;
  manualRevenue: number;
  estimatedMRR: number;
  transactions: TransactionRecord[];
  clients: ClientRecord[];
  allUsers: Array<{ uid: string; email: string }>;
  planBreakdown: {
    monthly: { totalCount: number; activeCount: number; revenue: number };
    half_yearly: { totalCount: number; activeCount: number; revenue: number };
    yearly: { totalCount: number; activeCount: number; revenue: number };
    manual: { totalCount: number; activeCount: number; revenue: number };
  };
};

export function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'clients' | 'messages' | 'notice'>('overview');
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Overview Gateway Filter (default to gateway_only as requested)
  const [gatewayViewFilter, setGatewayViewFilter] = useState<'gateway_only' | 'all' | 'manual'>('gateway_only');

  // Manual Grant State
  const [grantEmail, setGrantEmail] = useState('');
  const [grantDuration, setGrantDuration] = useState('12');
  const [grantAmount, setGrantAmount] = useState('0');
  const [granting, setGranting] = useState(false);
  const [grantMsg, setGrantMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Client Search & Filter
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState<'all' | 'active' | 'gateway' | 'expired' | 'cancelled' | 'none'>('all');

  // Action status message
  const [actionAlert, setActionAlert] = useState<{ text: string; ok: boolean } | null>(null);

  // Messages Search & Filter
  const [msgSearch, setMsgSearch] = useState('');
  const [msgFilter, setMsgFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Contact Page Notice State
  const [contactNotice, setContactNotice] = useState(
    'We typically respond within 2 hours. Support line active 9:00 AM - 9:00 PM IST.'
  );
  const [supportPhone, setSupportPhone] = useState('+91 97055 27264');
  const [supportEmail, setSupportEmail] = useState('thegopichand@gmail.com');
  const [savingNotice, setSavingNotice] = useState(false);
  const [noticeFeedback, setNoticeFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    setGrantMsg(null);
    try {
      const [usersSnap, subsSnap, contactMessages, savedNotice] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'subscriptions')),
        listContactMessages(),
        getContactNotice(),
      ]);

      setMessages(contactMessages);
      if (savedNotice) {
        if (savedNotice.notice) setContactNotice(savedNotice.notice);
        if (savedNotice.phone) setSupportPhone(savedNotice.phone);
        if (savedNotice.email) setSupportEmail(savedNotice.email);
      }

      const now = new Date();
      let totalRevenue = 0;
      let gatewayRevenue = 0;
      let manualRevenue = 0;
      let estimatedMRR = 0;
      const transactions: TransactionRecord[] = [];

      const planBreakdown = {
        monthly: { totalCount: 0, activeCount: 0, revenue: 0 },
        half_yearly: { totalCount: 0, activeCount: 0, revenue: 0 },
        yearly: { totalCount: 0, activeCount: 0, revenue: 0 },
        manual: { totalCount: 0, activeCount: 0, revenue: 0 },
      };

      // Process subscription documents
      subsSnap.docs.forEach((docSnap) => {
        const sub = docSnap.data();
        const planKey = (sub.plan || '').toLowerCase();
        const expiresAt = getDate(sub.expiresAt);
        const isActive = expiresAt > now && sub.status === 'active';
        const isCancelled = sub.status === 'cancelled';

        let subAmount = Number(sub.amount || 0);
        if (!subAmount) {
          if (planKey.includes('monthly')) subAmount = PLAN_CONFIG.monthly.defaultPrice;
          else if (planKey.includes('half_yearly') || planKey.includes('6m')) subAmount = PLAN_CONFIG.half_yearly.defaultPrice;
          else if (planKey.includes('yearly') || planKey.includes('annual')) subAmount = PLAN_CONFIG.yearly.defaultPrice;
        }

        const isGateway = Boolean(sub.paymentId && sub.paymentId !== 'offline' && sub.grantedBy !== 'admin');

        totalRevenue += subAmount;
        if (isGateway) {
          gatewayRevenue += subAmount;
        } else {
          manualRevenue += subAmount;
        }

        // Record transaction
        transactions.push({
          id: docSnap.id,
          uid: sub.uid || docSnap.id,
          email: sub.email || 'Customer',
          plan: sub.plan || 'Plan',
          amount: subAmount,
          paymentId: sub.paymentId,
          orderId: sub.orderId,
          date: getDate(sub.startedAt || sub.updatedAt),
          isGateway,
          status: isCancelled ? 'cancelled' : isActive ? 'active' : 'expired',
        });

        // Categorize by plan
        if (planKey === 'monthly' || planKey.includes('monthly')) {
          planBreakdown.monthly.totalCount++;
          planBreakdown.monthly.revenue += subAmount;
          if (isActive) {
            planBreakdown.monthly.activeCount++;
            estimatedMRR += PLAN_CONFIG.monthly.defaultPrice;
          }
        } else if (planKey === 'half_yearly' || planKey.includes('6m')) {
          planBreakdown.half_yearly.totalCount++;
          planBreakdown.half_yearly.revenue += subAmount;
          if (isActive) {
            planBreakdown.half_yearly.activeCount++;
            estimatedMRR += PLAN_CONFIG.half_yearly.defaultPrice / 6;
          }
        } else if (planKey === 'yearly' || planKey.includes('12m') || planKey.includes('annual')) {
          planBreakdown.yearly.totalCount++;
          planBreakdown.yearly.revenue += subAmount;
          if (isActive) {
            planBreakdown.yearly.activeCount++;
            estimatedMRR += PLAN_CONFIG.yearly.defaultPrice / 12;
          }
        } else {
          // Manual or custom grant
          planBreakdown.manual.totalCount++;
          planBreakdown.manual.revenue += subAmount;
          if (isActive) {
            planBreakdown.manual.activeCount++;
            estimatedMRR += subAmount > 0 ? subAmount / 12 : 0;
          }
        }
      });

      // Sort transactions newest first
      transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

      const activeSubDocs = subsSnap.docs.filter(
        (item) => getDate(item.data().expiresAt) > now && item.data().status === 'active'
      );

      const allUsers = usersSnap.docs.map((item) => ({
        uid: item.id,
        email: item.data().email || '',
      }));

      const clientList: ClientRecord[] = usersSnap.docs.map((userDoc) => {
        const subDoc = subsSnap.docs.find((s) => s.id === userDoc.id)?.data();
        const expiresAt = subDoc ? getDate(subDoc.expiresAt) : null;
        const startedAt = subDoc ? getDate(subDoc.startedAt) : null;
        const isCancelled = subDoc?.status === 'cancelled';
        const isActive = Boolean(expiresAt && expiresAt > now && subDoc?.status === 'active');
        const isGateway = Boolean(subDoc?.paymentId && subDoc?.paymentId !== 'offline' && subDoc?.grantedBy !== 'admin');

        let amount = Number(subDoc?.amount || 0);
        if (!amount && subDoc?.plan) {
          const pk = (subDoc.plan || '').toLowerCase();
          if (pk.includes('monthly')) amount = 499;
          else if (pk.includes('half_yearly')) amount = 2499;
          else if (pk.includes('yearly')) amount = 3499;
        }

        const subscriptionStatus = isCancelled
          ? 'cancelled'
          : isActive
          ? 'active'
          : subDoc
          ? 'expired'
          : 'none';

        return {
          uid: userDoc.id,
          email: userDoc.data().email || 'No email',
          createdAt: userDoc.data().createdAt ? getDate(userDoc.data().createdAt).toISOString() : null,
          subscriptionStatus,
          plan: subDoc?.plan || '-',
          amount,
          expiresAt,
          startedAt,
          grantedBy: subDoc?.grantedBy,
          paymentId: subDoc?.paymentId,
          orderId: subDoc?.orderId,
          isGateway,
        };
      });

      setOverview({
        totalClients: usersSnap.size,
        activeSubscriptions: activeSubDocs.length,
        totalRevenue,
        gatewayRevenue,
        manualRevenue,
        estimatedMRR: Math.round(estimatedMRR),
        transactions,
        clients: clientList,
        allUsers,
        planBreakdown,
      });
    } catch (err) {
      setError('Admin reporting encountered an error reading the database. Check administrator permissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Manual Access Grant
  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overview || !grantEmail) return;
    setGranting(true);
    setGrantMsg(null);
    try {
      const targetUser = overview.allUsers.find((u) => u.email.toLowerCase() === grantEmail.trim().toLowerCase());
      if (!targetUser) {
        setGrantMsg({ text: 'User not found in database. The customer must register an account first.', ok: false });
        setGranting(false);
        return;
      }

      const now = new Date();
      const currentSnap = await getDoc(doc(db, 'subscriptions', targetUser.uid));
      const currentExpiry = currentSnap.exists() ? getDate(currentSnap.data()?.expiresAt) : now;
      const startFrom = currentExpiry > now ? currentExpiry : now;
      const expiresAt = new Date(startFrom);
      expiresAt.setMonth(expiresAt.getMonth() + parseInt(grantDuration, 10));

      await setDoc(
        doc(db, 'subscriptions', targetUser.uid),
        {
          uid: targetUser.uid,
          email: targetUser.email,
          plan: `manual_grant_${grantDuration}m`,
          status: 'active',
          amount: Number(grantAmount || 0),
          startedAt: Timestamp.fromDate(now),
          expiresAt: Timestamp.fromDate(expiresAt),
          grantedBy: 'admin',
          updatedAt: Timestamp.fromDate(now),
        },
        { merge: true }
      );

      setGrantMsg({ text: `Successfully granted ${grantDuration} months access for ${targetUser.email}. Recorded ₹${grantAmount || 0}.`, ok: true });
      setGrantEmail('');
      setGrantAmount('0');
      loadData();
    } catch (err) {
      console.error(err);
      setGrantMsg({ text: 'Failed to grant access. Please try again.', ok: false });
    } finally {
      setGranting(false);
    }
  };

  // Revoke / Cancel Access (Dismiss Client Access)
  const handleRevokeAccess = async (client: ClientRecord) => {
    const confirmed = window.confirm(
      `DISMISS CLIENT ACCESS:\nAre you sure you want to CANCEL and REVOKE subscription access for "${client.email}" immediately?\n\nThe user will be blocked from accessing billing features.`
    );
    if (!confirmed) return;

    try {
      const now = new Date();
      await setDoc(
        doc(db, 'subscriptions', client.uid),
        {
          status: 'cancelled',
          expiresAt: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
        },
        { merge: true }
      );

      setActionAlert({ text: `Subscription access cancelled and dismissed for ${client.email}.`, ok: true });

      // Update local state immediately
      setOverview((prev) => {
        if (!prev) return prev;
        const wasActive = client.subscriptionStatus === 'active';
        return {
          ...prev,
          activeSubscriptions: Math.max(0, prev.activeSubscriptions - (wasActive ? 1 : 0)),
          clients: prev.clients.map((c) =>
            c.uid === client.uid ? { ...c, subscriptionStatus: 'cancelled' as const } : c
          ),
          transactions: prev.transactions.map((t) =>
            t.uid === client.uid ? { ...t, status: 'cancelled' as const } : t
          ),
        };
      });
    } catch (err) {
      console.error('Failed to revoke access:', err);
      setActionAlert({ text: 'Failed to revoke access. Please check permissions.', ok: false });
    }
  };

  // Permanently Delete Client Account
  const handleDeleteClient = async (client: ClientRecord) => {
    const confirmed = window.confirm(
      `PERMANENT ACTION WARNING:\nAre you sure you want to completely DELETE the client account for "${client.email}"?\n\nThis will remove their user record, subscription, and shop settings from the database.`
    );
    if (!confirmed) return;

    try {
      await Promise.all([
        deleteDoc(doc(db, 'users', client.uid)),
        deleteDoc(doc(db, 'subscriptions', client.uid)),
        deleteDoc(doc(db, 'company_settings', client.uid)).catch(() => {}),
      ]);

      setActionAlert({ text: `Client account "${client.email}" was permanently deleted.`, ok: true });

      // Update local state immediately
      setOverview((prev) => {
        if (!prev) return prev;
        const wasActive = client.subscriptionStatus === 'active';
        return {
          ...prev,
          totalClients: Math.max(0, prev.totalClients - 1),
          activeSubscriptions: Math.max(0, prev.activeSubscriptions - (wasActive ? 1 : 0)),
          clients: prev.clients.filter((c) => c.uid !== client.uid),
          allUsers: prev.allUsers.filter((u) => u.uid !== client.uid),
          transactions: prev.transactions.filter((t) => t.uid !== client.uid),
        };
      });
    } catch (err) {
      console.error('Failed to delete client account:', err);
      setActionAlert({ text: 'Failed to delete client account. Check permissions.', ok: false });
    }
  };

  // Toggle Message Resolution
  const handleToggleResolved = async (id: string, currentlyRead: boolean) => {
    const newStatus = !currentlyRead;
    try {
      await setDoc(doc(db, 'contact_messages', id), { read: newStatus }, { merge: true });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: newStatus } : m)));
    } catch (err) {
      console.error(err);
      alert('Failed to update inquiry status.');
    }
  };

  // Delete Inquiry Message
  const handleDeleteMessage = async (id: string, senderName: string) => {
    const confirmed = window.confirm(`Delete inquiry message from "${senderName || 'Visitor'}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete inquiry message. Please check permissions.');
    } finally {
      setDeletingId(null);
    }
  };

  // Save Contact Page Notice
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotice(true);
    setNoticeFeedback(null);
    try {
      await saveContactNotice(contactNotice, supportPhone, supportEmail);
      setNoticeFeedback({ text: 'Contact page notice & support contacts published live!', ok: true });
    } catch (err) {
      console.error(err);
      setNoticeFeedback({ text: 'Failed to save notice. Try again.', ok: false });
    } finally {
      setSavingNotice(false);
    }
  };

  // Filtered Clients
  const filteredClients = useMemo(() => {
    if (!overview) return [];
    return overview.clients.filter((client) => {
      const matchesSearch = client.email.toLowerCase().includes(clientSearch.toLowerCase());
      const matchesStatus =
        clientFilter === 'all' ||
        (clientFilter === 'active' && client.subscriptionStatus === 'active') ||
        (clientFilter === 'gateway' && client.isGateway && client.subscriptionStatus === 'active') ||
        (clientFilter === 'expired' && client.subscriptionStatus === 'expired') ||
        (clientFilter === 'cancelled' && client.subscriptionStatus === 'cancelled') ||
        (clientFilter === 'none' && client.subscriptionStatus === 'none');
      return matchesSearch && matchesStatus;
    });
  }, [overview, clientSearch, clientFilter]);

  // Filtered Overview Transactions (defaults to gateway_only)
  const overviewTransactions = useMemo(() => {
    if (!overview) return [];
    if (gatewayViewFilter === 'gateway_only') {
      return overview.transactions.filter((t) => t.isGateway);
    }
    if (gatewayViewFilter === 'manual') {
      return overview.transactions.filter((t) => !t.isGateway);
    }
    return overview.transactions;
  }, [overview, gatewayViewFilter]);

  // Filtered Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const textQuery = `${msg.name} ${msg.email} ${msg.subject} ${msg.message}`.toLowerCase();
      const matchesSearch = textQuery.includes(msgSearch.toLowerCase());
      const matchesFilter =
        msgFilter === 'all' ||
        (msgFilter === 'unresolved' && !msg.read) ||
        (msgFilter === 'resolved' && msg.read);
      return matchesSearch && matchesFilter;
    });
  }, [messages, msgSearch, msgFilter]);

  const unresolvedCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

  return (
    <div className={styles.container}>
      {/* 1. Header Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.titleArea}>
          <div className={styles.badgeHeader}>
            <ShieldCheck size={14} /> Owner Control Centre
          </div>
          <h2>Admin Portal & Intelligence</h2>
          <p>Track Razorpay gateway payments, dismiss or delete users, and manage subscription access.</p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={loadData}
            className={styles.refreshBtn}
            disabled={loading}
          >
            <RefreshCw className={loading ? styles.spin : ''} size={15} />
            Refresh Data
          </button>
        </div>
      </div>

      {actionAlert && (
        <div
          className={
            actionAlert.ok ? styles.statusFeedbackSuccess : styles.statusFeedbackError
          }
          style={{ padding: '10px 16px', borderRadius: '10px', background: actionAlert.ok ? '#ecfdf5' : '#fef2f2' }}
        >
          {actionAlert.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {actionAlert.text}
          <button
            type="button"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            onClick={() => setActionAlert(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={15} /> Overview & Gateway Payments
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'revenue' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          <IndianRupee size={15} /> Revenue & Plans Breakdown
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'clients' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <UsersRound size={15} /> Clients & Access Management ({overview?.totalClients || 0})
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'messages' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <MessageSquare size={15} /> Inquiries & Messages
          {unresolvedCount > 0 && <span className={styles.tabBadge}>{unresolvedCount}</span>}
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'notice' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('notice')}
        >
          <MessageCircle size={15} /> Notice Board
        </button>
      </div>

      {error && (
        <div className={styles.statusFeedbackError}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="page-loader">Loading secure admin data and payment gateway logs...</div>
      ) : overview && (
        <>
          {/* TAB 1: OVERVIEW & PAYMENT GATEWAY TRANSACTIONS */}
          {activeTab === 'overview' && (
            <>
              {/* Top 4 KPI Cards */}
              <section className={styles.statsGrid}>
                {/* Card 1: Gateway Verified Revenue */}
                <article className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${styles.iconRevenue}`}>
                      <CreditCard size={22} />
                    </div>
                    <span className={`${styles.metricPill} ${styles.metricPillPositive}`}>
                      ✓ Razorpay Verified
                    </span>
                  </div>
                  <div className={styles.metricBottom}>
                    <span className={styles.metricLabel}>Payment Gateway Revenue</span>
                    <strong className={styles.metricValue}>{currency(overview.gatewayRevenue)}</strong>
                    <span className={styles.metricSubtext}>Paid directly through online payment gateway</span>
                  </div>
                </article>

                {/* Card 2: Total Revenue */}
                <article className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${styles.iconRevenue}`}>
                      <IndianRupee size={22} />
                    </div>
                    <span className={styles.metricPill}>All Sources</span>
                  </div>
                  <div className={styles.metricBottom}>
                    <span className={styles.metricLabel}>Total Lifetime Revenue</span>
                    <strong className={styles.metricValue}>{currency(overview.totalRevenue)}</strong>
                    <span className={styles.metricSubtext}>Gateway ({currency(overview.gatewayRevenue)}) + Manual ({currency(overview.manualRevenue)})</span>
                  </div>
                </article>

                {/* Card 3: Active Subscriptions */}
                <article className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${styles.iconSubscribers}`}>
                      <Crown size={22} />
                    </div>
                    <span className={styles.metricPill}>Live Subscribers</span>
                  </div>
                  <div className={styles.metricBottom}>
                    <span className={styles.metricLabel}>Active Subscriptions</span>
                    <strong className={styles.metricValue}>{overview.activeSubscriptions}</strong>
                    <span className={styles.metricSubtext}>Currently active paying accounts</span>
                  </div>
                </article>

                {/* Card 4: Total Registered Accounts */}
                <article className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${styles.iconUsers}`}>
                      <UsersRound size={22} />
                    </div>
                    <span className={styles.metricPill}>
                      {overview.totalClients > 0
                        ? `${((overview.activeSubscriptions / overview.totalClients) * 100).toFixed(1)}% Active`
                        : '0%'}
                    </span>
                  </div>
                  <div className={styles.metricBottom}>
                    <span className={styles.metricLabel}>Total Clients Registered</span>
                    <strong className={styles.metricValue}>{overview.totalClients}</strong>
                    <span className={styles.metricSubtext}>Registered shop and wholesale owners</span>
                  </div>
                </article>
              </section>

              {/* DEDICATED OVERVIEW CARD: SUCCESSFUL PAYMENT GATEWAY TRANSACTIONS */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={styles.badgeGateway}>
                        <Zap size={13} /> Razorpay Gateway
                      </span>
                      <h3>Successful Payment Gateway Transactions</h3>
                    </div>
                    <p>Verified payments processed through the online payment gateway with payment IDs and order verification.</p>
                  </div>

                  {/* Filter Pills to isolate Gateway vs All */}
                  <div className={styles.filterPills}>
                    <button
                      type="button"
                      className={`${styles.filterPill} ${
                        gatewayViewFilter === 'gateway_only' ? styles.filterPillActive : ''
                      }`}
                      onClick={() => setGatewayViewFilter('gateway_only')}
                    >
                      ⚡ Gateway Only ({overview.transactions.filter((t) => t.isGateway).length})
                    </button>
                    <button
                      type="button"
                      className={`${styles.filterPill} ${
                        gatewayViewFilter === 'manual' ? styles.filterPillActive : ''
                      }`}
                      onClick={() => setGatewayViewFilter('manual')}
                    >
                      ✍️ Manual Grants ({overview.transactions.filter((t) => !t.isGateway).length})
                    </button>
                    <button
                      type="button"
                      className={`${styles.filterPill} ${
                        gatewayViewFilter === 'all' ? styles.filterPillActive : ''
                      }`}
                      onClick={() => setGatewayViewFilter('all')}
                    >
                      All Transactions ({overview.transactions.length})
                    </button>
                  </div>
                </div>

                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Payment ID / Channel</th>
                        <th>Order ID</th>
                        <th>Customer Email</th>
                        <th>Plan</th>
                        <th>Amount Paid</th>
                        <th>Date & Time</th>
                        <th>Gateway Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overviewTransactions.map((tx) => {
                        const clientRecord = overview.clients.find((c) => c.uid === tx.uid);
                        return (
                          <tr key={tx.id}>
                            <td>
                              {tx.isGateway ? (
                                <span className={styles.badgeGateway} title="Verified Razorpay Transaction">
                                  <CreditCard size={12} /> {tx.paymentId || 'Verified'}
                                </span>
                              ) : (
                                <span className={styles.badgeManual}>
                                  <Edit2 size={12} /> Offline / Admin
                                </span>
                              )}
                            </td>
                            <td>
                              <span className={styles.paymentIdPill}>
                                {tx.orderId || '-'}
                              </span>
                            </td>
                            <td>
                              <strong>{tx.email}</strong>
                            </td>
                            <td>{tx.plan}</td>
                            <td>
                              <strong style={{ color: '#059669', fontSize: '14px' }}>
                                {currency(tx.amount)}
                              </strong>
                            </td>
                            <td>{tx.date.toLocaleString('en-IN')}</td>
                            <td>
                              <span
                                className={`${styles.badgeStatus} ${
                                  tx.status === 'active'
                                    ? styles.statusActive
                                    : tx.status === 'cancelled'
                                    ? styles.statusCancelled
                                    : styles.statusExpired
                                }`}
                              >
                                {tx.status === 'active' && <Check size={12} />}
                                {tx.status === 'cancelled' ? 'Cancelled / Dismissed' : tx.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {clientRecord && (
                                <div className={styles.clientActions}>
                                  {clientRecord.subscriptionStatus === 'active' && (
                                    <button
                                      type="button"
                                      className={styles.btnRevoke}
                                      onClick={() => handleRevokeAccess(clientRecord)}
                                      title="Revoke / Cancel access immediately"
                                    >
                                      <Ban size={12} /> Dismiss Access
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className={styles.btnDeleteClient}
                                    onClick={() => handleDeleteClient(clientRecord)}
                                    title="Delete client account"
                                  >
                                    <Trash2 size={12} /> Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {!overviewTransactions.length && (
                        <tr>
                          <td colSpan={8} className="empty-cell">
                            {gatewayViewFilter === 'gateway_only'
                              ? 'No online gateway transactions processed yet. Successful online payments through Razorpay will be automatically captured here.'
                              : 'No transactions found for this filter.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Plans Performance Cards */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3>Subscription Plans Market Share</h3>
                    <p>Subscribers and revenue generated across all plan offerings.</p>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Est. MRR: <strong style={{ color: '#09090b', fontSize: '15px' }}>{currency(overview.estimatedMRR)}</strong>/mo
                  </div>
                </div>

                <div className={styles.planGrid}>
                  {/* Monthly Plan Card */}
                  <article className={styles.planCard}>
                    <div className={styles.planCardHeader}>
                      <div>
                        <span className={styles.planTag}>Monthly Plan</span>
                        <h4 className={styles.planName}>Monthly</h4>
                        <span className={styles.planPrice}>₹499 / month</span>
                      </div>
                    </div>
                    <div className={styles.planStats}>
                      <div className={styles.planStatRow}>
                        <span>Active Subscribers</span>
                        <strong>{overview.planBreakdown.monthly.activeCount}</strong>
                      </div>
                      <div className={styles.planStatRow}>
                        <span>Total Purchases</span>
                        <strong>{overview.planBreakdown.monthly.totalCount}</strong>
                      </div>
                      <div className={styles.planStatRow}>
                        <span>Total Revenue</span>
                        <strong className={styles.planRevenueHighlight}>
                          {currency(overview.planBreakdown.monthly.revenue)}
                        </strong>
                      </div>
                    </div>
                  </article>

                  {/* 6 Months Plan Card */}
                  <article className={styles.planCard}>
                    <div className={styles.planCardHeader}>
                      <div>
                        <span className={styles.planTag}>Semi-Annual</span>
                        <h4 className={styles.planName}>6 Months</h4>
                        <span className={styles.planPrice}>₹2,499 / 6 months</span>
                      </div>
                    </div>
                    <div className={styles.planStats}>
                      <div className={styles.planStatRow}>
                        <span>Active Subscribers</span>
                        <strong>{overview.planBreakdown.half_yearly.activeCount}</strong>
                      </div>
                      <div className={styles.planStatRow}>
                        <span>Total Purchases</span>
                        <strong>{overview.planBreakdown.half_yearly.totalCount}</strong>
                      </div>
                      <div className={styles.planStatRow}>
                        <span>Total Revenue</span>
                        <strong className={styles.planRevenueHighlight}>
                          {currency(overview.planBreakdown.half_yearly.revenue)}
                        </strong>
                      </div>
                    </div>
                  </article>

                  {/* Yearly Plan Card (Featured) */}
                  <article className={`${styles.planCard} ${styles.planCardFeatured}`}>
                    <div className={styles.planCardHeader}>
                      <div>
                        <span className={styles.planTag}>Best Value · Annual</span>
                        <h4 className={styles.planName}>Yearly Plan</h4>
                        <span className={styles.planPrice}>₹3,499 / year</span>
                      </div>
                      <Crown size={20} color="#6366f1" />
                    </div>
                    <div className={styles.planStats}>
                      <div className={styles.planStatRow}>
                        <span>Active Subscribers</span>
                        <strong>{overview.planBreakdown.yearly.activeCount}</strong>
                      </div>
                      <div className={styles.planStatRow}>
                        <span>Total Purchases</span>
                        <strong>{overview.planBreakdown.yearly.totalCount}</strong>
                      </div>
                      <div className={styles.planStatRow}>
                        <span>Total Revenue</span>
                        <strong className={styles.planRevenueHighlight}>
                          {currency(overview.planBreakdown.yearly.revenue)}
                        </strong>
                      </div>
                    </div>
                  </article>

                  {/* Manual / Direct Grants Card */}
                  <article className={styles.planCard}>
                    <div className={styles.planCardHeader}>
                      <div>
                        <span className={styles.planTag}>Direct / Offline</span>
                        <h4 className={styles.planName}>Manual Grants</h4>
                        <span className={styles.planPrice}>Recorded Admin Payments</span>
                      </div>
                    </div>
                    <div className={styles.planStats}>
                      <div className={styles.planStatRow}>
                        <span>Active Grants</span>
                        <strong>{overview.planBreakdown.manual.activeCount}</strong>
                      </div>
                      <div className={styles.planStatRow}>
                        <span>Total Grants</span>
                        <strong>{overview.planBreakdown.manual.totalCount}</strong>
                      </div>
                      <div className={styles.planStatRow}>
                        <span>Total Revenue</span>
                        <strong className={styles.planRevenueHighlight}>
                          {currency(overview.planBreakdown.manual.revenue)}
                        </strong>
                      </div>
                    </div>
                  </article>
                </div>
              </section>
            </>
          )}

          {/* TAB 2: REVENUE, PLANS & GRANT ACCESS */}
          {activeTab === 'revenue' && (
            <>
              {/* Financial Deep Dive Cards */}
              <section className={styles.statsGrid}>
                <article className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${styles.iconRevenue}`}>
                      <CreditCard size={22} />
                    </div>
                    <span className={`${styles.metricPill} ${styles.metricPillPositive}`}>Online</span>
                  </div>
                  <div className={styles.metricBottom}>
                    <span className={styles.metricLabel}>Gateway Verified Revenue</span>
                    <strong className={styles.metricValue}>{currency(overview.gatewayRevenue)}</strong>
                    <span className={styles.metricSubtext}>Direct Razorpay payment captures</span>
                  </div>
                </article>

                <article className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${styles.iconRevenue}`}>
                      <IndianRupee size={22} />
                    </div>
                    <span className={styles.metricPill}>Combined</span>
                  </div>
                  <div className={styles.metricBottom}>
                    <span className={styles.metricLabel}>Total Lifetime Revenue</span>
                    <strong className={styles.metricValue}>{currency(overview.totalRevenue)}</strong>
                    <span className={styles.metricSubtext}>Across all channels and manual grants</span>
                  </div>
                </article>

                <article className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${styles.iconSubscribers}`}>
                      <Calendar size={22} />
                    </div>
                    <span className={styles.metricPill}>Monthly</span>
                  </div>
                  <div className={styles.metricBottom}>
                    <span className={styles.metricLabel}>Estimated MRR</span>
                    <strong className={styles.metricValue}>{currency(overview.estimatedMRR)}</strong>
                    <span className={styles.metricSubtext}>Normalized monthly recurring value</span>
                  </div>
                </article>

                <article className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${styles.iconRate}`}>
                      <Crown size={22} />
                    </div>
                    <span className={styles.metricPill}>Active</span>
                  </div>
                  <div className={styles.metricBottom}>
                    <span className={styles.metricLabel}>Active Subscriptions</span>
                    <strong className={styles.metricValue}>{overview.activeSubscriptions}</strong>
                    <span className={styles.metricSubtext}>Paying shop workspaces</span>
                  </div>
                </article>
              </section>

              {/* Grant / Edit Subscription Access Card */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3>Grant or Extend Subscription Access</h3>
                    <p>Manually grant workspace access after receiving offline payment, bank transfer, or UPI.</p>
                  </div>
                </div>

                <form onSubmit={handleGrantAccess}>
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label htmlFor="grantEmailInput">Client Email Address</label>
                      <input
                        id="grantEmailInput"
                        type="email"
                        list="userEmailsList"
                        placeholder="e.g. shopowner@gmail.com"
                        required
                        value={grantEmail}
                        onChange={(e) => setGrantEmail(e.target.value)}
                      />
                      <datalist id="userEmailsList">
                        {overview.allUsers.map((u) => (
                          <option key={u.uid} value={u.email} />
                        ))}
                      </datalist>
                    </div>

                    <div className={styles.formField}>
                      <label htmlFor="grantDurationSelect">Access Duration</label>
                      <select
                        id="grantDurationSelect"
                        value={grantDuration}
                        onChange={(e) => setGrantDuration(e.target.value)}
                      >
                        <option value="1">1 Month (30 Days)</option>
                        <option value="3">3 Months (Quarterly)</option>
                        <option value="6">6 Months (Semi-Annual)</option>
                        <option value="12">1 Year (Annual)</option>
                        <option value="24">2 Years (Biannual)</option>
                      </select>
                    </div>

                    <div className={styles.formField}>
                      <label htmlFor="grantAmountInput">Amount Received (₹)</label>
                      <input
                        id="grantAmountInput"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={grantAmount}
                        onChange={(e) => setGrantAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.grantActionRow}>
                    <button
                      type="submit"
                      disabled={granting}
                      className="primary-button"
                      style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}
                    >
                      <Plus size={16} />
                      {granting ? 'Granting Access...' : 'Grant / Update Subscription'}
                    </button>

                    {grantMsg && (
                      <span
                        className={
                          grantMsg.ok ? styles.statusFeedbackSuccess : styles.statusFeedbackError
                        }
                      >
                        {grantMsg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {grantMsg.text}
                      </span>
                    )}
                  </div>
                </form>
              </section>
            </>
          )}

          {/* TAB 3: CLIENTS & ACCESS MANAGEMENT (DISMISS / DELETE / REVOKE) */}
          {activeTab === 'clients' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Clients Directory & User Access Control</h3>
                  <p>Dismiss or revoke user access, delete accounts permanently, or edit subscription grants.</p>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className={styles.filterBar}>
                <label className={styles.searchBox}>
                  <Search size={15} />
                  <input
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search by client email address..."
                  />
                </label>

                <div className={styles.filterPills}>
                  {(['all', 'active', 'gateway', 'expired', 'cancelled', 'none'] as const).map((filter) => (
                    <button
                      type="button"
                      key={filter}
                      className={`${styles.filterPill} ${
                        clientFilter === filter ? styles.filterPillActive : ''
                      }`}
                      onClick={() => setClientFilter(filter)}
                    >
                      {filter === 'all'
                        ? `All (${overview.clients.length})`
                        : filter === 'active'
                        ? `Active (${overview.clients.filter((c) => c.subscriptionStatus === 'active').length})`
                        : filter === 'gateway'
                        ? `Gateway Verified (${overview.clients.filter((c) => c.isGateway && c.subscriptionStatus === 'active').length})`
                        : filter === 'expired'
                        ? `Expired (${overview.clients.filter((c) => c.subscriptionStatus === 'expired').length})`
                        : filter === 'cancelled'
                        ? `Dismissed / Cancelled (${overview.clients.filter((c) => c.subscriptionStatus === 'cancelled').length})`
                        : `No Plan (${overview.clients.filter((c) => c.subscriptionStatus === 'none').length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table of Clients */}
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Client Email</th>
                      <th>Registered On</th>
                      <th>Status</th>
                      <th>Payment Source</th>
                      <th>Plan Details</th>
                      <th>Valid Until</th>
                      <th>Amount</th>
                      <th style={{ textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.uid}>
                        <td>
                          <strong>{client.email}</strong>
                        </td>
                        <td>
                          {client.createdAt
                            ? new Date(client.createdAt).toLocaleDateString('en-IN')
                            : '-'}
                        </td>
                        <td>
                          <span
                            className={`${styles.badgeStatus} ${
                              client.subscriptionStatus === 'active'
                                ? styles.statusActive
                                : client.subscriptionStatus === 'cancelled'
                                ? styles.statusCancelled
                                : client.subscriptionStatus === 'expired'
                                ? styles.statusExpired
                                : styles.statusNone
                            }`}
                          >
                            {client.subscriptionStatus === 'active' && <Check size={12} />}
                            {client.subscriptionStatus === 'cancelled' ? 'Dismissed / Cancelled' : client.subscriptionStatus}
                          </span>
                        </td>
                        <td>
                          {client.isGateway ? (
                            <span className={styles.badgeGateway} title={`Razorpay ID: ${client.paymentId}`}>
                              <CreditCard size={11} /> Gateway Verified
                            </span>
                          ) : client.subscriptionStatus !== 'none' ? (
                            <span className={styles.badgeManual}>
                              <Edit2 size={11} /> Offline Admin
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td>{client.plan}</td>
                        <td>
                          {client.expiresAt
                            ? client.expiresAt.toLocaleDateString('en-IN')
                            : '-'}
                        </td>
                        <td>
                          {client.amount > 0 ? (
                            <strong style={{ color: '#059669' }}>{currency(client.amount)}</strong>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.clientActions}>
                            {/* Edit / Extend Access */}
                            <button
                              type="button"
                              className="secondary-button"
                              style={{ padding: '5px 10px', fontSize: '11.5px' }}
                              onClick={() => {
                                setGrantEmail(client.email);
                                setActiveTab('revenue');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              title="Edit subscription duration or record payment"
                            >
                              <Edit2 size={12} /> Edit
                            </button>

                            {/* Dismiss / Revoke Access */}
                            {client.subscriptionStatus === 'active' && (
                              <button
                                type="button"
                                className={styles.btnRevoke}
                                onClick={() => handleRevokeAccess(client)}
                                title="Dismiss client and cancel subscription access immediately"
                              >
                                <Ban size={12} /> Dismiss Access
                              </button>
                            )}

                            {/* Delete Client Permanently */}
                            <button
                              type="button"
                              className={styles.btnDeleteClient}
                              onClick={() => handleDeleteClient(client)}
                              title="Permanently delete client account from database"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredClients.length && (
                      <tr>
                        <td colSpan={8} className="empty-cell">
                          No client accounts match your search filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 4: INQUIRIES & MESSAGES (WITH DELETE) */}
          {activeTab === 'messages' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Customer & Visitor Inquiries Inbox</h3>
                  <p>Inquiries submitted via the Contact Us and landing page forms. Manage, resolve, or delete.</p>
                </div>
              </div>

              {/* Messages Summary Cards */}
              <div className={styles.messagesSummary}>
                <div className={styles.summaryMiniCard}>
                  <span>Total Inquiries</span>
                  <strong>{messages.length}</strong>
                </div>
                <div className={styles.summaryMiniCard}>
                  <span>Unresolved / Action Required</span>
                  <strong style={{ color: '#dc2626' }}>{unresolvedCount}</strong>
                </div>
                <div className={styles.summaryMiniCard}>
                  <span>Resolved Inquiries</span>
                  <strong style={{ color: '#16a34a' }}>
                    {messages.length - unresolvedCount}
                  </strong>
                </div>
              </div>

              {/* Search & Status Filter */}
              <div className={styles.filterBar}>
                <label className={styles.searchBox}>
                  <Search size={15} />
                  <input
                    value={msgSearch}
                    onChange={(e) => setMsgSearch(e.target.value)}
                    placeholder="Search by sender, email, subject, or message..."
                  />
                </label>

                <div className={styles.filterPills}>
                  {(['all', 'unresolved', 'resolved'] as const).map((filter) => (
                    <button
                      type="button"
                      key={filter}
                      className={`${styles.filterPill} ${
                        msgFilter === filter ? styles.filterPillActive : ''
                      }`}
                      onClick={() => setMsgFilter(filter)}
                    >
                      {filter === 'all'
                        ? `All (${messages.length})`
                        : filter === 'unresolved'
                        ? `Action Required (${unresolvedCount})`
                        : `Resolved (${messages.length - unresolvedCount})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Cards List */}
              <div className={styles.messagesList}>
                {filteredMessages.map((msg) => (
                  <article
                    key={msg.id}
                    className={`${styles.messageCard} ${
                      msg.read ? styles.messageCardResolved : ''
                    }`}
                  >
                    <div className={styles.messageTopRow}>
                      <div className={styles.messageSender}>
                        <div className={styles.senderAvatar}>
                          {(msg.name || 'V')[0].toUpperCase()}
                        </div>
                        <div className={styles.senderMeta}>
                          <div className={styles.senderNameRow}>
                            <span className={styles.senderName}>{msg.name || 'Visitor'}</span>
                            {msg.businessName && (
                              <span className={styles.senderBusiness}>
                                ({msg.businessName})
                              </span>
                            )}
                            <span
                              className={`${styles.badgeStatus} ${
                                msg.read ? styles.statusActive : styles.statusExpired
                              }`}
                            >
                              {msg.read ? 'Resolved' : 'Action Required'}
                            </span>
                          </div>
                          <span className={styles.senderDate}>
                            {msg.createdAt?.toDate
                              ? msg.createdAt.toDate().toLocaleString('en-IN')
                              : 'Recent'}
                          </span>
                        </div>
                      </div>

                      {/* Contact Channels */}
                      <div className={styles.messageContactPills}>
                        <a
                          href={`mailto:${msg.email}`}
                          className={`${styles.contactPill} ${styles.contactPillEmail}`}
                        >
                          <Mail size={13} /> {msg.email}
                        </a>
                        {msg.phone && (
                          <a
                            href={`tel:${msg.phone}`}
                            className={`${styles.contactPill} ${styles.contactPillPhone}`}
                          >
                            <Phone size={13} /> {msg.phone}
                          </a>
                        )}
                        {msg.phone && (
                          <a
                            href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                              msg.name || ''
                            )},%20thank%20you%20for%20contacting%20Billora.`}
                            target="_blank"
                            rel="noreferrer"
                            className={`${styles.contactPill} ${styles.contactPillWhatsApp}`}
                          >
                            <MessageCircle size={13} /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>

                    <h4 className={styles.messageSubject}>{msg.subject || 'General Inquiry'}</h4>
                    <p className={styles.messageBody}>{msg.message}</p>

                    <div className={styles.messageFooterActions}>
                      <button
                        type="button"
                        onClick={() => handleToggleResolved(msg.id, msg.read)}
                        className={`${styles.toggleResolveBtn} ${
                          msg.read ? styles.btnMarkUnresolved : styles.btnMarkResolved
                        }`}
                      >
                        <Check size={14} />
                        {msg.read ? 'Reopen Inquiry' : 'Mark as Resolved'}
                      </button>

                      {/* Delete Message Button */}
                      <button
                        type="button"
                        disabled={deletingId === msg.id}
                        onClick={() => handleDeleteMessage(msg.id, msg.name)}
                        className={styles.deleteMessageBtn}
                        title="Delete Inquiry Message"
                      >
                        <Trash2 size={14} />
                        {deletingId === msg.id ? 'Deleting...' : 'Delete Message'}
                      </button>
                    </div>
                  </article>
                ))}

                {!filteredMessages.length && (
                  <p className="empty-cell" style={{ textAlign: 'center', padding: '40px' }}>
                    No messages match your selected search and filter criteria.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* TAB 5: NOTICE BOARD & LIVE CONTACT ANNOUNCEMENTS */}
          {activeTab === 'notice' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Set Contact Page Notice & Live Support Details</h3>
                  <p>
                    Manage the live status announcement, support phone, and support email visible on the public
                    Contact page.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveNotice}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className={styles.formField}>
                    <label htmlFor="noticeAnnouncement">Announcement Notice Banner</label>
                    <textarea
                      id="noticeAnnouncement"
                      rows={3}
                      value={contactNotice}
                      onChange={(e) => setContactNotice(e.target.value)}
                      placeholder="e.g. Support team is active 9:00 AM - 9:00 PM IST. Typical response time is under 2 hours."
                      required
                    />
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label htmlFor="directPhoneInput">Direct Support Phone</label>
                      <input
                        id="directPhoneInput"
                        type="text"
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        placeholder="+91 97055 27264"
                      />
                    </div>

                    <div className={styles.formField}>
                      <label htmlFor="directEmailInput">Direct Support Email</label>
                      <input
                        id="directEmailInput"
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        placeholder="thegopichand@gmail.com"
                      />
                    </div>
                  </div>

                  <div className={styles.grantActionRow}>
                    <button
                      type="submit"
                      disabled={savingNotice}
                      className="primary-button"
                      style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}
                    >
                      <Save size={16} />
                      {savingNotice ? 'Publishing...' : 'Save & Publish Live Notice'}
                    </button>

                    {noticeFeedback && (
                      <span
                        className={
                          noticeFeedback.ok
                            ? styles.statusFeedbackSuccess
                            : styles.statusFeedbackError
                        }
                      >
                        {noticeFeedback.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {noticeFeedback.text}
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </section>
          )}
        </>
      )}
    </div>
  );
}
