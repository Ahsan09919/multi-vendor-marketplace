import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function img(seed: string, n: number) {
  return `https://picsum.photos/seed/${seed}-${n}/800/800`;
}

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Fashion", slug: "fashion" },
  { name: "Home & Living", slug: "home-living" },
  { name: "Sports & Outdoors", slug: "sports-outdoors" },
  { name: "Books", slug: "books" },
];

type SeedProduct = {
  title: string;
  slug: string;
  description: string;
  price: number; // cents
  stock: number;
  category: string;
  vendor: 0 | 1;
};

const products: SeedProduct[] = [
  // TechNova (vendor 0)
  { title: "Wireless Noise-Cancelling Headphones", slug: "wireless-noise-cancelling-headphones", description: "Premium over-ear headphones with active noise cancellation, 40-hour battery life, plush memory-foam ear cushions and crystal-clear call quality. Perfect for travel, work and everyday listening.", price: 12999, stock: 35, category: "electronics", vendor: 0 },
  { title: "Smart Fitness Watch", slug: "smart-fitness-watch", description: "Track your heart rate, sleep, steps and 20+ workout modes with this water-resistant smart watch. Features a bright AMOLED display and 10-day battery life.", price: 8999, stock: 50, category: "electronics", vendor: 0 },
  { title: "4K Action Camera", slug: "4k-action-camera", description: "Capture your adventures in stunning 4K at 60fps. Waterproof to 10m without a case, with image stabilization and a touch screen. Includes mounting kit.", price: 15999, stock: 20, category: "electronics", vendor: 0 },
  { title: "Portable Bluetooth Speaker", slug: "portable-bluetooth-speaker", description: "Big 360-degree sound in a compact, rugged body. IPX7 waterproof, 24-hour playtime and a built-in microphone for hands-free calls.", price: 5999, stock: 80, category: "electronics", vendor: 0 },
  { title: "Mechanical Gaming Keyboard", slug: "mechanical-gaming-keyboard", description: "Hot-swappable mechanical keyboard with RGB per-key lighting, tactile switches, aluminium top plate and detachable USB-C cable. Built for speed and comfort.", price: 7499, stock: 45, category: "electronics", vendor: 0 },
  { title: "Wireless Charging Pad", slug: "wireless-charging-pad", description: "Fast 15W Qi wireless charger with a slim anti-slip design, over-temperature protection and a breathing LED indicator. Works with all Qi-enabled phones and earbuds.", price: 2499, stock: 120, category: "electronics", vendor: 0 },
  { title: "1080p Webcam with Ring Light", slug: "1080p-webcam-ring-light", description: "Look your best on every call with this full-HD webcam featuring an adjustable 3-level ring light, autofocus, dual noise-reducing microphones and a privacy cover.", price: 4599, stock: 60, category: "electronics", vendor: 0 },
  { title: "USB-C Hub 8-in-1", slug: "usb-c-hub-8-in-1", description: "Expand your laptop with HDMI 4K, three USB 3.0 ports, SD/microSD readers, gigabit Ethernet and 100W pass-through charging in a pocket-sized aluminium hub.", price: 3999, stock: 90, category: "electronics", vendor: 0 },
  { title: "Trail Running Backpack 12L", slug: "trail-running-backpack-12l", description: "Ultra-light vest-style backpack with soft flasks pockets, trekking-pole holders and a breathable mesh back panel. Ideal for trail runs and day hikes.", price: 6499, stock: 40, category: "sports-outdoors", vendor: 0 },
  { title: "Carbon Fiber Trekking Poles", slug: "carbon-fiber-trekking-poles", description: "Featherweight collapsible trekking poles with cork grips, quick-lock adjustment and tungsten tips. Pack down to 36cm and weigh just 210g each.", price: 8499, stock: 25, category: "sports-outdoors", vendor: 0 },
  { title: "The Art of Clean Code", slug: "the-art-of-clean-code", description: "A practical guide to writing readable, maintainable software. Covers naming, refactoring, testing and real-world case studies for modern developers.", price: 3499, stock: 70, category: "books", vendor: 0 },

  // Urban Threads (vendor 1)
  { title: "Classic Denim Jacket", slug: "classic-denim-jacket", description: "Timeless unisex denim jacket in washed indigo with button front, chest pockets and a comfortable regular fit. Made from 100% heavyweight cotton denim.", price: 6999, stock: 55, category: "fashion", vendor: 1 },
  { title: "Organic Cotton T-Shirt", slug: "organic-cotton-t-shirt", description: "Soft, breathable crew-neck tee made from GOTS-certified organic cotton. Pre-shrunk, fair-trade produced and available in a relaxed modern fit.", price: 1999, stock: 200, category: "fashion", vendor: 1 },
  { title: "Wool Blend Overcoat", slug: "wool-blend-overcoat", description: "Elegant mid-length overcoat in a warm wool blend with a tailored silhouette, notch lapels and full satin lining. Dress it up or down all winter long.", price: 14999, stock: 18, category: "fashion", vendor: 1 },
  { title: "Leather Crossbody Bag", slug: "leather-crossbody-bag", description: "Handcrafted full-grain leather crossbody with an adjustable strap, magnetic flap closure and three interior compartments. Ages beautifully with use.", price: 8999, stock: 30, category: "fashion", vendor: 1 },
  { title: "Chunky Knit Beanie", slug: "chunky-knit-beanie", description: "Cozy ribbed beanie hand-knitted from a soft merino blend. One size fits most, with a fold-over cuff and a relaxed slouchy fit.", price: 1799, stock: 150, category: "fashion", vendor: 1 },
  { title: "Ceramic Pour-Over Coffee Set", slug: "ceramic-pour-over-coffee-set", description: "Matte ceramic pour-over dripper with matching carafe and two cups. Brews a clean, flavorful cup and looks beautiful on any kitchen counter.", price: 4499, stock: 40, category: "home-living", vendor: 1 },
  { title: "Linen Throw Blanket", slug: "linen-throw-blanket", description: "Stonewashed 100% linen throw in warm oatmeal with a fringed edge. Lightweight yet cozy, perfect for sofas, beds and chilly evenings on the balcony.", price: 5499, stock: 65, category: "home-living", vendor: 1 },
  { title: "Scandinavian Table Lamp", slug: "scandinavian-table-lamp", description: "Minimalist table lamp with a solid oak base and a linen shade that casts a soft, warm glow. E27 socket, dimmer-compatible, 40cm tall.", price: 7999, stock: 22, category: "home-living", vendor: 1 },
  { title: "Aromatherapy Candle Trio", slug: "aromatherapy-candle-trio", description: "Set of three hand-poured soy candles in lavender, cedarwood and sea salt scents. 35-hour burn time each, in reusable amber glass jars.", price: 3299, stock: 100, category: "home-living", vendor: 1 },
  { title: "Yoga Mat Pro 6mm", slug: "yoga-mat-pro-6mm", description: "Non-slip natural rubber yoga mat with alignment lines, 6mm cushioning and a carry strap. Free from PVC and phthalates.", price: 4999, stock: 75, category: "sports-outdoors", vendor: 1 },
  { title: "Stories from the Studio", slug: "stories-from-the-studio", description: "A beautifully photographed collection of interviews with 30 independent makers and designers about craft, creativity and building a small business.", price: 2899, stock: 45, category: "books", vendor: 1 },
];

