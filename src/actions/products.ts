'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const sku = formData.get('sku') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string, 10);
  const categoryName = formData.get('category') as string;
  const description = formData.get('description') as string;

  try {
    let category = await prisma.category.findFirst({
      where: { name: categoryName },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
      });
    }

    await prisma.product.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku,
        price,
        stock,
        description,
        categoryId: category.id,
      },
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    throw new Error('Failed to create product in database.');
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');
  redirect('/admin/products');
}

export async function deleteProduct(formData: FormData) {
  const id = formData.get('id') as string;

  try {
    await prisma.product.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');
}