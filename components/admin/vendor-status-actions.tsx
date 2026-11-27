"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function VendorStatusActions({
  vendorId,
  status,
}: {
  vendorId: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update vendor");
      } else {
        toast.success(`Vendor ${newStatus.toLowerCase()}`);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="flex justify-end gap-2">
      {status !== "APPROVED" && (
        <button
          onClick={() => update("APPROVED")}
          disabled={loading}
          className="rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          Approve
        </button>
      )}
      {status !== "SUSPENDED" && (
        <button
          onClick={() => update("SUSPENDED")}
          disabled={loading}
          className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          Suspend
        </button>
      )}
      {status === "SUSPENDED" && (
        <button
          onClick={() => update("PENDING")}
          disabled={loading}
          className="rounded border border-gray-300 px-3 py-1 text-xs font-semibold hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Set pending
        </button>
      )}
    </div>
  );
}
