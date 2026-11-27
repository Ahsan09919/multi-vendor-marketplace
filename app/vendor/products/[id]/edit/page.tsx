import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/product-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });
  if (!vendor) redirect("/vendor");

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.vendorId !== vendor.id) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Edit product</h1>
      <div className="mt-6">
        <ProductForm
          categories={categories}
          initial={{
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price / 100,
            stock: product.stock,
            categoryId: product.categoryId,
            images: product.images.length > 0 ? product.images : [""],
            isActive: product.isActive,
          }}
        />
      </div>
    </div>
  );
}
