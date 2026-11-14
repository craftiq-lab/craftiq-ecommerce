import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data.json');

interface DatabaseSchema {
  products: any[];
  orders: any[];
  customers: any[];
  cart: any[];
  settings: any;
  user: any;
}

const defaultData: DatabaseSchema = {
  products: [
    {
      id: 'prod-1',
      name: 'Minimalist Teak Wall Panel',
      slug: 'minimalist-teak-wall-panel',
      sku: 'CRFT-001',
      price: 4500,
      compareAtPrice: 5500,
      stock: 12,
      description:
        'Handcrafted from premium seasoned teak wood, this geometric wall art brings natural warmth and architectural depth to modern interiors.',
      image:
        'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1000&q=80',
      gallery: [],
      videoUrl: '',
      woodType: 'Seasoned Chittagong Teak',
      finish: 'Natural Organic Beeswax',
      dimensions: '24 inch × 18 inch × 1.5 inch',
      weight: '2.4 KG Solid Timber',
      careInstructions:
        'Wipe gently with a soft, dry lint-free cloth.\nAvoid direct harsh sunlight or moisture.\nApply natural beeswax every 6 months.',
      category: { name: 'Home Decor' },
      reviews: [],
    },
    {
      id: 'prod-2',
      name: 'Artisan Pine Wood Perpetual Calendar',
      slug: 'artisan-pine-wood-perpetual-calendar',
      sku: 'CRFT-002',
      price: 1450,
      compareAtPrice: 1800,
      stock: 25,
      description:
        'Precision laser-engraved pine wood perpetual desk calendar. A timeless companion for your modern workspace that lasts year after year.',
      image:
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
      gallery: [],
      videoUrl: '',
      woodType: 'Imported Seasoned Pine & Teak',
      finish: 'Matte Smooth Sealant',
      dimensions: '8 inch × 5 inch × 2.5 inch',
      weight: '0.6 KG',
      careInstructions:
        'Dust lightly with a dry brush or soft cloth.\nKeep away from water spills.',
      category: { name: 'Workspace' },
      reviews: [],
    },
    {
      id: 'prod-3',
      name: 'Water-Resistant Wooden Soap Dish Pair',
      slug: 'water-resistant-wooden-soap-dish',
      sku: 'CRFT-003',
      price: 650,
      compareAtPrice: 850,
      stock: 40,
      description:
        'Slatted self-draining wooden soap holders treated with hydrophobic natural oil to resist moisture and extend soap life.',
      image:
        'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=1000&q=80',
      gallery: [],
      videoUrl: '',
      woodType: 'Water-Treated Teak Wood',
      finish: 'Hydrophobic Natural Oil Coating',
      dimensions: '4.5 inch × 3.2 inch × 0.8 inch',
      weight: '0.3 KG',
      careInstructions:
        'Rinse soap residue occasionally and air dry.\nKeep slots clear for proper drainage.',
      category: { name: 'Home Decor' },
      reviews: [],
    },
  ],
  orders: [],
  customers: [],
  cart: [],
  settings: {
    steadfastApiKey: process.env.STEADFAST_API_KEY || '',
    steadfastSecretKey: process.env.STEADFAST_SECRET_KEY || '',
    fbPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '',
    whatsappNumber: '8801700000000',
  },
  user: null,
};

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      products: Array.isArray(parsed.products) ? parsed.products : defaultData.products,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      settings: parsed.settings || defaultData.settings,
      user: parsed.user || null,
    };
  } catch {
    return defaultData;
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database write error:', err);
  }
}

