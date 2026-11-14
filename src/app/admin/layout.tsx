import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242424] flex flex-col">
      {/* Admin Top Navigation Header */}
      <header className="bg-[#242424] text-white border-b border-[#333333] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-serif text-2xl tracking-widest font-light text-white">
              CRAFTIQ <span className="text-xs uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37] px-2 py-0.5 ml-2 font-sans font-normal">Admin</span>
            </Link>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-widest font-medium text-gray-300">
            <Link href="/admin" className="hover:text-white transition">Dashboard</Link>
            <Link href="/admin/products" className="hover:text-white transition">Products</Link>
            <Link href="/admin/orders" className="hover:text-white transition">Orders</Link>
            <Link href="/admin/reports" className="text-[#D4AF37] hover:text-white transition">Reports</Link>
            <Link href="/admin/settings" className="hover:text-white transition">Settings</Link>
            <Link 
              href="/" 
              target="_blank" 
              className="bg-[#9B704D] text-white px-4 py-2 hover:bg-amber-800 transition rounded-none"
            >
              Live Store &rarr;
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Admin Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-[#E2DDD5] py-6 text-center text-xs text-[#777777]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p>&copy; {new Date().getFullYear()} Craftiq Enterprise Control Panel. All rights reserved.</p>
          <p className="text-[#9B704D] font-medium uppercase tracking-widest text-[10px]">Secure D2C Management System</p>
        </div>
      </footer>
    </div>
  );
}