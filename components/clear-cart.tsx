"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

// Clears the local cart after a successful checkout.
export default function ClearCart() {
  const clear = useCartStore((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
