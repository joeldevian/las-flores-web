import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { categories } from '@/components/MenuModal';
import { SiteFooter } from '@/components/site-footer';

export const Route = createFileRoute('/carta')({
  head: () => ({
    meta: [
      { title: 'Nuestra Carta — Restaurante Las Flores' },
      { name: 'description', content: 'Explore nuestra carta completa. Platos típicos de Ayacucho, recomendaciones del chef y más.' },
    ],
  }),
  component: CartaPage,
});

function CartaPage() {
  const [activeId, setActiveId] = useState(categories[0].id);
  const active = categories.find((c) => c.id === activeId)!;

  return (
    <div className="min-h-screen bg-cream text-ink font-sans flex flex-col">
      {/* Sleek Top Nav Bar - Premium Style (Centered Logo) */}
      <nav className="bg-ink text-cream px-6 md:px-10 py-3 md:py-4 flex items-center justify-between shadow-md relative z-30">
        <div className="flex-1 flex justify-start">
          <Link 
            to="/restaurante" 
            className="text-sm uppercase tracking-[0.15em] font-semibold hover:text-retama transition-colors"
          >
            RESTAURANTE
          </Link>
        </div>
        
        <div className="flex-none">
          <img src="/images.png" alt="Las Flores" className="h-10 md:h-12 w-auto object-contain brightness-0 invert" />
        </div>
        
        <div className="flex-1 flex justify-end gap-6 md:gap-8">
          <Link 
            to="/restaurante" 
            className="text-sm uppercase tracking-[0.15em] font-semibold hover:text-retama transition-colors"
          >
            RESERVAS
          </Link>
          <Link 
            to="/restaurante" 
            className="text-sm uppercase tracking-[0.15em] font-semibold hover:text-retama transition-colors hidden sm:block"
          >
            DELIVERY
          </Link>
        </div>
      </nav>

      {/* Page Title */}
      <div className="bg-cream pt-10 pb-4 text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-ink">Nuestra Carta</h1>
      </div>

      {/* Sticky Category Navigation */}
      <div className="bg-cream border-b border-ink/10 overflow-x-auto scrollbar-none sticky top-0 z-20 shadow-sm">
        <div className="flex px-4 md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveId(cat.id)}
              className={`flex-shrink-0 px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${
                activeId === cat.id
                  ? 'border-retablo text-retablo'
                  : 'border-transparent text-ink/40 hover:text-ink/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Content */}
      <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8 border-b border-ink/5 pb-4">
          <h2 className="font-serif text-3xl md:text-4xl text-ink">
            {active.label}
          </h2>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/40 bg-ink/5 px-4 py-2 rounded-full hidden sm:inline-block">
            {active.dishes.length} platos
          </span>
        </div>

        <div key={activeId} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12">
          {active.dishes.map((dish, i) => (
            <div key={i} className="bg-white rounded-md overflow-hidden flex flex-col h-full shadow-md hover:shadow-xl transition-all duration-300 group border-b-4 border-transparent hover:border-retama">
              {dish.image ? (
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-ink/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              ) : (
                <div className="h-48 bg-ink/5 flex items-center justify-center relative">
                  <span className="font-serif italic text-ink/30 text-xl px-4 text-center">{dish.name}</span>
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="text-base font-serif leading-tight text-ink group-hover:text-retablo transition-colors">
                    {dish.name}
                  </h3>
                  <span className="text-retablo font-bold text-sm flex-shrink-0 tracking-wide bg-retablo/10 px-2 py-1 rounded-sm">{dish.price}</span>
                </div>
                <p className="text-ink/60 text-xs flex-1 mb-2 leading-relaxed font-light">{dish.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
