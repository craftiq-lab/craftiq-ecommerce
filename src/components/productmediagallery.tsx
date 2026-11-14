'use client';

import { useState } from 'react';

interface MediaGalleryProps {
  mainImage?: string;
  gallery?: string[];
  videoUrl?: string;
  productName: string;
  categoryName?: string;
}

export default function ProductMediaGallery({
  mainImage,
  gallery = [],
  videoUrl,
  productName,
  categoryName,
}: MediaGalleryProps) {
  const allImages = [mainImage, ...(Array.isArray(gallery) ? gallery : [])].filter(Boolean) as string[];
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; url: string }>({
    type: 'image',
    url: allImages[0] || '',
  });

  // YouTube লিংক থাকলে সেটিকে Embed লিংকে রূপান্তর করা
  const getEmbedUrl = (url: string) => {
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

  return (
    <div className="space-y-4">
      {/* Main Display Box */}
      <div className="bg-white border border-[#E2DDD5] p-4 md:p-6 shadow-sm">
        <div className="h-[380px] md:h-[500px] w-full overflow-hidden relative bg-[#E9E2D5]/20 flex items-center justify-center">
          {activeMedia.type === 'video' && activeMedia.url ? (
            activeMedia.url.includes('youtube.com') || activeMedia.url.includes('youtu.be') ? (
              <iframe
                src={getEmbedUrl(activeMedia.url)}
                title={productName}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={activeMedia.url} controls autoPlay className="w-full h-full object-cover" />
            )
          ) : activeMedia.url ? (
            <img
              src={activeMedia.url}
              alt={productName}
              className="w-full h-full object-cover transition duration-500"
            />
          ) : (
            <span className="text-xs font-mono uppercase text-[#777777]">[ Wood Product Image ]</span>
          )}

          <div className="absolute top-4 left-4 bg-white/95 px-3 py-1 text-[11px] uppercase tracking-wider text-[#9B704D] font-medium border border-[#E2DDD5]">
            {categoryName || 'Handcrafted Wood'}
          </div>
        </div>
      </div>

      {/* Thumbnails Row (Images + Video Button) */}
      {(allImages.length > 1 || videoUrl) && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {allImages.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveMedia({ type: 'image', url: imgUrl })}
              className={`w-20 h-20 border flex-shrink-0 overflow-hidden bg-white p-1 transition cursor-pointer ${
                activeMedia.type === 'image' && activeMedia.url === imgUrl
                  ? 'border-[#9B704D] ring-1 ring-[#9B704D]'
                  : 'border-[#E2DDD5] opacity-70 hover:opacity-100'
              }`}
            >
              <img src={imgUrl} alt={`${productName} thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}

          {videoUrl && (
            <button
              type="button"
              onClick={() => setActiveMedia({ type: 'video', url: videoUrl })}
              className={`w-20 h-20 border flex-shrink-0 flex flex-col items-center justify-center bg-[#242424] text-white text-[10px] uppercase tracking-widest transition cursor-pointer ${
                activeMedia.type === 'video'
                  ? 'border-[#9B704D] ring-2 ring-[#9B704D]'
                  : 'border-[#242424] opacity-85 hover:opacity-100'
              }`}
            >
              <span className="text-lg text-[#9B704D]">▶</span>
              <span className="mt-0.5 text-[9px]">Video</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}