import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address").max(200),
    password: z.string().min(6, "Password must be at least 6 characters").max(100),
    accountType: z.enum(["CUSTOMER", "VENDOR"]),
    storeName: z.string().max(100).optional(),
    storeDescription: z.string().max(1000).optional(),
  })
  .refine(
    (data) =>
      data.accountType !== "VENDOR" ||
      (data.storeName && data.storeName.trim().length >= 2),
    { message: "Store name is required for vendor accounts", path: ["storeName"] }
  );

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(1000000, "Price too large"),
  stock: z.number().int("Stock must be a whole number").min(0).max(1000000),
  categoryId: z.string().min(1, "Category is required"),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .min(1, "At least one image URL is required")
    .max(4, "Maximum 4 images"),
  isActive: z.boolean(),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Cart is empty")
    .max(50),
  shipping: z.object({
    fullName: z.string().min(2, "Full name is required").max(100),
    address: z.string().min(3, "Address is required").max(200),
    city: z.string().min(2, "City is required").max(100),
    postalCode: z.string().min(2, "Postal code is required").max(20),
    country: z.string().min(2, "Country is required").max(100),
  }),
});

export const cartSyncSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .max(100),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

export const vendorStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "SUSPENDED"]),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const userRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "VENDOR", "ADMIN"]),
});

export const productToggleSchema = z.object({
  isActive: z.boolean(),
});
