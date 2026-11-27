import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cartSyncSchema } from "@/lib/validators";
import { PLACEHOLDER_IMAGE } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          stock: true,
          images: true,
          isActive: true,
        },
      },
    },
  });

  const items = cartItems
    .filter((ci) => ci.product.isActive)
    .map((ci) => ({
      productId: ci.product.id,
      title: ci.product.title,
      slug: ci.product.slug,
      price: ci.product.price,
      image: ci.product.images[0] ?? PLACEHOLDER_IMAGE,
      stock: ci.product.stock,
      quantity: Math.min(ci.quantity, ci.product.stock),
    }))
    .filter((i) => i.quantity > 0);

  return NextResponse.json({ items });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = cartSyncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid cart data" }, { status: 400 });
    }

    const productIds = parsed.data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true },
    });
    const validIds = new Set(products.map((p) => p.id));
    const validItems = parsed.data.items.filter((i) => validIds.has(i.productId));

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { userId: session.user.id } }),
      prisma.cartItem.createMany({
        data: validItems.map((i) => ({
          userId: session.user.id,
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cart sync error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
