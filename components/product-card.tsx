import Link from "next/link";
import Image from "next/image";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  vendor: { id: string; storeName: string };
  category?: { name: string } | null;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={product.images[0] ?? PLACEHOLDER_IMAGE}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {product.stock === 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            {product.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {product.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          by {product.vendor.storeName}
        </p>
        <p className="mt-auto pt-3 text-lg font-bold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
