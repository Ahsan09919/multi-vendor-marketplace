"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type Category = { id: string; name: string };

type ProductData = {
  id?: string;
  title: string;
  description: string;
  price: number; // dollars in the form
  stock: number;
  categoryId: string;
  images: string[];
  isActive: boolean;
};

export default function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductData;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<ProductData>(
    initial ?? {
      title: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: categories[0]?.id ?? "",
      images: [""],
      isActive: true,
    }
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const images = form.images.map((u) => u.trim()).filter(Boolean);
    if (images.length === 0) {
      toast.error("Add at least one image URL");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        isEdit ? `/api/vendor/products/${initial!.id}` : "/api/vendor/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            price: Number(form.price),
            stock: Number(form.stock),
            categoryId: form.categoryId,
            images,
            isActive: form.isActive,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save product");
        setLoading(false);
        return;
      }
      toast.success(isEdit ? "Product updated" : "Product created");
      router.push("/vendor/products");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
    >
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Title
        </label>
        <input id="title" required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea id="description" required minLength={10} rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium">
            Price ($)
          </label>
          <input id="price" type="number" required min="0.01" step="0.01" value={form.price || ""} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="stock" className="mb-1 block text-sm font-medium">
            Stock
          </label>
          <input id="stock" type="number" required min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">
            Category
          </label>
          <select id="category" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Image URLs <span className="text-gray-400">(up to 4)</span>
        </label>
        <div className="space-y-2">
          {form.images.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => {
                  const images = [...form.images];
                  images[i] = e.target.value;
                  setForm({ ...form, images });
                }}
                className={inputClass}
              />
              {form.images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, images: form.images.filter((_, j) => j !== i) })
                  }
                  className="rounded-lg border border-gray-300 px-3 text-sm text-red-600 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-900/20"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {form.images.length < 4 && (
          <button
            type="button"
            onClick={() => setForm({ ...form, images: [...form.images, ""] })}
            className="mt-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            + Add another image
          </button>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Tip: you can use free images like https://picsum.photos/seed/my-product/800/800
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
        />
        Product is active (visible in the store)
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : isEdit ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
