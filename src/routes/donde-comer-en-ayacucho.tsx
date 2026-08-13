import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigationMenu } from "@/components/SiteNavigationMenu";
import { MapPin, Phone, Utensils, Star, Calendar, ArrowRight, ShieldCheck, Heart, Award } from "lucide-react";
import RetabloWrapper from "@/components/RetabloWrapper";

export const Route = createFileRoute("/donde-comer-en-ayacucho")({
  head: () => ({
    meta: [
      { title: "Dónde Comer en Ayacucho (2026) — Guía Gastronómica y Mejores Restaurantes" },
      {
        name: "description",
        content:
          "¿Dónde comer en Ayacucho? Guía gastronómica completa con los mejores restaurantes, platos típicos (Puca Picante, Cuy Frito) y lugares imperdibles en Huamanga.",
      },
      {
        name: "keywords",
        content:
          "donde comer en ayacucho, donde comer ayacucho, restaurantes en ayacucho, mejores restaurantes ayacucho, donde almorzar ayacucho, restaurante las flores ayacucho, comida tipica ayacucho",
      },
      { property: "og:title", content: "Dónde Comer en Ayacucho (2026) — Guía Gastronómica Oficial" },
      {
        property: "og:description",
        content: "Descubre los mejores restaurantes de Ayacucho. Platillos típicos, tradición andina y reservas en línea en Restaurante Las Flores.",
      },
      { property: "og:image", content: "https://www.restaurantelasflores.com/images.png" },
      { property: "og:url", content: "https://www.restaurantelasflores.com/donde-comer-en-ayacucho" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Dónde Comer en Ayacucho: Guía Gastronómica y Mejores Restaurantes",
          "image": "https://www.restaurantelasflores.com/images.png",
          "author": { "@type": "Organization", "name": "Restaurante Las Flores Ayacucho" },
          "publisher": {
            "@type": "Organization",
            "name": "Restaurante Las Flores",
            "logo": { "@type": "ImageObject", "url": "https://www.restaurantelasflores.com/images.png" }
          },
          "datePublished": "2026-08-13",
          "description": "La guía definitiva para saber dónde comer en Ayacucho. Platos típicos, desayunos tradicionales y restaurantes emblemáticos en Huamanga."
        }),
      },
    ],
  }),
  component: DondeComerPage,
});

function DondeComerPage() {
  return (
    <div className="min-h-screen bg-[#faf6ed] text-[#1b2a24] font-sans flex flex-col">
      <nav className="bg-[#f8f4e6] px-4 md:px-10 py-3 flex items-center justify-between shadow-xs border-b border-nogal/10 sticky top-0 z-50">
        <div className="flex-1 flex justify-start items-center">
          <SiteNavigationMenu isScrolled={true} />
        </div>
      </nav>

      {/* Hero Header */}
      <div className="bg-[#2c4a3e] text-[#faf6ed] py-16 px-4 text-center border-b-4 border-[#d4af37]">
        <div className="max-w-4xl mx-auto">
          <span className="text-[#d4af37] font-serif text-sm uppercase tracking-widest font-bold">
            Guía Gastronómica de Huamanga
          </span>
          <h1 className="text-3xl md:text-5xl font-serif mt-3 mb-4 text-white">
            ¿Dónde Comer en Ayacucho?
          </h1>
          <p className="text-sm md:text-base opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
            Descubre la riqueza culinaria de la Ciudad de las 33 Iglesias. Desde el emblemático Puca Picante hasta el tradicional Cuy Frito y desayunos con pan chapla.
          </p>
        </div>
      </div>

      {/* Main SEO Body Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
        <RetabloWrapper title="Restaurantes Destacados en Ayacucho">
          <div className="space-y-8 font-serif leading-relaxed">
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-[#2c4a3e20] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Award className="text-[#d4af37] w-6 h-6" />
                <h2 className="text-2xl font-serif text-[#2c4a3e] font-bold">
                  1. Restaurante Las Flores — Tradición & Alta Gastronomía
                </h2>
              </div>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
                Ubicado en el corazón de Huamanga (<strong>Jr. José Olaya 106</strong>), <strong>Restaurante Las Flores</strong> se ha consolidado como el destino imperdible para locales y turistas. Con más de 40 años de trayectoria, combina la sazón andina ancestral con salones temáticos decorados con retablos ayacuchanos en pan de oro.
              </p>
              
              <div className="bg-[#faf6ed] p-4 rounded-xl border-l-4 border-[#2c4a3e] my-4 text-sm">
                <p className="font-bold text-[#2c4a3e] mb-1">Especialidades Recomendadas:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Puca Picante con Chicharrón:</strong> Guiso tradicional a base de maní y ají panca.</li>
                  <li><strong>Cuy Frito Tradicional:</strong> Acompañado de papas doradas y qapchi ayacuchano.</li>
                  <li><strong>Mondongo Ayacuchano:</strong> Caldo reconfortante de maíz blanco cocido a fuego lento.</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                <Link
                  to="/reservas"
                  className="bg-[#2c4a3e] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#1b2a24] transition-colors inline-flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Reserva tu Mesa Online
                </Link>
                <Link
                  to="/carta"
                  className="bg-[#faf6ed] border border-[#2c4a3e] text-[#2c4a3e] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors inline-flex items-center gap-2"
                >
                  <Utensils className="w-4 h-4" /> Ver Carta Completa & Precios
                </Link>
              </div>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-2xl border border-[#2c4a3e20] shadow-sm space-y-4">
              <h2 className="text-2xl font-serif text-[#2c4a3e] font-bold">
                ¿Qué Comer en Ayacucho? Platos Típicos Imperdibles
              </h2>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                La gastronomía ayacuchana destaca por su diversidad de insumos autóctonos y técnicas de cocción ancestrales. Si visitas la ciudad, no puedes dejar de probar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#faf6ed] p-4 rounded-xl">
                  <h3 className="font-bold text-[#2c4a3e]">Puca Picante</h3>
                  <p className="text-xs text-gray-600 mt-1">Plato emblemático servido con chicharrón de cerdo y arroz blanco.</p>
                </div>
                <div className="bg-[#faf6ed] p-4 rounded-xl">
                  <h3 className="font-bold text-[#2c4a3e]">Desayunos con Pan Chapla</h3>
                  <p className="text-xs text-gray-600 mt-1">Acompañado de queso ayacuchano, palta local y café de chanchamayo.</p>
                </div>
              </div>
            </section>
          </div>
        </RetabloWrapper>
      </main>

      <SiteFooter />
    </div>
  );
}
