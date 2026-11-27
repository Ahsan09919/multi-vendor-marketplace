"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { status } = useSession();
  const router = useRouter();

  const [showShipping, setShowShipping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const total = cartTotal(items);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "authenticated") {
      toast("Please log in to check out");
      router.push("/login?callbackUrl=/cart");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shipping,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Checkout failed");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="skeleton h-9 w-40" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Shopping cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <Image src={item.image} alt={item.title} fill sizes="96px" className="object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-semibold hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {item.title}
                  </Link>
                  <button
                    onClick={() => {
                      removeItem(item.productId);
                      toast.success("Removed from cart");
                    }}
                    className="text-sm text-red-600 hover:underline dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)} each</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700">
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="px-3 py-1 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold dark:border-gray-800">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {!showShipping ? (
            <button
              onClick={() => {
                if (status !== "authenticated") {
                  toast("Please log in to check out");
                  router.push("/login?callbackUrl=/cart");
                  return;
                }
                setShowShipping(true);
              }}
              className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Proceed to checkout
            </button>
          ) : (
            <form onSubmit={handleCheckout} className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold">Shipping address</h3>
              <input required placeholder="Full name" value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} className={inputClass} />
              <input required placeholder="Street address" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="City" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className={inputClass} />
                <input required placeholder="Postal code" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} className={inputClass} />
              </div>
              <input required placeholder="Country" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} className={inputClass} />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting
                  ? "Placing order..."
                  : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                    ? "Pay with Stripe"
                    : "Place order"}
              </button>
              <p className="text-center text-xs text-gray-400">
                {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                  ? "Test mode — use card 4242 4242 4242 4242"
                  : "Demo checkout — no real payment is made"}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
