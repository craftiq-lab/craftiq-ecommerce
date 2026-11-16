"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "Dhaka",
    paymentMethod: "Cash on Delivery",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
    0
  );
  const deliveryCharge = formData.city.toLowerCase().includes("dhaka") && !formData.city.toLowerCase().includes("outside") ? 70 : 130;
  const total = subtotal > 0 ? subtotal + deliveryCharge : 0;

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    if (!formData.customerName || !formData.phone || !formData.address) {
      alert("Please provide Name, Phone number, and Delivery Address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: cart,
          total,
        }),
      });

      const data = await res.json();
      if (res.ok && (data.order || data.id || data.success)) {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("storage"));
        const orderId = data.order?.id || data.id || "success";
        router.push("/track?orderId=" + orderId + "&success=true");
      } else {
        alert(data.error || "Order placement failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424] p-6 md:p-12">
      <div className="max-w-4xl mx-auto mb-8 pb-6 border-b border-[#E2DDD5] flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#9B704D] font-semibold">
            Secure Checkout
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-[#242424] mt-1">
            Complete Your Order
          </h1>
        </div>
        <Link href="/shop" className="text-xs uppercase tracking-widest text-[#9B704D] hover:underline">
          ← Back to Shop
        </Link>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Customer Details Form */}
        <div className="md:col-span-7 bg-white p-6 border border-stone-200 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-6 text-stone-700">
            Shipping Information
          </h2>
          <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Full Name *</label>
              <input
                required
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full border border-stone-300 p-2.5 text-sm focus:outline-[#9B704D]"
                placeholder="আপনার নাম লিখুন"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Phone Number *</label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-stone-300 p-2.5 text-sm focus:outline-[#9B704D]"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Delivery Address *</label>
              <textarea
                required
                rows={3}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-stone-300 p-2.5 text-sm focus:outline-[#9B704D]"
                placeholder="বাসা নং, রোড নং, এলাকা এবং থানা"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Delivery Area</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full border border-stone-300 p-2.5 text-sm focus:outline-[#9B704D]"
                >
                  <option value="Dhaka">Inside Dhaka (৳70)</option>
                  <option value="Outside Dhaka">Outside Dhaka (৳130)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Payment Method</label>
                <input
                  type="text"
                  readOnly
                  value="Cash on Delivery"
                  className="w-full border border-stone-200 bg-stone-50 p-2.5 text-sm text-stone-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="mt-4 w-full bg-[#9B704D] text-white py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#835d3f] transition disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? "Processing..." : `Confirm Order — ৳${total.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-5 bg-white p-6 border border-stone-200 shadow-sm h-fit">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 text-stone-700">
            Order Summary ({cart.length})
          </h2>

          {cart.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-sm">
              Your cart is empty.
              <div className="mt-2">
                <Link href="/shop" className="text-xs text-[#9B704D] underline uppercase tracking-wider">
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-stone-100">
              {cart.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover border border-stone-200" />
                    )}
                    <div>
                      <div className="font-medium text-stone-800 line-clamp-1">{item.title || item.name}</div>
                      <div className="text-xs text-stone-400">Qty: {item.quantity || 1}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-stone-700">
                    ৳{(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                  </div>
                </div>
              ))}

              <div className="pt-4 flex flex-col gap-2 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>৳{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 border-t border-stone-200 pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-[#9B704D]">৳{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
