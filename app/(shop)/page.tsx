import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, vendor: { status: "APPROVED" } },
      include: {
        vendor: { select: { id: true, storeName: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              One marketplace.
              <br />
              Many independent stores.
            </h1>
            <p className="mt-4 text-lg text-indigo-100">
              Shop electronics, fashion, home goods and more from trusted
              independent vendors — all in one place, with secure checkout.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50"
              >
                Browse products
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Become a vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 text-center transition hover:border-indigo-400 hover:shadow dark:border-gray-800 dark:bg-gray-900"
            >
              <p className="font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {cat.name}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {cat._count.products} products
              </p>
            </Link>
          ))}
          {categories.length === 0 && (
            <p className="col-span-full text-sm text-gray-500">
              No categories yet.
            </p>
          )}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">New arrivals</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {featured.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-gray-500">
              No products yet. Check back soon!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
