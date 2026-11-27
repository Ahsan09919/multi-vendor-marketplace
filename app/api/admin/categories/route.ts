import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { categorySchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const name = parsed.data.name.trim();
    const slug = slugify(name);
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({ data: { name, slug } });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error("Create category error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
