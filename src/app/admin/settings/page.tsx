import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import Link from 'next/link';

export default async function AdminSettingsPage() {
  let settings: any = null;
  try {
    settings = await prisma.settings.get();
  } catch (error) {
    console.error('Error fetching settings:', error);
  }

  // Save Settings Server Action
  async function handleSaveSettings(formData: FormData) {
    'use server';
    const storeName = formData.get('storeName') as string;
    const whatsappNumber = formData.get('whatsappNumber') as string;
    const steadfastApiKey = formData.get('steadfastApiKey') as string;
    const steadfastSecretKey = formData.get('steadfastSecretKey') as string;
    const fbPixelId = formData.get('fbPixelId') as string;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Logo Image Handler
    let logoUrl = settings?.logo || '';
    const logoFile = formData.get('logoFile') as File;
    if (logoFile && logoFile.size > 0) {
      try {
        const bytes = await logoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueName = `${Date.now()}-logo-${logoFile.name.replace(/\s+/g, '_')}`;
        await writeFile(path.join(uploadDir, uniqueName), buffer);
        logoUrl = `/uploads/${uniqueName}`;
      } catch (err) {
        console.error('Error uploading logo:', err);
      }
    } else {
      const logoInput = formData.get('logoInput') as string;
      if (logoInput) logoUrl = logoInput;
    }

    // Cover Banner Handler
    let bannerUrl = settings?.heroBanner || '';
    const bannerFile = formData.get('bannerFile') as File;
    if (bannerFile && bannerFile.size > 0) {
      try {
        const bytes = await bannerFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueName = `${Date.now()}-banner-${bannerFile.name.replace(/\s+/g, '_')}`;
        await writeFile(path.join(uploadDir, uniqueName), buffer);
        bannerUrl = `/uploads/${uniqueName}`;
      } catch (err) {
        console.error('Error uploading banner:', err);
      }
    } else {
      const bannerInput = formData.get('bannerInput') as string;
      if (bannerInput) bannerUrl = bannerInput;
    }

    try {
      await prisma.settings.update({
        storeName,
        whatsappNumber,
        logo: logoUrl,
        heroBanner: bannerUrl,
        steadfastApiKey,
        steadfastSecretKey,
        fbPixelId,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }

    revalidatePath('/admin/settings');
    revalidatePath('/');
    revalidatePath('/shop');
  }

  return (
    <div className="space-y-10 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E2DDD5] pb-6 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#9B704D] font-semibold">Store Configuration</span>
          <h1 className="font-serif text-3xl font-light text-[#242424] mt-1">General Settings & APIs</h1>
          <p className="text-xs text-[#666666] mt-1">লোগো, ব্যানার, হোয়াটসঅ্যাপ এবং কুরিয়ার API কনফিগারেশন ম্যানেজ করুন।</p>
        </div>
        <Link
          href="/admin"
          className="border border-[#242424] px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-[#242424] hover:text-white transition"
        >
          &larr; Dashboard
        </Link>
      </div>

      <div className="bg-white border border-[#E2DDD5] p-6 md:p-10 shadow-sm">
        <form action={handleSaveSettings} className="space-y-8">
          
          {/* General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777] mb-2 font-semibold">Store Name *</label>
              <input
                type="text"
                name="storeName"
                defaultValue={settings?.storeName || 'Craftiq'}
                required
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777] mb-2 font-semibold">WhatsApp Number *</label>
              <input
                type="text"
                name="whatsappNumber"
                defaultValue={settings?.whatsappNumber || '8801700000000'}
                required
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-[#F8F7F3]/60 p-5 border border-[#E2DDD5] space-y-3">
            <label className="block text-xs uppercase tracking-wider text-[#242424] font-bold">
              Store Logo Image (Recommended: 180 × 60 px, Transparent PNG)
            </label>
            <input type="file" name="logoFile" accept="image/*" className="w-full border border-[#E2DDD5] p-2 text-xs bg-white" />
            <input
              type="text"
              name="logoInput"
              defaultValue={settings?.logo || ''}
              placeholder="অথবা লোগো ইমেজ পাথ / URL দিন..."
              className="w-full border border-[#E2DDD5] px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#9B704D]"
            />
            {settings?.logo && (
              <div className="w-32 h-12 bg-white border border-[#E2DDD5] p-1 flex items-center justify-center">
                <img src={settings.logo} alt="Logo" className="max-h-full object-contain" />
              </div>
            )}
          </div>

          {/* Cover Banner Upload */}
          <div className="bg-[#F8F7F3]/60 p-5 border border-[#E2DDD5] space-y-3">
            <label className="block text-xs uppercase tracking-wider text-[#242424] font-bold">
              Home Cover Banner Image (Recommended: 1200 × 500 px, Landscape)
            </label>
            <input type="file" name="bannerFile" accept="image/*" className="w-full border border-[#E2DDD5] p-2 text-xs bg-white" />
            <input
              type="text"
              name="bannerInput"
              defaultValue={settings?.heroBanner || ''}
              placeholder="অথবা ব্যানার ইমেজ পাথ / URL দিন..."
              className="w-full border border-[#E2DDD5] px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#9B704D]"
            />
            {settings?.heroBanner && (
              <div className="w-48 h-20 bg-white border border-[#E2DDD5] overflow-hidden">
                <img src={settings.heroBanner} alt="Banner" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* API Credentials */}
          <div className="border-t border-[#E2DDD5] pt-6 space-y-6">
            <h3 className="font-serif text-xl font-light text-[#242424]">Courier & Marketing APIs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#777] mb-2 font-semibold">Steadfast API Key</label>
                <input
                  type="text"
                  name="steadfastApiKey"
                  defaultValue={settings?.steadfastApiKey || ''}
                  className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#777] mb-2 font-semibold">Steadfast Secret Key</label>
                <input
                  type="text"
                  name="steadfastSecretKey"
                  defaultValue={settings?.steadfastSecretKey || ''}
                  className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#777] mb-2 font-semibold">Facebook Pixel ID</label>
              <input
                type="text"
                name="fbPixelId"
                defaultValue={settings?.fbPixelId || ''}
                className="w-full border border-[#E2DDD5] px-4 py-3 text-sm bg-[#F8F7F3]/40 focus:outline-none focus:border-[#9B704D]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-[#242424] text-white px-10 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-[#9B704D] transition cursor-pointer shadow-sm"
            >
              Save Changes &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}