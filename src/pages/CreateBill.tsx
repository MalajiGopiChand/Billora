import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Download, Plus, Printer, Save, Trash2, User, Truck, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InvoiceModal } from '../components/InvoiceModal';
import { useAuth } from '../context/AuthContext';
import { getCompanySettings, listCustomers, listProducts, nextInvoiceNumber, createInvoice, updateInvoice } from '../lib/firestore';
import { calculateItem, currency, numberValue } from '../lib/money';
import type { CompanySettings, Customer, Invoice, InvoiceDraft, InvoiceItem, Product } from '../types';
import styles from './CreateBill.module.css';

const blankItem = (): InvoiceItem => ({
  description: '',
  box: '',
  qty: '',
  rate: '',
  discount: '',
  gross: 0,
  amount: 0,
});

const today = () => new Date().toISOString().slice(0, 10);

const blankDraft = (invoiceNo = 0, terms = ''): InvoiceDraft => ({
  shopName: '',
  phone: '',
  address: '',
  date: today(),
  invoiceNo,
  gbSlipNo: '',
  transport: '',
  lrNo: '',
  globalBoxes: '',
  terms,
  tax: '',
  hamali: '',
  hamaliLabel: 'Hamali / Delivery',
  grandTotal: 0,
  items: [blankItem()],
});

