import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} MarketHub — Multi-Vendor E-commerce. University Web
          Technologies project.
        </p>
        <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/products" className="hover:text-gray-900 dark:hover:text-white">
            Products
          </Link>
          <Link href="/register" className="hover:text-gray-900 dark:hover:text-white">
            Become a vendor
          </Link>
        </div>
      </div>
    </footer>
  );
}
