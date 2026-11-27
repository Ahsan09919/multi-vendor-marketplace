import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your MarketHub account.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-center text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        Log in to your MarketHub account
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
