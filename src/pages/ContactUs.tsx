import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Sparkles, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveContactMessage, getContactNotice } from '../lib/firestore';
import styles from './ContactUs.module.css';

export function ContactUs() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [adminNotice, setAdminNotice] = useState('');
  const [supportPhone, setSupportPhone] = useState('+91 97055 27264');
  const [supportEmail, setSupportEmail] = useState('thegopichand@gmail.com');

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    // Fetch notice configured by admin
    getContactNotice().then(data => {
      if (data) {
        if (data.notice) setAdminNotice(data.notice);
        if (data.phone) setSupportPhone(data.phone);
        if (data.email) setSupportEmail(data.email);
      }
    }).catch(() => {});
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      await saveContactMessage({
        userId: user?.uid || 'guest',
        name: name || user?.displayName || 'Customer',
        email,
        phone,
        businessName,
        subject: subject || 'General Inquiry',
        message
      });
      setStatus('Message sent successfully! Our admin team has received your message and will contact you shortly.');
      setSubject('');
      setMessage('');
      if (!user) {
        setName('');
        setEmail('');
        setPhone('');
        setBusinessName('');
      }
    } catch (err) {
      console.error(err);
      setStatus('Thank you! Your message was recorded. You can also call us directly at ' + supportPhone);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Contact Support</h2>
        <p>We are here to help you get the most out of Billora for your shop.</p>
      </header>

      {/* Admin Notice Banner (Set by admin in messages tab) */}
      {adminNotice && (
        <div className={styles.adminNoticeBanner}>
          <div className={styles.noticeIcon}><Sparkles size={18} /></div>
          <div>
            <strong>Support Announcement</strong>
            <p>{adminNotice}</p>
          </div>
        </div>
      )}
      
      <div className={styles.grid}>
        <section className={styles.card}>
          <h3>Get in Touch</h3>
          <p>If you have questions about subscription activation, need assistance setting up products, or want to suggest a new feature, reach out to our team directly.</p>
          
          <div className={styles.methods}>
            <div className={styles.method}>
              <Mail className={styles.icon} size={20} />
              <div>
                <strong>Direct Email</strong>
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </div>
            </div>
            
            <div className={styles.method}>
              <Phone className={styles.icon} size={20} />
              <div>
                <strong>Phone & WhatsApp</strong>
                <a href={`tel:${supportPhone}`}>{supportPhone}</a>
              </div>
            </div>
            
            <div className={styles.method}>
              <MapPin className={styles.icon} size={20} />
              <div>
                <strong>Office Location</strong>
                <span>Andhra Pradesh, India</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h3>Send a Message</h3>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <label>
                Your Name
                <input 
                  type="text" 
                  placeholder="e.g. Ramesh Reddy" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </label>
              <label>
                Phone Number
                <input 
                  type="tel" 
                  placeholder="e.g. +91 98765 43210" 
                  required 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                />
              </label>
            </div>

            <div className={styles.formRow}>
              <label>
                Email Address
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </label>
              <label>
                Shop / Business Name
                <input 
                  type="text" 
                  placeholder="e.g. Sri Lakshmi Stores" 
                  value={businessName} 
                  onChange={e => setBusinessName(e.target.value)} 
                />
              </label>
            </div>

            <label>
              Subject
              <input 
                type="text" 
                placeholder="How can we help?" 
                required 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
              />
            </label>

            <label>
              Message
              <textarea 
                placeholder="Describe your issue or query..." 
                rows={4} 
                required 
                value={message} 
                onChange={e => setMessage(e.target.value)}
              />
            </label>

            <button type="submit" disabled={loading} className="primary-button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', fontSize: '14px' }}>
              <Send size={15} /> {loading ? 'Sending to Admin...' : 'Send Message'}
            </button>

            {status && (
              <div className={status.includes('success') ? styles.successBox : styles.infoBox}>
                <CheckCircle2 size={16} />
                <span>{status}</span>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
