"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export function CategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error ?? "Failed to create category");
      else {
        toast.success("Category created");
        setName("");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        required
        minLength={2}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New category name"
        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        Add
      </button>
    </form>
  );
}

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error ?? "Failed to delete category");
      else {
        toast.success("Category deleted");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
    >
      Delete
    </button>
  );
}
