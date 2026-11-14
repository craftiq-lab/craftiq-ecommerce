import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import "./globals.css";

const serifFont = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CRAFTIQ | Handcrafted Wooden Masterpieces",
  description: "Minimalist wooden home decor and accessories in Bangladesh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${serifFont.variable} ${sansFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8F7F3] text-[#242424] font-sans selection:bg-[#9B704D] selection:text-white">
        {/* Main Content */}
        <div className="flex-grow">{children}</div>

        {/* Global Footer Section */}
        <footer className="bg-[#1C1C1C] text-[#F8F7F3] pt-16 pb-12 border-t border-[#333333]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand Info */}
            <div className="space-y-4">
              <h3 className="font-serif text-3xl font-light tracking-widest">CRAFTIQ</h3>
              <p className="text-xs text-[#AAAAAA] font-light leading-relaxed">
                Handcrafted wooden masterpieces sculpted from sustainable Teak and Sheesham timber by master artisans in Bangladesh.
              </p>
              <p className="text-xs font-mono text-[#9B704D]">Hotline: +880 134 122 5315</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#9B704D] font-semibold mb-4">Quick Navigation</h4>
              <ul className="space-y-2.5 text-xs tracking-wider font-light text-[#AAAAAA]">
                <li><Link href="/shop" className="hover:text-white transition">All Catalog</Link></li>
                <li><Link href="/shop?category=Home+Decor" className="hover:text-white transition">Home Decor</Link></li>
                <li><Link href="/shop?category=Kitchen" className="hover:text-white transition">Kitchen & Dining</Link></li>
                <li><Link href="/shop?category=Workspace" className="hover:text-white transition">Workspace & Desk</Link></li>
                <li><Link href="/account" className="hover:text-white transition">Customer Account / Orders</Link></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#9B704D] font-semibold mb-4">Customer Care</h4>
              <ul className="space-y-2.5 text-xs tracking-wider font-light text-[#AAAAAA]">
                <li><span className="hover:text-white transition cursor-pointer">Cash on Delivery Available</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Nationwide Courier (Steadfast / Pathao)</span></li>
                <li><span className="hover:text-white transition cursor-pointer">5-Year Structural Warranty</span></li>
                <li><Link href="/admin" className="text-[#9B704D] hover:underline">Admin Portal Access</Link></li>
              </ul>
            </div>

            {/* Newsletter Subscription */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#9B704D] font-semibold mb-4">Exclusive Newsletter</h4>
              <p className="text-xs text-[#AAAAAA] font-light mb-4 leading-relaxed">
                Subscribe to receive private previews of new artisan collections and seasonal coupon codes.
              </p>
              <NewsletterForm />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-[#333333] flex flex-col md:flex-row justify-between items-center text-xs text-[#888888] font-light">
            <p>&copy; 2026 CRAFTIQ Bangladesh. All rights reserved. Handcrafted with pride.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
              <span className="hover:text-white cursor-pointer">Shipping & Returns</span>
            </div>
          </div>
        </footer>

        {/* Floating WhatsApp Chat Button */}
        <a 
          href="https://wa.me/8801341225315?text=Hello%20Craftiq,%20I%20want%20to%20know%20more%20about%20your%20wooden%20products."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition duration-300 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.57 6.57 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.558 6.558 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.348.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34l-.38-.007c-.133 0-.348.05-.53.247-.183.198-.703.688-7.03 1.686 0 1.075.783 2.112.893 2.251.114.133 1.54 2.352 3.731 3.296.522.225.928.36 1.246.463.524.168 1.001.144 1.379.088.42-.063 1.17-.478 1.338-.94.17-.462.17-.858.119-.94-.05-.082-.183-.133-.38-.232z"/>
          </svg>
          <span className="absolute right-16 bg-white text-[#242424] text-[11px] font-medium px-3 py-1.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none whitespace-nowrap border border-[#E2DDD5]">
            Chat with us on WhatsApp
          </span>
        </a>
      </body>
    </html>
  );
}