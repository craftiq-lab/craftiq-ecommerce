import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard — Craftiq',
};

export default async function AdminDashboardPage() {
  let orders: any[] = [];
  let products: any[] = [];

  try {
    orders = await (prisma.order as any).findMany({
      orderBy: { createdAt: 'desc' },
    });
    products = await (prisma.product as any).findMany();
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled' && o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);

  const pendingOrders = orders.filter(
    (o) => !o.status || o.status === 'Processing' || o.status === 'PROCESSING'
  ).length;

  const shippedOrders = orders.filter(
    (o) => o.status === 'Shipped via Steadfast' || o.status === 'SHIPPED'
  ).length;

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424] p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2DDD5] pb-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[#9B704D] font-semibold">
              Executive Overview
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-light mt-1">
              Craftiq Business Dashboard
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="bg-white border border-[#242424] px-5 py-2.5 text-xs uppercase tracking-widest font-medium hover:bg-[#242424] hover:text-white transition"
            >
              + Manage Products
            </Link>
            <Link
              href="/admin/orders"
              className="bg-[#9B704D] text-white px-5 py-2.5 text-xs uppercase tracking-widest font-medium hover:bg-amber-800 transition shadow-sm"
            >
              View Orders ({orders.length})
            </Link>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#E2DDD5] p-6 shadow-sm space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Total Revenue (COD)
            </span>
            <p className="font-serif text-3xl text-[#9B704D]">৳{totalRevenue.toLocaleString()}</p>
            <span className="text-[11px] text-gray-400 block">Active & Completed Orders</span>
          </div>

          <div className="bg-white border border-[#E2DDD5] p-6 shadow-sm space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Total Orders
            </span>
            <p className="font-serif text-3xl text-[#242424]">{orders.length}</p>
            <span className="text-[11px] text-gray-400 block">{pendingOrders} Pending Processing</span>
          </div>

          <div className="bg-white border border-[#E2DDD5] p-6 shadow-sm space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Shipped via Steadfast
            </span>
            <p className="font-serif text-3xl text-emerald-700">{shippedOrders}</p>
            <span className="text-[11px] text-gray-400 block">In Courier Transit</span>
          </div>

          <div className="bg-white border border-[#E2DDD5] p-6 shadow-sm space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Catalog Products
            </span>
            <p className="font-serif text-3xl text-[#242424]">{products.length}</p>
            <span className="text-[11px] text-gray-400 block">Live in Storefront</span>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white border border-[#E2DDD5] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#E2DDD5] pb-4">
            <h2 className="font-serif text-xl">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs uppercase tracking-widest text-[#9B704D] hover:underline font-semibold"
            >
              Manage All Orders →
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">এখনো কোনো অর্ডার আসেনি।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E2DDD5] text-[10px] uppercase tracking-widest text-gray-500 bg-[#FAF9F5]">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice(0, 5).map((order: any) => (
                    <tr key={order.id} className="hover:bg-[#FAF9F5]">
                      <td className="p-3 font-mono font-bold text-[#9B704D]">#{order.id}</td>
                      <td className="p-3 font-medium">{order.customerName || order.name || 'Craftiq Guest'}</td>
                      <td className="p-3 text-gray-600">{order.phone || order.shippingPhone || 'N/A'}</td>
                      <td className="p-3 font-mono">৳{Number(order.total || order.totalAmount || 0).toLocaleString()}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-[10px] uppercase tracking-wider bg-[#F8F7F3] border border-[#E2DDD5]">
                          {order.status || 'Processing'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href="/admin/orders"
                          className="text-[#9B704D] hover:underline uppercase tracking-widest text-[10px] font-semibold"
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}