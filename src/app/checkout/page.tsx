import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { sendFacebookEvent } from '@/lib/facebook-capi';

export default async function CheckoutPage() {
  const cartItems = await prisma.cart.findMany();
  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const deliveryCharge = 100;
  const total = subtotal > 0 ? subtotal + deliveryCharge : 0;

  async function handlePlaceOrder(formData: FormData) {
    'use server';
    
    const customerName = formData.get('customerName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const paymentMethod = formData.get('paymentMethod') as string || 'Cash on Delivery';

    const cart = await prisma.cart.findMany();
    if (cart.length === 0) return;

    const orderSubtotal = cart.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const orderTotal = orderSubtotal + 100;

    // ১. ডাটাবেজে অর্ডার সেভ করা
    const newOrder = await prisma.order.create({
      customerName,
      phone,
      address,
      city,
      paymentMethod,
      items: cart,
      total: orderTotal,
    });

    // ২. অর্ডার কনফার্ম হওয়ার সাথে সাথে ফেসবুক CAPI-তে Purchase ইভেন্ট পাঠানো
    await sendFacebookEvent(
      'Purchase',
      {
        currency: 'BDT',
        value: Number(orderTotal),
        content_type: 'product',
        contents: cart.map((i: any) => ({ id: i.id, quantity: i.quantity })),
      },
      {
        phone: phone,
        email: 'customer@craftiq.store',
      }
    );

    redirect('/account?success=true');
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424] p-6 md:p-12">
      <div className="max-w-4xl mx-auto mb-8 pb-6 border-b border-[#E2DDD5] flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#9B704D] font-semibold">Secure Checkout</span>
          <h1 className="font-serif text-3xl md:text-4xl font-light mt-1 text-[#242424]">Complete Your Order</h1>
        </div>
        <Link href="/cart" className="border border-[#242424] px-4 py-2.5 text-xs uppercase tracking-widest font-medium hover:bg-[#242424] hover:text-white transition">
          &larr; Back to Bag
        </Link>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="bg-white border border-[#E2DDD5] p-8 shadow-sm">
          <h2 className="font-serif text-xl font-light mb-6 text-[#9B704D]">Shipping & Contact Information</h2>
          
          <form action={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">Full Name *</label>
              <input type="text" name="customerName" required placeholder="Jahid Hasan" className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">Phone Number *</label>
              <input type="text" name="phone" required placeholder="01712345678" className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">Delivery Address *</label>
              <textarea name="address" required rows={3} placeholder="House, Road, Area" className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">City / District *</label>
              <input type="text" name="city" required placeholder="Dhaka / Noakhali" className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]" />
            </div>

            <input type="hidden" name="paymentMethod" value="Cash on Delivery" />

            <div className="pt-4">
              <button type="submit" className="w-full bg-[#9B704D] text-white py-4 text-xs uppercase tracking-widest font-medium hover:bg-amber-800 transition cursor-pointer">
                Confirm Order (Cash on Delivery)
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-[#E2DDD5] p-8 shadow-sm h-fit">
          <h2 className="font-serif text-xl font-light mb-6 text-[#9B704D]">Order Summary</h2>
          
          <div className="space-y-4 mb-6 divide-y divide-[#E2DDD5]">
            {cartItems.length === 0 ? (
              <p className="text-xs text-[#777777] py-4">Your bag is empty.</p>
            ) : (
              cartItems.map((item: any) => (
                <div key={item.id} className="pt-3 first:pt-0 flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-[#777777]">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-[#9B704D]">৳{Number(item.price) * Number(item.quantity)}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-[#E2DDD5] pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-[#777777]">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-[#777777]">
              <span>Shipping Charge</span>
              <span>৳{subtotal > 0 ? deliveryCharge : 0}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-[#242424] pt-2 border-t border-[#E2DDD5]">
              <span>Total Amount</span>
              <span className="text-[#9B704D]">৳{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}