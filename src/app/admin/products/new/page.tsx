import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  let categories: any[] = [];
  try {
    const db = prisma as any;
    if (db.category && typeof db.category.findMany === 'function') {
      categories = await db.category.findMany();
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Title</label>
          <input type="text" name="title" required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select name="categoryId" className="w-full border rounded p-2">
            <option value="">Select Category</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Save Product
        </button>
      </form>
    </div>
  );
}