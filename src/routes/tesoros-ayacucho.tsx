import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { useState, useEffect } from "react";
import { SiteNavigationMenu } from "../components/SiteNavigationMenu";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/tesoros-ayacucho")({
  head: () => ({
    meta: [
      { title: "Tesoros de Ayacucho — Las Flores | Productos de Temporada" },
      {
        name: "description",
        content:
          "Descubre los productos ayacuchanos de temporada: papa nativa, quinoa, nísperos, airampo, tunas y más ingredientes autóctonos que dan vida a nuestra cocina.",
      },
      { property: "og:title", content: "Tesoros de Ayacucho — Las Flores" },
      {
        property: "og:description",
        content: "Productos ayacuchanos de temporada que dan vida a nuestra cocina tradicional.",
      },
    ],
  }),
  component: TesorosAyacuchoPage,
});

type Producto = {
  nombre: string;
  nombreCientifico?: string;
  descripcion: string;
  temporada: string;
  meses: string;
  imagen: string;
  usos: string[];
};

const productosPorTemporada: Record<string, Producto[]> = {
  Verano: [
    {
      nombre: "Tuna",
      nombreCientifico: "Opuntia ficus-indica",
      descripcion:
        "Fruto del nopal, dulce y refrescante. Rico en vitamina C y fibra. Se consume fresco o en jugos y mermeladas.",
      temporada: "Verano",
      meses: "Diciembre - Marzo",
      imagen: "/imagenes-reales/FESTIVIDADES LISTO/CARNAVAL AYACUCHANO/02042026-DSC04656.webp",
      usos: ["Fresco", "Jugos", "Mermeladas", "Postres"],
    },
    {
      nombre: "Níspero",
      nombreCientifico: "Eriobotrya japonica",
      descripcion:
        "Fruta dulce y jugosa de pulpa anaranjada. Excelente fuente de vitamina A y antioxidantes.",
      temporada: "Verano",
      meses: "Enero - Marzo",
      imagen: "/imagenes-reales/FESTIVIDADES LISTO/CARNAVAL AYACUCHANO/02042026-DSC04656.webp",
      usos: ["Fresco", "Jugos", "Compotas", "Ensaladas de frutas"],
    },
  ],
  Otoño: [
    {
      nombre: "Papa Nativa",
      nombreCientifico: "Solanum spp.",
      descripcion:
        "Variedades ancestrales de papa con colores y sabores únicos. Base fundamental de la gastronomía ayacuchana.",
      temporada: "Otoño",
      meses: "Abril - Junio",
      imagen: "/imagenes-reales/FESTIVIDADES LISTO/CARNAVAL AYACUCHANO/02042026-DSC04656.webp",
      usos: ["Guisos", "Sopas", "Puca picante", "Papas fritas"],
    },
    {
      nombre: "Quinoa",
      nombreCientifico: "Chenopodium quinoa",
      descripcion:
        "Grano andino considerado superalimento. Rico en proteínas y minerales esenciales.",
      temporada: "Otoño",
      meses: "Mayo - Julio",
      imagen: "/imagenes-reales/FESTIVIDADES LISTO/CARNAVAL AYACUCHANO/02042026-DSC04656.webp",
      usos: ["Sopas", "Ensaladas", "Guarniciones", "Postres"],
    },
  ],
  Invierno: [
    {
      nombre: "Airampo",
      nombreCientifico: "Opuntia soehrensii",
      descripcion:
        "Cactus cuya fruta produce un colorante natural rojo intenso. Usado en bebidas tradicionales.",
      temporada: "Invierno",
      meses: "Junio - Agosto",
      imagen: "/imagenes-reales/FESTIVIDADES LISTO/CARNAVAL AYACUCHANO/02042026-DSC04656.webp",
      usos: ["Bebidas", "Colorante natural", "Postres", "Chicha"],
    },
  ],
  Primavera: [
    {
      nombre: "Habas Verdes",
      nombreCientifico: "Vicia faba",
      descripcion:
        "Legumbre tierna y nutritiva. Se consume en sopas, guisos y como acompañamiento.",
      temporada: "Primavera",
      meses: "Septiembre - Noviembre",
      imagen: "/imagenes-reales/FESTIVIDADES LISTO/CARNAVAL AYACUCHANO/02042026-DSC04656.webp",
      usos: ["Sopas", "Guisos", "Ensaladas", "Saltados"],
    },
  ],
};

