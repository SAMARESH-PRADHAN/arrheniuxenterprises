import { useState } from "react";
import { Trash2 } from "lucide-react";

const AdminCategories = () => {
  const [categories, setCategories] = useState<string[]>([
    "T-Shirts", "Hoodies", "Polos", "Jackets", "Joggers", "Caps", "Uniforms",
  ]);
  const [name, setName] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCategories([...categories, name.trim()]);
    setName("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Categories</h1>
        <p className="text-zinc-500 mt-1">Organize products into categories</p>
      </div>

      <form onSubmit={add} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/60"
        />
        <button className="bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 px-5 rounded-md text-sm font-semibold hover:from-amber-300 hover:to-amber-500">
          Add
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((c) => (
          <div key={c} className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
            <span className="font-medium text-zinc-100">{c}</span>
            <button onClick={() => setCategories(categories.filter((x) => x !== c))} className="text-red-400 hover:text-red-300">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
