import type { Metadata } from "next";
import RegisterForm from "@/components/register-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a MarketHub account as a customer or vendor.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-center text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        Shop as a customer or open your own store
      </p>
      <RegisterForm />
    </div>
  );
}
