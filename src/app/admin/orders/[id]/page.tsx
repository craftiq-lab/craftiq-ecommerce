import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Order Details — Craftiq Admin',
};

// ক্লায়েন্ট সাইড ইন্টারঅ্যাকশনের জন্য আলাদা একটি ছোট কম্পোনেন্ট বা সরাসরি হ্যান্ডলার
export default async function AdminOrderDetailPage({
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
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
  }

  if (!order) {
    return notFound();
  }

  // ফোন নম্বর ফরম্যাট করার ফাংশন
  const rawPhone = order.phone || order.shippingPhone || order.customerPhone || '';
  let formattedPhone = rawPhone.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '88' + formattedPhone;
  } else if (!formattedPhone.startsWith('88')) {
    formattedPhone = '880' + formattedPhone;
  }

  // WhatsApp মেসেজ টেক্সট তৈরি
  const whatsappMessage = `আসসালামু আলাইকুম, ${order.customerName || order.name || 'প্রিয় গ্রাহক'}! 🪵\n\n` +
    `Craftiq-এ অর্ডার করার জন্য আপনাকে আন্তরিক ধন্যবাদ। আপনার অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে!\n\n` +
    `📦 *ইনভয়েস ও অর্ডার বিবরণী:*\n` +
    `• অর্ডার আইডি: #${order.id}\n` +
    `• পেমেন্ট মেথড: Cash on Delivery (COD)\n` +
    `• মোট মূল্য: ৳${Number(order.totalAmount || order.total || 0).toLocaleString()}\n\n` +
    `🔍 আপনার অর্ডার ট্র্যাক করতে ভিজিট করুন:\n` +
    `https://craftiqbd.store/track\n\n` +
    `আপনার পারপেচুয়াল ক্যালেন্ডার বা উড ডেকোরটি নিপুণভাবে তৈরি করে খুব শীঘ্রই কুরিয়ারে হস্তান্তর করা হবে। কোনো প্রশ্ন থাকলে এই নম্বরেই আমাদের সাথে যোগাযোগ করতে পারেন। ধন্যবাদ! ✨`;

  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424] p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center border-b border-[#E2DDD5] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#9B704D] font-semibold">Admin Panel</span>
          <h1 className="font-serif text-3xl font-light mt-1">Order #{order.id}</h1>
        </div>
        <Link
          href="/admin/orders"
          className="bg-white border border-[#E2DDD5] px-4 py-2 text-xs uppercase tracking-widest hover:border-black transition"
        >
          ← Back to Orders
        </Link>
      </div>

      {/* Action Banner for WhatsApp */}
      <div className="bg-white border border-[#E2DDD5] p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif text-lg">কাস্টমারের সাথে WhatsApp-এ যোগাযোগ</h3>
          <p className="text-xs text-gray-500 mt-1">এক ক্লিকেই কাস্টমারের WhatsApp-এ ইনভয়েস ও থ্যাংক ইউ মেসেজ পাঠিয়ে দিন।</p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3 text-xs uppercase tracking-widest font-medium flex items-center gap-2 shadow-sm transition whitespace-nowrap"
        >
          <span>💬 Send Invoice via WhatsApp</span>
        </a>
      </div>

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Details */}
        <div className="bg-white border border-[#E2DDD5] p-6 space-y-4 shadow-sm">
          <h3 className="font-serif text-xl border-b pb-2">কাস্টমারের তথ্য</h3>
          <div className="text-xs space-y-2 text-[#555]">
            <p><strong className="text-black">নাম:</strong> {order.customerName || order.name || 'N/A'}</p>
            <p><strong className="text-black">ফোন:</strong> {rawPhone || 'N/A'}</p>
            <p><strong className="text-black">ঠিকানা:</strong> {order.shippingAddress || order.address || 'N/A'}</p>
            <p><strong className="text-black">শহর/এরিয়া:</strong> {order.city || 'N/A'}</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-[#E2DDD5] p-6 space-y-4 shadow-sm">
          <h3 className="font-serif text-xl border-b pb-2">অর্ডারের সারসংক্ষেপ</h3>
          <div className="text-xs space-y-2 text-[#555]">
            <p><strong className="text-black">স্ট্যাটাস:</strong> <span className="uppercase text-[#9B704D] font-bold">{order.status || 'Pending'}</span></p>
            <p><strong className="text-black">পেমেন্ট স্ট্যাটাস:</strong> {order.paymentStatus || 'COD'}</p>
            <p><strong className="text-black">অর্ডারের তারিখ:</strong> {new Date(order.createdAt).toLocaleString('en-BD')}</p>
            <p className="text-base font-serif text-[#9B704D] pt-2 border-t">
              <strong>মোট বিল:</strong> ৳{Number(order.totalAmount || order.total || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Ordered Items List */}
      <div className="bg-white border border-[#E2DDD5] p-6 space-y-4 shadow-sm">
        <h3 className="font-serif text-xl border-b pb-2">অর্ডারকৃত প্রডাক্টসমূহ</h3>
        <div className="space-y-4">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-3 text-xs">
              <div className="flex items-center gap-4">
                {item.product?.image && (
                  <img src={item.product.image} alt="" className="w-12 h-12 object-cover border" />
                )}
                <div>
                  <p className="font-bold text-sm">{item.product?.name || 'Product'}</p>
                  <p className="text-gray-500">পরিমাণ: {item.quantity || 1}</p>
                </div>
              </div>
              <p className="font-mono text-sm text-[#9B704D]">৳{Number(item.price * (item.quantity || 1)).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}