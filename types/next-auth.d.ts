import { DefaultSession } from "next-auth";

type Role = "CUSTOMER" | "VENDOR" | "ADMIN";
type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED";

declare module "next-auth" {
  interface User {
    role: Role;
    vendorId: string | null;
    vendorStatus: VendorStatus | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      vendorId: string | null;
      vendorStatus: VendorStatus | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    vendorId: string | null;
    vendorStatus: VendorStatus | null;
  }
}
