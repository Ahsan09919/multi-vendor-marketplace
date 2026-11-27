"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/cart-store";

type Props = {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    image: string;
    stock: number;
  };
  showQuantity?: boolean;
};

export default function AddToCartButton({ product, showQuantity = false }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const [quantity, setQuantity] = useState(1);

  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const maxAdd = Math.max(product.stock - inCart, 0);
  const disabled = product.stock === 0 || maxAdd === 0;

  function handleAdd() {
    if (disabled) return;
    addItem(
      {
        productId: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      Math.min(quantity, maxAdd)
    );
    toast.success(`Added "${product.title}" to cart`);
  }

  return (
    <div className="flex items-center gap-3">
      {showQuantity && !disabled && (
        <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxAdd, q + 1))}
            className="px-3 py-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}
      <button
        onClick={handleAdd}
        disabled={disabled}
        className="flex-1 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
      >
        {product.stock === 0
          ? "Out of stock"
          : maxAdd === 0
            ? "Max in cart"
            : "Add to cart"}
      </button>
    </div>
  );
}
