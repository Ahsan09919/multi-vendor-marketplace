"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore, type CartItem } from "@/lib/cart-store";

// Keeps the client cart and the server cart in sync for logged-in users.
// On login: merges the guest cart with the server cart. Afterwards every
// local change is pushed to the server (debounced).
export default function CartSync() {
  const { status } = useSession();
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const replaceItems = useCartStore((s) => s.replaceItems);
  const mergedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !hydrated || mergedRef.current) return;
    mergedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) return;
        const data: { items: CartItem[] } = await res.json();
        const local = useCartStore.getState().items;
        const map = new Map<string, CartItem>();
        for (const item of data.items) map.set(item.productId, item);
        for (const item of local) {
          const existing = map.get(item.productId);
          if (!existing || item.quantity > existing.quantity) {
            map.set(item.productId, item);
          }
        }
        const merged = Array.from(map.values());
        replaceItems(merged);
        await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: merged.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          }),
        });
      } catch {
        // Non-fatal: cart stays local.
      }
    })();
  }, [status, hydrated, replaceItems]);

  useEffect(() => {
    if (status !== "authenticated" || !mergedRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      }).catch(() => {});
    }, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items, status]);

  useEffect(() => {
    if (status === "unauthenticated") mergedRef.current = false;
  }, [status]);

  return null;
}
