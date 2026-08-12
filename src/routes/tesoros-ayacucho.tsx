import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { useState, useEffect } from "react";
import { SiteNavigationMenu } from "../components/SiteNavigationMenu";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Sparkles } from "lucide-react";

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
      imagen: "/imagenes-reales/productosAyacucho/Tuna.webp",
      usos: ["Fresco", "Jugos", "Mermeladas", "Postres"],
    },
    {
      nombre: "Níspero",
      nombreCientifico: "Eriobotrya japonica",
      descripcion:
        "Fruta dulce y jugosa de pulpa anaranjada. Excelente fuente de vitamina A y antioxidantes.",
      temporada: "Verano",
      meses: "Enero - Marzo",
      imagen: "/imagenes-reales/productosAyacucho/Níspero.webp",
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
      imagen: "/imagenes-reales/productosAyacucho/Papa-Nativa.webp",
      usos: ["Guisos", "Sopas", "Puca picante", "Papas fritas"],
    },
    {
      nombre: "Quinoa",
      nombreCientifico: "Chenopodium quinoa",
      descripcion:
        "Grano andino considerado superalimento. Rico en proteínas y minerales esenciales.",
      temporada: "Otoño",
      meses: "Mayo - Julio",
      imagen: "/imagenes-reales/productosAyacucho/Quinoa.webp",
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
      imagen: "/imagenes-reales/productosAyacucho/Airampo.webp",
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
      imagen: "/imagenes-reales/productosAyacucho/Habas-Verdes.webp",
      usos: ["Sopas", "Guisos", "Ensaladas", "Saltados"],
    },
  ],
};

function TesorosAyacuchoPage() {
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTemporada, setActiveTemporada] = useState<string>("Verano");

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

        </div>
      </nav>

      {/* Hero */}
      <header className="relative min-h-[60vh] w-full overflow-hidden bg-eucalipto flex items-center pt-32 pb-24">
        <img
          src="/imagenes-reales/hero-paginas/hero-tesoros-ayacucho.webp"
          alt="Tesoros de Ayacucho — productos nativos de temporada"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover opacity-65 filter brightness-105 saturate-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-black/30" />

        <div className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-center px-6 text-piedra">
          <div className="max-w-3xl text-center space-y-6">

            <span className="text-chilca font-medium uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-2">
              <Sparkles size={14} />
              Productos de Temporada · Ayacucho
              <Sparkles size={14} />
            </span>

            <h1 className="font-serif text-4xl md:text-6xl text-piedra font-normal leading-tight">
              Tesoros de Ayacucho
            </h1>

            <p className="text-base md:text-lg text-piedra/90 max-w-3xl mx-auto leading-relaxed">
              Ingredientes autóctonos que dan vida a nuestra cocina. Cada temporada trae los mejores
              productos de nuestra tierra, cosechados en su punto perfecto.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3">
            {Object.keys(productosPorTemporada).map((temporada) => (
              <button
                key={temporada}
                onClick={() => setActiveTemporada(temporada)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                  activeTemporada === temporada
                    ? "bg-[#2D473C] text-[#D4AF37] font-black shadow-md scale-105"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {temporada}
              </button>
            ))}
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productosPorTemporada[activeTemporada].map((producto, index) => (
              <article
                key={index}
                className="group relative h-[420px] rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              >
                {/* Imagen de fondo absoluto con zoom en hover */}
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />
                
                {/* Gradiente base (siempre visible para legibilidad) y gradiente hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
                
                {/* Contenido (Textos superpuestos) */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  
                  {/* Título y nombre científico (Aparece con leve movimiento arriba) */}
                  <div className="transform translate-y-4 group-hover:-translate-y-2 transition-all duration-500 ease-out">
                    <h3 className="font-serif text-3xl text-white font-bold mb-1 drop-shadow-md">
                      {producto.nombre}
                    </h3>
                    {producto.nombreCientifico && (
                      <p className="text-sm italic text-white/70 mb-2">{producto.nombreCientifico}</p>
                    )}
                  </div>
                  
                  {/* Temporada (Delay 1) */}
                  <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100 ease-out mb-5">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-chilca bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                      Temporada: {producto.meses}
                    </span>
                  </div>
                  
                  {/* Etiquetas de usos (Delay 2) */}
                  <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-200 ease-out">
                    <div className="flex flex-wrap gap-2">
                      {producto.usos.map((uso, i) => (
                        <span
                          key={i}
                          className="text-[10px] uppercase tracking-wider px-3 py-1 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20"
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
      </main>

      <SiteFooter />
    </div>
  );
}
