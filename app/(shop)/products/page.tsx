import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product-card";
import FiltersPanel from "@/components/filters-panel";
import Pagination from "@/components/pagination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse all products from independent vendors on MarketHub. Search, filter by category, vendor and price.",
};

const PAGE_SIZE = 12;

type SearchParams = {
  q?: string;
  category?: string;
  vendor?: string;
  min?: string;
  max?: string;
  inStock?: string;
  sort?: string;
  page?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    vendor: { status: "APPROVED" },
  };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.category) where.category = { slug: params.category };
  if (params.vendor) where.vendorId = params.vendor;
  if (params.inStock === "1") where.stock = { gt: 0 };

  const min = parseFloat(params.min ?? "");
  const max = parseFloat(params.max ?? "");
  if (!isNaN(min) || !isNaN(max)) {
    where.price = {
      ...(isNaN(min) ? {} : { gte: Math.round(min * 100) }),
      ...(isNaN(max) ? {} : { lte: Math.round(max * 100) }),
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "price-asc"
      ? { price: "asc" }
      : params.sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [products, total, categories, vendors] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        vendor: { select: { id: true, storeName: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.vendor.findMany({
      where: { status: "APPROVED" },
      select: { id: true, storeName: true },
      orderBy: { storeName: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-3xl font-bold">
          {params.q ? `Results for "${params.q}"` : "All products"}
        </h1>
        <p className="text-sm text-gray-500">
          {total} product{total === 1 ? "" : "s"} found
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <FiltersPanel
            categories={categories}
            vendors={vendors}
            current={{
              q: params.q,
              category: params.category,
              vendor: params.vendor,
              min: params.min,
              max: params.max,
              inStock: params.inStock,
              sort: params.sort,
            }}
          />
        </aside>

        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
              <p className="text-lg font-semibold">No products found</p>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/products"
            searchParams={params as Record<string, string | undefined>}
          />
        </div>
      </div>
    </div>
  );
}
