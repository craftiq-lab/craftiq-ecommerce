import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminReportsPage() {
  let products: any[] = [];
  let orders: any[] = [];

  try {
    products = await (prisma.product as any).findMany();
    orders = await (prisma.order as any).findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error loading reports data:', error);
  }

  const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  
  // Low stock products (stock <= 5)
  const lowStockProducts = products.filter((p: any) => Number(p.stock || 0) <= 5);

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E2DDD5] pb-6 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#9B704D] font-semibold">Analytics & Reports</span>
          <h1 className="font-serif text-3xl font-light text-[#242424] mt-1">Store Performance & Inventory</h1>
          <p className="text-xs text-[#666666] mt-1">সার্বিক রেভিনিউ, স্টক স্ট্যাটাস এবং সেলস অ্যানালিটিক্স।</p>
        </div>
        <Link
          href="/admin"
          className="border border-[#242424] px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-[#242424] hover:text-white transition"
        >
          &larr; Dashboard
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E2DDD5] p-6 shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-[#777777] font-semibold">Total Revenue</span>
          <p className="font-serif text-3xl font-medium text-[#9B704D]">৳{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-[#E2DDD5] p-6 shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-[#777777] font-semibold">Total Orders</span>
          <p className="font-serif text-3xl font-medium text-[#242424]">{totalOrders}</p>
        </div>

        <div className="bg-white border border-[#E2DDD5] p-6 shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-[#777777] font-semibold">Total Products</span>
          <p className="font-serif text-3xl font-medium text-[#242424]">{totalProducts}</p>
        </div>

        <div className="bg-white border border-[#E2DDD5] p-6 shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-[#777777] font-semibold">Low Stock Items</span>
          <p className="font-serif text-3xl font-medium text-red-600">{lowStockProducts.length}</p>
        </div>
      </div>

      {/* Low Stock Alert Section */}
      <div className="bg-white border border-[#E2DDD5] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E2DDD5] bg-[#F8F7F3]/50">
          <h2 className="font-serif text-xl font-light text-[#242424]">⚠️ Low Stock Inventory Alert</h2>
          <p className="text-xs text-[#777] mt-0.5">যে প্রডাক্টগুলোর স্টক ৫ পিসের নিচে নেমে গেছে</p>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#777]">
            স্টকে পর্যাপ্ত পণ্য রয়েছে। কোনো লো-স্টক আইটেম নেই!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F7F3] border-b border-[#E2DDD5] text-[#777] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Product Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Remaining Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD5]">
                {lowStockProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#F8F7F3]/40">
                    <td className="py-3 px-4 font-medium text-[#242424]">{p.name}</td>
                    <td className="py-3 px-4 text-[#777]">{p.category?.name || 'Woodcraft'}</td>
                    <td className="py-3 px-4 font-medium text-[#9B704D]">৳{Number(p.price).toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-red-600">{p.stock} pcs left</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}