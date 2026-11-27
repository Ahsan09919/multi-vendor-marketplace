import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  title: string;
  slug: string;
  price: number; // cents
  image: string;
  stock: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  replaceItems: (items: CartItem[]) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock, 99) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, item.stock, 99) },
            ],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId
                    ? { ...i, quantity: Math.min(quantity, i.stock, 99) }
                    : i
                ),
        })),
      replaceItems: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "markethub-cart",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
