import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export default function NewProductPage() {
  async function createProduct(formData: FormData) {
    'use server';

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
    }

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    redirect('/admin/products');
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424] p-6 md:p-12">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10 pb-6 border-b border-[#E2DDD5]">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#9B704D] font-semibold">Inventory Management</span>
          <h1 className="font-serif text-3xl md:text-4xl font-light mt-1 text-[#242424]">Add New Product</h1>
        </div>
        <Link 
          href="/admin/products" 
          className="border border-[#242424] px-5 py-3 text-xs uppercase tracking-widest font-medium hover:bg-[#242424] hover:text-[#F8F7F3] transition"
        >
          &larr; Back to Inventory
        </Link>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto bg-white border border-[#E2DDD5] p-8 shadow-sm">
        <form action={createProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">Product Name</label>
              <input 
                name="name"
                type="text" 
                required
                placeholder="e.g. Minimalist Teak Wall Panel" 
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm focus:outline-none focus:border-[#9B704D] bg-[#F8F7F3]/30"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">SKU Code</label>
              <input 
                name="sku"
                type="text" 
                required
                placeholder="e.g. CRFT-004" 
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm focus:outline-none focus:border-[#9B704D] bg-[#F8F7F3]/30 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">Price (BDT)</label>
              <input 
                name="price"
                type="number" 
                required
                placeholder="4500" 
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm focus:outline-none focus:border-[#9B704D] bg-[#F8F7F3]/30"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">Stock Quantity</label>
              <input 
                name="stock"
                type="number" 
                required
                placeholder="10" 
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm focus:outline-none focus:border-[#9B704D] bg-[#F8F7F3]/30"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">Category</label>
              <select name="category" className="w-full border border-[#E2DDD5] px-4 py-3 text-sm focus:outline-none focus:border-[#9B704D] bg-[#F8F7F3]/30">
                <option value="Home Decor">Home Decor</option>
                <option value="Kitchen">Kitchen & Dining</option>
                <option value="Workspace">Workspace</option>
                <option value="Custom Woodwork">Custom Woodwork</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">Description</label>
            <textarea 
              name="description"
              rows={4} 
              placeholder="Write a brief editorial description of the craft..." 
              className="w-full border border-[#E2DDD5] px-4 py-3 text-sm focus:outline-none focus:border-[#9B704D] bg-[#F8F7F3]/30"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-[#E2DDD5] flex justify-end">
            <button 
              type="submit" 
              className="bg-[#9B704D] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-medium hover:bg-amber-800 transition"
            >
              Save Product to Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}