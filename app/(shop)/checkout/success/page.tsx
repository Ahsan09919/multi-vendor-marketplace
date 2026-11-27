import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import ClearCart from "@/components/clear-cart";
import StatusBadge from "@/components/status-badge";
import { finalizePaidOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata = { title: "Order confirmed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; order_id?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { session_id, order_id } = await searchParams;
  if (!session_id && !order_id) redirect("/");

  let order = session_id
    ? await prisma.order.findUnique({
        where: { stripeSessionId: session_id },
        include: { items: true },
      })
    : await prisma.order.findUnique({
        where: { id: order_id! },
        include: { items: true },
      });

  if (!order || order.userId !== session.user.id) {
    redirect("/");
  }

  // Fallback in case the webhook has not arrived yet: verify the payment
  // directly with Stripe and finalize the order (idempotent with the webhook).
  if (session_id && process.env.STRIPE_SECRET_KEY && order.status === "PENDING") {
    try {
      const stripeSession = await getStripe().checkout.sessions.retrieve(session_id);
      if (stripeSession.payment_status === "paid") {
        await finalizePaidOrder(order.id);
        order = await prisma.order.findUnique({
          where: { id: order.id },
          include: { items: true },
        });
      }
    } catch {
      // Keep showing the pending state.
    }
  }

  if (!order) redirect("/");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <ClearCart />
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold">
          {order.status === "PENDING" ? "Payment processing..." : "Thank you for your order!"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Order <span className="font-mono">{order.id}</span>
        </p>
        <div className="mt-2">
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-6 space-y-2 border-t border-gray-200 pt-4 text-left text-sm dark:border-gray-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.title} × {item.quantity}
              </span>
              <span>{formatPrice(item.priceAtPurchase * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-gray-200 pt-2 font-bold dark:border-gray-800">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href={`/account/orders/${order.id}`}
            className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            View order
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