function TesorosAyacuchoPage() {
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTemporada, setActiveTemporada] = useState<string>("Verano");
  const [language, setLanguage] = useState<"ES" | "EN">("ES");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-piedra text-nogal font-sans selection:bg-chilca/30">
      {/* Nav Header */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 py-2 md:py-4 transition-all duration-500 pointer-events-none ${
          isScrolled ? "bg-piedra text-nogal shadow-md" : "bg-transparent text-piedra"
        }`}
      >
        <div className="flex-1 flex justify-start items-center">
          <SiteNavigationMenu isScrolled={isScrolled} />
        </div>
        <a
          href="/"
          className="flex-none pointer-events-auto"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src="/images.png"
            alt="Las Flores Logo"
            className={`w-auto object-contain transition-all duration-500 ${
              isScrolled ? "h-8" : "h-10 md:h-12 brightness-0 invert"
            }`}
          />
        </a>
        <div className="flex-1 flex justify-end items-center gap-6 md:gap-8 text-[11px] md:text-sm uppercase tracking-widest md:tracking-[0.15em] font-semibold pointer-events-auto">
          {totalItems > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative hover:text-chilca transition-colors"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-chilca text-nogal text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          )}

          {/* Language Selector */}
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

      {/* Hero */}
      <header className="relative min-h-[60vh] w-full overflow-hidden bg-eucalipto flex items-center pt-32 pb-24">
        <img
          src="/imagenes-reales/FESTIVIDADES LISTO/CARNAVAL AYACUCHANO/02042026-DSC04656.webp"
          alt="Productos ayacuchanos de temporada"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/35 to-ink/90" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-center px-4 sm:px-6 lg:px-8 text-piedra">
          <div className="max-w-3xl text-center">
            <h1 className="font-serif italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-balance">
              Tesoros de Ayacucho
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-[1.7] text-piedra/80">
              Ingredientes autóctonos que dan vida a nuestra cocina. Cada temporada trae los mejores
              productos de nuestra tierra, cosechados en su punto perfecto.
            </p>
          </div>
        </div>
      </header>

      {/* Tabs de Temporadas */}
      <section className="bg-white border-b border-nogal/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-4">
            {Object.keys(productosPorTemporada).map((temporada) => (
              <button
                key={temporada}
                onClick={() => setActiveTemporada(temporada)}
                className={`px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold transition-all rounded-full whitespace-nowrap ${
                  activeTemporada === temporada
                    ? "bg-eucalipto text-piedra"
                    : "bg-transparent text-nogal/60 hover:text-nogal hover:bg-nogal/5"
                }`}
              >
                {temporada}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Productos */}
      <section className="bg-piedra py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productosPorTemporada[activeTemporada].map((producto, index) => (
              <article
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-serif text-2xl text-eucalipto font-bold mb-1">
                      {producto.nombre}
                    </h3>
                    {producto.nombreCientifico && (
                      <p className="text-xs italic text-nogal/50">{producto.nombreCientifico}</p>
                    )}
                  </div>
                  <p className="text-sm text-nogal/70 leading-relaxed mb-4">{producto.descripcion}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-chilca">
                      {producto.meses}
                    </span>
                  </div>
                  <div className="border-t border-nogal/10 pt-4">
                    <p className="text-xs uppercase tracking-wider text-nogal/50 mb-2 font-bold">
                      Usos Culinarios
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {producto.usos.map((uso, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-3 py-1 bg-piedra text-nogal rounded-full border border-nogal/10"
                        >
                          {uso}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
