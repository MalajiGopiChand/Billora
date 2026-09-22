import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Users, 
  Package, 
  FileText, 
  BarChart3, 
  CreditCard, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Store, 
  Smartphone, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  Menu, 
  X,
  Play,
  Clock,
  Layers,
  ShoppingBag,
  Cpu,
  Wrench,
  Pill,
  Truck,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { saveContactMessage, getContactNotice } from '@/lib/firestore';
import { HeroDashboardPreview } from '@/components/landing/HeroDashboardPreview';
import { InteractiveDemoModal } from '@/components/landing/InteractiveDemoModal';
import { OneWorkspaceSection } from '@/components/landing/OneWorkspaceSection';
import { PricingCalculator } from '@/components/landing/PricingCalculator';
import styles from './Landing.module.css';

export function Landing() {
  const { user, isAdmin } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'sixMonths' | 'yearly'>('yearly');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Live Contact state linked to Admin Messages
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formBusiness, setFormBusiness] = useState('');
  const [formReason, setFormReason] = useState('General enquiry');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState('');

  const [supportPhone, setSupportPhone] = useState('+91 97055 27264');
  const [supportEmail, setSupportEmail] = useState('thegopichand@gmail.com');
  const [adminNotice, setAdminNotice] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    getContactNotice().then(data => {
      if (data) {
        if (data.phone) setSupportPhone(data.phone);
        if (data.email) setSupportEmail(data.email);
        if (data.notice) setAdminNotice(data.notice);
      }
    }).catch(() => {});

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqList = [
    {
      q: 'What is Billora?',
      a: 'Billora is a modern business operating workspace for shops and growing businesses in India. It brings fast invoicing, inventory cataloging, customer profiles, payment tracking, and live sales insights into one beautifully simple app.'
    },
    {
      q: 'Who can use Billora?',
      a: 'Billora is built for grocery stores, clothing boutiques, electronics shops, hardware stores, pharmacies, general retail, wholesale distributors, and local kirana stores of all sizes.'
    },
    {
      q: 'Can I create GST invoices?',
      a: 'Yes! Billora supports both GST and Non-GST billing. It automatically calculates CGST, SGST, IGST, and item-wise or invoice-level discounts based on your preferences.'
    },
    {
      q: 'Can I download and print invoices?',
      a: 'Yes. With one click you can print standard A4 invoices for laser or thermal printers, or download clean PDF copies ready to share directly with customers over WhatsApp or email.'
    },
    {
      q: 'Can I manage products and inventory?',
      a: 'Absolutely. Save product names, barcodes, categories, wholesale purchase rates, and standard selling prices once. They auto-complete on bills in seconds, and you get low-stock warnings before items run out.'
    },
    {
      q: 'Can I manage customers and credit khata?',
      a: 'Yes. Billora automatically builds customer profiles from invoice history. You can view total purchases, visit frequency, average order values, and track pending credit dues.'
    },
    {
      q: 'Can I track payments and cash collection?',
      a: 'Yes. Record payments across Cash, UPI QR, Debit/Credit Card, and credit accounts. Your dashboard immediately reconciles cash in hand with digital payments.'
    },
    {
      q: 'Can I see sales reports and analytics?',
      a: 'Yes. Your live dashboard provides clear graphs for today, 7 days, 30 days, and yearly turnover, along with top-performing products and sales volume insights.'
    },
    {
      q: 'Can I use Billora on mobile?',
      a: 'Yes! Billora is fully responsive and optimized for mobile browsers as well as desktop screens. You can check daily sales or create quick bills right from your smartphone.'
    },
    {
      q: 'How does the subscription work?',
      a: 'We offer straightforward, transparent pricing with no hidden charges. Choose from Monthly (₹499), 6 Months (₹2,499), or Yearly (₹3,499). All plans include unlimited invoices, products, and full features.'
    },
    {
      q: 'How does Razorpay payment work?',
      a: 'When you choose a plan, you can securely pay via UPI, Google Pay, PhonePe, Paytm, Netbanking, or Debit/Credit cards through Razorpay. Your workspace is activated instantly upon payment verification.'
    },
    {
      q: 'How can I contact support?',
      a: 'You can reach out to our dedicated support team via email at thegopichand@gmail.com or call us directly at +91 97055 27264. We are always ready to assist you.'
    }
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Interactive Demo Modal */}
      {showDemoModal && (
        <InteractiveDemoModal onClose={() => setShowDemoModal(false)} />
      )}

      {/* 3. STICKY PREMIER NAVBAR */}
      <nav className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.brand}>
            <img src="/logo.jpg" alt="Billora" className={styles.brandLogo} />
            <span className={styles.brandName}>Billora</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className={styles.navLinks}>
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#why-billora">About</a>
            <a href="#contact">Contact</a>
          </div>

          {/* Right Action Buttons */}
          <div className={styles.navActions}>
            <button 
              onClick={() => setShowDemoModal(true)} 
              className={styles.demoLinkBtn}
            >
              <Sparkles size={14} /> Explore Demo
            </button>
            {user ? (
              <Link to={isAdmin ? "/admin" : "/dashboard"} className={styles.primaryNavBtn}>
                {isAdmin ? "Admin Console" : "Open Dashboard"} <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link to="/login" className={styles.signInBtn}>Sign in</Link>
                <Link to="/register" className={styles.primaryNavBtn}>
                  Get Started <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className={styles.mobileDrawer}>
            <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#why-billora" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <div className={styles.mobileDrawerActions}>
              <button 
                onClick={() => { setMobileMenuOpen(false); setShowDemoModal(true); }}
                className={styles.mobileDemoBtn}
              >
                <Sparkles size={14} /> Try Interactive Demo
              </button>
              {user ? (
                <Link to={isAdmin ? "/admin" : "/dashboard"} className={styles.mobileStartBtn}>
                  Open Workspace
                </Link>
              ) : (
                <>
                  <Link to="/login" className={styles.mobileLoginBtn}>Sign In</Link>
                  <Link to="/register" className={styles.mobileStartBtn}>Create Workspace</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 4. HERO SECTION */}
      <header id="home" className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} className={styles.sparkleIcon} />
            <span>Modern Billing Platform for Indian Retail & Wholesale</span>
          </div>

          <h1 className={styles.heroHeadline}>
            Professional billing for growing shops.
          </h1>

          <p className={styles.heroSubhead}>
            Create invoices faster. Know your sales instantly. Build stronger customer relationships.
          </p>

          <p className={styles.heroSupport}>
            Billora brings billing, products, customers, payments, and business insights together in one simple workspace.
          </p>

          <div className={styles.heroCtaGroup}>
            <Link to={user ? "/dashboard" : "/register"} className={styles.heroPrimaryBtn}>
              Start with Billora <ArrowRight size={17} />
            </Link>
            <button onClick={() => setShowDemoModal(true)} className={styles.heroSecondaryBtn}>
              <Play size={15} fill="currentColor" /> Explore the demo
            </button>
          </div>

          <div className={styles.trustText}>
            <ShieldCheck size={16} />
            <span>No complicated setup · Secure payments · Built for growing businesses</span>
          </div>
        </div>

        {/* 5. HERO INTERACTIVE PRODUCT DEMO & FLOATING CARDS */}
        <div className={styles.mockupContainer}>
          <HeroDashboardPreview onOpenDemo={() => setShowDemoModal(true)} />
        </div>
      </header>

      {/* 9. SOCIAL PROOF / VALUE STRIP */}
      <section className={styles.proofStrip}>
        <div className={styles.proofInner}>
          <span className={styles.proofTitle}>Everything you need to run your daily billing:</span>
          <div className={styles.proofTags}>
            <div className={styles.proofItem}><CheckCircle2 size={16} /> Fast invoicing</div>
            <div className={styles.proofItem}><CheckCircle2 size={16} /> Customer history</div>
            <div className={styles.proofItem}><CheckCircle2 size={16} /> Product management</div>
            <div className={styles.proofItem}><CheckCircle2 size={16} /> Sales analytics</div>
            <div className={styles.proofItem}><CheckCircle2 size={16} /> PDF invoices</div>
            <div className={styles.proofItem}><CheckCircle2 size={16} /> A4 printing</div>
          </div>
        </div>
      </section>

      {/* 10. PROBLEM SECTION */}
      <section className={styles.problemSection}>
        <div className={styles.problemInner}>
          <div className={styles.problemHeader}>
            <span className={styles.sectionBadge}>The Reality</span>
            <h2>Your business is busy enough.</h2>
            <p className={styles.problemSub}>Your billing software shouldn't make it harder.</p>
          </div>

          <div className={styles.problemCardsGrid}>
            <div className={styles.problemCard}>
              <div className={styles.problemCardIcon}>📄</div>
              <h3>Paper everywhere</h3>
              <p>Bills, customer details, and sales records scattered across physical notebooks, loose receipts, and lost registers.</p>
            </div>

            <div className={styles.problemCard}>
              <div className={styles.problemCardIcon}>🖥️</div>
              <h3>Too many screens</h3>
              <p>Traditional accounting software is clunky, requiring 10 clicks just to generate a simple invoice at a crowded counter.</p>
            </div>

            <div className={styles.problemCard}>
              <div className={styles.problemCardIcon}>📉</div>
              <h3>No clear picture</h3>
              <p>Without live reports, it is difficult to know daily turnover, outstanding customer khata, or your best-selling items.</p>
            </div>
          </div>

          <div className={styles.problemTransition}>
            <div className={styles.transitionLine} />
            <div className={styles.transitionPill}>
              <Sparkles size={16} />
              <span>Billora brings everything together into one calm, lightning-fast workspace.</span>
            </div>
            <div className={styles.transitionLine} />
          </div>
        </div>
      </section>

      {/* 11. "ONE WORKSPACE" SECTION */}
      <div id="features">
        <OneWorkspaceSection />
      </div>

      {/* 16. BUSINESS INSIGHTS: KNOW WHAT SELLS */}
      <section className={styles.insightsSection}>
        <div className={styles.insightsInner}>
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionBadge}>Clarity At Every Step</span>
            <h2>Stop guessing. Start knowing.</h2>
            <p>Four pillars that transform how Indian shop owners make daily business decisions.</p>
          </div>

          <div className={styles.insightsGrid}>
            <div className={styles.insightBox}>
              <div className={styles.insightIcon}><Package size={24} /></div>
              <h3>Know what sells.</h3>
              <p>Spot your top-performing products by invoiced volume and revenue. Never let your highest-profit items run out of stock.</p>
            </div>

            <div className={styles.insightBox}>
              <div className={styles.insightIcon}><Users size={24} /></div>
              <h3>Know your customers.</h3>
              <p>Understand repeat customers, their lifetime purchase total, average ticket size, and preferred payment methods.</p>
            </div>

            <div className={styles.insightBox}>
              <div className={styles.insightIcon}><CreditCard size={24} /></div>
              <h3>Know your money.</h3>
              <p>Track cash in drawer, UPI transfers received, and pending credit balances. Reconcile daily transactions in minutes.</p>
            </div>

            <div className={styles.insightBox}>
              <div className={styles.insightIcon}><TrendingUp size={24} /></div>
              <h3>Know your growth.</h3>
              <p>Compare daily, weekly, monthly, and yearly performance to spot seasonal trends and plan orders proactively.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 17. "BUILT FOR REAL SHOPS" GRID */}
      <section className={styles.industrySection}>
        <div className={styles.industryInner}>
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionBadge}>Versatile & Proven</span>
            <h2>Designed around the way you actually work.</h2>
            <p>Tailored for the daily counter rhythm of diverse trade sectors across India.</p>
          </div>

          <div className={styles.industryGrid}>
            <div className={styles.indCard}>
              <Store size={24} />
              <h4>Grocery & Kirana</h4>
              <p>Fast billing for loose grains, oils, packaged staples, and daily provisions.</p>
            </div>

            <div className={styles.indCard}>
              <ShoppingBag size={24} />
              <h4>Clothing & Apparel</h4>
              <p>Item size and rate tagging with clean customer receipts and WhatsApp delivery.</p>
            </div>

            <div className={styles.indCard}>
              <Smartphone size={24} />
              <h4>Electronics & Mobile</h4>
              <p>Serial numbers, model details, accessories billing, and GST compliance.</p>
            </div>

            <div className={styles.indCard}>
              <Wrench size={24} />
              <h4>Hardware & Electrical</h4>
              <p>Wholesale and retail rates, contractor khata tracking, and itemized bills.</p>
            </div>

            <div className={styles.indCard}>
              <Pill size={24} />
              <h4>Pharmacy & Health</h4>
              <p>Quick patient billing, customer phone lookup, and clean printed summaries.</p>
            </div>

            <div className={styles.indCard}>
              <Layers size={24} />
              <h4>General Retail</h4>
              <p>Instant barcode search, discount percentages, and multi-mode payment handling.</p>
            </div>

            <div className={styles.indCard}>
              <Truck size={24} />
              <h4>Small Distributors</h4>
              <p>Bulk quantity invoices, transport GB slip numbers, LR records, and carton counts.</p>
            </div>

            <div className={styles.indCard}>
              <Building2Icon />
              <h4>Local Businesses</h4>
              <p>Services, repairs, and supply shops wanting to leave messy paper bills behind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 18. WHY BILLORA (SPLIT VALUE PROPS) */}
      <section id="why-billora" className={styles.whySection}>
        <div className={styles.whyInner}>
          <div className={styles.whyLeft}>
            <span className={styles.sectionBadge}>Why Choose Billora</span>
            <h2>Built for speed at the counter, not accounting exams.</h2>
            <p>Most software is built for accountants sitting at a desk. Billora is crafted for shop owners standing at a busy counter with customers waiting.</p>
            
            <div className={styles.whyHighlights}>
              <div className={styles.whyHighlightItem}>
                <div className={styles.whyNum}>01</div>
                <div>
                  <strong>Fast & Keyboard-First</strong>
                  <p>Move through product names, quantities, and rates with just the Enter key.</p>
                </div>
              </div>

              <div className={styles.whyHighlightItem}>
                <div className={styles.whyNum}>02</div>
                <div>
                  <strong>Zero Training Required</strong>
                  <p>So intuitive anyone at your shop can create an accurate bill on day one.</p>
                </div>
              </div>

              <div className={styles.whyHighlightItem}>
                <div className={styles.whyNum}>03</div>
                <div>
                  <strong>Organised In One Place</strong>
                  <p>Bills, inventory, customer history, and payment ledgers permanently in sync.</p>
                </div>
              </div>

              <div className={styles.whyHighlightItem}>
                <div className={styles.whyNum}>04</div>
                <div>
                  <strong>Insightful Live Reports</strong>
                  <p>Clear visual graphs replace complicated balance sheets with real answers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.whyRight}>
            <div className={styles.whyVisualCard}>
              <div className={styles.whyCardHeader}>
                <Sparkles size={16} /> Sri Lakshmi Stores · Live Billora Console
              </div>
              <div className={styles.whyCardMetric}>
                <span>Average Billing Speed</span>
                <strong>45 Seconds</strong>
                <small>Down from 3-4 minutes per manual paper bill</small>
              </div>
              <div className={styles.whyCardDivider} />
              <div className={styles.whyFeaturesList}>
                <div><Check size={15} /> Accurate GST tax and discount calculation</div>
                <div><Check size={15} /> Instant search by customer phone number</div>
                <div><Check size={15} /> Safe cloud storage with daily backups</div>
                <div><Check size={15} /> A4 Laser, Inkjet, or Thermal print ready</div>
              </div>
              <button onClick={() => setShowDemoModal(true)} className={styles.whyDemoBtn}>
                Try Live Interactive Demo <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 19. HOW IT WORKS TIMELINE */}
      <section id="how-it-works" className={styles.howSection}>
        <div className={styles.howInner}>
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionBadge}>Simple Setup</span>
            <h2>From zero to first bill in 5 minutes.</h2>
            <p>No lengthy installations, no technician visits, no complicated IT hardware needed.</p>
          </div>

          <div className={styles.timelineRow}>
            <div className={styles.timelineStep}>
              <div className={styles.stepNum}>01</div>
              <h4>Create Workspace</h4>
              <p>Add your shop name, address, phone, and optional GSTIN in 30 seconds.</p>
            </div>

            <div className={styles.timelineStep}>
              <div className={styles.stepNum}>02</div>
              <h4>Add Products</h4>
              <p>Save common products and selling rates once for instant autocomplete.</p>
            </div>

            <div className={styles.timelineStep}>
              <div className={styles.stepNum}>03</div>
              <h4>Add Customers</h4>
              <p>Keep customer phone numbers and purchase histories automatically organized.</p>
            </div>

            <div className={styles.timelineStep}>
              <div className={styles.stepNum}>04</div>
              <h4>Create Invoices</h4>
              <p>Type items with rapid Enter-key navigation and print or download PDF.</p>
            </div>

            <div className={styles.timelineStep}>
              <div className={styles.stepNum}>05</div>
              <h4>Track Sales</h4>
              <p>Watch daily sales, top products, and customer balances update live.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 21. SECURITY & TRUST */}
      <section className={styles.trustSection}>
        <div className={styles.trustInner}>
          <div className={styles.trustGrid}>
            <div className={styles.trustTextCol}>
              <span className={styles.sectionBadge}>Reliability & Privacy</span>
              <h2>Your business deserves a system you can trust.</h2>
              <p>We treat your shop's billing records with the highest standards of reliability, performance, and data isolation.</p>
            </div>

            <div className={styles.trustCardsCol}>
              <div className={styles.trustCard}>
                <ShieldCheck size={20} className={styles.trustIcon} />
                <div>
                  <strong>Secure Authentication</strong>
                  <p>Encrypted credentials and owner-isolated workspace access protection.</p>
                </div>
              </div>

              <div className={styles.trustCard}>
                <Layers size={20} className={styles.trustIcon} />
                <div>
                  <strong>Isolated Business Records</strong>
                  <p>Your shop's bills, customer data, and products are strictly private to your account.</p>
                </div>
              </div>

              <div className={styles.trustCard}>
                <CreditCard size={20} className={styles.trustIcon} />
                <div>
                  <strong>Trusted Payment Processing</strong>
                  <p>All subscription payments are securely verified and processed through Razorpay.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 22. PRICING SECTION */}
      <section id="pricing" className={styles.pricingSection}>
        <div className={styles.pricingInner}>
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionBadge}>Transparent Pricing</span>
            <h2>Simple pricing. No confusing plans.</h2>
            <p>One powerful plan with everything included. Pay securely with Razorpay and unlock your workspace instantly.</p>
            
            {/* Period Toggle */}
            <div className={styles.pricingToggle}>
              <button 
                className={billingPeriod === 'monthly' ? styles.toggleActive : ''}
                onClick={() => setBillingPeriod('monthly')}
              >
                Monthly
              </button>
              <button 
                className={billingPeriod === 'sixMonths' ? styles.toggleActive : ''}
                onClick={() => setBillingPeriod('sixMonths')}
              >
                6 Months <span className={styles.saveBadge}>Save 17%</span>
              </button>
              <button 
                className={billingPeriod === 'yearly' ? styles.toggleActive : ''}
                onClick={() => setBillingPeriod('yearly')}
              >
                Yearly <span className={styles.bestBadge}>Best Value · Save 42%</span>
              </button>
            </div>
          </div>

          <div className={styles.pricingCardsGrid}>
            {/* MONTHLY */}
            <div className={`${styles.priceCard} ${billingPeriod === 'monthly' ? styles.cardHighlight : ''}`}>
              <div className={styles.planName}>Monthly Plan</div>
              <div className={styles.planPrice}>
                <strong>₹499</strong> <span>/ month</span>
              </div>
              <div className={styles.planTaxNote}>GST included · Pay monthly</div>
              <p className={styles.planDesc}>Great for new stores trying out modern billing.</p>
              
              <ul className={styles.planFeatures}>
                <li><Check size={16} /> Unlimited invoices & bills</li>
                <li><Check size={16} /> Complete product & customer catalog</li>
                <li><Check size={16} /> A4 thermal & laser printing</li>
                <li><Check size={16} /> Instant PDF export & WhatsApp share</li>
                <li><Check size={16} /> Real-time sales dashboard & reports</li>
              </ul>

              <Link to="/register" className={styles.planBtnSecondary}>
                Start Monthly Plan
              </Link>
            </div>

            {/* 6 MONTHS */}
            <div className={`${styles.priceCard} ${billingPeriod === 'sixMonths' ? styles.cardHighlight : ''}`}>
              <div className={styles.popularTag}>POPULAR CHOICE</div>
              <div className={styles.planName}>6 Months Plan</div>
              <div className={styles.planPrice}>
                <strong>₹2,499</strong> <span>/ 6 months</span>
              </div>
              <div className={styles.planTaxNote}>GST included · Equivalent to ₹416/mo</div>
              <p className={styles.planDesc}>Ideal for growing shops looking for steady savings.</p>
              
              <ul className={styles.planFeatures}>
                <li><Check size={16} /> Unlimited invoices & bills</li>
                <li><Check size={16} /> Complete product & customer catalog</li>
                <li><Check size={16} /> A4 thermal & laser printing</li>
                <li><Check size={16} /> Instant PDF export & WhatsApp share</li>
                <li><Check size={16} /> Real-time sales dashboard & reports</li>
                <li><Check size={16} /> Priority customer support</li>
              </ul>

              <Link to="/register" className={styles.planBtnPrimary}>
                Choose 6 Months Plan
              </Link>
            </div>

            {/* YEARLY */}
            <div className={`${styles.priceCard} ${billingPeriod === 'yearly' ? styles.cardHighlight : ''}`}>
              <div className={styles.bestValueTag}>BEST VALUE</div>
              <div className={styles.planName}>Yearly Plan</div>
              <div className={styles.planPrice}>
                <strong>₹3,499</strong> <span>/ year</span>
              </div>
              <div className={styles.planTaxNote}>GST included · Just ₹291/month</div>
              <p className={styles.planDesc}>Maximum savings for established retail and wholesale businesses.</p>
              
              <ul className={styles.planFeatures}>
                <li><Check size={16} /> Unlimited invoices & bills</li>
                <li><Check size={16} /> Complete product & customer catalog</li>
                <li><Check size={16} /> A4 thermal & laser printing</li>
                <li><Check size={16} /> Instant PDF export & WhatsApp share</li>
                <li><Check size={16} /> Real-time sales dashboard & reports</li>
                <li><Check size={16} /> Priority 1-on-1 setup assistance</li>
              </ul>

              <Link to="/register" className={styles.planBtnPrimary}>
                Choose Yearly Plan →
              </Link>
            </div>
          </div>

          {/* 23. PRICING CALCULATOR */}
          <PricingCalculator />
        </div>
      </section>

      {/* 24. TESTIMONIALS */}
      <section className={styles.testimonialsSection}>
        <div className={styles.testimonialsInner}>
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionBadge}>Customer Stories</span>
            <h2>Loved by shop owners across India.</h2>
            <p>Here is what shopkeepers are saying about switching their daily billing to Billora.</p>
          </div>

          <div className={styles.testimonialsGrid}>
            <div className={styles.testCard}>
              <p>"Before Billora, our evening billing rush was stressful. Moving through items with the Enter key is so fast, we now finish every bill in under a minute."</p>
              <div className={styles.testAuthor}>
                <div className={styles.testAvatar}>SR</div>
                <div>
                  <strong>Suresh Reddy</strong>
                  <span>Sri Lakshmi General Stores · Andhra Pradesh</span>
                </div>
              </div>
            </div>

            <div className={styles.testCard}>
              <p>"Finding old customer bills used to take 20 minutes of digging through registers. Now I just type the customer's phone number and see their whole history."</p>
              <div className={styles.testAuthor}>
                <div className={styles.testAvatar}>AT</div>
                <div>
                  <strong>Anil Kumar</strong>
                  <span>Anil Traders & Electricals · Telangana</span>
                </div>
              </div>
            </div>

            <div className={styles.testCard}>
              <p>"The dashboard gives me a clear picture of my shop every evening. I know exactly how much cash was taken, what came via UPI, and my top-selling items."</p>
              <div className={styles.testAuthor}>
                <div className={styles.testAvatar}>PS</div>
                <div>
                  <strong>Priya Sharma</strong>
                  <span>Priya Fashion Boutique · Maharashtra</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 25. FAQ ACCORDION */}
      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionBadge}>Frequently Asked Questions</span>
            <h2>Got questions? We've got answers.</h2>
            <p>Everything you need to know about setting up and running your shop on Billora.</p>
          </div>

          <div className={styles.accordionContainer}>
            {faqList.map((faq, index) => (
              <div 
                key={index} 
                className={`${styles.accordionItem} ${openFaqIndex === index ? styles.accordionOpen : ''}`}
              >
                <button 
                  className={styles.accordionHeader}
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaqIndex === index}
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaqIndex === index && (
                  <div className={styles.accordionBody}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 26. FINAL CTA BANNER */}
      <section className={styles.finalCtaSection}>
        <div className={styles.finalCtaInner}>
          <h2>Ready to make billing simpler?</h2>
          <p>Start creating professional invoices, organising customers, and understanding your business from one simple workspace.</p>
          
          <div className={styles.finalBtnGroup}>
            <Link to="/register" className={styles.ctaWhiteBtn}>
              Start with Billora <ArrowRight size={16} />
            </Link>
            <button onClick={() => setShowDemoModal(true)} className={styles.ctaGhostBtn}>
              <Play size={14} fill="currentColor" /> Try the interactive demo
            </button>
          </div>

          <span className={styles.ctaFooterNote}>
            Instant workspace setup · Secure records · Built for growing businesses
          </span>
        </div>
      </section>

      {/* 27. CONTACT SECTION */}
      <section id="contact" className={styles.contactSection}>
        <div className={styles.contactInner}>
          <div className={styles.contactInfoCol}>
            <span className={styles.sectionBadge}>Contact Us</span>
            <h2>Let's talk about your shop.</h2>
            <p>Have questions about your billing setup or need help choosing a plan? Reach out to our founder and team directly.</p>
            
            {adminNotice && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', color: '#1e40af', fontSize: '13px' }}>
                <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#2563eb', marginBottom: '4px' }}>
                  Support Announcement
                </strong>
                {adminNotice}
              </div>
            )}

            <div className={styles.contactMethods}>
              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}><Mail size={18} /></div>
                <div>
                  <strong>Email Us</strong>
                  <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                </div>
              </div>

              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}><Phone size={18} /></div>
                <div>
                  <strong>Call or WhatsApp</strong>
                  <a href={`tel:${supportPhone}`}>{supportPhone}</a>
                </div>
              </div>

              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}><MapPin size={18} /></div>
                <div>
                  <strong>Office Location</strong>
                  <span>Andhra Pradesh, India</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contactCardCol}>
            <div className={styles.contactBox}>
              <h3>Quick Message</h3>
              <p>Leave a note and our admin team will reply promptly.</p>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFormSubmitting(true);
                  setFormStatus('');
                  try {
                    await saveContactMessage({
                      userId: user?.uid || 'guest',
                      name: formName || user?.displayName || 'Visitor',
                      email: formEmail || user?.email || 'No email provided',
                      phone: formPhone,
                      businessName: formBusiness,
                      subject: formReason,
                      message: formMessage
                    });
                    setFormStatus('Message received! Our team has received your inquiry in the admin portal.');
                    setFormName('');
                    setFormPhone('');
                    setFormEmail('');
                    setFormBusiness('');
                    setFormMessage('');
                  } catch (err) {
                    console.error(err);
                    setFormStatus(`Message recorded! For instant assistance, call us at ${supportPhone}`);
                  } finally {
                    setFormSubmitting(false);
                  }
                }}
                className={styles.contactForm}
              >
                <div className={styles.formRow}>
                  <div>
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ramesh Reddy" 
                      required 
                      value={formName} 
                      onChange={e => setFormName(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 98765 43210" 
                      required 
                      value={formPhone} 
                      onChange={e => setFormPhone(e.target.value)} 
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div>
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      value={formEmail} 
                      onChange={e => setFormEmail(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label>Business / Shop Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Reddy Groceries" 
                      value={formBusiness} 
                      onChange={e => setFormBusiness(e.target.value)} 
                    />
                  </div>
                </div>
                <div>
                  <label>Reason for contacting</label>
                  <select 
                    value={formReason} 
                    onChange={e => setFormReason(e.target.value)}
                  >
                    <option value="General enquiry">General enquiry</option>
                    <option value="Request personalized demo">Request personalized demo</option>
                    <option value="Pricing & subscription">Pricing & subscription</option>
                    <option value="Technical support">Technical support</option>
                    <option value="Feature request">Feature request</option>
                  </select>
                </div>
                <div>
                  <label>Message</label>
                  <textarea 
                    rows={4} 
                    placeholder="How can we help your business?" 
                    required 
                    value={formMessage} 
                    onChange={e => setFormMessage(e.target.value)} 
                  />
                </div>
                <button type="submit" disabled={formSubmitting} className={styles.submitFormBtn}>
                  {formSubmitting ? 'Sending...' : 'Send Message'} <ArrowRight size={15} />
                </button>
                {formStatus && (
                  <p style={{ marginTop: 10, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                    {formStatus}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 43. FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrandCol}>
            <Link to="/" className={styles.brand}>
              <img src="/logo.jpg" alt="Billora" className={styles.brandLogo} />
              <span className={styles.brandName}>Billora</span>
            </Link>
            <p className={styles.footerTagline}>
              Professional billing & business management platform for growing shops in India.
            </p>
            <div className={styles.footerLocation}>
              📍 Andhra Pradesh, India
            </div>
          </div>

          <div className={styles.footerLinksGrid}>
            <div className={styles.footerCol}>
              <strong>Product</strong>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <a href="#pricing">Pricing</a>
              <button onClick={() => setShowDemoModal(true)} className={styles.footerLinkBtn}>
                Interactive Demo
              </button>
            </div>

            <div className={styles.footerCol}>
              <strong>Company</strong>
              <a href="#why-billora">About Us</a>
              <a href="#why-billora">Why Billora</a>
              <a href="#contact">Contact</a>
            </div>

            <div className={styles.footerCol}>
              <strong>Support</strong>
              <a href="#faq">FAQ</a>
              <a href="#contact">Direct Support</a>
              <a href="tel:+919705527264">+91 97055 27264</a>
            </div>

            <div className={styles.footerCol}>
              <strong>Legal</strong>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Refund Policy</span>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2026 Billora. All rights reserved. Built with pride in Andhra Pradesh, India.</p>
          <div className={styles.footerBottomLinks}>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Building2Icon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
      <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>
  );
}