async function main() {
  console.log("Seeding database...");

  const [adminHash, vendorHash, customerHash] = await Promise.all([
    bcrypt.hash("Admin123!", 10),
    bcrypt.hash("Vendor123!", 10),
    bcrypt.hash("Customer123!", 10),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: "admin@markethub.test" },
    update: {},
    create: {
      name: "Site Admin",
      email: "admin@markethub.test",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const vendorUser1 = await prisma.user.upsert({
    where: { email: "vendor1@markethub.test" },
    update: {},
    create: {
      name: "Taylor Reed",
      email: "vendor1@markethub.test",
      passwordHash: vendorHash,
      role: "VENDOR",
    },
  });

  const vendorUser2 = await prisma.user.upsert({
    where: { email: "vendor2@markethub.test" },
    update: {},
    create: {
      name: "Jordan Blake",
      email: "vendor2@markethub.test",
      passwordHash: vendorHash,
      role: "VENDOR",
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@markethub.test" },
    update: {},
    create: {
      name: "Casey Morgan",
      email: "customer@markethub.test",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });

  const vendor1 = await prisma.vendor.upsert({
    where: { userId: vendorUser1.id },
    update: {},
    create: {
      userId: vendorUser1.id,
      storeName: "TechNova",
      description:
        "Cutting-edge gadgets and outdoor tech, curated and tested by enthusiasts.",
      status: "APPROVED",
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { userId: vendorUser2.id },
    update: {},
    create: {
      userId: vendorUser2.id,
      storeName: "Urban Threads",
      description:
        "Sustainable fashion and cozy home goods made by independent makers.",
      status: "APPROVED",
    },
  });

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }

  const vendorIds = [vendor1.id, vendor2.id];
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        vendorId: vendorIds[p.vendor],
        categoryId: categoryMap.get(p.category)!,
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        images: [img(p.slug, 1), img(p.slug, 2), img(p.slug, 3)],
        isActive: true,
      },
    });
  }

  console.log(
    `Seeded: admin ${admin.email}, 2 vendors, 1 customer, ${categories.length} categories, ${products.length} products.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
