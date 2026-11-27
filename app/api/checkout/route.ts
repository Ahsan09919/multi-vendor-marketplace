import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { finalizePaidOrder } from "@/lib/orders";
import { checkoutSchema } from "@/lib/validators";
import { PLACEHOLDER_IMAGE } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { items, shipping } = parsed.data;

    // Server-verified prices: everything is loaded fresh from the database.
    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((i) => i.productId) },
        isActive: true,
        vendor: { status: "APPROVED" },
      },
      include: { vendor: { select: { id: true } } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: "One of the products in your cart is no longer available" },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for "${product.title}" (only ${product.stock} left)` },
          { status: 400 }
        );
      }
    }

    const total = items.reduce(
      (sum, i) => sum + productMap.get(i.productId)!.price * i.quantity,
      0
    );

    const shippingAddress = `${shipping.fullName}, ${shipping.address}, ${shipping.city} ${shipping.postalCode}, ${shipping.country}`;

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        total,
        shippingAddress,
        items: {
          create: items.map((i) => {
            const p = productMap.get(i.productId)!;
            return {
              productId: p.id,
              vendorId: p.vendor.id,
              title: p.title,
              image: p.images[0] ?? PLACEHOLDER_IMAGE,
              quantity: i.quantity,
              priceAtPurchase: p.price,
            };
          }),
        },
      },
    });

    const origin =
      req.headers.get("origin") ??
      process.env.NEXTAUTH_URL ??
      "http://localhost:3000";

    // Demo-payment mode: when Stripe is not configured (e.g. Stripe is not
    // available in the owner's country), complete the order immediately
    // without charging anything. The Stripe flow below stays fully functional
    // and is used automatically as soon as STRIPE_SECRET_KEY is set.
    if (!process.env.STRIPE_SECRET_KEY) {
      await finalizePaidOrder(order.id);
      return NextResponse.json({
        url: `${origin}/checkout/success?order_id=${order.id}`,
      });
    }

    const stripeSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      line_items: items.map((i) => {
        const p = productMap.get(i.productId)!;
        return {
          quantity: i.quantity,
          price_data: {
            currency: "usd",
            unit_amount: p.price,
            product_data: {
              name: p.title,
              images: p.images.slice(0, 1),
            },
          },
        };
      }),
      metadata: { orderId: order.id },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
