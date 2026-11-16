"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ product }: { product: any }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCartStorage = () => {
    try {
      const existing = localStorage.getItem("cart");
      const cart = existing ? JSON.parse(existing) : [];
      const itemIndex = cart.findIndex((i: any) => String(i.id) === String(product.id));

      if (itemIndex > -1) {
        cart[itemIndex].quantity = (cart[itemIndex].quantity || 1) + qty;
      } else {
        cart.push({
          id: product.id,
          name: product.title || product.name,
          title: product.title || product.name,
          price: Number(product.price),
          image: (product.images && product.images[0]) || product.image || "/placeholder.jpg",
          quantity: qty,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
      return true;
    } catch (e) {
      console.error("Cart save error:", e);
      return false;
    }
  };

  const handleAddToCart = () => {
    addToCartStorage();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCartStorage();
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <label className="text-xs uppercase tracking-wider text-stone-500 font-medium">Quantity:</label>
        <div className="flex border border-stone-300">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-1 hover:bg-stone-100"
          >
            -
          </button>
          <span className="px-4 py-1 text-sm font-medium">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-1 hover:bg-stone-100"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="border border-[#242424] text-[#242424] py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#242424] hover:text-white transition"
        >
          {added ? "✓ Added" : "Add to Bag"}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className="bg-[#9B704D] text-white py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#835d3f] transition shadow-sm"
        >
          Order Now
        </button>
      </div>
    </div>
  );
}
