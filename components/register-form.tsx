"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    accountType: "CUSTOMER" as "CUSTOMER" | "VENDOR",
    storeName: "",
    storeDescription: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        setLoading(false);
        return;
      }
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      toast.success(
        form.accountType === "VENDOR"
          ? "Account created! Your store is pending admin approval."
          : "Account created!"
      );
      router.push(form.accountType === "VENDOR" ? "/vendor" : "/");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {(["CUSTOMER", "VENDOR"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setForm({ ...form, accountType: type })}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              form.accountType === type
                ? "bg-white shadow dark:bg-gray-700"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {type === "CUSTOMER" ? "I want to shop" : "I want to sell"}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Full name
        </label>
        <input id="name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Jane Doe" />
      </div>
      <div>
        <label htmlFor="reg-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input id="reg-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="reg-password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input id="reg-password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder="At least 6 characters" />
      </div>

      {form.accountType === "VENDOR" && (
        <>
          <div>
            <label htmlFor="storeName" className="mb-1 block text-sm font-medium">
              Store name
            </label>
            <input id="storeName" required minLength={2} value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className={inputClass} placeholder="My Awesome Store" />
          </div>
          <div>
            <label htmlFor="storeDescription" className="mb-1 block text-sm font-medium">
              Store description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea id="storeDescription" rows={3} value={form.storeDescription} onChange={(e) => setForm({ ...form, storeDescription: e.target.value })} className={inputClass} placeholder="What do you sell?" />
          </div>
          <p className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Vendor stores require admin approval before products become visible.
          </p>
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Log in
        </Link>
      </p>
    </form>
  );
}
