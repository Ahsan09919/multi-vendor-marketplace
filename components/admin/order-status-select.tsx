"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ORDER_STATUSES } from "@/lib/utils";

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(newStatus: string) {
    if (newStatus === status) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error ?? "Failed to update order");
      else {
        toast.success(`Order marked ${newStatus}`);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <select
      defaultValue={status}
      disabled={loading}
      onChange={(e) => update(e.target.value)}
      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
