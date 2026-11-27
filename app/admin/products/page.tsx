import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";
import ProductToggle from "@/components/admin/product-toggle";
import DeleteProductButton from "@/components/delete-product-button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      vendor: { select: { storeName: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Products</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                      <Image src={p.images[0] ?? PLACEHOLDER_IMAGE} alt="" fill sizes="40px" className="object-cover" />
                    </div>
                    <Link href={`/products/${p.slug}`} className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400">
                      {p.title}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.vendor.storeName}</td>
                <td className="px-4 py-3 text-gray-500">{p.category.name}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.isActive ? "ACTIVE" : "INACTIVE"} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <ProductToggle productId={p.id} isActive={p.isActive} />
                    <DeleteProductButton productId={p.id} endpoint="admin" />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
