"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import type { Session } from "next-auth";
import CartSync from "@/components/cart-sync";

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <CartSync />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className:
              "!bg-white !text-gray-900 dark:!bg-gray-800 dark:!text-gray-100 !shadow-lg",
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
