import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, Package, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listProducts, removeProduct, saveProduct } from '../lib/firestore';
import { currency } from '../lib/money';
import type { Product } from '../types';
import styles from './Pages.module.css';

export function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  const load = () => user && listProducts(user.uid).then(setProducts);

  useEffect(() => {
    load();
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    await saveProduct(
      user.uid,
      { name: name.trim(), rate: rate === '' ? null : Number(rate) },
      editing || undefined
    );
    setName('');
    setRate('');
    setEditing(null);
    load();
  };

  const edit = (product: Product) => {
    setEditing(product.id);
    setName(product.name);
    setRate(product.rate == null ? '' : String(product.rate));
  };

  const remove = async (id: string) => {
    if (window.confirm('Delete this product from your catalog?')) {
      await removeProduct(id);
      load();
    }
  };

  const visible = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className={styles.intro}>
        <h2>Product Catalog</h2>
        <p>Save items with default rates for 1-click invoice filling at the counter.</p>
      </div>

      <section className={styles.split}>
        {/* Form Card */}
        <form className={`${styles.card} ${styles.inlineForm}`} onSubmit={submit}>
          <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>

          <label>
            Product Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Basmati Rice 5kg"
              required
              autoFocus
            />
          </label>

          <label>
            Default Selling Price (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Leave blank for variable rate"
            />
          </label>

          <div className={styles.actions}>
            <button type="submit" className="primary-button">
              <Plus size={16} /> {editing ? 'Update Product' : 'Save Product'}
            </button>
            {editing && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditing(null);
                  setName('');
                  setRate('');
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
              <h3>Catalog Items</h3>
              <span className={styles.countBadge}>{products.length} products</span>
            </div>

            <label className="search-box">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
              />
            </label>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Default Rate</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>
                      {product.rate == null ? (
                        <span className={styles.variableBadge}>Variable Price</span>
                      ) : (
                        <span className={styles.priceBadge}>{currency(product.rate)}</span>
                      )}
                    </td>
                    <td className="row-actions">
                      <button
                        type="button"
                        title="Edit product"
                        onClick={() => edit(product)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        title="Delete product"
                        className="icon-danger"
                        onClick={() => remove(product.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!visible.length && (
                  <tr>
                    <td colSpan={3} className="empty-cell">
                      No products found. Add your first item using the form on the left.
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
