"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function DeleteProductButton({
  productId,
  endpoint,
}: {
  productId: string;
  endpoint: "vendor" | "admin";
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/${endpoint}/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete");
        setLoading(false);
        setConfirming(false);
        return;
      }
      toast.success("Product deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-700"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
    >
      Delete
    </button>
  );
}
