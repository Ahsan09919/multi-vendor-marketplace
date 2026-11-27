import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product-card";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    select: { storeName: true, description: true },
  });
  if (!vendor) return { title: "Store not found" };
  return { title: vendor.storeName, description: vendor.description.slice(0, 160) };
}

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      products: {
        where: { isActive: true },
        include: {
          vendor: { select: { id: true, storeName: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor || vendor.status !== "APPROVED") notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white sm:p-12">
        <h1 className="text-3xl font-bold sm:text-4xl">{vendor.storeName}</h1>
        {vendor.description && (
          <p className="mt-3 max-w-2xl text-indigo-100">{vendor.description}</p>
        )}
        <p className="mt-4 text-sm text-indigo-200">
          {vendor.products.length} product{vendor.products.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {vendor.products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {vendor.products.length === 0 && (
          <p className="col-span-full py-16 text-center text-sm text-gray-500">
            This store has no products yet.
          </p>
        )}
      </div>
    </div>
  );
}