export const prisma = {
  product: {
    findMany: async () => readDb().products,
    findFirst: async ({ where }: { where: { slug?: string; id?: string } }) => {
      const products = readDb().products;
      return (
        products.find(
          (p) =>
            (where.slug && p.slug === where.slug) ||
            (where.id && String(p.id) === String(where.id))
        ) || null
      );
    },
    create: async ({ data }: { data: any }) => {
      const db = readDb();
      const newProduct = {
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
        reviews: [],
        gallery: [],
        ...data,
      };
      db.products.unshift(newProduct);
      writeDb(db);
      return newProduct;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const db = readDb();
      const index = db.products.findIndex((p) => String(p.id) === String(where.id));
      if (index !== -1) {
        db.products[index] = { ...db.products[index], ...data };
        writeDb(db);
        return db.products[index];
      }
      return null;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const db = readDb();
      db.products = db.products.filter((p) => String(p.id) !== String(where.id));
      writeDb(db);
      return { success: true };
    },
  },

  order: {
    findMany: async () => readDb().orders,
    create: async (orderData: any) => {
      const db = readDb();
      const payload = orderData.data ? orderData.data : orderData;

      // অটোমেটিক কাস্টমার প্রোফাইল ও আইডি তৈরি/আপডেট করা (কোনো পাসওয়ার্ড ছাড়া)
      const cleanPhone = String(payload.phone || '').trim();
      let existingCustomer = db.customers.find((c) => c.phone === cleanPhone);

      if (!existingCustomer) {
        existingCustomer = {
          customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          name: payload.customerName,
          phone: cleanPhone,
          district: payload.district || payload.city || 'Dhaka',
          thana: payload.thana || '',
          address: payload.address || '',
          createdAt: new Date().toISOString(),
        };
        db.customers.unshift(existingCustomer);
      } else {
        existingCustomer.name = payload.customerName || existingCustomer.name;
        existingCustomer.district = payload.district || payload.city || existingCustomer.district;
        existingCustomer.thana = payload.thana || existingCustomer.thana;
        existingCustomer.address = payload.address || existingCustomer.address;
      }

      // বর্তমান ইউজার হিসেবে তাকে অটো-লগইন অবস্থায় সেট করা
      db.user = existingCustomer;

      const newOrder = {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        customerId: existingCustomer.customerId,
        status: 'Processing',
        createdAt: new Date().toISOString(),
        ...payload,
      };

      db.orders.unshift(newOrder);
      writeDb(db);
      return newOrder;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const db = readDb();
      const index = db.orders.findIndex((o) => String(o.id) === String(where.id));
      if (index !== -1) {
        db.orders[index] = { ...db.orders[index], ...data };
        writeDb(db);
        return db.orders[index];
      }
      return null;
    },
  },

  cart: {
    findMany: async () => readDb().cart,
    addItem: async (product: any, quantity: number = 1) => {
      const db = readDb();
      const existingIndex = db.cart.findIndex((item) => String(item.id) === String(product.id));
      if (existingIndex > -1) {
        db.cart[existingIndex].quantity = Number(db.cart[existingIndex].quantity) + Number(quantity);
      } else {
        db.cart.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          image: product.image,
          quantity: Number(quantity),
        });
      }
      writeDb(db);
      return db.cart;
    },
    removeItem: async (id: string) => {
      const db = readDb();
      db.cart = db.cart.filter((item) => String(item.id) !== String(id));
      writeDb(db);
      return db.cart;
    },
    clear: async () => {
      const db = readDb();
      db.cart = [];
      writeDb(db);
      return [];
    },
  },

  settings: {
    get: async () => readDb().settings,
    update: async (newSettings: any) => {
      const db = readDb();
      db.settings = { ...db.settings, ...newSettings };
      writeDb(db);
      return db.settings;
    },
  },

  auth: {
    getCurrentUser: async () => readDb().user,
    loginByPhone: async (phone: string) => {
      const db = readDb();
      const found = db.customers.find((c) => c.phone?.includes(phone.trim()));
      if (found) {
        db.user = found;
        writeDb(db);
      }
      return found || null;
    },
    logout: async () => {
      const db = readDb();
      db.user = null;
      writeDb(db);
    },
  },
};