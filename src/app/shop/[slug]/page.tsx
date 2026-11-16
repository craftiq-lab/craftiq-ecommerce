import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: any = null;
  try {
    product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: slug }, { id: slug }],
      },
    });
  } catch (err) {
    console.error("Failed to fetch product:", err);
  }

  if (!product) {
    notFound();
  }

  const primaryImage =
    (product.images && product.images[0]) ||
    product.image ||
    "/placeholder.jpg";

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#242424] font-sans">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/shop" className="text-xs uppercase tracking-widest text-stone-500 hover:text-black">
            ← Back to Catalog
          </Link>
          <Link href="/cart" className="bg-[#242424] text-white px-5 py-2 text-xs uppercase tracking-widest hover:bg-[#9B704D] transition">
            Cart / Checkout
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="relative aspect-square w-full bg-stone-100 border border-stone-200 overflow-hidden shadow-sm">
            <img
              src={primaryImage}
              alt={product.title || product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#9B704D] font-semibold">
                {product.category || "Solid Wood Collection"}
              </span>
              <h1 className="text-3xl font-serif mt-1 text-[#242424]">
                {product.title || product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-2xl font-bold text-[#9B704D]">
                ৳{Number(product.price).toLocaleString()}
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                <span className="text-base text-stone-400 line-through">
                  ৳{Number(product.compareAtPrice).toLocaleString()}
                </span>
              )}
            </div>

            <div className="border-t border-b border-stone-200 py-4 text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {product.description || "Handcrafted with natural pine wood finish and precision laser engraving."}
            </div>

            <AddToCartButton product={JSON.parse(JSON.stringify(product))} />
          </div>
        </div>
      </main>
    </div>
  );
}
