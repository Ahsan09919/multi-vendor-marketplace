import { prisma } from "@/lib/prisma";

// Marks a PENDING order as PAID, decrements stock and clears the buyer's
// server-side cart. Idempotent: does nothing if the order is not PENDING,
// so the Stripe webhook and the success-page fallback can both call it.
export async function finalizePaidOrder(orderId: string) {
  await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!current || current.status !== "PENDING") return;

    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });

    for (const item of current.items) {
      if (item.productId) {
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.product.updateMany({
          where: { id: item.productId, stock: { lt: 0 } },
          data: { stock: 0 },
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { userId: current.userId } });
  });
}
