import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Shop Catalog — Craftiq Artisan Woodcraft & Perpetual Calendars',
  description: 'Explore our handcrafted solid timber decor, perpetual calendars, kitchen accessories, and artisan home decor in Bangladesh.',
};

export default async function ShopCatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; search?: string; sort?: string }> | { category?: string; search?: string; sort?: string };
}) {
  const resolvedSearch = searchParams ? await Promise.resolve(searchParams) : {};
  const activeCategory = resolvedSearch?.category || 'All';
  const searchQuery = resolvedSearch?.search || '';
  const sortBy = resolvedSearch?.sort || 'latest';

  let products: any[] = [];
  let allProductsForTabs: any[] = [];
  let settings: any = null;

  try {
    // ১. সমস্ত প্রডাক্ট ফেচ করা ক্যাটাগরি ট্যাব ও কাউন্ট দেখানোর জন্য
    allProductsForTabs = await (prisma.product as any).findMany({
      include: { category: true },
    });

    // ২. ডেটাবেজ কুয়েরি লেভেলেই ক্যাটাগরি ফিল্টার করা (কোনো JS .filter() লাগবে না, তাই ক্রাশের কোনো সুযোগ নেই)
    const whereClause: any = {};
    if (activeCategory !== 'All') {
      whereClause.OR = [
        { category: { name: { equals: activeCategory, mode: 'insensitive' } } },
        { category: { slug: { equals: activeCategory, mode: 'insensitive' } } },
      ];
    }

    products = await (prisma.product as any).findMany({
      where: whereClause,
      include: { 
        category: true,
        reviews: true 
      },
      orderBy: { id: 'desc' },
    });

    settings = await prisma.settings.get();
  } catch (error) {
    console.error('Error fetching shop catalog data:', error);
  }

  // সেফ ক্যাটাগরি নেম এক্সট্র্যাক্টর
  const getCatName = (cat: any): string => {
    if (!cat) return 'Home Decor';
    if (typeof cat === 'object' && cat !== null) {
      return String(cat.name || 'Home Decor');
    }
    return String(cat);
  };

  // সার্চ কুয়েরি হ্যান্ডলিং
  let filteredProducts = products;
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter((p: any) => 
      p.name?.toLowerCase().includes(q) || 
      p.description?.toLowerCase().includes(q)
    );
  }

  // সর্টিং হ্যান্ডলিং
  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
  } else {
    filteredProducts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  // ইউনিক ক্যাটাগরি লিস্ট ট্যাবগুলোর জন্য
  const categories = ['All', ...Array.from(new Set(allProductsForTabs.map((p: any) => getCatName(p.category))))];

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424] flex flex-col justify-between">
      <div>
        {/* Top Announcement Bar */}
        <div className="bg-[#242424] text-[#F8F7F3] text-center py-2.5 text-xs tracking-[0.2em] uppercase font-light">
          Handcrafted Masterpiece • Cash on Delivery Across Bangladesh • 5-Year Structural Warranty
        </div>

        {/* Main Header / Hero Section for Shop */}
        <div className="border-b border-[#E2DDD5] bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 text-center space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] text-[#9B704D] font-semibold">Artisan Collection & Masterpieces</span>
            <h1 className="font-serif text-4xl md:text-6xl font-light tracking-wide text-[#242424]">The Craftiq Catalog</h1>
            <p className="text-xs md:text-sm text-[#666666] max-w-xl mx-auto font-light leading-relaxed">
              টেকসই কাঠ এবং নিখুঁত হাতের কাজের তৈরি প্রিমিয়াম পারপেচুয়াল ক্যালেন্ডার, হোম ডেকোর ও লাইফস্টাইল এক্সেসরিজ। প্রতিটি পিস শিল্পীর নিপুণ ছোঁয়ায় তৈরি।
            </p>
          </div>
        </div>

        {/* Filters & Catalog Body */}
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
          
          {/* Controls Bar: Categories & Sorting */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[#E2DDD5] pb-6">
            
            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {categories.map((cat: string) => {
                const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
                const count = cat === 'All' 
                  ? allProductsForTabs.length 
                  : allProductsForTabs.filter((p: any) => getCatName(p.category).toLowerCase() === cat.toLowerCase()).length;

                return (
                  <Link
                    key={cat}
                    href={cat === 'All' ? '/shop' : `/shop?category=${encodeURIComponent(cat)}`}
                    className={`px-4 py-2 text-xs uppercase tracking-widest transition font-medium flex items-center gap-2 ${
                      isActive 
                        ? 'bg-[#242424] text-white shadow-sm' 
                        : 'bg-white border border-[#E2DDD5] text-[#555] hover:border-[#242424]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#9B704D] text-white' : 'bg-[#F8F7F3] text-[#777]'}`}>
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Sort & Stats */}
            <div className="flex items-center gap-4 text-xs">
              <span className="text-[#777] uppercase tracking-widest hidden sm:inline">Sort By:</span>
              <div className="flex gap-2">
                <Link
                  href={`/shop?category=${encodeURIComponent(activeCategory)}&sort=latest`}
                  className={`px-3 py-2 border ${sortBy === 'latest' ? 'bg-[#242424] text-white border-[#242424]' : 'bg-white border-[#E2DDD5] text-[#555]'}`}
                >
                  Latest
                </Link>
                <Link
                  href={`/shop?category=${encodeURIComponent(activeCategory)}&sort=price-low`}
                  className={`px-3 py-2 border ${sortBy === 'price-low' ? 'bg-[#242424] text-white border-[#242424]' : 'bg-white border-[#E2DDD5] text-[#555]'}`}
                >
                  Price: Low to High
                </Link>
                <Link
                  href={`/shop?category=${encodeURIComponent(activeCategory)}&sort=price-high`}
                  className={`px-3 py-2 border ${sortBy === 'price-high' ? 'bg-[#242424] text-white border-[#242424]' : 'bg-white border-[#E2DDD5] text-[#555]'}`}
                >
                  Price: High to Low
                </Link>
              </div>
            </div>

          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center space-y-4 bg-white border border-[#E2DDD5] shadow-sm max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-[#F8F7F3] border border-[#E2DDD5] rounded-full flex items-center justify-center mx-auto text-xl text-[#9B704D]">
                🪵
              </div>
              <p className="font-serif text-2xl text-[#555]">এই ক্যাটাগরিতে বর্তমানে কোনো মাস্টারপিস নেই।</p>
              <p className="text-xs text-[#777] max-w-md mx-auto">অন্যান্য ক্যাটাগরি ব্রাউজ করুন অথবা সমস্ত প্রিমিয়াম কালেকশন দেখতে নিচে ক্লিক করুন।</p>
              <Link href="/shop" className="inline-block bg-[#242424] text-white px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-[#9B704D] transition shadow-sm">
                View All Masterpieces
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product: any) => {
                const hasDiscount = Number(product.compareAtPrice) > Number(product.price);
                const discountPercent = hasDiscount
                  ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
                  : 0;

                const catDisplay = getCatName(product.category);

                const reviews = product.reviews || [];
                const avgRating = reviews.length > 0 
                  ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) 
                  : '5.0';

                return (
                  <div key={product.id} className="bg-white border border-[#E2DDD5] group shadow-sm flex flex-col justify-between overflow-hidden transition hover:shadow-md">
                    <div>
                      {/* Image & Badges */}
                      <div className="aspect-square bg-gray-100 overflow-hidden relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image Available</div>
                        )}
                        
                        {hasDiscount && (
                          <span className="absolute top-3 left-3 bg-[#9B704D] text-white px-3 py-1 text-[10px] uppercase tracking-widest font-medium shadow-sm">
                            Save {discountPercent}%
                          </span>
                        )}

                        <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-[#242424] px-2.5 py-1 text-[10px] font-mono border border-[#E2DDD5]">
                          Stock: {product.stock} pcs
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="p-6 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[#9B704D] font-semibold">{catDisplay}</span>
                          <div className="flex items-center gap-1 text-xs text-[#9B704D]">
                            <span>★</span>
                            <span className="text-[#555] font-medium">{avgRating} ({reviews.length})</span>
                          </div>
                        </div>

                        <h3 className="font-serif text-xl font-light text-[#242424] group-hover:text-[#9B704D] transition leading-snug">
                          {product.name}
                        </h3>

                        <p className="text-xs text-[#666] line-clamp-2 font-light">
                          {product.description || 'Handcrafted from sustainable solid timber with natural beeswax finish.'}
                        </p>

                        <div className="flex items-baseline gap-3 pt-2 border-t border-[#E2DDD5]">
                          <span className="font-serif text-xl font-medium text-[#9B704D]">৳{Number(product.price).toLocaleString()}</span>
                          {hasDiscount && (
                            <span className="text-sm text-[#888] line-through font-light">৳{Number(product.compareAtPrice).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 pt-0 grid grid-cols-2 gap-2">
                      <Link
                        href={`/shop/${product.slug}`}
                        className="border border-[#242424] text-center py-3 text-[10px] uppercase tracking-widest font-medium hover:bg-[#242424] hover:text-white transition"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/campaign/${product.slug}`}
                        className="bg-[#9B704D] text-white text-center py-3 text-[10px] uppercase tracking-widest font-medium hover:bg-amber-800 transition shadow-sm"
                      >
                        Landing Page
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Footer Info */}
      <footer className="bg-[#242424] text-[#F8F7F3] py-12 border-t border-[#333] mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="space-y-3">
            <h3 className="font-serif text-xl tracking-widest font-light">CRAFTIQ</h3>
            <p className="text-gray-400 font-light leading-relaxed">
              Crafting timeless wooden masterpieces with sustainable timber and exquisite local artistry across Bangladesh.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="uppercase tracking-widest text-[#9B704D] font-semibold">Quick Catalog Links</h4>
            <div className="flex flex-col space-y-1.5 text-gray-300">
              <Link href="/shop" className="hover:text-white transition">All Masterpieces</Link>
              <Link href="/track" className="hover:text-white transition">Track Your Order</Link>
              <Link href="/cart" className="hover:text-white transition">Shopping Bag</Link>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="uppercase tracking-widest text-[#9B704D] font-semibold">Customer Support</h4>
            <p className="text-gray-300">Instant order confirmation and custom inquiries via WhatsApp & Phone Hotlines.</p>
            <p className="text-[#9B704D] font-mono pt-1">Hotline: {settings?.whatsappNumber || '01700000000'}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-gray-800 text-center text-gray-500 text-[11px]">
          &copy; {new Date().getFullYear()} CraftiqBD. All rights reserved. Powered by Craftiq D2C Engine.
        </div>
      </footer>
    </div>
  );
}