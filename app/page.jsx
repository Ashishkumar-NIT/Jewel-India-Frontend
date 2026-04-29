import { getAllProducts } from "../lib/api/supabase-products";
import { getAuthUser } from "../lib/supabase/queries";
import { ProductCard } from "../components/product/ProductCard";
import { SignOutButton } from "../components/auth/SignOutButton";
import { Hero } from "../components/product/Hero";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Celestique | Timeless Jewelry",
  description: "A celestial touch for timeless moments.",
};

export const revalidate = 60;
export default async function HomePage() {
  // getAuthUser() is deduplicated by React.cache() — if layout already called it
  // this request, no additional /user network call is made.
  const user = await getAuthUser();

  // Hard gate: wholesalers must never see the retailer storefront.
  // Middleware handles it on first load; this catches any edge cases.
  if (user) {
    const role = user.user_metadata?.role;
    if (!role) redirect("/select-role");
    if (role === "wholesaler") redirect("/dashboard/wholesaler/add-product");
  }

  const products = await getAllProducts();

  return (
    <div className="min-h-screen bg-celestique-cream text-celestique-dark font-sans selection:bg-celestique-dark selection:text-celestique-cream">
      
      {/* ── Header ── */}
      <header className="w-full px-6 md:px-12 py-6 flex items-center justify-between text-[10px] uppercase tracking-[0.1em] font-medium border-b border-celestique-border/30">
        <div className="flex items-center gap-6">
          <span className="opacity-60">STUDIO CELESTIQUE</span>
        </div>
        
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <span className="hidden sm:block opacity-60">{user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <Link href="/signin" className="hover:opacity-70 transition-opacity">
              [ SIGN IN ]
            </Link>
          )}
        </div>
      </header>

      {/* ── Hero Section ── */}
      <Hero />

      {/* ── Philosophy Section ── */}
      <section className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-12">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-celestique-dark/40 block">
              / PHILOSOPHY
            </span>
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.1] tracking-tight text-celestique-dark italic">
              &quot;Every piece is living energy, enclosed in form.&quot;
            </h2>
            <p className="text-sm md:text-base text-celestique-dark/60 leading-relaxed font-sans max-w-md">
              We believe in the resonance between stone and spirit. Our jewelry isn&apos;t just worn; it&apos;s a conversation with the natural world, captured in gold and silver.
            </p>
            <div className="pt-8">
              <Link href="/signup" className="group text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-4 hover:gap-6 transition-all duration-300">
                Join our Inner Circle <span className="text-lg">&rarr;</span>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="mt-12 aspect-[3/4] overflow-hidden bg-celestique-taupe/20 rounded-sm">
                <img 
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop" 
                  alt="Crafting" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden bg-celestique-taupe/20 rounded-sm">
                <img 
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1887&auto=format&fit=crop" 
                  alt="The Result" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 cursor-pointer"
                />
              </div>
            </div>
            {/* Float badge */}
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-celestique-dark rounded-full flex items-center justify-center text-celestique-cream text-center p-4 transform -rotate-12 hidden md:flex">
              <span className="text-[9px] uppercase tracking-widest font-bold">Nature&apos;s Own Design 2025</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Products Section ── */}
      <section id="products" className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-celestique-dark/10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-celestique-dark/40">
              / THE COLLECTION
            </span>
            <h2 className="font-serif text-5xl md:text-7xl tracking-tighter text-celestique-dark uppercase">
              Curated <br/>Selection
            </h2>
          </div>
          <div className="max-w-xs">
            <p className="text-[11px] uppercase tracking-[0.1em] text-celestique-dark/60 leading-relaxed mb-6">
              A meticulously crafted series of rings, inspired by the raw textures of nature and the rhythmic flow of time.
            </p>
            <div className="flex gap-4">
              <button className="h-10 w-10 rounded-full border border-celestique-dark/10 flex items-center justify-center hover:bg-celestique-dark hover:text-celestique-cream transition-colors">
                &larr;
              </button>
              <button className="h-10 w-10 rounded-full border border-celestique-dark/10 flex items-center justify-center hover:bg-celestique-dark hover:text-celestique-cream transition-colors">
                &rarr;
              </button>
            </div>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center border border-celestique-border/30">
            <span className="font-serif text-4xl text-celestique-dark/40 mb-4">No pieces yet</span>
            <p className="text-[10px] tracking-[0.1em] uppercase opacity-60">
              Our artisans are currently crafting new designs.
            </p>
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-celestique-dark/10 pt-24 pb-12 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
          <div className="md:col-span-2 space-y-8">
            <div className="text-4xl font-serif tracking-tighter text-celestique-dark">CELESTIQUE</div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-celestique-dark/60 max-w-xs leading-relaxed">
              Timeless jewelry for the modern spirit. Handcrafted with precision and passion in our studio.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-celestique-dark">Explore</h4>
            <ul className="space-y-2 text-[10px] uppercase tracking-[0.1em] text-celestique-dark/60">
              <li><Link href="#products" className="hover:text-celestique-dark transition-colors">Collections</Link></li>
              <li><Link href="#" className="hover:text-celestique-dark transition-colors">Philosophy</Link></li>
              <li><Link href="#" className="hover:text-celestique-dark transition-colors">Bespoke</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-celestique-dark">Connect</h4>
            <ul className="space-y-2 text-[10px] uppercase tracking-[0.1em] text-celestique-dark/60">
              <li><Link href="#" className="hover:text-celestique-dark transition-colors">Instagram</Link></li>
              <li><Link href="#" className="hover:text-celestique-dark transition-colors">Telegram</Link></li>
              <li><Link href="#" className="hover:text-celestique-dark transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-celestique-dark/5 gap-4">
          <span className="text-[9px] uppercase tracking-[0.2em] text-celestique-dark/40">&copy; 2025 Studio Celestique. All rights reserved.</span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-celestique-dark/40 font-bold italic">Crafted by hand. Born from nature.</span>
        </div>
      </footer>
    </div>
  );
}
