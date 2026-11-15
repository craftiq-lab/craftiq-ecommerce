import { prisma } from '@/lib/prisma';

export async function getProducts() {
  try {
    return await prisma.product.findMany();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    const db = prisma as any;
    if (db.category && typeof db.category.findMany === 'function') {
      return await db.category.findMany();
    }
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}