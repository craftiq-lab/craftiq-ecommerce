import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export default async function AdminProductsPage() {
  let products: any[] = [];
  try {
    products = await (prisma.product as any).findMany({
      orderBy: { id: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  // Server action to add new product with full file upload support
  async function handleAddProduct(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `product-${Date.now()}`;
    const price = Number(formData.get('price')) || 0;
    const compareAtPrice = Number(formData.get('compareAtPrice')) || 0;
    const stock = Number(formData.get('stock')) || 20;
    const categoryName = formData.get('category') as string || 'Home Decor';
    
    const woodType = formData.get('woodType') as string;
    const finish = formData.get('finish') as string;
    const dimensions = formData.get('dimensions') as string;
    const description = formData.get('description') as string;
    const careInstructions = formData.get('careInstructions') as string;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // 1. Handle Main Image (File or URL)
    let imageUrl = '';
    const imageFile = formData.get('imageFile') as File;
    if (imageFile && imageFile.size > 0) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueName = `${Date.now()}-main-${imageFile.name.replace(/\s+/g, '_')}`;
        await writeFile(path.join(uploadDir, uniqueName), buffer);
        imageUrl = `/uploads/${uniqueName}`;
      } catch (err) {
        console.error('Error uploading main image:', err);
      }
    } else {
      imageUrl = formData.get('imageUrl') as string || 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=800';
    }

    // 2. Handle Multiple Gallery Images (Files + Text URLs)
    let gallery: string[] = [];
    const galleryFiles = formData.getAll('galleryFiles') as File[];
    if (galleryFiles && galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        if (file && file.size > 0) {
          try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uniqueName = `${Date.now()}-gallery-${file.name.replace(/\s+/g, '_')}`;
            await writeFile(path.join(uploadDir, uniqueName), buffer);
            gallery.push(`/uploads/${uniqueName}`);
          } catch (err) {
            console.error('Error uploading gallery file:', err);
          }
        }
      }
    }

    const galleryInput = formData.get('galleryInput') as string;
    if (galleryInput) {
      const urlLines = galleryInput.split('\n').map((url) => url.trim()).filter(Boolean);
      gallery.push(...urlLines);
    }

    // 3. Handle Video (File or URL)
    let videoUrl = formData.get('videoUrl') as string;
    const videoFile = formData.get('videoFile') as File;
    if (videoFile && videoFile.size > 0) {
      try {
        const bytes = await videoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueName = `${Date.now()}-video-${videoFile.name.replace(/\s+/g, '_')}`;
        await writeFile(path.join(uploadDir, uniqueName), buffer);
        videoUrl = `/uploads/${uniqueName}`;
      } catch (err) {
        console.error('Error uploading video file:', err);
      }
    }

    try {
      await (prisma.product as any).create({
        data: {
          name,
          slug,
          price,
          compareAtPrice,
          stock,
          image: imageUrl,
          gallery,
          description,
          careInstructions,
          woodType,
          finish,
          dimensions,
          videoUrl,
          category: {
            connectOrCreate: {
              where: { name: categoryName },
              create: { name: categoryName, slug: categoryName.toLowerCase().replace(/\s+/g, '-') },
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating product:', error);
    }

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath('/');
  }

  // Server action to delete product
  async function handleDeleteProduct(formData: FormData) {
    'use server';
    const productId = formData.get('productId') as string;
    try {
      await (prisma.product as any).delete({
        where: { id: productId },
      });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath('/');
  }

  return (
    <div className="space-y-12 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E2DDD5] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#9B704D] font-semibold">Inventory Control Center</span>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-[#242424] mt-1">Product Management & Media</h1>
          <p className="text-xs text-[#666666] mt-1">সরাসরি ফাইল আপলোড করে একাধিক গ্যালারি ইমেজ, ভিডিও এবং সমস্ত বিবরণ সহ মাস্টারপিস পাবলিশ করুন।</p>
        </div>
        <Link
          href="/admin"
          className="border border-[#242424] text-[#242424] px-5 py-2.5 text-xs uppercase tracking-widest font-medium hover:bg-[#242424] hover:text-white transition"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Add New Product Form Section */}
      <div className="bg-white border border-[#E2DDD5] p-6 md:p-10 shadow-sm space-y-8">
        <div className="border-b border-[#E2DDD5] pb-4">
          <h2 className="font-serif text-2xl font-light text-[#242424]">+ Add New Artisan Masterpiece</h2>
          <p className="text-xs text-[#777777]">ফাইল আপলোড এবং গ্যালারি কনফিগারেশন সহ ফর্মটি পূরণ করুন।</p>
        </div>

        <form action={handleAddProduct} className="space-y-6">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777777] mb-2 font-semibold">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="যেমন: Solid Teak Wood Perpetual Calendar"
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777777] mb-2 font-semibold">Category *</label>
              <select
                name="category"
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              >
                <option value="Home Decor">Home Decor</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Workspace">Workspace</option>
                <option value="Furniture">Furniture</option>
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777777] mb-2 font-semibold">Regular Price (৳) *</label>
              <input
                type="number"
                name="price"
                required
                placeholder="1500"
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777777] mb-2 font-semibold">Compare At Price (৳)</label>
              <input
                type="number"
                name="compareAtPrice"
                placeholder="2000 (Discount দেখানোর জন্য)"
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777777] mb-2 font-semibold">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                defaultValue={20}
                required
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>
          </div>

          {/* Wood Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777777] mb-2 font-semibold">Wood / Timber Type</label>
              <input
                type="text"
                name="woodType"
                placeholder="যেমন: Chittagong Teak"
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777777] mb-2 font-semibold">Finish & Polish</label>
              <input
                type="text"
                name="finish"
                placeholder="যেমন: Natural Beeswax"
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777777] mb-2 font-semibold">Dimensions</label>
              <input
                type="text"
                name="dimensions"
                placeholder="যেমন: 10 x 6 inches"
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>
          </div>

          {/* Main Image & Video Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F8F7F3]/60 p-5 border border-[#E2DDD5]">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#242424] mb-2 font-bold">
                1. Main Product Image *
              </label>
              <input type="file" name="imageFile" accept="image/*" className="w-full border border-[#E2DDD5] p-2 text-xs bg-white mb-2" />
              <input
                type="url"
                name="imageUrl"
                placeholder="অথবা মেইন ইমেজ URL দিন..."
                className="w-full border border-[#E2DDD5] px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#9B704D]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#242424] mb-2 font-bold">
                2. Product Video (File Upload or URL)
              </label>
              <input type="file" name="videoFile" accept="video/*" className="w-full border border-[#E2DDD5] p-2 text-xs bg-white mb-2" />
              <input
                type="url"
                name="videoUrl"
                placeholder="অথবা YouTube / Video URL দিন..."
                className="w-full border border-[#E2DDD5] px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#9B704D]"
              />
            </div>
          </div>

          {/* Gallery Images (Multiple File Uploads) */}
          <div className="bg-[#F8F7F3]/60 p-5 border border-[#E2DDD5]">
            <label className="block text-xs uppercase tracking-wider text-[#242424] mb-2 font-bold">
              3. Additional Gallery Images (Multiple File Uploads)
            </label>
            <input 
              type="file" 
              name="galleryFiles" 
              accept="image/*" 
              multiple 
              className="w-full border border-[#E2DDD5] p-2 text-xs bg-white mb-3" 
            />
            <span className="text-[11px] text-[#777777] block mb-2">আপনি একসাথে একাধিক ছবি সিলেক্ট (Ctrl বা Shift চেপে) করে আপলোড করতে পারেন। অথবা নিচে প্রতি লাইনে একটি করে URL দিতে পারেন:</span>
            <textarea
              name="galleryInput"
              rows={2}
              placeholder="অথবা গ্যালারি ইমেজের URL প্রতি লাইনে একটি করে দিন..."
              className="w-full border border-[#E2DDD5] px-4 py-2 text-xs font-mono bg-white focus:outline-none focus:border-[#9B704D]"
            />
          </div>

          {/* Description & Care Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777777] mb-2 font-semibold">Product Description *</label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="প্রোডাক্টের বিস্তারিত বিবরণ লিখুন..."
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777777] mb-2 font-semibold">Wood Care Instructions</label>
              <textarea
                name="careInstructions"
                rows={4}
                placeholder="প্রতি লাইনে একেকটি কেয়ার গাইডলাইন লিখুন..."
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-[#242424] text-white px-10 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#9B704D] transition cursor-pointer shadow-sm"
            >
              Publish Masterpiece &rarr;
            </button>
          </div>
        </form>
      </div>

      {/* Existing Products List */}
      <div className="bg-white border border-[#E2DDD5] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E2DDD5] bg-[#F8F7F3]/50">
          <h2 className="font-serif text-xl font-light text-[#242424]">All Store Products ({products.length})</h2>
          <p className="text-xs text-[#777777] mt-0.5">আপনার স্টোরে বর্তমানে সচল থাকা মাস্টারপিস সমূহের তালিকা</p>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-serif text-lg text-[#555555]">কোনো প্রডাক্ট পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F7F3] border-b border-[#E2DDD5] text-[#777777] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Image</th>
                  <th className="py-3 px-4 font-semibold">Product Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Stock</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD5]">
                {products.map((item: any) => (
                  <tr key={item.id} className="hover:bg-[#F8F7F3]/40 transition">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 bg-gray-100 border border-[#E2DDD5] overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] flex items-center justify-center h-full text-gray-400">No Img</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#242424] max-w-xs truncate">{item.name}</td>
                    <td className="py-3 px-4 text-[#777777]">{item.category?.name || 'Woodcraft'}</td>
                    <td className="py-3 px-4 font-medium text-[#9B704D]">৳{Number(item.price).toLocaleString()}</td>
                    <td className="py-3 px-4 text-[#555555]">{item.stock} pcs</td>
                    
                    {/* Fixed Actions Layout */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <Link
                          href={`/campaign/${item.slug}`}
                          target="_blank"
                          className="bg-[#9B704D] text-white px-2.5 py-1.5 text-[10px] uppercase tracking-wider hover:bg-amber-800 transition"
                        >
                          Landing
                        </Link>
                        <Link
                          href={`/shop/${item.slug}`}
                          target="_blank"
                          className="border border-[#242424] px-2.5 py-1.5 text-[10px] uppercase tracking-wider hover:bg-[#242424] hover:text-white transition"
                        >
                          Shop
                        </Link>
                        <form action={handleDeleteProduct} className="inline-block">
                          <input type="hidden" name="productId" value={item.id} />
                          <button
                            type="submit"
                            className="bg-red-50 border border-red-200 text-red-600 px-2.5 py-1.5 text-[10px] uppercase tracking-wider hover:bg-red-600 hover:text-white transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}