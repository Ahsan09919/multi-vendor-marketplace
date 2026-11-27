import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";
import DeleteProductButton from "@/components/delete-product-button";

export const dynamic = "force-dynamic";

export default async function VendorProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
    include: {
      products: {
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor) {
    return <p className="text-sm text-gray-500">No vendor profile found.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My products</h1>
        <Link
          href="/vendor/products/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add product
        </Link>
      </div>

      {vendor.products.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <p className="font-semibold">No products yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Create your first product to start selling.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendor.products.map((p) => (
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
                  <td className="px-4 py-3 text-gray-500">{p.category.name}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock === 0 ? "font-semibold text-red-600" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.isActive ? "ACTIVE" : "INACTIVE"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/vendor/products/${p.id}/edit`}
                        className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton productId={p.id} endpoint="vendor" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
