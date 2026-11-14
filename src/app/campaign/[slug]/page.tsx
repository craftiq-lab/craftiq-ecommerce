import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const product = await prisma.product.findFirst({
    where: { slug: resolvedParams.slug },
  });

  if (!product) {
    return { title: 'Special Offer | CRAFTIQ' };
  }

  const priceText = `৳${Number(product.price).toLocaleString()}`;
  return {
    title: `স্পেশাল অফার: ${product.name} — মাত্র ${priceText} | CRAFTIQ`,
    description: `১ টাকাও অগ্রিম দিতে হবে না! সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন: ${product.name}`,
    openGraph: {
      title: `🔥 অফার প্রাইস ${priceText} — ${product.name}`,
      description: `প্রোডাক্ট হাতে পেয়ে দেখে ডেলিভারি ম্যানকে পেমেন্ট করুন। ৫ বছরের ওয়ারেন্টিসহ সলিড কাঠের তৈরি।`,
      images: product.image ? [{ url: product.image, width: 1000, height: 1000, alt: product.name }] : [],
      type: 'website',
    },
  };
}

export default async function BoostLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams?: Promise<{ zone?: string; qty?: string; media?: string }> | { zone?: string; qty?: string; media?: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearch = searchParams ? await Promise.resolve(searchParams) : {};
  const slug = resolvedParams.slug;

  const product = await prisma.product.findFirst({
    where: { slug },
  });

  if (!product) {
    notFound();
  }

  const currentUser = await prisma.auth.getCurrentUser();
  const selectedZone = resolvedSearch?.zone === 'outside' ? 'outside' : 'inside';
  const selectedQty = Math.max(1, Number(resolvedSearch?.qty) || 1);
  const deliveryCharge = selectedZone === 'outside' ? 130 : 70;
  const subtotal = Number(product.price) * selectedQty;
  const totalPrice = subtotal + deliveryCharge;

  async function handleLandingPageOrder(formData: FormData) {
    'use server';

    const customerName = formData.get('customerName') as string;
    const phone = formData.get('phone') as string;
    const district = formData.get('district') as string;
    const thana = formData.get('thana') as string;
    const streetAddress = formData.get('streetAddress') as string;
    const orderNote = formData.get('orderNote') as string;
    const zone = formData.get('deliveryZone') as string;
    const quantity = Number(formData.get('quantity')) || 1;

    const fullAddress = `${streetAddress}, ${thana}`;
    const shippingFee = zone === 'outside' ? 130 : 70;
    const itemTotal = Number(product.price) * quantity;
    const finalTotal = itemTotal + shippingFee;

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
      items: [{ id: product.id, name: product.name, price: product.price, quantity }],
      total: finalTotal,
    });

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath('/account');

    redirect(`/cart?invoice=${encodeURIComponent(newOrder.id)}&success=true`);
  }

  // Gallery & Video setup
  const allImages = [
    product.image,
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ].filter(Boolean) as string[];

  const selectedMedia = resolvedSearch?.media || '0';
  const isVideoSelected = selectedMedia === 'video' && Boolean(product.videoUrl);
  const activeImageIndex = !isVideoSelected && !isNaN(Number(selectedMedia)) ? Number(selectedMedia) : 0;
  const currentImageUrl = allImages[activeImageIndex] || allImages[0] || '';

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const careList = product.careInstructions
    ? product.careInstructions.split('\n').filter((line: string) => line.trim() !== '')
    : [
        'Wipe gently with a soft, dry or slightly damp lint-free cloth.',
        'Avoid harsh chemical cleaners, direct sunlight, or soaking in water.',
        'Apply natural beeswax every 6 months to keep the wood grain rich and lustrous.',
      ];

  const hasDiscount = Number(product.compareAtPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424]">
      {/* Top Urgent Banner */}
      <div className="bg-[#242424] text-[#F8F7F3] text-center py-3 px-4 text-xs tracking-widest uppercase font-medium">
        🔥 স্পেশাল অফার! ১ টাকাও অগ্রিম দিতে হবে না — প্রোডাক্ট হাতে পেয়ে দেখে ডেলিভারি ম্যানকে পেমেন্ট করুন
      </div>

      <header className="border-b border-[#E2DDD5] bg-[#F8F7F3]/95 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-serif text-2xl tracking-widest font-light text-[#242424]">
            CRAFTIQ
          </Link>
          <Link href="/" className="text-xs uppercase tracking-widest text-[#777777] hover:text-[#242424]">
            &larr; Go Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        {/* Hero Banner Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <span className="inline-block bg-[#9B704D]/15 text-[#9B704D] border border-[#9B704D]/30 px-4 py-1 text-xs uppercase tracking-widest font-semibold">
            CRAFTIQ EXCLUSIVE WOODCRAFT
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light text-[#242424] leading-tight">
            {product.name}
          </h1>
          <p className="text-sm md:text-base text-[#555555] font-light leading-relaxed">
            {product.description}
          </p>
          <div className="flex justify-center items-baseline gap-4 pt-2">
            {hasDiscount && (
              <span className="text-lg text-[#888888] line-through">
                রেগুলার প্রাইস: ৳{Number(product.compareAtPrice).toLocaleString()}
              </span>
            )}
            <span className="text-2xl md:text-3xl font-bold text-[#9B704D]">
              অফার প্রাইস: ৳{Number(product.price).toLocaleString()}
            </span>
          </div>
          <div className="pt-3">
            <a
              href="#order-form"
              className="inline-block bg-[#9B704D] text-white px-10 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-amber-800 transition shadow-sm"
            >
              Order Now &darr;
            </a>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Daraz-Style Multi-Image Gallery & Video Viewer */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-[#E2DDD5] p-4 shadow-sm">
              <div className="h-[380px] md:h-[460px] w-full overflow-hidden relative bg-[#E9E2D5]/20 flex items-center justify-center">
                {isVideoSelected && product.videoUrl ? (
                  product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={getEmbedUrl(product.videoUrl)}
                      title={product.name}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={product.videoUrl} controls autoPlay className="w-full h-full object-cover" />
                  )
                ) : currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition duration-500"
                  />
                ) : (
                  <span className="text-xs font-mono uppercase text-[#777777]">[ Product Image ]</span>
                )}

                {hasDiscount && (
                  <div className="absolute top-4 right-4 bg-[#9B704D] text-white px-3 py-1 text-[11px] uppercase tracking-wider font-medium">
                    Save {discountPercent}%
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Row (Daraz Style Gallery Switcher) */}
            {(allImages.length > 1 || product.videoUrl) && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((imgUrl, idx) => (
                  <Link
                    key={idx}
                    href={`/campaign/${product.slug}?media=${idx}#order-form`}
                    scroll={false}
                    className={`w-20 h-20 border flex-shrink-0 overflow-hidden bg-white p-1 transition ${
                      !isVideoSelected && activeImageIndex === idx
                        ? 'border-[#9B704D] ring-2 ring-[#9B704D]'
                        : 'border-[#E2DDD5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </Link>
                ))}

                {product.videoUrl && (
                  <Link
                    href={`/campaign/${product.slug}?media=video#order-form`}
                    scroll={false}
                    className={`w-20 h-20 border flex-shrink-0 flex flex-col items-center justify-center bg-[#242424] text-white text-[10px] uppercase tracking-widest transition ${
                      isVideoSelected
                        ? 'border-[#9B704D] ring-2 ring-[#9B704D]'
                        : 'border-[#242424] opacity-85 hover:opacity-100'
                    }`}
                  >
                    <span className="text-lg text-[#9B704D]">▶</span>
                    <span className="mt-0.5 text-[9px]">Video</span>
                  </Link>
                )}
              </div>
            )}

            {/* Why Choose Us */}
            <div className="bg-white border border-[#E2DDD5] p-6 space-y-4 shadow-sm mt-6">
              <h3 className="font-serif text-2xl font-light text-[#242424] border-b border-[#E2DDD5] pb-3">
                কেন আমাদের এই কাঠের প্রোডাক্টটি নিবেন?
              </h3>
              <ul className="space-y-3 text-sm text-[#444444]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9B704D] font-bold">✓</span>
                  <span><strong>কাঠের ধরণ:</strong> {product.woodType || '১০০% সলিড সিজনড সেগুন ও পাইন কাঠ'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9B704D] font-bold">✓</span>
                  <span><strong>ফিনিশিং ও পলিশ:</strong> {product.finish || 'ন্যাচারাল অর্গানিক বিসওয়াক্স এবং ওয়াটার-রেজিস্ট্যান্ট পলিশ'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9B704D] font-bold">✓</span>
                  <span><strong>মাপ (Dimensions):</strong> {product.dimensions || 'স্ট্যান্ডার্ড প্রিমিয়াম সাইজ'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9B704D] font-bold">✓</span>
                  <span><strong>ওয়ারেন্টি:</strong> ঘুণ পোকা বা কাঠ বাঁকা হওয়ার বিরুদ্ধে ৫ বছরের গ্যারান্টি।</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9B704D] font-bold">✓</span>
                  <span><strong>ডেলিভারি:</strong> সারা বাংলাদেশে Steadfast কুরিয়ারের মাধ্যমে সম্পূর্ণ ক্যাশ অন ডেলিভারি।</span>
                </li>
              </ul>
            </div>

            {/* Wood Care Guide */}
            <div className="bg-white border border-[#E2DDD5] p-5 space-y-2">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#9B704D]">Wood Care & Maintenance Guide</h3>
              <ul className="text-xs text-[#555555] space-y-1.5 list-disc pl-4">
                {careList.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Order Form */}
          <div className="lg:col-span-5 bg-white border-2 border-[#9B704D] p-6 md:p-8 shadow-md sticky top-24 space-y-5" id="order-form">
            <div className="pb-4 border-b border-[#E2DDD5]">
              <span className="text-xs uppercase tracking-[0.2em] text-[#9B704D] font-bold">Express Checkout</span>
              <h2 className="font-serif text-2xl font-light mt-1 text-[#242424]">অর্ডার কনফার্ম করুন</h2>
              <p className="text-xs text-[#666666] mt-1">প্রোডাক্ট হাতে পেয়ে পেমেন্ট করুন (Cash on Delivery)</p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#777777] mb-2">ডেলিভারি জোন সিলেক্ট করুন *</label>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/campaign/${product.slug}?zone=inside&qty=${selectedQty}&media=${selectedMedia}#order-form`}
                  scroll={false}
                  className={`p-3 border text-center text-xs uppercase tracking-wider font-semibold transition ${
                    selectedZone === 'inside'
                      ? 'border-[#9B704D] bg-[#9B704D] text-white'
                      : 'border-[#E2DDD5] bg-[#F8F7F3] text-[#444444]'
                  }`}
                >
                  ঢাকার ভেতরে (৳৭০)
                </Link>
                <Link
                  href={`/campaign/${product.slug}?zone=outside&qty=${selectedQty}&media=${selectedMedia}#order-form`}
                  scroll={false}
                  className={`p-3.5 border text-center text-xs uppercase tracking-wider font-semibold transition ${
                    selectedZone === 'outside'
                      ? 'border-[#9B704D] bg-[#9B704D] text-white'
                      : 'border-[#E2DDD5] bg-[#F8F7F3] text-[#444444]'
                  }`}
                >
                  ঢাকার বাইরে (৳১৩০)
                </Link>
              </div>
            </div>

            <form action={handleLandingPageOrder} className="space-y-4">
              <input type="hidden" name="deliveryZone" value={selectedZone} />

              <div>
                <label className="block text-xs font-medium text-[#242424] mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  defaultValue={currentUser?.name || ''}
                  placeholder="পূর্ণ নাম লিখুন"
                  className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/50 focus:outline-none focus:border-[#9B704D]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#242424] mb-1">মোবাইল নম্বর (১১ ডিজিট) *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  defaultValue={currentUser?.phone || ''}
                  placeholder="017XXXXXXXX"
                  className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/50 focus:outline-none focus:border-[#9B704D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#242424] mb-1">জেলা *</label>
                  <input
                    type="text"
                    name="district"
                    required
                    defaultValue={currentUser?.district || (selectedZone === 'inside' ? 'Dhaka' : '')}
                    placeholder="যেমন: ঢাকা"
                    className="w-full border border-[#E2DDD5] px-3 py-2.5 text-sm bg-[#F8F7F3]/50 focus:outline-none focus:border-[#9B704D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#242424] mb-1">থানা / এরিয়া *</label>
                  <input
                    type="text"
                    name="thana"
                    required
                    defaultValue={currentUser?.thana || ''}
                    placeholder="যেমন: মিরপুর"
                    className="w-full border border-[#E2DDD5] px-3 py-2.5 text-sm bg-[#F8F7F3]/50 focus:outline-none focus:border-[#9B704D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#242424] mb-1">বাসা ও রোড নম্বর *</label>
                <textarea
                  name="streetAddress"
                  required
                  rows={2}
                  defaultValue={currentUser?.address || ''}
                  placeholder="বাসা নং, রোড, এলাকা..."
                  className="w-full border border-[#E2DDD5] px-4 py-2 text-sm bg-[#F8F7F3]/50 focus:outline-none focus:border-[#9B704D]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#242424] mb-1">পরিমাণ (Quantity)</label>
                <input
                  type="number"
                  name="quantity"
                  defaultValue={selectedQty}
                  min={1}
                  max={20}
                  className="w-full border border-[#E2DDD5] px-4 py-2.5 text-sm bg-[#F8F7F3]/50 focus:outline-none focus:border-[#9B704D]"
                />
              </div>

              <div className="bg-[#F8F7F3] p-4 border border-[#E2DDD5] space-y-2 text-xs my-3">
                <div className="flex justify-between text-[#666666]">
                  <span>{product.name} (× {selectedQty})</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>ডেলিভারি চার্জ ({selectedZone === 'outside' ? 'ঢাকার বাইরে' : 'ঢাকার ভেতরে'})</span>
                  <span>৳{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#242424] pt-2 border-t border-[#E2DDD5]">
                  <span>সর্বমোট প্রদেয় (COD)</span>
                  <span className="text-[#9B704D]">৳{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#242424] text-white py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#9B704D] transition cursor-pointer shadow-sm"
              >
                Order Now (৳{totalPrice.toLocaleString()})
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}