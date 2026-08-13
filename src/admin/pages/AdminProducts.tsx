import { useState } from "react";
import { Trash2, Check, Pencil } from "lucide-react";
import { getProducts, saveProducts, Product } from "@/lib/authStore";

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [form, setForm] = useState<Omit<Product, "id">>({ name: "", category: "", minQty: 20, price: 0 });
  const [editing, setEditing] = useState<Record<string, number>>({});

  const persist = (next: Product[]) => {
    setProducts(next);
    saveProducts(next);
  };

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) return;
    persist([...products, { ...form, id: crypto.randomUUID() }]);
    setForm({ name: "", category: "", minQty: 20, price: 0 });
  };
  const remove = (id: string) => persist(products.filter((p) => p.id !== id));

  const startEdit = (p: Product) => setEditing({ ...editing, [p.id]: p.price });
  const savePrice = (id: string) => {
    persist(products.map((p) => (p.id === id ? { ...p, price: editing[id] } : p)));
    const e = { ...editing }; delete e[id]; setEditing(e);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Products</h1>
        <p className="text-zinc-500 mt-1">Manage catalog and pricing</p>
      </div>

      <form onSubmit={addProduct} className="bg-zinc-950/60 border border-zinc-800 p-5 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-3">
        <input className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm md:col-span-2 text-zinc-100 focus:outline-none focus:border-amber-500/60" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/60" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input type="number" className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/60" placeholder="Price ₹" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <button className="bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 rounded-md text-sm font-semibold hover:from-amber-300 hover:to-amber-500">Add Product</button>
      </form>

      <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-zinc-400">
            <tr>
              <th className="text-left px-4 py-3 font-medium uppercase text-xs tracking-wider">Name</th>
              <th className="text-left px-4 py-3 font-medium uppercase text-xs tracking-wider">Category</th>
              <th className="text-left px-4 py-3 font-medium uppercase text-xs tracking-wider">Min Qty</th>
              <th className="text-left px-4 py-3 font-medium uppercase text-xs tracking-wider">Price</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-zinc-800 hover:bg-zinc-900/40">
                <td className="px-4 py-3 font-medium text-zinc-100">{p.name}</td>
                <td className="px-4 py-3 text-zinc-400">{p.category}</td>
                <td className="px-4 py-3 text-zinc-400">{p.minQty}</td>
                <td className="px-4 py-3">
                  {editing[p.id] !== undefined ? (
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">₹</span>
                      <input
                        type="number"
                        autoFocus
                        value={editing[p.id]}
                        onChange={(e) => setEditing({ ...editing, [p.id]: Number(e.target.value) })}
                        className="w-24 bg-zinc-900 border border-amber-500/40 rounded px-2 py-1 text-zinc-100"
                      />
                      <button onClick={() => savePrice(p.id)} className="text-emerald-400 hover:text-emerald-300">
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(p)} className="flex items-center gap-2 text-amber-300 hover:text-amber-200">
                      ₹{p.price} <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(p.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
