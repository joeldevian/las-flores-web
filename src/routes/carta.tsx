import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNavigationMenu } from "@/components/SiteNavigationMenu";
import { categories as staticCategories } from "@/components/MenuModal";
import { SiteFooter } from "@/components/site-footer";
import { useLiveMenuCategories, Dish } from "@/lib/liveProducts";
import { CartSidebar } from "@/components/CartSidebar";

export const Route = createFileRoute("/carta")({
  head: () => ({
    meta: [
      { title: "Nuestra Carta — Restaurante Las Flores" },
      {
        name: "description",
        content:
          "Explore nuestra carta completa. Platos típicos de Ayacucho, recomendaciones del chef y más.",
      },
    ],
  }),
  component: CartaPage,
});

function CartaPage() {
  const { categories: liveCategories } = useLiveMenuCategories();
  const [activeId, setActiveId] = useState("desayuno");

  const currentCategories = liveCategories.length > 0 ? liveCategories : staticCategories;
  const active = currentCategories.find((c) => c.id === activeId) || currentCategories[0];

  return (
    <div className="min-h-screen bg-piedra text-nogal font-sans flex flex-col">
      {/* Sleek Top Nav Bar - Premium Style (Centered Logo) */}
      <nav className="bg-eucalipto text-piedra px-4 md:px-10 py-2 md:py-4 flex items-center justify-between shadow-md relative z-30">
        <div className="flex-1 flex justify-start">
          <SiteNavigationMenu isScrolled={false} />
        </div>

        <div className="flex-none">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 overflow-hidden flex-shrink-0 bg-white shadow-sm flex items-center justify-center p-1"
            style={{ borderColor: "var(--color-cream)" }}
          >
            <img src="/favicon.png" alt="Las Flores" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="flex-1 flex justify-end gap-6 md:gap-8">
          <Link
            to="/reservas"
            className="text-sm uppercase tracking-[0.15em] font-semibold hover:text-chilca transition-colors"
          >
            RESERVAS
          </Link>
        </div>
      </nav>

      {/* Page Title */}
      <div className="bg-piedra pt-10 pb-4 text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-nogal">Nuestra Carta</h1>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full flex-1">
        {/* Vertical Category Sidebar (Desktop) / Horizontal Tabs (Mobile) */}
        <aside className="w-full md:w-72 bg-piedra border-b md:border-b-0 md:border-r border-nogal/10 flex-shrink-0 md:sticky md:top-24 md:h-[calc(100vh-100px)] overflow-x-auto md:overflow-y-auto z-20 scrollbar-none">
          <div className="flex flex-row md:flex-col py-0 md:py-8 w-max min-w-full md:w-auto">
            {currentCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveId(cat.id);
                  if (window.innerWidth < 768) {
                    window.scrollTo({
                      top: document.getElementById("menu-content")?.offsetTop || 0,
                      behavior: "smooth",
                    });
                  }
                }}
                className={`text-center md:text-left whitespace-nowrap md:whitespace-normal px-6 md:px-8 py-4 md:py-4 text-xs font-bold uppercase tracking-[0.15em] transition-all border-b-4 md:border-b-0 md:border-l-4 ${
                  activeId === cat.id
                    ? "border-cochinilla text-cochinilla bg-cochinilla/5"
                    : "border-transparent text-nogal/50 hover:text-nogal hover:bg-nogal/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Menu Content */}
        <main id="menu-content" className="flex-1 p-6 md:p-12">
          <div className="flex justify-between items-end mb-8 border-b border-nogal/10 pb-4">
            <h2 className="font-serif text-3xl md:text-4xl text-nogal">{active.label}</h2>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-nogal/40 bg-nogal/5 px-4 py-2 rounded-full hidden sm:inline-block">
              {active.dishes.length} platos
            </span>
          </div>

          <div
            key={activeId}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {active.dishes.map((dish, i) => {
              return (
                <div
                  key={i}
                  className="bg-piedra border border-pacay/50 rounded-md overflow-hidden flex flex-col h-full shadow-md hover:shadow-xl transition-all duration-300 group hover:border-pacay"
                >
                  {dish.image ? (
                    <div className="h-48 overflow-hidden relative">
                      <div className="absolute inset-0 bg-nogal/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-nogal/5 flex items-center justify-center relative border-b border-pacay/30">
                      <span className="font-serif italic text-nogal/30 text-xl px-4 text-center">
                        {dish.name}
                      </span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <h3 className="text-base font-serif leading-tight text-nogal group-hover:text-cochinilla transition-colors">
                        {dish.name}
                      </h3>
                      <span className="text-adobe-new font-bold text-sm flex-shrink-0 tracking-wide bg-adobe-new/10 px-2 py-1 rounded-sm">
                        {dish.price}
                      </span>
                    </div>
                    <p className="text-nogal/70 text-xs flex-1 mb-4 leading-relaxed font-light">
                      {dish.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <SiteFooter />

      <CartSidebar />
    </div>
  );
}
