import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";

async function getOwnedProduct(userId: string, productId: string) {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) return { error: "Vendor profile not found", status: 404 } as const;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Product not found", status: 404 } as const;
  // Ownership check: vendors can only touch their own products.
  if (product.vendorId !== vendor.id) {
    return { error: "Forbidden", status: 403 } as const;
  }
  return { vendor, product } as const;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const result = await getOwnedProduct(session.user.id, id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { price, categoryId, ...rest } = parsed.data;

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 400 });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId ? { categoryId } : {}),
        ...(price !== undefined ? { price: Math.round(price * 100) } : {}),
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const result = await getOwnedProduct(session.user.id, id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
