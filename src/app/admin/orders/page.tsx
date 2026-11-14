import { prisma } from '@/lib/prisma';
import OrderActions from './OrderActions';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Customer Orders — Craftiq Admin',
};

export default async function AdminOrdersPage() {
  let orders: any[] = [];

  try {
    const orderModel = (prisma as any).order;

    // ১. প্রথমে স্ট্যান্ডার্ড Prisma বা কাস্টম মেথড দিয়ে চেষ্টা করা
    try {
      orders = await orderModel.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      // যদি কাস্টম prisma.ts আর্গুমেন্ট ছাড়া findMany() নেয়
      orders = await orderModel.findMany();
    }

    // ২. যদি মেমোরি ক্যাশের কারণে নতুন অর্ডার না আসে, তবে সরাসরি JSON ডাটাবেস ফাইল থেকেও চেক করা
    const possiblePaths = [
      path.join(process.cwd(), 'data', 'db.json'),
      path.join(process.cwd(), 'src', 'data', 'db.json'),
      path.join(process.cwd(), 'db.json'),
      path.join(process.cwd(), 'data', 'orders.json'),
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const dbData = JSON.parse(raw);
        const fileOrders = Array.isArray(dbData)
          ? dbData
          : Array.isArray(dbData?.orders)
          ? dbData.orders
          : null;

        if (fileOrders && fileOrders.length >= (orders?.length || 0)) {
          orders = fileOrders;
          break;
        }
      }
    }

    // নতুন অর্ডারগুলো যেন সবার ওপরে থাকে এবং ডিলিট করা অর্ডার বাদ যায়
    if (Array.isArray(orders)) {
      orders = orders
        .filter((o: any) => o && o.status !== 'DELETED' && !o.isDeleted)
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
    } else {
      orders = [];
    }
  } catch (error) {
    console.error('Error fetching admin orders:', error);
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424] pb-20 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border-b border-[#E2DDD5] pb-4 flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[#9B704D] font-semibold">
              Order Management
            </span>
            <h1 className="font-serif text-3xl font-light mt-1">
              Customer Orders ({orders.length})
            </h1>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-[#E2DDD5] p-16 text-center space-y-3 shadow-sm">
            <p className="font-serif text-xl text-gray-500">কোনো অর্ডার পাওয়া যায়নি।</p>
          </div>
        ) : (
          orders.map((order: any) => {
            const rawPhone =
              order.phone || order.shippingPhone || order.customerPhone || '';
            const totalAmount = Number(order.total || order.totalAmount || 0);
            const customerName =
              order.customerName || order.name || 'Craftiq Guest';
            const address =
              order.shippingAddress || order.address || 'Inside Dhaka';

            const orderDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '';

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E2DDD5] p-6 shadow-sm space-y-5"
              >
                {/* Order ID, Status Badge & Date */}
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-[#9B704D]">
                    #{order.id}
                  </span>
                  <span className="px-3 py-1 text-[10px] uppercase font-semibold tracking-widest bg-[#FAF9F5] border border-[#E2DDD5] text-[#242424]">
                    {order.status || 'PROCESSING'}
                  </span>
                  <span className="text-xs text-gray-500">{orderDate}</span>
                </div>

                {/* Customer Name & Address */}
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl text-[#242424]">
                    {customerName}
                  </h3>
                  <p className="text-xs text-gray-700">
                    📞 <strong>{rawPhone || 'N/A'}</strong> • 📍 {address}
                  </p>
                </div>

                {/* Collectable COD Amount */}
                <div className="space-y-0.5 pt-1 border-b border-[#E2DDD5] pb-4">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold block">
                    COLLECTABLE COD AMOUNT
                  </span>
                  <span className="font-serif text-3xl text-[#9B704D] block">
                    ৳{totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Includes Delivery Fee
                  </span>
                </div>

                {/* Ordered Masterpieces */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold block">
                    ORDERED MASTERPIECES:
                  </span>
                  <div className="border border-[#E2DDD5] bg-white">
                    {order.items?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 flex justify-between items-center text-xs border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-[#242424]">
                          {item.product?.name || item.name || 'Masterpiece'} ×{' '}
                          {item.quantity || 1}
                        </span>
                        <span className="font-mono text-gray-700">
                          ৳
                          {Number(
                            (item.price || 0) * (item.quantity || 1)
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons (waUrl প্রপস ছাড়াই ক্লিন কল) */}
                <OrderActions order={order} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}