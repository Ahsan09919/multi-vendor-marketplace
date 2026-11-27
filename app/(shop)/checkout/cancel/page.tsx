import Link from "next/link";

export const metadata = { title: "Checkout cancelled" };

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/40">
        <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="mt-4 text-2xl font-bold">Checkout cancelled</h1>
      <p className="mt-2 text-gray-500">
        Your payment was not completed. Your cart is still saved.
      </p>
      <Link
        href="/cart"
        className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Back to cart
      </Link>
    </div>
  );
}
