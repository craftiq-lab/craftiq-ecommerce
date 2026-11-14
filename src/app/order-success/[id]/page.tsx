import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const orderId = resolvedParams.id;

  let order: any = null;
  try {
    order = await (prisma.order as any).findUnique({
      where: { id: orderId },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
  }

  if (!order) {
    notFound();
  }

  const settings = await prisma.settings.get();
  const cleanWhatsapp = String(settings?.whatsappNumber || '8801700000000').replace(/[^0-9]/g, '');
  
  // WhatsApp Message Template
  const whatsappMsg = encodeURIComponent(
    `আসসালামু আলাইকুম! আমি Craftiq থেকে একটি নতুন অর্ডার করেছি।\n\n` +
    `📦 *Order ID:* #${order.id.slice(-6).toUpperCase()}\n` +
    `👤 *Customer:* ${order.customerName}\n` +
    `📞 *Phone:* ${order.phone}\n` +
    `📍 *Address:* ${order.address}, ${order.thana}, ${order.district}\n` +
    `💰 *Total Amount:* ৳${Number(order.total || 0).toLocaleString()}\n\n` +
    `দয়া করে অর্ডারটি কনফার্ম করুন।`
  );

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424] flex flex-col justify-between">
      {/* Top Bar */}
      <div className="bg-[#242424] text-[#F8F7F3] text-center py-2.5 text-xs tracking-[0.2em] uppercase font-light">
        Order Placed Successfully • Cash on Delivery
      </div>

      <main className="max-w-2xl w-full mx-auto px-6 py-16">
        <div className="bg-white border border-[#E2DDD5] p-8 md:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-green-50 border border-green-200 text-green-700 rounded-full flex items-center justify-center mx-auto text-2xl font-serif">
            ✓
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[#9B704D] font-semibold">Thank You For Your Purchase</span>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-[#242424]">অর্ডার সফলভাবে গ্রহণ করা হয়েছে!</h1>
            <p className="text-xs text-[#666666]">আপনার অর্ডার আইডি: <span className="font-mono font-bold text-[#9B704D]">#{order.id.slice(-6).toUpperCase()}</span></p>
          </div>

          <div className="bg-[#F8F7F3] border border-[#E2DDD5] p-6 text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-[#E2DDD5] pb-2">
              <span className="text-[#777]">Customer Name:</span>
              <span className="font-medium text-[#242424]">{order.customerName}</span>
            </div>
            <div className="flex justify-between border-b border-[#E2DDD5] pb-2">
              <span className="text-[#777]">Phone Number:</span>
              <span className="font-mono font-medium text-[#242424]">{order.phone}</span>
            </div>
            <div className="flex justify-between border-b border-[#E2DDD5] pb-2">
              <span className="text-[#777]">Delivery Location:</span>
              <span className="font-medium text-[#242424]">{order.thana}, {order.district}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#777] font-semibold">Total Payable:</span>
              <span className="font-serif font-bold text-sm text-[#9B704D]">৳{Number(order.total || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs text-[#555]">দ্রুত কনফার্মেশনের জন্য নিচের বাটনে ক্লিক করে সরাসরি হোয়াটসঅ্যাপে মেসেজ পাঠান:</p>
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white py-4 px-6 text-xs uppercase tracking-widest font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-sm"
            >
              💬 Confirm Order via WhatsApp
            </a>
          </div>

          <div className="pt-6 border-t border-[#E2DDD5] flex justify-center gap-4">
            <Link
              href="/shop"
              className="border border-[#242424] px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#242424] hover:text-white transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-[#777] border-t border-[#E2DDD5]">
        &copy; {new Date().getFullYear()} CraftiqBD. All rights reserved.
      </footer>
    </div>
  );
}