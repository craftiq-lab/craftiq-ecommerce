import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import InvoicePrintButton from '@/components/InvoicePrintButton';

interface PageProps {
  searchParams?: Promise<{
    zone?: string;
    invoice?: string;
    success?: string;
  }> | {
    zone?: string;
    invoice?: string;
    success?: string;
  };
}

export default async function CartCheckoutPage({ searchParams }: PageProps) {
  const resolvedSearch = searchParams ? await Promise.resolve(searchParams) : {};
  const cartItems = await prisma.cart.findMany();
  const currentUser = await prisma.auth.getCurrentUser();

  const invoiceId = resolvedSearch?.invoice;
  const showPopup = resolvedSearch?.success === 'true';

  const allOrders = await prisma.order.findMany();
  const createdOrder = invoiceId
    ? allOrders.find((o: any) => String(o.id) === String(invoiceId))
    : null;

  const selectedZone = resolvedSearch?.zone === 'outside' ? 'outside' : 'inside';
  const deliveryCharge = cartItems.length > 0 ? (selectedZone === 'outside' ? 130 : 70) : 0;
  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity || 1),
    0
  );
  const grandTotal = subtotal + deliveryCharge;

  async function handleRemoveItem(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await prisma.cart.removeItem(id);
    revalidatePath('/cart');
    revalidatePath('/');
  }

  async function handleCartCheckout(formData: FormData) {
    'use server';
    const currentCart = await prisma.cart.findMany();
    if (!currentCart || currentCart.length === 0) return;

    const customerName = (formData.get('customerName') as string) || '';
    const phone = (formData.get('phone') as string) || '';
    const district = (formData.get('district') as string) || '';
    const thana = (formData.get('thana') as string) || '';
    const streetAddress = (formData.get('streetAddress') as string) || '';
    const orderNote = (formData.get('orderNote') as string) || '';
    const zone = (formData.get('deliveryZone') as string) || 'inside';

    const fullAddress = `${streetAddress}, ${thana}`;
    const shippingFee = zone === 'outside' ? 130 : 70;
    const itemsSubtotal = currentCart.reduce(
      (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity || 1),
      0
    );
    const total = itemsSubtotal + shippingFee;

    const newOrder = await (prisma.order as any).create({
      customerName,
      phone,
      district,
      thana,
      address: fullAddress,
      city: district,
      orderNote,
      deliveryZone: zone === 'outside' ? 'Outside Dhaka (৳130)' : 'Inside Dhaka (৳70)',
      deliveryCharge: shippingFee,
      paymentMethod: 'Cash on Delivery',
      items: currentCart,
      total,
    });

    await prisma.cart.clear();
    revalidatePath('/');
    revalidatePath('/cart');
    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath('/account');

    redirect(`/cart?invoice=${encodeURIComponent(newOrder.id)}&success=true`);
  }

  if (createdOrder) {
    const itemsSubtotal = Array.isArray(createdOrder.items)
      ? createdOrder.items.reduce(
          (s: number, i: any) => s + Number(i.price) * Number(i.quantity || 1),
          0
        )
      : 0;

    return (
      <div className="min-h-screen bg-[#F8F7F3] text-[#242424] py-10 px-6 relative">
        {/* Thank You Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white border border-[#E2DDD5] max-w-md w-full p-8 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#9B704D] font-semibold">
                  Order Successfully Placed
                </span>
                <h3 className="font-serif text-3xl font-light text-[#242424]">অনেক ধন্যবাদ!</h3>
                <p className="text-xs text-[#555555] leading-relaxed">
                  আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আপনার অটোমেটিক কাস্টমার আইডি: <strong className="text-[#242424]">{createdOrder.customerId}</strong>
                </p>
              </div>
              <div className="pt-3">
                <a
                  href={`/cart?invoice=${createdOrder.id}`}
                  className="block w-full bg-[#242424] text-white py-3.5 text-xs uppercase tracking-widest font-medium hover:bg-[#9B704D] transition"
                >
                  ইনভয়েস দেখুন ও প্রিন্ট করুন &rarr;
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto mb-6 bg-green-50 border border-green-300 p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-green-800 font-bold block">
              ✓ Order Confirmed & Account Created
            </span>
            <h2 className="font-serif text-xl text-[#242424] mt-0.5">
              কাস্টমার আইডি: <strong>{createdOrder.customerId}</strong>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <InvoicePrintButton order={createdOrder} />
            <Link
              href="/"
              className="bg-[#9B704D] text-white px-6 py-3 text-xs uppercase tracking-widest font-medium hover:bg-amber-800 transition whitespace-nowrap"
            >
              Finish & Go to Homepage &rarr;
            </Link>
          </div>
        </div>

        {/* Dedicated Customer Invoice Area */}
        <div
          id="printable-invoice-area"
          className="max-w-3xl mx-auto bg-white border border-[#E2DDD5] p-8 md:p-12 shadow-sm"
        >
          <div className="header flex justify-between items-start border-b-2 border-[#242424] pb-6 mb-6">
            <div>
              <h1 className="brand font-serif text-3xl tracking-widest font-light text-[#242424]">
                CRAFTIQ
              </h1>
              <p className="subtext text-xs text-[#666666] mt-1">
                Artisan Handcrafted Wooden Masterpieces
              </p>
              <p className="subtext text-xs text-[#666666]">
                Website: craftiqbd.store • Dhaka, Bangladesh
              </p>
            </div>
            <div className="text-right">
              <span className="badge text-xs uppercase tracking-[0.2em] text-[#9B704D] font-bold block">
                CUSTOMER INVOICE
              </span>
              <p className="text-sm font-mono font-bold mt-1">Invoice: #{createdOrder.id}</p>
              <p className="text-xs font-mono text-[#555555]">
                Customer ID: {createdOrder.customerId || 'CUST-101'}
              </p>
              <p className="text-xs text-[#777777] mt-0.5">
                Date: {new Date(createdOrder.createdAt).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 mb-6 border-b border-[#E2DDD5] text-xs">
            <div className="space-y-1">
              <span className="section-label text-[10px] uppercase tracking-widest text-[#777777] font-bold block">
                Billed & Shipped To (Customer):
              </span>
              <p className="text-sm font-bold text-[#242424]">{createdOrder.customerName}</p>
              <p className="text-[#242424] font-medium">Phone: {createdOrder.phone}</p>
              <p className="text-[#444444]">Address: {createdOrder.address}</p>
              <p className="text-[#444444]">District: {createdOrder.city}</p>
              {createdOrder.orderNote && (
                <p className="text-[#666666] italic">Note: {createdOrder.orderNote}</p>
              )}
            </div>
            <div className="space-y-1 sm:text-right">
              <span className="section-label text-[10px] uppercase tracking-widest text-[#777777] font-bold block">
                Payment & Delivery Details:
              </span>
              <p>Payment Method: <strong>Cash on Delivery (COD)</strong></p>
              <p>Delivery Zone: <strong>{createdOrder.deliveryZone}</strong></p>
              <p>Courier Partner: <strong>Steadfast Courier</strong></p>
              <p className="text-sm font-bold text-[#9B704D] pt-1">
                Collectable COD: ৳{Number(createdOrder.total).toLocaleString()}
              </p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs mb-6">
            <thead>
              <tr className="border-b border-[#242424] text-[10px] uppercase tracking-widest text-[#555555]">
                <th className="py-2.5">Product Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DDD5]">
              {Array.isArray(createdOrder.items) &&
                createdOrder.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-[#242424]">{item.name}</td>
                    <td className="py-3 text-center">{item.quantity || 1}</td>
                    <td className="py-3 text-right">৳{Number(item.price).toLocaleString()}</td>
                    <td className="py-3 text-right font-medium">
                      ৳{(Number(item.price) * Number(item.quantity || 1)).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="totals w-64 ml-auto space-y-2 text-xs">
            <div className="totals-row flex justify-between text-[#555555]">
              <span>Subtotal:</span>
              <span>৳{itemsSubtotal.toLocaleString()}</span>
            </div>
            <div className="totals-row flex justify-between text-[#555555]">
              <span>Delivery Charge:</span>
              <span>৳{createdOrder.deliveryCharge || 70}</span>
            </div>
            <div className="totals-row totals-final flex justify-between text-base font-bold text-[#9B704D] border-t-2 border-[#242424] pt-2">
              <span>Total Payable (COD):</span>
              <span>৳{Number(createdOrder.total).toLocaleString()}</span>
            </div>
          </div>

          <div className="footer mt-10 pt-4 border-t border-dashed border-[#CCCCCC] text-center space-y-1 text-xs text-[#555555]">
            <p className="font-bold text-[#242424]">
              ★ 5-Year Structural Wood Warranty Certificate ★
            </p>
            <p>Thank you for shopping with Craftiq. Handcrafted with pride in Bangladesh.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424]">
      <div className="bg-[#242424] text-[#F8F7F3] text-center py-2.5 text-xs tracking-[0.2em] uppercase font-light">
        Craftiq Shopping Bag • Instant Auto-Account & Invoice Generation
      </div>

      <header className="border-b border-[#E2DDD5] bg-[#F8F7F3]/95 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="font-serif text-3xl tracking-widest font-light text-[#242424]">
            CRAFTIQ
          </Link>
          <div className="flex items-center gap-6 text-xs uppercase tracking-widest font-medium">
            <Link href="/shop" className="hover:text-[#9B704D] transition">&larr; Continue Shopping</Link>
            <Link href="/account" className="hover:text-[#9B704D] transition">
              {currentUser ? `${currentUser.name} (${currentUser.customerId})` : 'My Account'}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-8 pb-4 border-b border-[#E2DDD5]">
          Your Shopping Bag & Checkout ({cartItems.length})
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-[#E2DDD5] p-12 text-center space-y-4">
            <p className="font-serif text-2xl font-light text-[#555555]">আপনার শপিং ব্যাগটি বর্তমানে খালি আছে।</p>
            <Link
              href="/shop"
              className="inline-block bg-[#242424] text-white px-8 py-4 text-xs uppercase tracking-widest font-medium hover:bg-[#9B704D] transition"
            >
              Explore Wooden Catalog &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-6 space-y-4">
              {cartItems.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E2DDD5] p-5 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-[#E9E2D5]/30 border border-[#E2DDD5] overflow-hidden flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <Link href={`/shop/${item.slug}`} className="font-serif text-xl font-medium hover:text-[#9B704D]">
                        {item.name}
                      </Link>
                      <p className="text-xs text-[#777777] mt-1">
                        Unit Price: ৳{Number(item.price).toLocaleString()} × Qty: <strong>{item.quantity}</strong>
                      </p>
                      <p className="text-sm font-medium text-[#9B704D] mt-1">
                        ৳{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <form action={handleRemoveItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="text-[10px] uppercase tracking-widest border border-red-200 text-red-600 px-3 py-1.5 hover:bg-red-50 cursor-pointer"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <div className="lg:col-span-6 bg-white border border-[#E2DDD5] p-6 md:p-8 shadow-sm space-y-5">
              <div className="pb-3 border-b border-[#E2DDD5]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#9B704D] font-semibold">
                  Complete Shipping Address
                </span>
                <h2 className="font-serif text-2xl font-light mt-1">ডেলিভারি ঠিকানা ও তথ্য দিন</h2>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">
                  ডেলিভারি জোন সিলেক্ট করুন *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/cart?zone=inside"
                    scroll={false}
                    className={`p-3 border text-center text-xs uppercase tracking-wider font-medium transition ${
                      selectedZone === 'inside'
                        ? 'border-[#9B704D] bg-[#9B704D]/10 text-[#242424]'
                        : 'border-[#E2DDD5] text-[#777777] hover:border-[#242424]'
                    }`}
                  >
                    Inside Dhaka (৳70)
                  </Link>
                  <Link
                    href="/cart?zone=outside"
                    scroll={false}
                    className={`p-3 border text-center text-xs uppercase tracking-wider font-medium transition ${
                      selectedZone === 'outside'
                        ? 'border-[#9B704D] bg-[#9B704D]/10 text-[#242424]'
                        : 'border-[#E2DDD5] text-[#777777] hover:border-[#242424]'
                    }`}
                  >
                    Outside Dhaka (৳130)
                  </Link>
                </div>
              </div>

              <form action={handleCartCheckout} className="space-y-4">
                <input type="hidden" name="deliveryZone" value={selectedZone} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#777777] mb-1">আপনার পূর্ণ নাম *</label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      defaultValue={currentUser?.name || ''}
                      placeholder="যেমন: তানভীর আহমেদ"
                      className="w-full border border-[#E2DDD5] px-3.5 py-2.5 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#777777] mb-1">মোবাইল নম্বর (১১ ডিজিট) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      defaultValue={currentUser?.phone || ''}
                      placeholder="017XXXXXXXX"
                      className="w-full border border-[#E2DDD5] px-3.5 py-2.5 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#777777] mb-1">জেলা (District) *</label>
                    <input
                      type="text"
                      name="district"
                      required
                      defaultValue={currentUser?.district || (selectedZone === 'inside' ? 'Dhaka' : '')}
                      placeholder="যেমন: ঢাকা / চট্টগ্রাম / কুমিল্লা"
                      className="w-full border border-[#E2DDD5] px-3.5 py-2.5 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#777777] mb-1">থানা / উপজেলা / এলাকা *</label>
                    <input
                      type="text"
                      name="thana"
                      required
                      defaultValue={currentUser?.thana || ''}
                      placeholder="যেমন: ধানমন্ডি / উত্তরা / মিরপুর"
                      className="w-full border border-[#E2DDD5] px-3.5 py-2.5 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#777777] mb-1">
                    বাসা নং, রোড নং ও বিস্তারিত ঠিকানা *
                  </label>
                  <textarea
                    name="streetAddress"
                    required
                    rows={2}
                    defaultValue={currentUser?.address || ''}
                    placeholder="বাসা #১২, রোড #৫, ব্লক-বি, ফ্ল্যাট ৪এ..."
                    className="w-full border border-[#E2DDD5] px-3.5 py-2 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#777777] mb-1">
                    ডেলিভারি নোট বা ল্যান্ডমার্ক (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    name="orderNote"
                    placeholder="যেমন: মসজিদের পাশে / ডেলিভারির আগে কল দিবেন"
                    className="w-full border border-[#E2DDD5] px-3.5 py-2.5 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
                  />
                </div>

                <div className="bg-[#F8F7F3] p-4 border border-[#E2DDD5] space-y-2 text-xs">
                  <div className="flex justify-between text-[#777777]">
                    <span>Items Subtotal</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#777777]">
                    <span>Delivery Charge ({selectedZone === 'outside' ? 'Outside Dhaka' : 'Inside Dhaka'})</span>
                    <span>৳{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#242424] pt-2 border-t border-[#E2DDD5]">
                    <span>Total Cash on Delivery</span>
                    <span className="text-[#9B704D]">৳{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#242424] text-white py-4 text-xs uppercase tracking-widest font-medium hover:bg-[#9B704D] transition cursor-pointer"
                >
                  Order Now (৳{grandTotal.toLocaleString()}) &rarr;
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}