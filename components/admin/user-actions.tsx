"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function UserActions({
  userId,
  role,
  isSelf,
}: {
  userId: string;
  role: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function changeRole(newRole: string) {
    if (newRole === role) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error ?? "Failed to update role");
      else {
        toast.success("Role updated");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  async function deleteUser() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) toast.error(data.error ?? "Failed to delete user");
      else {
        toast.success("User deleted");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
    setConfirming(false);
  }

  if (isSelf) {
    return <span className="text-xs text-gray-400">(you)</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <select
        defaultValue={role}
        disabled={loading}
        onChange={(e) => changeRole(e.target.value)}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
      >
        <option value="CUSTOMER">CUSTOMER</option>
        <option value="VENDOR">VENDOR</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      {confirming ? (
        <span className="flex gap-1">
          <button
            onClick={deleteUser}
            disabled={loading}
            className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
          >
            Confirm
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-700"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
        >
          Delete
        </button>
      )}
    </div>
  );
}
