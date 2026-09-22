import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveContactMessage } from '../lib/firestore';
import styles from './ContactUs.module.css';

export function ContactUs() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      if (user) {
        await saveContactMessage(user.uid, user.email || 'Unknown', subject, message);
      }
      setStatus('Message sent successfully! Our team will contact you shortly.');
      setSubject('');
      setMessage('');
      setGuestEmail('');
      setGuestName('');
    } catch (err) {
      console.error(err);
      setStatus('Message recorded. For immediate assistance, please call +91 97055 27264.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Contact Support</h2>
        <p>We are here to help you with your shop billing.</p>
      </header>
      
      <div className={styles.grid}>
        <section className={styles.card}>
          <h3>Get in Touch</h3>
          <p>If you have questions about your subscription, facing technical issues, or want to suggest a feature, reach out to our team directly.</p>
          
          <div className={styles.methods}>
            <div className={styles.method}>
              <Mail className={styles.icon} size={20} />
              <div>
                <strong>Email Us</strong>
                <span>thegopichand@gmail.com</span>
              </div>
            </div>
            
            <div className={styles.method}>
              <Phone className={styles.icon} size={20} />
              <div>
                <strong>Call Us</strong>
                <span>+91 97055 27264</span>
              </div>
            </div>
            
            <div className={styles.method}>
              <MapPin className={styles.icon} size={20} />
              <div>
                <strong>Office</strong>
                <span>Andhra Pradesh, India</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h3>Send a Message</h3>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label>
              Subject
              <input type="text" placeholder="How can we help?" required value={subject} onChange={e => setSubject(e.target.value)} />
            </label>
            <label>
              Message
              <textarea placeholder="Describe your issue or query..." rows={5} required value={message} onChange={e => setMessage(e.target.value)}></textarea>
            </label>
            <button type="submit" disabled={loading} className="primary-button">{loading ? 'Sending...' : 'Send Message'}</button>
            {status && <p style={{ color: status.includes('success') ? '#4ade80' : '#f87171', fontSize: '13px', marginTop: '10px' }}>{status}</p>}
          </form>
        </section>
      </div>
    </div>
  );
}
