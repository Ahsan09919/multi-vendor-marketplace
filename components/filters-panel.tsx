"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  categories: { slug: string; name: string }[];
  vendors: { id: string; storeName: string }[];
  current: {
    q?: string;
    category?: string;
    vendor?: string;
    min?: string;
    max?: string;
    inStock?: string;
    sort?: string;
  };
};

export default function FiltersPanel({ categories, vendors, current }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState(current.category ?? "");
  const [vendor, setVendor] = useState(current.vendor ?? "");
  const [min, setMin] = useState(current.min ?? "");
  const [max, setMax] = useState(current.max ?? "");
  const [inStock, setInStock] = useState(current.inStock === "1");
  const [sort, setSort] = useState(current.sort ?? "newest");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (current.q) params.set("q", current.q);
    if (category) params.set("category", category);
    if (vendor) params.set("vendor", vendor);
    if (min) params.set("min", min);
    if (max) params.set("max", max);
    if (inStock) params.set("inStock", "1");
    if (sort && sort !== "newest") params.set("sort", sort);
    router.push(`/products${params.toString() ? `?${params}` : ""}`);
  }

  function reset() {
    setCategory("");
    setVendor("");
    setMin("");
    setMax("");
    setInStock(false);
    setSort("newest");
    router.push("/products");
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900";

  return (
    <form
      onSubmit={apply}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
    >
      <h2 className="font-semibold">Filters</h2>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
          Category
        </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
          Vendor
        </label>
        <select value={vendor} onChange={(e) => setVendor(e.target.value)} className={inputClass}>
          <option value="">All vendors</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.storeName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
          Price range ($)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className={inputClass}
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
        />
        In stock only
      </label>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
          Sort by
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputClass}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
