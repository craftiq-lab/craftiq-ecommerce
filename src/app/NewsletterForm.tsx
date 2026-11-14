'use client';

export default function NewsletterForm() {
  return (
    <form 
      onSubmit={(e) => { 
        e.preventDefault(); 
        alert('Thank you for subscribing to Craftiq!'); 
      }} 
      className="flex gap-2"
    >
      <input 
        type="email" 
        required
        placeholder="Your email address" 
        className="bg-[#2A2A2A] border border-[#444444] px-3.5 py-2.5 text-xs text-white w-full focus:outline-none focus:border-[#9B704D]"
      />
      <button 
        type="submit" 
        className="bg-[#9B704D] text-white px-4 text-xs uppercase tracking-widest hover:bg-amber-800 transition shrink-0 cursor-pointer"
      >
        Join
      </button>
    </form>
  );
}