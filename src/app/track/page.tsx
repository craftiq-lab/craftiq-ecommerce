import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams?: Promise<{ phone?: string }> | { phone?: string };
}) {
  const resolvedSearch = searchParams ? await Promise.resolve(searchParams) : {};
  const searchPhone = resolvedSearch?.phone?.trim() || '';

  let foundOrders: any[] = [];
  let isDemo = false;

  if (searchPhone) {
    try {
      const allOrders = await prisma.order.findMany();
      foundOrders = allOrders.filter((o: any) => {
        const dbPhone = String(o.phone || '').trim();
        return dbPhone.includes(searchPhone) || searchPhone.includes(dbPhone);
      });

      // যদি ডাটাবেজে ওই নম্বরে কোনো অর্ডার না থাকে, কিন্তু ডেভেলপার টেস্ট করতে চান
      if (foundOrders.length === 0 && searchPhone === '01700000000') {
        isDemo = true;
        foundOrders = [
          {
            id: 'DEMO-999',
            customerId: 'CUST-DEMO',
            customerName: 'ডেমো কাস্টমার (টেস্টিং)',
            phone: '01700000000',
            address: 'ধানমন্ডি ৩২, ঢাকা',
            city: 'Dhaka',
            deliveryZone: 'Inside Dhaka (৳70)',
            paymentMethod: 'Cash on Delivery',
            status: 'Processing',
            total: 1570,
            createdAt: new Date().toISOString(),
            orderNote: 'ডেমো অর্ডার নোট: এটি টেস্ট করার জন্য দেখানো হচ্ছে।',
            items: [{ name: 'সলিড সেগুন কাঠের পারপেচুয়াল ক্যালেন্ডার', price: 1500, quantity: 1 }],
          },
        ];
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  async function handleTrackSearch(formData: FormData) {
    'use server';
    const phone = (formData.get('phone') as string) || '';
    const { redirect } = await import('next/navigation');
    redirect(`/track?phone=${encodeURIComponent(phone.trim())}`);
  }

  async function handleAddCustomerNote(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId') as string;
    const customerNote = (formData.get('customerNote') as string) || '';
    const phone = (formData.get('phone') as string) || '';

    if (!customerNote || !orderId) return;

    if (!orderId.startsWith('DEMO')) {
      try {
        const allOrders = await prisma.order.findMany();
        const targetOrder = allOrders.find((o: any) => String(o.id) === String(orderId));
        
        if (targetOrder) {
          const existingNote = targetOrder.orderNote || '';
          const updatedNote = existingNote
            ? `${existingNote} | কাস্টমার মেসেজ: ${customerNote}`
            : `কাস্টমার মেসেজ: ${customerNote}`;

          await (prisma.order as any).update({
            where: { id: orderId },
            data: { orderNote: updatedNote },
          });
        }
      } catch (error) {
        console.error('Error updating note:', error);
      }
    }

    revalidatePath(`/track?phone=${encodeURIComponent(phone)}`);
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424]">
      {/* Top Bar */}
      <div className="bg-[#242424] text-[#F8F7F3] text-center py-2.5 text-xs tracking-[0.2em] uppercase font-light">
        Craftiq Order Tracking • Search by Mobile Number
      </div>

      {/* Navigation */}
      <header className="border-b border-[#E2DDD5] bg-[#F8F7F3]/95 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="font-serif text-3xl tracking-widest font-light text-[#242424]">
            CRAFTIQ
          </Link>
          <div className="flex items-center gap-6 text-xs uppercase tracking-widest font-medium">
            <Link href="/" className="hover:text-[#9B704D] transition">&larr; Home</Link>
            <Link href="/shop" className="hover:text-[#9B704D] transition">Catalog</Link>
            <Link href="/cart" className="bg-[#242424] text-white px-4 py-2.5 hover:bg-[#9B704D] transition">
              Bag
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.2em] text-[#9B704D] font-semibold">Live Order Tracker</span>
          <h1 className="font-serif text-3xl md:text-4xl font-light">আপনার অর্ডার স্ট্যাটাস চেক করুন</h1>
          <p className="text-xs text-[#666666]">
            যেকোনো কাস্টমার তার মোবাইল নম্বর দিয়ে সার্চ করে অর্ডারের বর্তমান অবস্থা দেখতে এবং নোট বা মেসেজ যুক্ত করতে পারবে।
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white border border-[#E2DDD5] p-6 md:p-8 shadow-sm max-w-lg mx-auto space-y-3">
          <form action={handleTrackSearch} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777777] mb-1">
                মোবাইল নম্বর লিখুন *
              </label>
              <input
                type="tel"
                name="phone"
                required
                defaultValue={searchPhone}
                placeholder="যেমন: 017XXXXXXXX"
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#242424] text-white py-3.5 text-xs uppercase tracking-widest font-medium hover:bg-[#9B704D] transition cursor-pointer"
            >
              Track Order &rarr;
            </button>
          </form>

          {/* Quick Demo Helper for Testing */}
          <div className="pt-2 border-t border-[#E2DDD5] text-center">
            <p className="text-[11px] text-[#777777] mb-1">ডেভেলপার টেস্ট করার জন্য:</p>
            <a
              href="/track?phone=01700000000"
              className="text-xs font-mono text-[#9B704D] underline hover:text-[#242424]"
            >
              সরাসরি ডেমো অর্ডার দেখতে এখানে ক্লিক করুন (01700000000)
            </a>
          </div>
        </div>

        {/* Results Section */}
        {searchPhone && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#E2DDD5] pb-3">
              <h2 className="font-serif text-xl font-light">
                নম্বর: <span className="font-mono font-bold text-[#9B704D]">{searchPhone}</span> এর অর্ডারসমূহ ({foundOrders.length})
              </h2>
              {isDemo && (
                <span className="bg-amber-100 text-amber-800 text-[10px] uppercase px-2 py-1 font-bold">
                  Demo Preview Mode
                </span>
              )}
            </div>

            {foundOrders.length === 0 ? (
              <div className="bg-white border border-[#E2DDD5] p-10 text-center space-y-3">
                <p className="text-sm text-[#555555]">এই মোবাইল নম্বরে কোনো অর্ডার পাওয়া যায়নি।</p>
                <p className="text-xs text-[#888888]">
                  টেস্ট করার জন্য ওপরের <strong className="text-[#9B704D]">ডেমো লিংক</strong> এ ক্লিক করে দেখতে পারেন পেজটি কীভাবে কাজ করে।
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {foundOrders.map((ord: any) => (
                  <div key={ord.id} className="bg-white border border-[#E2DDD5] p-6 md:p-8 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E2DDD5] pb-4 gap-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#9B704D] font-semibold block">
                          Order ID: #{ord.id}
                        </span>
                        <span className="text-xs text-[#777777]">
                          Customer ID: <strong>{ord.customerId || 'CUST-101'}</strong> | Date: {new Date(ord.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <div>
                        <span className={`px-3 py-1 text-xs uppercase tracking-widest font-medium border ${
                          ord.status === 'Processing' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                          ord.status === 'Shipped' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                          'bg-green-50 border-green-200 text-green-800'
                        }`}>
                          {ord.status || 'Processing'}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Delivery Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-[#777777] font-bold block">Shipping Address:</span>
                        <p className="font-medium text-[#242424]">{ord.customerName} ({ord.phone})</p>
                        <p className="text-[#555555]">{ord.address}, {ord.city}</p>
                        <p className="text-[#555555]">Delivery Zone: {ord.deliveryZone || 'Inside Dhaka'}</p>
                      </div>
                      <div className="space-y-1 sm:text-right">
                        <span className="text-[10px] uppercase tracking-widest text-[#777777] font-bold block">Payment & Total:</span>
                        <p className="text-[#555555]">Payment: <strong>{ord.paymentMethod || 'Cash on Delivery'}</strong></p>
                        <p className="text-sm font-bold text-[#9B704D]">Total COD: ৳{Number(ord.total).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="border-t border-b border-[#E2DDD5] py-4">
                      <span className="text-[10px] uppercase tracking-widest text-[#777777] font-bold block mb-2">Ordered Items:</span>
                      <div className="space-y-2 text-xs">
                        {Array.isArray(ord.items) && ord.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-[#F8F7F3] p-2.5 border border-[#E2DDD5]">
                            <span>{item.name} (× {item.quantity || 1})</span>
                            <span className="font-medium">৳{(Number(item.price) * Number(item.quantity || 1)).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Notes / Customer Message Section */}
                    <div className="bg-[#F8F7F3] p-4 border border-[#E2DDD5] space-y-3 text-xs">
                      <span className="font-bold uppercase tracking-wider text-[#777777] block">
                        Order Notes & Instructions:
                      </span>
                      <p className="text-[#444444] italic bg-white p-3 border border-[#E2DDD5]">
                        {ord.orderNote ? ord.orderNote : 'কোনো বিশেষ নোট দেওয়া হয়নি।'}
                      </p>

                      {/* Add note form */}
                      <form action={handleAddCustomerNote} className="space-y-2 pt-2 border-t border-[#E2DDD5]">
                        <input type="hidden" name="orderId" value={ord.id} />
                        <input type="hidden" name="phone" value={searchPhone} />
                        <label className="block uppercase tracking-wider text-[10px] text-[#777777]">
                          এই অর্ডারে কোনো বিশেষ নোট বা মেসেজ যোগ করতে চান?
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="customerNote"
                            required
                            placeholder="যেমন: বিকেলে ডেলিভারি দিলে ভালো হয়..."
                            className="flex-1 border border-[#E2DDD5] px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#9B704D]"
                          />
                          <button
                            type="submit"
                            className="bg-[#242424] text-white px-4 py-2 uppercase tracking-widest text-[10px] hover:bg-[#9B704D] transition cursor-pointer"
                          >
                            Add Note
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Invoice Link */}
                    {!isDemo && (
                      <div className="flex justify-end pt-2">
                        <a
                          href={`/admin/invoice/${encodeURIComponent(ord.id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-[#242424] px-4 py-2 text-[10px] uppercase tracking-widest font-medium hover:bg-[#242424] hover:text-white transition"
                        >
                          🖨️ View / Print Invoice
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}