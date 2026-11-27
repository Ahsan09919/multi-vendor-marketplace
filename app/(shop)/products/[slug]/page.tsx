import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/utils";
import ImageGallery from "@/components/image-gallery";
import AddToCartButton from "@/components/add-to-cart-button";
import ProductCard from "@/components/product-card";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      vendor: { select: { id: true, storeName: true, description: true, status: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  if (!product || !product.isActive || product.vendor.status !== "APPROVED") {
    notFound();
  }

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
      vendor: { status: "APPROVED" },
    },
    include: {
      vendor: { select: { id: true, storeName: true } },
      category: { select: { name: true } },
    },
    take: 4,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/products" className="hover:text-indigo-600">
          Products
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-indigo-600"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-200">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ImageGallery images={product.images} alt={product.title} />

        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <Link
            href={`/store/${product.vendor.id}`}
            className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Sold by {product.vendor.storeName}
          </Link>

          <p className="mt-4 text-3xl font-extrabold">{formatPrice(product.price)}</p>

          <div className="mt-3">
            {product.stock > 10 ? (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                ● In stock
              </span>
            ) : product.stock > 0 ? (
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                ● Only {product.stock} left in stock
              </span>
            ) : (
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                ● Out of stock
              </span>
            )}
          </div>

          <div className="mt-6">
            <AddToCartButton
              product={{
                id: product.id,
                title: product.title,
                slug: product.slug,
                price: product.price,
                image: product.images[0] ?? PLACEHOLDER_IMAGE,
                stock: product.stock,
              }}
              showQuantity
            />
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-600 dark:text-gray-300">
              {product.description}
            </p>
          </div>

          {product.vendor.description && (
            <div className="mt-6 rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
              <h3 className="text-sm font-semibold">
                About {product.vendor.storeName}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {product.vendor.description}
              </p>
              <Link
                href={`/store/${product.vendor.id}`}
                className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Visit store →
              </Link>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Related products</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
