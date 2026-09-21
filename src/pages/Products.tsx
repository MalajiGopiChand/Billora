import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listProducts, removeProduct, saveProduct } from '../lib/firestore';
import { currency } from '../lib/money';
import type { Product } from '../types';
import styles from './Pages.module.css';

export function Products() {
  const { user } = useAuth(); const [products, setProducts] = useState<Product[]>([]); const [name, setName] = useState(''); const [rate, setRate] = useState(''); const [editing, setEditing] = useState<string | null>(null);
  const load = () => user && listProducts(user.uid).then(setProducts); useEffect(() => { load(); }, [user]);
  const submit = async (e: FormEvent) => { e.preventDefault(); if (!user || !name.trim()) return; await saveProduct(user.uid, { name: name.trim(), rate: rate === '' ? null : Number(rate) }, editing || undefined); setName(''); setRate(''); setEditing(null); load(); };
  const edit = (product: Product) => { setEditing(product.id); setName(product.name); setRate(product.rate == null ? '' : String(product.rate)); };
  const remove = async (id: string) => { if (window.confirm('Delete this product?')) { await removeProduct(id); load(); } };
  return <><div className={styles.intro}><h2>Products</h2><p>Save standard items. Leave rate blank for fluctuating prices.</p></div><section className={styles.split}><form className={`${styles.card} ${styles.inlineForm}`} onSubmit={submit}><h3>{editing ? 'Edit product' : 'Add product'}</h3><label>Product name<input value={name} onChange={(e) => setName(e.target.value)} required autoFocus /></label><label>Default rate (optional)<input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="Leave blank if variable" /></label><div className={styles.actions}><button className="primary-button"><Plus size={16} />{editing ? 'Update product' : 'Add product'}</button>{editing && <button type="button" className="secondary-button" onClick={() => { setEditing(null); setName(''); setRate(''); }}>Cancel</button>}</div></form><section className={styles.card}><div className={styles.tableTitle}><h3>Product catalog</h3><span>{products.length} products</span></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Product</th><th>Default rate</th><th></th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td>{product.name}</td><td>{product.rate == null ? <em>Variable</em> : currency(product.rate)}</td><td className="row-actions"><button title="Edit product" onClick={() => edit(product)}><Pencil size={16}/></button><button title="Delete product" onClick={() => remove(product.id)}><Trash2 size={16}/></button></td></tr>)}{!products.length && <tr><td colSpan={3} className="empty-cell">No products saved yet.</td></tr>}</tbody></table></div></section></section></>;
}
