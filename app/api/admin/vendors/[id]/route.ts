import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { vendorStatusSchema } from "@/lib/validators";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = vendorStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ vendor });
  } catch (err) {
    console.error("Update vendor error:", err);
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }
}
