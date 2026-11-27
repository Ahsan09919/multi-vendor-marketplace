import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });
  if (!vendor) {
    return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
  }
  if (vendor.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Your store must be approved before you can add products" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { title, description, price, stock, categoryId, images, isActive } =
      parsed.data;

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    // Generate a unique slug.
    const base = slugify(title) || "product";
    let slug = base;
    let n = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${base}-${++n}`;
    }

    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId,
        title,
        slug,
        description,
        price: Math.round(price * 100),
        stock,
        images,
        isActive,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
