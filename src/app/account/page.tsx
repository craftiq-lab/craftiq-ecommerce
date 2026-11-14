import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const products = await prisma.product.findMany({
    include: { category: true },
  });
  const cartItems = await prisma.cart.findMany();
  const currentUser = await prisma.auth.getCurrentUser();

  const totalCartCount = cartItems.reduce((sum: number, item: any) => sum + Number(item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424]">
      {/* Top Announcement Bar */}
      <div className="bg-[#242424] text-[#F8F7F3] text-center py-2.5 text-xs tracking-[0.2em] uppercase font-light">
        Handcrafted Wooden Masterpieces • Nationwide Delivery in Bangladesh
      </div>

      {/* Main Navigation */}
      <header className="border-b border-[#E2DDD5] bg-[#F8F7F3]/90 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="font-serif text-3xl tracking-widest font-light text-[#242424]">
            CRAFTIQ
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-[#555555]">
            <Link href="/shop" className="hover:text-[#9B704D] transition">All Catalog</Link>
            <Link href="/shop?category=Home+Decor" className="hover:text-[#9B704D] transition">Home Decor</Link>
            <Link href="/shop?category=Kitchen" className="hover:text-[#9B704D] transition">Kitchen</Link>
            <Link href="/shop?category=Workspace" className="hover:text-[#9B704D] transition">Workspace</Link>
            <Link href="/admin/products" className="text-[#9B704D] font-medium hover:underline">Admin Panel</Link>
          </nav>

          <div className="flex items-center gap-4 text-xs uppercase tracking-widest font-medium">
            <Link href="/account" className="hover:text-[#9B704D] transition">
              {currentUser ? currentUser.name : 'Login'}
            </Link>
            <Link 
              href="/cart" 
              className="bg-[#242424] text-[#F8F7F3] px-4 py-2.5 hover:bg-[#9B704D] transition"
            >
              Bag ({totalCartCount})
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-b border-[#E2DDD5]">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9B704D] font-semibold block">
            Sustainable Teak & Sheesham Timber
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-light leading-tight text-[#242424]">
            Sculpted for Modern Living, Rooted in Bangladeshi Craftsmanship.
          </h1>
          <p className="text-sm md:text-base text-[#555555] font-light leading-relaxed max-w-xl">
            Discover minimalist wooden home decor, ergonomic kitchen accessories, and bespoke workspace organizers crafted by master wood artisans.
          </p>
          <div className="pt-4 flex flex-wrap gap-4 items-center">
            <Link 
              href="/shop" 
              className="bg-[#9B704D] text-white px-8 py-4 text-xs uppercase tracking-widest font-medium hover:bg-amber-800 transition"
            >
              Explore Full Catalog
            </Link>
            <Link 
              href="/account" 
              className="border border-[#242424] px-6 py-4 text-xs uppercase tracking-widest font-medium hover:bg-[#242424] hover:text-white transition"
            >
              Track Your Order &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white p-4 border border-[#E2DDD5] shadow-sm">
          <div className="h-[380px] md:h-[460px] overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1000&q=80" 
              alt="Craftiq Wooden Masterpiece" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-b border-[#E2DDD5]">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#9B704D] font-semibold">Curated Collections</span>
            <h2 className="font-serif text-3xl md:text-4xl font-light mt-1">Designed for Every Corner</h2>
          </div>
          <Link href="/shop" className="text-xs uppercase tracking-widest text-[#9B704D] hover:underline font-medium">
            View All Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/shop?category=Home+Decor" className="bg-white border border-[#E2DDD5] p-8 hover:border-[#9B704D] transition group">
            <span className="text-xs font-mono text-[#777777]">01 / Living</span>
            <h3 className="font-serif text-2xl font-light mt-2 mb-3 group-hover:text-[#9B704D] transition">Wooden Home Decor</h3>
            <p className="text-xs text-[#555555] leading-relaxed mb-6">Aesthetic wall panels, minimalist trays, and sculptural candle holders.</p>
            <span className="text-xs uppercase tracking-widest font-medium text-[#242424] group-hover:text-[#9B704D]">Explore Collection &rarr;</span>
          </Link>

          <Link href="/shop?category=Kitchen" className="bg-white border border-[#E2DDD5] p-8 hover:border-[#9B704D] transition group">
            <span className="text-xs font-mono text-[#777777]">02 / Kitchen</span>
            <h3 className="font-serif text-2xl font-light mt-2 mb-3 group-hover:text-[#9B704D] transition">Kitchen Accessories</h3>
            <p className="text-xs text-[#555555] leading-relaxed mb-6">Hand-turned wooden bowls, spice racks, and end-grain cutting boards.</p>
            <span className="text-xs uppercase tracking-widest font-medium text-[#242424] group-hover:text-[#9B704D]">Explore Collection &rarr;</span>
          </Link>

          <Link href="/shop?category=Workspace" className="bg-white border border-[#E2DDD5] p-8 hover:border-[#9B704D] transition group">
            <span className="text-xs font-mono text-[#777777]">03 / Workspace</span>
            <h3 className="font-serif text-2xl font-light mt-2 mb-3 group-hover:text-[#9B704D] transition">Desk & Organizers</h3>
            <p className="text-xs text-[#555555] leading-relaxed mb-6">Ergonomic monitor stands, docking stations, and minimalist pen holders.</p>
            <span className="text-xs uppercase tracking-widest font-medium text-[#242424] group-hover:text-[#9B704D]">Explore Collection &rarr;</span>
          </Link>
        </div>
      </section>

      {/* Live Featured Products from Database */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#9B704D] font-semibold">Signature Pieces</span>
            <h2 className="font-serif text-3xl md:text-4xl font-light mt-1">Featured Handcrafted Products</h2>
          </div>
          <Link href="/shop" className="text-xs uppercase tracking-widest text-[#9B704D] hover:underline font-medium">
            Browse All ({products.length}) &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white border border-[#E2DDD5] group overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="bg-[#E9E2D5]/30 h-64 w-full flex items-center justify-center relative overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <span className="text-xs font-mono uppercase text-[#777777]">[ Wood Image ]</span>
                )}
                <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#9B704D] font-medium border border-[#E2DDD5]">
                  {product.category?.name || 'Woodcraft'}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-serif text-xl font-light text-[#242424] group-hover:text-[#9B704D] transition">
                    {product.name}
                  </h3>
                  <p className="text-sm font-medium text-[#9B704D] mt-1">৳{Number(product.price).toLocaleString()}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E2DDD5] grid grid-cols-2 gap-2">
                  <Link 
                    href={`/shop/${product.slug}`}
                    className="text-center bg-[#242424] text-[#F8F7F3] py-2.5 text-[10px] uppercase tracking-widest font-medium hover:bg-[#9B704D] transition"
                  >
                    Details
                  </Link>
                  <Link 
                    href={`/campaign/${product.slug}`}
                    className="text-center border border-[#9B704D] text-[#9B704D] py-2.5 text-[10px] uppercase tracking-widest font-medium hover:bg-[#9B704D] hover:text-white transition"
                  >
                    ⚡ Buy Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}