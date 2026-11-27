"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProductToggle({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error ?? "Failed to update product");
      else {
        toast.success(isActive ? "Product hidden" : "Product activated");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="text-sm font-medium text-indigo-600 hover:underline disabled:opacity-60 dark:text-indigo-400"
    >
      {isActive ? "Hide" : "Activate"}
    </button>
  );
}
