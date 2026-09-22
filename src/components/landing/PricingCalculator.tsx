import { useState } from 'react';
import { Clock, Zap, Calculator, ArrowRight } from 'lucide-react';
import styles from './PricingCalculator.module.css';

export function PricingCalculator() {
  const [billsPerDay, setBillsPerDay] = useState<number>(45);
  const [minutesPerBill, setMinutesPerBill] = useState<number>(4);
  const [workingDays, setWorkingDays] = useState<number>(26);

  // Calculations
  const monthlyBills = billsPerDay * workingDays;
  // Manual time spent in hours per month
  const manualHours = (monthlyBills * minutesPerBill) / 60;
  // With Billora keyboard speed & autocomplete, average time drops to ~1.2 mins
  const billoraHours = (monthlyBills * 1.2) / 60;
  const hoursSaved = Math.max(0, Math.round(manualHours - billoraHours));
  const estimatedVolume = monthlyBills * 185; // approx ₹185 average ticket

  return (
    <div className={styles.calculatorCard}>
      <div className={styles.cardHeader}>
        <div className={styles.badge}><Calculator size={14} /> Interactive Productivity Calculator</div>
        <h3>How much could Billora simplify your billing?</h3>
        <p>See how much time your counter staff saves by switching from manual pen-and-paper or slow legacy software.</p>
      </div>

      <div className={styles.grid}>
        {/* Sliders Input Column */}
        <div className={styles.inputsCol}>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label>Bills created per day</label>
              <strong>{billsPerDay} bills</strong>
            </div>
            <input 
              type="range" 
              min="10" 
              max="250" 
              step="5"
              value={billsPerDay} 
              onChange={(e) => setBillsPerDay(Number(e.target.value))}
              className={styles.rangeInput}
            />
            <div className={styles.rangeLabels}>
              <span>10 bills</span>
              <span>100 bills</span>
              <span>250 bills</span>
            </div>
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label>Current time spent per bill</label>
              <strong>{minutesPerBill} minutes</strong>
            </div>
            <input 
              type="range" 
              min="2" 
              max="10" 
              step="1"
              value={minutesPerBill} 
              onChange={(e) => setMinutesPerBill(Number(e.target.value))}
              className={styles.rangeInput}
            />
            <div className={styles.rangeLabels}>
              <span>2 mins (Fast)</span>
              <span>5 mins</span>
              <span>10 mins (Manual)</span>
            </div>
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label>Working days per month</label>
              <strong>{workingDays} days</strong>
            </div>
            <input 
              type="range" 
              min="20" 
              max="31" 
              step="1"
              value={workingDays} 
              onChange={(e) => setWorkingDays(Number(e.target.value))}
              className={styles.rangeInput}
            />
            <div className={styles.rangeLabels}>
              <span>20 days</span>
              <span>26 days</span>
              <span>31 days</span>
            </div>
          </div>
        </div>

        {/* Output Metrics Column */}
        <div className={styles.outputCol}>
          <div className={styles.highlightResult}>
            <div className={styles.highlightIcon}><Clock size={28} /></div>
            <div>
              <span className={styles.resultLabel}>Estimated Counter Time Saved</span>
              <div className={styles.hugeNumber}>{hoursSaved} Hours / mo</div>
              <p>That is roughly <strong>{Math.round(hoursSaved / 8)} full working days</strong> saved each month for serving customers and growing your shop.</p>
            </div>
          </div>

          <div className={styles.miniResultsGrid}>
            <div className={styles.miniMetric}>
              <span>Monthly Invoices</span>
              <strong>{monthlyBills.toLocaleString('en-IN')}</strong>
            </div>
            <div className={styles.miniMetric}>
              <span>Estimated Sales Tracked</span>
              <strong>₹{estimatedVolume.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className={styles.disclaimer}>
            <Zap size={14} /> Illustration based on average 70% billing speed improvement with Billora's keyboard-first input.
          </div>
        </div>
      </div>
    </div>
  );
}