export function CreateBill() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const editingInvoice = (location.state as { invoice?: Invoice } | null)?.invoice;

  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<InvoiceDraft>(blankDraft());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!user || initialized.current) return;
    initialized.current = true;

    Promise.all([
      getCompanySettings(user.uid),
      listCustomers(user.uid),
      listProducts(user.uid),
      editingInvoice ? Promise.resolve(null) : nextInvoiceNumber(user.uid),
    ])
      .then(([settings, people, catalog, nextNo]) => {
        setCompany(settings);
        setCustomers(people);
        setProducts(catalog);

        if (editingInvoice) {
          const { id, userId, createdAt, ...rest } = editingInvoice;
          setDraft({
            ...rest,
            items: rest.items.map((item) => ({ ...item, ...calculateItem(item) })),
            grandTotal: rest.grandTotal,
          });
        } else {
          setDraft(blankDraft(nextNo || 1, settings?.terms || ''));
        }
      })
      .catch(() => setNotice('Unable to load billing data. Please check your network connection.'));
  }, [user, editingInvoice]);

  const itemTotal = useMemo(
    () => draft.items.reduce((sum, item) => sum + item.amount, 0),
    [draft.items]
  );
  const grandTotal = itemTotal + numberValue(draft.tax) + numberValue(draft.hamali);
  const invoiceForOutput: InvoiceDraft = { ...draft, grandTotal };

  const updateField = <K extends keyof InvoiceDraft>(field: K, value: InvoiceDraft[K]) =>
    setDraft((old) => ({ ...old, [field]: value }));

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) =>
    setDraft((old) => {
      const items = [...old.items];
      const changed = { ...items[index], [field]: value } as InvoiceItem;
      items[index] = { ...changed, ...calculateItem(changed) };
      return { ...old, items };
    });

  const selectCustomer = () => {
    const selected = customers.find(
      (c) => c.name.toLowerCase() === draft.shopName.trim().toLowerCase()
    );
    if (selected) {
      setDraft((old) => ({
        ...old,
        shopName: selected.name,
        phone: selected.phone,
        address: selected.address,
      }));
    }
  };

  const selectProduct = (index: number) => {
    const item = draft.items[index];
    const selected = products.find(
      (p) => p.name.toLowerCase() === item.description.trim().toLowerCase()
    );
    if (selected && selected.rate != null && item.rate === '') {
      updateItem(index, 'rate', selected.rate);
    }
  };

  const focus = (index: number, field: string) =>
    setTimeout(() => document.getElementById(`line-${index}-${field}`)?.focus(), 0);

  const keyboardNext = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    field: 'description' | 'box' | 'qty' | 'rate' | 'discount'
  ) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const fields = ['description', 'box', 'qty', 'rate', 'discount'];
    const next = fields[fields.indexOf(field) + 1];
    if (next) {
      focus(index, next);
      return;
    }
    setDraft((old) => ({ ...old, items: [...old.items, blankItem()] }));
    focus(index + 1, 'description');
  };

  const removeItem = (index: number) =>
    setDraft((old) =>
      old.items.length === 1 ? old : { ...old, items: old.items.filter((_, i) => i !== index) }
    );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (!draft.shopName.trim()) {
      setNotice('Please enter a customer or shop name before saving.');
      return;
    }

    const items = draft.items.filter((item) => item.description.trim());
    if (!items.length) {
      setNotice('Please add at least one product line item before saving.');
      return;
    }

    setSaving(true);
    setNotice('');
    const finalDraft = { ...invoiceForOutput, items };

    try {
      if (editingInvoice) {
        await updateInvoice(user.uid, editingInvoice.id, finalDraft);
        setNotice(`Invoice #${draft.invoiceNo} updated successfully.`);
      } else {
        await createInvoice(user.uid, finalDraft);
        setNotice(`Invoice #${draft.invoiceNo} created successfully.`);
        setTimeout(() => navigate('/all-bills'), 650);
      }
    } catch {
      setNotice('Unable to save invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const asNumber = (value: string): number | '' => (value === '' ? '' : Number(value));

  return (
    <form onSubmit={submit} className={styles.formWrapper}>
      {/* 1. Header Toolbar */}
      <div className={styles.topbar}>
        <div className={styles.topTitle}>
          <h2>{editingInvoice ? `Edit Invoice #${draft.invoiceNo}` : 'Create Bill'}</h2>
          <p>Quick counter billing. Press Enter across inputs to rapidly advance.</p>
        </div>

        <div className={styles.topActions}>
          <button type="button" className="secondary-button" onClick={() => setPreview(true)}>
            <Printer size={16} /> Print Preview
          </button>
          <button type="button" className="secondary-button" onClick={() => setPreview(true)}>
            <Download size={16} /> Download PDF
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : editingInvoice ? 'Update Bill' : 'Save Bill'}
          </button>
        </div>
      </div>

      {notice && (
        <div className={notice.includes('success') ? styles.success : styles.notice}>
          {notice.includes('success') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Customer Details Card */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <User size={18} style={{ color: '#4f46e5' }} />
          <h3>Customer & Invoice Details</h3>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.fieldGroup}>
            <label>Invoice No.</label>
            <input
              type="number"
              value={draft.invoiceNo || ''}
              onChange={(e) => updateField('invoiceNo', Number(e.target.value))}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Invoice Date</label>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => updateField('date', e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Customer Name</label>
            <input
              list="customers"
              value={draft.shopName}
              onBlur={selectCustomer}
              onChange={(e) => updateField('shopName', e.target.value)}
              placeholder="e.g. Ramesh Stores"
              required
            />
            <datalist id="customers">
              {customers.map((customer) => (
                <option key={customer.id} value={customer.name} />
              ))}
            </datalist>
          </div>

          <div className={styles.fieldGroup}>
            <label>Phone Number</label>
            <input
              value={draft.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className={`${styles.fieldGroup} ${styles.wideCol}`}>
            <label>Billing Address</label>
            <input
              value={draft.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Shop location, street, city"
            />
          </div>
        </div>
      </section>

      {/* 3. Transport Details Card */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <Truck size={18} style={{ color: '#06b6d4' }} />
          <h3>Transport & Logistics</h3>
        </div>

        <div className={styles.transportGrid}>
          <div className={styles.fieldGroup}>
            <label>GB Slip No.</label>
            <input
              value={draft.gbSlipNo}
              onChange={(e) => updateField('gbSlipNo', e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>LR No.</label>
            <input
              value={draft.lrNo}
              onChange={(e) => updateField('lrNo', e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Transport Mode / Carrier</label>
            <input
              value={draft.transport}
              onChange={(e) => updateField('transport', e.target.value)}
              placeholder="e.g. VRL Logistics"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Total Boxes</label>
            <input
              type="number"
              min="0"
              value={draft.globalBoxes}
              onChange={(e) => updateField('globalBoxes', asNumber(e.target.value))}
              placeholder="0"
            />
          </div>
        </div>
      </section>

      {/* 4. Products / Items Table Card */}
      <section className={styles.card}>
        <div className={styles.itemSectionHeader}>
          <div className={styles.itemSectionTitle}>
            <h3>Invoice Items</h3>
            <p>Product prices auto-fill if saved in your catalog.</p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setDraft((old) => ({ ...old, items: [...old.items, blankItem()] }))}
          >
            <Plus size={16} /> Add Line Item
          </button>
        </div>

        <div className="table-scroll">
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th className={styles.descCol}>Product Description</th>
                <th className={styles.numCol}>Box</th>
                <th className={styles.numCol}>Qty</th>
                <th className={styles.rateCol}>Unit Rate</th>
                <th className={styles.numCol}>Disc %</th>
                <th className={styles.rightAlign}>Gross</th>
                <th className={styles.rightAlign}>Amount</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {draft.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      id={`line-${index}-description`}
                      list="products"
                      value={item.description}
                      onBlur={() => selectProduct(index)}
                      onKeyDown={(e) => keyboardNext(e, index, 'description')}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item name"
                    />
                    <datalist id="products">
                      {products.map((product) => (
                        <option key={product.id} value={product.name} />
                      ))}
                    </datalist>
                  </td>
                  <td>
                    <input
                      id={`line-${index}-box`}
                      type="number"
                      min="0"
                      value={item.box}
                      onKeyDown={(e) => keyboardNext(e, index, 'box')}
                      onChange={(e) => updateItem(index, 'box', asNumber(e.target.value))}
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <input
                      id={`line-${index}-qty`}
                      type="number"
                      min="0"
                      value={item.qty}
                      onKeyDown={(e) => keyboardNext(e, index, 'qty')}
                      onChange={(e) => updateItem(index, 'qty', asNumber(e.target.value))}
                      placeholder="1"
                    />
                  </td>
                  <td>
                    <input
                      id={`line-${index}-rate`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onKeyDown={(e) => keyboardNext(e, index, 'rate')}
                      onChange={(e) => updateItem(index, 'rate', asNumber(e.target.value))}
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    <input
                      id={`line-${index}-discount`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discount}
                      onKeyDown={(e) => keyboardNext(e, index, 'discount')}
                      onChange={(e) => updateItem(index, 'discount', asNumber(e.target.value))}
                      placeholder="0"
                    />
                  </td>
                  <td className={styles.rightAlign}>{currency(item.gross)}</td>
                  <td className={styles.rightAlign}>
                    <strong>{currency(item.amount)}</strong>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      title="Remove line"
                      className="icon-danger"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. Terms & Sticky Totals */}
        <div className={styles.billBottomSplit}>
          <div className={styles.termsContainer}>
            <label>Terms and Payment Instructions</label>
            <textarea
              rows={4}
              value={draft.terms}
              onChange={(e) => updateField('terms', e.target.value)}
              placeholder="e.g. Payment due within 7 days. Cheques payable to Shop Name."
            />
          </div>

          <div className={styles.totalsCard}>
            <div className={styles.totalRow}>
              <span>Items Total</span>
              <strong>{currency(itemTotal)}</strong>
            </div>

            <div className={styles.totalRow}>
              <span>Tax / GST</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={styles.totalInput}
                value={draft.tax}
                onChange={(e) => updateField('tax', asNumber(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div className={styles.totalRow}>
              <input
                className={styles.labelInput}
                value={draft.hamaliLabel}
                onChange={(e) => updateField('hamaliLabel', e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                className={styles.totalInput}
                value={draft.hamali}
                onChange={(e) => updateField('hamali', asNumber(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div className={styles.grandTotalHighlight}>
              <span>Grand Total</span>
              <span>{currency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Invoice Modal for Print / PDF */}
      {preview && (
        <InvoiceModal
          invoice={invoiceForOutput}
          company={company}
          onClose={() => setPreview(false)}
        />
      )}
    </form>
  );
}
