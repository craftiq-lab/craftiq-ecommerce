import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const products = await prisma.product.findMany();
  const settings = await prisma.settings.get();
  const storeName = settings?.storeName || 'CRAFTIQ';
  const logoUrl = settings?.logoUrl;

  const coverImage = settings?.bannerImage || (products.length > 0 && products[0].image 
    ? products[0].image 
    : 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=1600&auto=format&fit=crop');

  const noticeText = settings?.noticeText || 'Handcrafted Solid Timber Masterpieces • Cash on Delivery Across Bangladesh';

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424]">
      {/* Top Banner */}
      <div className="bg-[#242424] text-[#F8F7F3] text-center py-2.5 text-xs tracking-[0.2em] uppercase font-light">
        {noticeText}
      </div>

      {/* Header with Dynamic Logo */}
      <header className="border-b border-[#E2DDD5] bg-[#F8F7F3]/95 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-9 md:h-10 object-contain" />
            ) : (
              <span className="font-serif text-3xl tracking-widest font-light text-[#242424]">
                {storeName}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-6 text-xs uppercase tracking-widest font-medium">
            <Link href="/shop" className="hover:text-[#9B704D] transition">Catalog</Link>
            <Link href="/track" className="hover:text-[#9B704D] transition">Track Order</Link>
            <Link href="/cart" className="bg-[#242424] text-white px-4 py-2.5 hover:bg-[#9B704D] transition">
              Bag
            </Link>
          </div>
        </div>
      </header>

      {/* Immersive Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        <div className="relative bg-[#242424] text-white overflow-hidden shadow-md">
          <div className="absolute inset-0 opacity-45">
            <img src={coverImage} alt="Craftiq Cover" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent"></div>
          
          <div className="relative z-10 max-w-2xl px-8 py-20 md:py-28 space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold bg-black/40 px-3.5 py-1.5 border border-[#D4AF37]/30 inline-block">
              Artisan Woodcraft Studio
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-light leading-tight">
              Handcrafted Solid Timber Masterpieces & Home Decor
            </h1>
            <p className="text-sm md:text-base text-gray-200 font-light leading-relaxed">
              Sustainable teak and pine wood perpetual calendars, desk organizers, and kitchenware crafted with precision and backed by a 5-year structural warranty.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="bg-[#9B704D] text-white px-8 py-4 text-xs uppercase tracking-widest font-medium hover:bg-amber-800 transition"
              >
                Explore Catalog &rarr;
              </Link>
              <Link
                href="/track"
                className="border border-white text-white px-8 py-4 text-xs uppercase tracking-widest font-medium hover:bg-white hover:text-[#242424] transition"
              >
                Track Your Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <main className="max-w-7xl mx-auto px-6 py-12 mb-16">
        <div className="flex justify-between items-end mb-10 border-b border-[#E2DDD5] pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#9B704D] font-semibold">Artisan Collection</span>
            <h2 className="font-serif text-3xl font-light mt-1">Featured Masterpieces</h2>
          </div>
          <Link href="/shop" className="text-xs uppercase tracking-widest text-[#777777] hover:text-[#242424] transition">
            View All Products &rarr;
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-[#E2DDD5] p-12 text-center space-y-4">
            <p className="font-serif text-xl text-[#555555]">No products available right now.</p>
            <Link href="/admin/products" className="inline-block bg-[#242424] text-white px-6 py-3 text-xs uppercase tracking-widest">
              Add Products &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 6).map((item: any) => (
              <div key={item.id} className="bg-white border border-[#E2DDD5] p-4 shadow-sm flex flex-col justify-between group">
                <div>
                  <div className="h-72 w-full bg-[#E9E2D5]/30 overflow-hidden relative mb-4">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#777777]">[ No Image ]</div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#9B704D] font-medium border border-[#E2DDD5]">
                      {item.category?.name || 'Woodcraft'}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase text-[#777777]">SKU: {item.sku || 'CRFT'}</span>
                  <h3 className="font-serif text-xl font-medium mt-1 text-[#242424] group-hover:text-[#9B704D] transition">
                    <Link href={`/shop/${item.slug}`}>{item.name}</Link>
                  </h3>
                  <p className="text-xs text-[#555555] font-light mt-2 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[#E2DDD5] flex items-center justify-between">
                  <p className="text-lg font-medium text-[#9B704D]">৳{Number(item.price).toLocaleString()}</p>
                  <div className="flex gap-2">
                    <Link
                      href={`/shop/${item.slug}`}
                      className="border border-[#242424] px-3.5 py-2 text-[10px] uppercase tracking-widest font-medium hover:bg-[#242424] hover:text-white transition"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/campaign/${item.slug}`}
                      className="bg-[#9B704D] text-white px-3.5 py-2 text-[10px] uppercase tracking-widest font-medium hover:bg-amber-800 transition"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}