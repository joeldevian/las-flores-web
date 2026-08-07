import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigationMenu } from "@/components/SiteNavigationMenu";
import { MenuModal } from "@/components/MenuModal";
import { Quote, Heart, Award, Utensils, Sparkles, ArrowRight, ShieldCheck, Star } from "lucide-react";

export const Route = createFileRoute("/familia-las-flores")({
  head: () => ({
    meta: [
      { title: "Familia Las Flores — El Alma Detrás del Sabor | Ayacucho" },
      {
        name: "description",
        content:
          "Conozca al equipo humano de Restaurante Las Flores. Historias de orgullo, pasión y excelencia culinaria de quienes hacen posible la magia ayacuchana.",
      },
    ],
  }),
  component: FamiliaLasFloresPage,
});

interface Collaborator {
  id: string;
  name: string;
  role: string;
  category: "cocina" | "salon" | "reposteria";
  years: string;
  photo: string;
  quote: string;
  recommendedDish: string;
  dishPrice: string;
  badge: string;
}

const COLLABORATORS: Collaborator[] = [
  {
    id: "1",
    name: "Rosaura Huamán",
    role: "Maestra Repostera & Bebidas Tradicionales",
    category: "reposteria",
    years: "6 años en Las Flores",
    photo: "/imagenes-reales/EQUIPO/02042026-DSC04926-opt.webp",
    quote:
      "En Las Flores no solo servimos recetas, compartimos las memorias vivas de nuestras abuelas. Mi mayor orgullo es ver la cara de sorpresa y felicidad de los clientes cuando prueban la mazamorra y las bebidas artesanales hechas a fuego lento.",
    recommendedDish: "Mazamorra de Llipta & Chapla Tradicional",
    dishPrice: "S/ 18.00",
    badge: "Maestra Dulcera",
  },
  {
    id: "2",
    name: "Dante Galindo",
    role: "Capitán de Salón & Hospitalidad",
    category: "salon",
    years: "4 años en Las Flores",
    photo: "/imagenes-reales/EQUIPO/02042026-DSC05081-opt.webp",
    quote:
      "Trabajar aquí es como recibir a invitados en mi propia casa. El respeto, la dignidad y el trato humano que nos brinda la empresa se refleja en la atención cálida y sonriente con la que servimos cada mesa.",
    recommendedDish: "Chicha de Jora Especial de la Casa",
    dishPrice: "S/ 16.00",
    badge: "Anfitrión Estrella",
  },
  {
    id: "3",
    name: "Carlos Avelino",
    role: "Chef de Fuegos & Carnes Andinas",
    category: "cocina",
    years: "5 años en Las Flores",
    photo: "/imagenes-reales/EQUIPO/encantados-de-atenderlos-opt.webp",
    quote:
      "El fuego ayacuchano requiere técnica, paciencia y sobre todo mucho orgullo. Me llena el alma saber que el Cuy Chactado que sale de mi parrilla deja un recuerdo imborrable en las familias que nos visitan.",
    recommendedDish: "Cuy Chactado Crujiente Tradicional",
    dishPrice: "S/ 68.00",
    badge: "Maestro Parrillero",
  },
  {
    id: "4",
    name: "Maritza Sulca",
    role: "Jefa de Cocina & Sazones Típicas",
    category: "cocina",
    years: "8 años en Las Flores",
    photo: "/imagenes-reales/EQUIPO/02042026-DSC05069-opt.webp",
    quote:
      "Para mí la cocina ayacuchana es sagrada. Mantener el aderezo exacto de la Puca Picante y la panceta dorada en su punto es mi forma de rendir homenaje a nuestras raíces y a cada comensal.",
    recommendedDish: "Puca Picante Tradicional con Chicharrón",
    dishPrice: "S/ 38.00",
    badge: "Líder de Cocina",
  },
  {
    id: "5",
    name: "Brayan Mendoza",
    role: "Sommelier & Barman de Macerados",
    category: "reposteria",
    years: "3 años en Las Flores",
    photo: "/imagenes-reales/EQUIPO/02042026-DSC05038-opt.webp",
    quote:
      "Me fascina crear coctelería de autor con insumos andinos como la pantiwayta, la airampo y el tumbo. Cada trago cuenta una historia de las alturas de Ayacucho.",
    recommendedDish: "Cóctel Macerado Pantiwayta Sour",
    dishPrice: "S/ 28.00",
    badge: "Mixólogo Andino",
  },
  {
    id: "6",
    name: "Lucía Cárdenas",
    role: "Supervisora de Calidad & Protocolo",
    category: "salon",
    years: "7 años en Las Flores",
    photo: "/imagenes-reales/EQUIPO/02042026-DSC04926-opt.webp",
    quote:
      "Ver crecer a nuestra familia laboral durante todos estos años me llena de satisfacción. Nos aseguramos de que cada detalle en mesa transmita la elegancia y calidez que nos caracteriza.",
    recommendedDish: "Chorizo Ayacuchano Artesanal",
    dishPrice: "S/ 34.00",
    badge: "Garantía de Servicio",
  },
];

function FamiliaLasFloresPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "cocina" | "salon" | "reposteria">("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredCollaborators = COLLABORATORS.filter(
    (c) => activeCategory === "all" || c.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-piedra flex flex-col font-sans text-nogal selection:bg-chilca/20">
      {/* ── HEADER FIJO ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          isScrolled ? "bg-piedra/90 backdrop-blur-md shadow-sm border-nogal/10 py-3" : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 flex justify-between items-center relative">
          <SiteNavigationMenu isScrolled={isScrolled} />
          
          <a href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group">
            <img 
              src="/images.png" 
              alt="Las Flores" 
              className={`transition-all duration-300 origin-center ${isScrolled ? "h-8 opacity-100" : "h-10 md:h-12 opacity-100 invert brightness-0"}`}
              style={isScrolled ? { filter: "brightness(0) saturate(100%) invert(19%) sepia(16%) saturate(740%) hue-rotate(346deg) brightness(96%) contrast(89%)" } : {}}
            />
          </a>

          <div className="flex items-center gap-4">
            <Link
              to="/reservas"
              className={`hidden sm:inline-flex px-5 py-2 text-xs font-serif uppercase tracking-widest border transition-all rounded-sm ${
                isScrolled
                  ? "border-nogal/30 text-nogal hover:bg-nogal hover:text-piedra"
                  : "border-piedra/40 text-piedra hover:bg-piedra hover:text-nogal"
              }`}
            >
              Reservar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Completa */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 pb-16 px-6 bg-eucalipto-dark text-piedra overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/imagenes-reales/EQUIPO/02042026-DSC05038-opt.webp"
            alt="Familia Las Flores"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover opacity-65 filter brightness-105 saturate-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-black/30" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="text-chilca font-medium uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-2">
            <Sparkles size={14} />
            Nuestra Gente · Nuestro Orgullo
            <Sparkles size={14} />
          </span>

          <h1 className="font-serif font-black text-5xl md:text-7xl leading-[1.05] tracking-tight text-white">
            Familia Las Flores
          </h1>

          <p className="text-lg md:text-xl text-piedra/90 font-serif italic max-w-2xl mx-auto leading-relaxed">
            "Detrás de cada plato sabroso y cada sonrisa en mesa hay hombres y mujeres ayacuchanos que trabajan con dignidad, pasión y profundo amor por nuestras raíces."
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-piedra/80 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-chilca" /> Trato Digno y Justo
            </span>
            <span className="flex items-center gap-2">
              <Heart size={16} className="text-chilca" /> Tradición Familiar
            </span>
            <span className="flex items-center gap-2">
              <Award size={16} className="text-chilca" /> Excelencia Ayacuchana
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              activeCategory === "all"
                ? "bg-[#2D473C] text-[#D4AF37] font-black shadow-md scale-105"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Todos los Colaboradores ({COLLABORATORS.length})
          </button>
          <button
            onClick={() => setActiveCategory("cocina")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              activeCategory === "cocina"
                ? "bg-[#2D473C] text-[#D4AF37] font-black shadow-md scale-105"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cocina & Fuegos
          </button>
          <button
            onClick={() => setActiveCategory("salon")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              activeCategory === "salon"
                ? "bg-[#2D473C] text-[#D4AF37] font-black shadow-md scale-105"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Salón & Hospitalidad
          </button>
          <button
            onClick={() => setActiveCategory("reposteria")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              activeCategory === "reposteria"
                ? "bg-[#2D473C] text-[#D4AF37] font-black shadow-md scale-105"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Repostería & Bar
          </button>
        </div>

        {/* Collaborators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCollaborators.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              {/* Photo & Badge Header */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <img
                  src={c.photo}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#D4AF37] text-[#2D473C] text-[10px] font-black uppercase tracking-wider shadow-md">
                  {c.badge}
                </span>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-serif font-black text-xl leading-tight">
                    {c.name}
                  </h3>
                  <p className="text-xs text-emerald-200 font-medium">
                    {c.role}
                  </p>
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider block mt-0.5">
                    {c.years}
                  </span>
                </div>
              </div>

              {/* Quote Body */}
              <div className="p-6 space-y-4 flex-1">
                <Quote size={24} className="text-[#D4AF37]" />
                <p className="text-xs text-gray-700 font-serif italic leading-relaxed">
                  "{c.quote}"
                </p>
              </div>

              {/* Dish Recommendation Footer */}
              <div className="p-4 bg-[#F9F8F3] border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-black tracking-wider text-gray-400 block">
                    Recomendación de {c.name.split(" ")[0]}
                  </span>
                  <p className="font-serif font-bold text-xs text-[#2D473C] truncate">
                    {c.recommendedDish}
                  </p>
                </div>

                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#2D473C] hover:bg-[#243B31] text-white text-[11px] font-black flex items-center gap-1.5 shadow-2xs shrink-0 active:scale-95 transition-all"
                >
                  <Utensils size={12} className="text-[#D4AF37]" />
                  <span>Pedir Plato</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Join the Team Callout */}
        <div className="bg-[#2D473C] text-white rounded-3xl p-8 md:p-12 shadow-xl border-2 border-[#D4AF37]/40 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="text-xs uppercase font-black text-[#D4AF37] tracking-widest">
              Únete a Nuestra Historia
            </span>
            <h3 className="font-serif font-black text-2xl md:text-3xl">
              ¿Te gustaría formar parte de la Familia Las Flores?
            </h3>
            <p className="text-sm text-emerald-100/90 leading-relaxed font-serif">
              Buscamos personas apasionadas por el buen servicio, la riqueza cultural de Ayacucho y el crecimiento profesional en un ambiente respetuoso y acogedor.
            </p>
          </div>

          <Link
            to="/unete-al-equipo"
            className="px-8 py-4 rounded-2xl bg-[#D4AF37] hover:bg-[#c29e2f] text-[#2D473C] font-black text-sm transition-all shadow-lg shrink-0 flex items-center gap-2 active:scale-95"
          >
            <span>Ver Convocatorias Laborales</span>
            <ArrowRight size={18} />
          </Link>
        </div>

      </main>

      <MenuModal open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SiteFooter />
    </div>
  );
}
