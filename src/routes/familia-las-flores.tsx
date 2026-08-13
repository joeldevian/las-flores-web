import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigationMenu } from "@/components/SiteNavigationMenu";
import { MenuModal } from "@/components/MenuModal";
import { Quote, Heart, Award, Utensils, Sparkles, ArrowRight, Star } from "lucide-react";

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
    id: "admin-1",
    name: "Ritney Betsy",
    role: "Jefa Administrativa",
    category: "administracion",
    years: "5 años en Las Flores",
    photo: "/familia/Ritney.webp",
    quote:
      "Liderar el área administrativa de Las Flores durante estos 5 años ha sido un honor. Mi enfoque principal es optimizar nuestros procesos para que cada área brinde lo mejor y sigamos creciendo como una gran familia.",
    recommendedDish: "Pachamanca",
    dishPrice: "S/ 55.00",
    badge: "Líder Estratégico",
  },
  {
    id: "0",
    name: "Mayte Jarumy",
    role: "Jefa de Azafatas",
    category: "salon",
    years: "3 años en Las Flores",
    photo: "/familia/Mayte.webp",
    quote:
      "Como Jefa de Azafatas, mi misión es asegurar que cada detalle en el salón sea perfecto. Liderar este equipo me llena de orgullo, y ver a nuestros clientes regresar felices es la mayor recompensa.",
    recommendedDish: "Puca Picante Especial",
    dishPrice: "S/ 42.00",
    badge: "Líder de Servicio",
  },
  {
    id: "1",
    name: "Paola Zinthia",
    role: "Maestra Repostera",
    category: "reposteria",
    years: "1 año en Las Flores",
    photo: "/familia/Paola.webp",
    quote:
      "Durante mi primer año trabajando como repostera en el restaurante Las Flores, tuve la oportunidad de desarrollar y perfeccionar mis habilidades en la elaboración de postres, Pan elavorado conmasa madre y diferentes productos de repostería.",
    recommendedDish: "Mazamorra de Calabaza y Chapla Tradicional",
    dishPrice: "S/ 18.00",
    badge: "Maestra Dulcera",
  },
  {
    id: "2",
    name: "Marilu Fernanda",
    role: "Logistica",
    category: "administracion",
    years: "3 años en Las Flores",
    photo: "/familia/Fernanda.webp",
    quote:
      "Durante mis tres años trabajando en el área de administración del restaurante Las Flores, tuve la oportunidad de conocer de cerca el funcionamiento y la organización de un negocio gastronómico.",
      recommendedDish: "Chancho Azado",
      dishPrice: "S/ 16.00",
    badge: "Anfitrión Estrella",
  },
  {
    id: "3",
    name: "Juan Carlos ",
    role: "Inocuidad",
    category: "administracion",
    years: "1 años en Las Flores",
    photo: "/familia/Carlos.webp",
    quote:
      "Durante mi primer año trabajando en el área de inocuidad del restaurante Las Flores, mi principal función fue velar por que los alimentos fueran manipulados, almacenados y preparados de manera segura, cumpliendo con las normas y buenas prácticas de higiene.",
    recommendedDish: "Cuy Chactado Crujiente Tradicional",
    dishPrice: "S/ 68.00",
    badge: "Maestro Parrillero",
  },
  {
    id: "4",
    name: "Edgar Luis",
    role: "Chef",
    category: "cocina",
    years: "1 año en Las Flores",
    photo: "/familia/chef.webp",
    quote:
      "Durante mis dos años como chef en el restaurante Las Flores, adquirí experiencia en la preparación, presentación y control de calidad de los alimentos. Desarrollé habilidades de liderazgo, organización y trabajo en equipo, manteniendo siempre altos estándares de higiene e inocuidad. Fue una experiencia muy enriquecedora que me permitió crecer profesionalmente y aportar a la satisfacción de nuestros clientes.",
    recommendedDish: "Puca Picante con Chicharrón",
    dishPrice: "S/ 38.00",
    badge: "Líder de Cocina",
  },
  {
    id: "5",
    name: "Yadira Paris",
    role: "Cocina",
    category: "cocina",
    years: "1 años en Las Flores",
    photo: "/familia/Cocina.webp",
    quote:
      "Mi experiencia en el área de cocina del restaurante Las Flores durante el año me permitió fortalecer mis conocimientos en la preparación y elaboración de alimentos. A lo largo de este tiempo, desarrollé habilidades de organización, trabajo en equipo y cumplimiento de las normas de higiene e inocuidad. Esta etapa laboral fue muy importante para mi crecimiento profesional y me permitió contribuir al buen funcionamiento y servicio del restaurante.",
    recommendedDish: "Ceviche de Trucha",
    dishPrice: "S/ 28.00",
    badge: "Mixólogo Andino",
  },
  {
    id: "6",
    name: "Kelly Melisa",
    role: "Ventas",
    category: "administracion",
    years: "1 año en Las Flores",
    photo: "/familia/Melisa.webp",
    quote:
      "Mi experiencia durante el año en el área de ventas del restaurante Las Flores me permitió desarrollar habilidades de atención y servicio al cliente. Durante este tiempo aprendí a comunicarme de manera efectiva, conocer las necesidades de los clientes y brindar una atención amable y eficiente. Fue una etapa muy enriquecedora que contribuyó a mi crecimiento profesional y me enseñó la importancia de ofrecer siempre un buen servicio. ",
    recommendedDish: "Chorizo Ayacuchano",
    dishPrice: "S/ 34.00",
    badge: "Garantía de Servicio",
  },
  {
    id: "7",
    name: "Jhon Aldahir",
    role: "Mozo",
    category: "salon",
    years: "1 año en Las Flores",
    photo: "/familia/Jhon.webp",
    quote:
      "Me enorgullece recibir a cada familia que nos visita y asegurar que se lleven una experiencia inolvidable. El ambiente cálido de Las Flores es contagioso y me encanta ser parte de ello.",
    recommendedDish: "Puca Picante con Chicharrón",
    dishPrice: "S/ 38.00",
    badge: "Atención Especial",
  },
  {
    id: "8",
    name: "Heidi Jeraldine",
    role: "Anfitriona",
    category: "salon",
    years: "8 meses en Las Flores",
    photo: "/familia/Heidi.webp",
    quote:
      "Desde mi primer día me sentí acogida. Recibir a los clientes con una sonrisa y guiarlos a su mesa es el primer paso para una gran comida ayacuchana.",
    recommendedDish: "Chicharrón de Cerdo",
    dishPrice: "S/ 42.00",
    badge: "Sonrisa Acogedora",
  },
  {
    id: "9",
    name: "Dina Luz",
    role: "Moza",
    category: "salon",
    years: "2 años en Las Flores",
    photo: "/familia/Dina.webp",
    quote:
      "Atender a nuestros comensales es un arte que cultivo cada día. Conozco nuestros platos a la perfección y siempre recomiendo lo mejor según los gustos de cada cliente.",
    recommendedDish: "Cuy Chactado",
    dishPrice: "S/ 68.00",
    badge: "Servicio Impecable",
  },
  {
    id: "10",
    name: "Aurelio",
    role: "Capitán de Mozos",
    category: "salon",
    years: "3 años en Las Flores",
    photo: "/familia/Aurelio.webp",
    quote:
      "Organizar el salón y garantizar que cada mesa reciba un trato excepcional es mi pasión. Estos años en Las Flores me han enseñado el verdadero significado de la hospitalidad andina.",
    recommendedDish: "Trucha Frita",
    dishPrice: "S/ 35.00",
    badge: "Líder de Salón",
  },
  {
    id: "11",
    name: "Percy Yoni",
    role: "Azafata",
    category: "salon",
    years: "2 años en Las Flores",
    photo: "/familia/Percy.webp",
    quote:
      "Me dedico a brindar la mejor atención, asegurando que cada comensal tenga todo lo que necesita en su mesa. Formar parte de Las Flores por estos dos años me ha llenado de hermosas experiencias.",
    recommendedDish: "Mondongo Ayacuchano",
    dishPrice: "S/ 25.00",
    badge: "Atención Dedicada",
  },
  {
    id: "admin-2",
    name: "Paola Sofia",
    role: "Caja",
    category: "administracion",
    years: "2 años en Las Flores",
    photo: "/familia/Sofia.webp",
    quote:
      "Atender a nuestros clientes al finalizar su comida con rapidez, exactitud y amabilidad es mi objetivo. Garantizo que su experiencia termine tan bien como empezó.",
    recommendedDish: "Choclo con Queso",
    dishPrice: "S/ 15.00",
    badge: "Atención Eficiente",
  },
  {
    id: "admin-3",
    name: "Jose",
    role: "Marketing",
    category: "administracion",
    years: "1 año en Las Flores",
    photo: "/familia/Jose.webp",
    quote:
      "Mi trabajo es mostrar al mundo la belleza, sabor y tradición de Las Flores. Cada foto y cada publicación busca transmitir el cariño con el que preparamos nuestros platos.",
    recommendedDish: "Helado de Lúcuma",
    dishPrice: "S/ 12.00",
    badge: "Creatividad Visual",
  },
  {
    id: "cocina-1",
    name: "Ronaldiño",
    role: "Cocinero",
    category: "cocina",
    years: "3 años en Las Flores",
    photo: "/familia/Ronaldinho.webp",
    quote:
      "Cocinar es mi verdadera pasión. Estos 3 años me han enseñado que el secreto de un buen plato está en el respeto por nuestros insumos locales y el amor que le ponemos a cada preparación.",
    recommendedDish: "Mondongo Ayacuchano",
    dishPrice: "S/ 25.00",
    badge: "Sazón Tradicional",
  },
  {
    id: "cocina-2",
    name: "Marina",
    role: "Maestra Cocinera",
    category: "cocina",
    years: "5 años en Las Flores",
    photo: "/familia/Marina.webp",
    quote:
      "Tengo el orgullo de decir que llevo 5 años cuidando las recetas de la casa. Mi mayor alegría es saber que cada persona que prueba mi sazón se lleva un pedacito de nuestra tradición.",
    recommendedDish: "Puca Picante con Chicharrón",
    dishPrice: "S/ 38.00",
    badge: "Manos de Oro",
  },
  {
    id: "reposteria-1",
    name: "Nancy Marleny",
    role: "Asistente de Repostería",
    category: "reposteria",
    years: "2 años en Las Flores",
    photo: "/familia/Nancy.webp",
    quote:
      "Acompañar nuestras comidas con el dulce perfecto es mi especialidad. Durante estos 2 años he aprendido a mezclar las técnicas tradicionales con el cariño que nos caracteriza.",
    recommendedDish: "Helado de Lúcuma",
    dishPrice: "S/ 12.00",
    badge: "Toque Dulce",
  }
];

function FamiliaLasFloresPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "administracion" | "cocina" | "salon" | "barra" | "reposteria">("all");
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
      <section className="relative min-h-[60vh] flex items-center justify-center pt-32 pb-24 px-6 bg-eucalipto-dark text-piedra overflow-hidden">
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

          <h1 className="font-serif text-4xl md:text-6xl text-piedra font-normal leading-tight">
            Familia Las Flores
          </h1>

          <p className="text-base md:text-lg text-piedra/90 max-w-3xl mx-auto leading-relaxed">
            "Detrás de cada plato sabroso y cada sonrisa en mesa hay hombres y mujeres ayacuchanos que trabajan con dignidad, pasión y profundo amor por nuestras raíces."
          </p>
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
            Todos ({COLLABORATORS.length})
          </button>
          <button
            onClick={() => setActiveCategory("administracion")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              activeCategory === "administracion"
                ? "bg-[#2D473C] text-[#D4AF37] font-black shadow-md scale-105"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Administración
          </button>
          <button
            onClick={() => setActiveCategory("cocina")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              activeCategory === "cocina"
                ? "bg-[#2D473C] text-[#D4AF37] font-black shadow-md scale-105"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cocina
          </button>
          <button
            onClick={() => setActiveCategory("salon")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              activeCategory === "salon"
                ? "bg-[#2D473C] text-[#D4AF37] font-black shadow-md scale-105"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Salón
          </button>
          <button
            onClick={() => setActiveCategory("barra")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              activeCategory === "barra"
                ? "bg-[#2D473C] text-[#D4AF37] font-black shadow-md scale-105"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Barra
          </button>
          <button
            onClick={() => setActiveCategory("reposteria")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              activeCategory === "reposteria"
                ? "bg-[#2D473C] text-[#D4AF37] font-black shadow-md scale-105"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Repostería
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
                  style={{ objectPosition: "center 18%" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#D4AF37] text-[#2D473C] text-[10px] font-black uppercase tracking-wider shadow-md">
                  {c.badge}
                </span>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-serif text-3xl leading-tight">
                    {c.name}
                  </h3>
                  <p className="text-sm text-emerald-200">
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
                <p className="text-base italic leading-relaxed text-gray-700">
                  "{c.quote}"
                </p>
              </div>

              {/* Dish Recommendation Footer */}
              <div className="p-4 bg-[#F9F8F3] border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">
                    Recomendación de {c.name.split(" ")[0]}
                  </span>
                  <p className="font-serif text-sm text-[#2D473C] truncate">
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
            <h3 className="font-serif text-3xl md:text-4xl">
              ¿Te gustaría formar parte de la Familia Las Flores?
            </h3>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
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
