import Stripe from "stripe";

let stripeClient: Stripe | null = null;

// Lazy singleton so that importing this module never throws at build time
// when STRIPE_SECRET_KEY is not yet available.
export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}
