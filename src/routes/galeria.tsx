import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigationMenu } from "@/components/SiteNavigationMenu";

export const Route = createFileRoute("/galeria")({
  component: GaleriaPage,
});

type Category = {
  id: string;
  label: string;
  images: string[];
};

const GALLERY_CATEGORIES: Category[] = [
  {
    id: "restaurante",
    label: "Restaurante",
    images: [
      "/imagenes-reales/Salones/Salonprincipal.webp",
      "/imagenes-reales/Salones/Ventana.webp",
      "/imagenes-reales/Salones/Estrado.webp",
    ],
  },
  {
    id: "experiencia",
    label: "Experiencia",
    images: [
      "/imagenes-reales/EVENTOS-COORPORATIVAS/reuniones-corporativas.webp",
      "/imagenes-reales/EVENTOS-COORPORATIVAS/celebraciones-familiares.webp",
      "/imagenes-reales/EVENTOS-COORPORATIVAS/bodas-recepciones.webp",
    ],
  },
  {
    id: "arte-cultura",
    label: "Arte y Cultura",
    images: [
      "/imagenes-reales/ARTE Y CULTURA LISTO/RETABLO AYACUCHANO/Retablo-Ayacuchano.webp",
      "/imagenes-reales/ARTE Y CULTURA LISTO/CERAMICA/CERAMICA-AYACUCHANA.webp",
      "/imagenes-reales/ARTE Y CULTURA LISTO/PIEDRA DE HUAMANGA/Piedra_de_Huamanga.webp",
    ],
  },
  {
    id: "festividades",
    label: "Festividades",
    images: [
      "/imagenes-reales/FESTIVIDADES LISTO/CARNAVALES/Carnavales.webp",
      "/imagenes-reales/FESTIVIDADES LISTO/CHACCU/CHACCU.webp",
      "/imagenes-reales/FESTIVIDADES LISTO/CHACCU/CHACCU(1).webp",
    ],
  },
  {
    id: "destino",
    label: "Destino",
    images: [
      "/imagenes-reales/DESTINOS LISTO/CITY TOUR/CATEDRAL DE HUAMANGA/CATEDRAL.webp",
      "/imagenes-reales/DESTINOS LISTO/CITY TOUR/MIRADOR ACUCHIMAY/acuchimay.webp",
      "/imagenes-reales/DESTINOS LISTO/CITY TOUR/ARCO DEL TRIUNFO/ARCO DE SAN FRANCISCO.webp",
    ],
  },
  {
    id: "gastronomia",
    label: "Gastronomía",
    images: [
      "/imagenes-reales/CARTA/02042026-DSC04652.webp",
      "/imagenes-reales/CARTA/02042026-DSC04727.webp",
      "/imagenes-reales/RECOMENDACIONES-CHEF/cuy-chactado.webp",
    ],
  },
];

function GaleriaPage() {
  const [activeCategory, setActiveCategory] = useState<string>("restaurante");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState<"ES" | "EN">("ES");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentCategory = GALLERY_CATEGORIES.find((cat) => cat.id === activeCategory);

  return (
    <div className="min-h-screen bg-piedra flex flex-col">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 py-3 transition-all duration-300 pointer-events-none ${
          isScrolled
            ? "bg-piedra/95 backdrop-blur-sm border-b border-nogal/10"
            : "bg-transparent border-b border-transparent"
        }`}>
        <div className="flex-1 flex justify-start items-center">
          <SiteNavigationMenu isScrolled={isScrolled} isAlwaysDark={false} />
        </div>
        <div className="flex-none pointer-events-auto">
          <img
            src="/images.png"
            alt="Restaurante Las Flores"
            className="h-10 w-auto object-contain transition-all"
            style={
              isScrolled
                ? {
                    filter:
                      "brightness(0) saturate(100%) invert(19%) sepia(16%) saturate(740%) hue-rotate(346deg) brightness(96%) contrast(89%)",
                  }
                : { filter: "brightness(0) invert(1)" }
            }
          />
        </div>
        <div className="flex-1 flex justify-end items-center">
          {/* Language Selector with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className={`flex items-center gap-2 px-2 py-1.5 transition-all ${
                isScrolled ? "text-nogal" : "text-piedra"
              }`}
            >
              <img
                src={language === "ES" ? "https://flagcdn.com/w40/pe.png" : "https://flagcdn.com/w40/us.png"}
                alt={language === "ES" ? "Peru Flag" : "USA Flag"}
                className="w-5 h-auto rounded-[2px]"
              />
              <span className="text-xs font-bold">{language}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${isLangDropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isLangDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 py-2 min-w-[100px]">
                {language === "ES" ? (
                  <button
                    onClick={() => {
                      setLanguage("EN");
                      setIsLangDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors"
                  >
                    <img
                      src="https://flagcdn.com/w40/us.png"
                      alt="USA Flag"
                      className="w-5 h-auto rounded-[2px]"
                    />
                    <span className={`text-xs font-bold ${isScrolled ? "text-nogal" : "text-white"}`}>EN</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setLanguage("ES");
                      setIsLangDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors"
                  >
                    <img
                      src="https://flagcdn.com/w40/pe.png"
                      alt="Peru Flag"
                      className="w-5 h-auto rounded-[2px]"
                    />
                    <span className={`text-xs font-bold ${isScrolled ? "text-nogal" : "text-white"}`}>ES</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <section className="relative h-[36vh] min-h-[280px] flex items-center justify-center bg-[#2c1d11]">
        <div className="absolute inset-0">
          <img
            src="/imagenes-reales/GALERIA/evento_corporativo.webp"
            alt="Galería Las Flores"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c1d11] via-transparent to-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-6 pt-12">
          <span className="text-[#d4a373] uppercase tracking-[0.35em] text-xs font-bold mb-4 block">
            Las Flores · Ayacucho
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-piedra font-normal leading-tight drop-shadow-md mb-5">
            Galería de Momentos
          </h1>
          <p className="text-base md:text-lg text-piedra/90 max-w-3xl mx-auto leading-relaxed">
            Descubre a través de imágenes la esencia de nuestro restaurante, nuestra cultura ayacuchana y los sabores que nos definen.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="w-full bg-white border-b border-nogal/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-4">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "text-eucalipto border-b-2 border-eucalipto"
                    : "text-nogal/60 hover:text-nogal"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-14 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCategory?.images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(img)}
              className="relative aspect-[3/4] overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={img}
                alt={`${currentCategory.label} ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* Borde interno delgado */}
              <div className="absolute inset-3 border border-white/40 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-4xl font-light hover:text-piedra transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="Vista ampliada"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
