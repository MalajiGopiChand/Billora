import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Search, Trash2, UserRound, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listCustomers, removeCustomer, saveCustomer } from '../lib/firestore';
import type { Customer } from '../types';
import styles from './Pages.module.css';

export function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = () => user && listCustomers(user.uid).then(setCustomers);

  useEffect(() => {
    load();
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;

    await saveCustomer(
      user.uid,
      { ...form, name: form.name.trim() },
      editing || undefined
    );
    setForm({ name: '', phone: '', address: '' });
    setEditing(null);
    load();
  };

  const edit = (customer: Customer) => {
    setEditing(customer.id);
    setForm({ name: customer.name, phone: customer.phone, address: customer.address });
  };

  const remove = async (id: string) => {
    if (window.confirm('Delete this customer? Their invoices will remain saved.')) {
      await removeCustomer(id);
      load();
    }
  };

  const visible = customers.filter((c) =>
    `${c.name} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className={styles.intro}>
        <h2>Customer Accounts</h2>
        <p>Maintain customer profiles, phone numbers, addresses, and purchase histories.</p>
      </div>

      <section className={styles.split}>
        {/* Form Card */}
        <form className={`${styles.card} ${styles.inlineForm}`} onSubmit={submit}>
          <h3>{editing ? 'Edit Customer' : 'Add New Customer'}</h3>

          <label>
            Customer / Shop Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Sri Lakshmi Provision Stores"
              required
              autoFocus
            />
          </label>

          <label>
            Phone Number
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </label>

          <label>
            Address / Location
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Shop address, town or market"
            />
          </label>

          <div className={styles.actions}>
            <button type="submit" className="primary-button">
              <Plus size={16} /> {editing ? 'Update Customer' : 'Save Customer'}
            </button>
            {editing && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditing(null);
                  setForm({ name: '', phone: '', address: '' });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Directory Card */}
        <section className={styles.card}>
          <div className={styles.tableTitle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3>Customer Directory</h3>
              <span className={styles.countBadge}>{customers.length} contacts</span>
            </div>

            <label className="search-box">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or phone..."
              />
            </label>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone Number</th>
                  <th>Address</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <Link className={styles.customerLink} to={`/customers/${customer.id}`}>
                        <UserRound size={16} />
                        <span>{customer.name}</span>
                      </Link>
                    </td>
                    <td>{customer.phone || '-'}</td>
                    <td>{customer.address || '-'}</td>
                    <td className="row-actions">
                      <button
                        type="button"
                        title="Edit customer"
                        onClick={() => edit(customer)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        title="Delete customer"
                        className="icon-danger"
                        onClick={() => remove(customer.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!visible.length && (
                  <tr>
                    <td colSpan={4} className="empty-cell">
                      No customers match your search. Add a new customer using the form on the left.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </>
  );
}
