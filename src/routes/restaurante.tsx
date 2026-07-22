import { createFileRoute, Link } from "@tanstack/react-router";
const equipoImg = "/imagenes-reales/EQUIPO/02042026-DSC04926.webp";
const casaImg = "/inicio/inicio-pagina-restaurante.webp";
const cocinaImg = "/imagenes-reales/EQUIPO/02042026-DSC05081.webp";
const platoPucaImg = "/gastronomia/puca-picante.webp"; // placeholder
const platoCuyImg = "/gastronomia/cuy-chactado.webp"; // placeholder
const platoMaizImg = "/gastronomia/chicharron.webp"; // placeholder
import { SiteFooter } from "@/components/site-footer";
import { useState, useTransition, lazy, Suspense, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
const ReservationModal = lazy(() =>
  import("@/components/ReservationModal").then((m) => ({ default: m.ReservationModal })),
);
const MenuModal = lazy(() =>
  import("@/components/MenuModal").then((m) => ({ default: m.MenuModal })),
);

export const Route = createFileRoute("/restaurante")({
  head: () => ({
    meta: [
      { title: "Nuestro Restaurante — Las Flores | Tres generaciones" },
      {
        name: "description",
        content:
          "Tres generaciones cocinando Ayacucho. Conozca la historia, el equipo y las recomendaciones del chef de Restaurante Las Flores.",
      },
      { property: "og:title", content: "Nuestro Restaurante — Las Flores" },
      {
        property: "og:description",
        content: "La historia, el equipo y la firma del chef de Restaurante Las Flores.",
      },
      {
        property: "og:image",
        content: new URL(casaImg, "https://restaurantelasflores.pe").toString(),
      },
      {
        name: "twitter:image",
        content: new URL(casaImg, "https://restaurantelasflores.pe").toString(),
      },
    ],
  }),
  component: RestaurantePage,
});

type GenerationStory = {
  generation: string;
  name: string;
  image: string;
  alt: string;
  summary: string;
  contribution: string;
};

const generationStories: GenerationStory[] = [
  {
    generation: "Primera generación",
    name: "Fundadora",
    image: "/imagenes-reales/EQUIPO/02042026-DSC05038.webp",
    alt: "Fundadora de Las Flores en la cocina",
    summary:
      "Mamina abrió la primera casa de sabor, donde la hospitalidad, el fuego y la memoria compartida dieron forma a la identidad de Las Flores.",
    contribution:
      "Puso la base de la cocina familiar y consolidó el vínculo entre tradición, hogar y mesa.",
  },
  {
    generation: "La Consolidación · 1990s",
    name: "Gloria",
    image: "/Gloria.webp",
    alt: "Gloria en la etapa de consolidación del restaurante Las Flores",
    summary:
      "Gloria tomó las riendas y transformó el comedor familiar en un santuario gastronómico, formalizando el negocio y llevando el sabor de Ayacucho a nuevos horizontes sin perder la esencia.",
    contribution: "Formalizó el negocio y proyectó la cocina de Ayacucho hacia nuevos horizontes.",
  },
  {
    generation: "El Legado",
    name: "Mijail",
    image: "/Captura%20de%20pantalla%202026-07-22%20162318.webp",
    alt: "Mijail junto a la tercera generación de Las Flores",
    summary:
      "Mijail lidera la tercera generación, preservando el fuego original y llevando nuestra tradición culinaria hacia una experiencia contemporánea.",
    contribution:
      "Mantiene viva la esencia familiar mientras proyecta la cocina hacia el presente.",
  },
];

const chefRecommendations = [
  {
    name: "Puca Picante Ancestral",
    price: "S/ 65",
    description:
      "Remolacha fermentada, maní tostado y jugoso chicharrón crocante hecho en leña de molle.",
    image: "/gastronomia/puca-picante.webp",
    alt: "Puca Picante Ancestral",
  },
  {
    name: "Cuy Chactado de la Casa",
    price: "S/ 85",
    description:
      "El orgullo de Las Flores. Confitado con hierbas aromáticas y servido bajo la piedra caliente con papas doradas.",
    image: "/gastronomia/cuy-chactado.webp",
    alt: "Cuy Chactado de la Casa",
  },
  {
    name: "Chicharrón Tradicional",
    price: "S/ 70",
    description:
      "Panceta de cerdo dorada lentamente en su propia manteca hasta lograr la crocancia perfecta, con mote y sarsa.",
    image: "/gastronomia/chicharron.webp",
    alt: "Chicharrón Tradicional",
  },
];

function GenerationFlipCard({ generation }: { generation: GenerationStory }) {
  return (
    <article className="group h-full [perspective:1400px]">
      <div
        tabIndex={0}
        className="relative h-[380px] md:h-[420px] w-full overflow-hidden rounded-[2rem] bg-transparent text-left cursor-pointer focus:outline-none"
      >
        <div className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)] shadow-xl">
          {/* Front Face */}
          <div
            className="absolute inset-0 h-full w-full rounded-[2rem] overflow-hidden bg-ink"
            style={{ backfaceVisibility: "hidden" }}
          >
            <img
              src={generation.image}
              alt={generation.alt}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-cream">
              <span className="inline-flex rounded-full border border-cream/30 bg-ink/30 backdrop-blur-md px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cream/90 mb-4">
                {generation.generation}
              </span>
              <h3 className="font-serif text-3xl md:text-4xl leading-tight text-balance">
                {generation.name}
              </h3>
            </div>
          </div>

          {/* Back Face */}
          <div
            className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-[2rem] bg-[#f8f4e6] p-8 md:p-10 text-ink shadow-inner border border-ink/5"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div>
              <span className="inline-flex rounded-full border border-ink/20 bg-ink/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-ink/80 mb-5">
                {generation.generation}
              </span>
              <h3 className="font-serif text-3xl leading-tight text-ink text-balance mb-6">
                {generation.name}
              </h3>
              <p className="text-base leading-relaxed text-ink/80 text-pretty">
                {generation.summary}
              </p>
            </div>

            <div className="mt-auto pt-6 border-t border-ink/10">
              <span className="block text-[10px] uppercase tracking-[0.3em] text-ink/60 mb-2 font-bold">
                Su Legado
              </span>
              <p className="text-sm leading-relaxed text-ink/80">{generation.contribution}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function GenerationsSection() {
  return (
    <section id="historia" className="bg-cream py-16 md:py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-8 md:mb-12">
          <span className="text-eucalipto font-medium uppercase tracking-[0.3em] text-xs mb-4 block">
            Las Tres Generaciones
          </span>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] text-balance">
            La historia y el legado familiar de Las Flores
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
          {generationStories.map((generation) => (
            <GenerationFlipCard key={generation.name} generation={generation} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ChefAccordionSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(1);

  return (
    <section className="bg-eucalipto/5 py-16 md:py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <span className="text-eucalipto font-medium uppercase tracking-[0.3em] text-xs mb-4 block">
            Especialidad de Casa
          </span>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] text-balance">
            Recomendaciones del Chef
          </h2>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:h-[400px]">
          {chefRecommendations.map((plate, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={plate.name}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex((prev) => (prev === index ? null : index))}
                className={`group relative overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white text-left shadow-md transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive ? "md:flex-[2.2]" : "md:flex-[0.9]"} ${isActive ? "min-h-[280px]" : "min-h-[120px]"}`}
              >
                <img
                  src={plate.image}
                  alt={plate.alt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 transition-all duration-700 ${isActive ? "bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" : "bg-gradient-to-t from-ink/70 via-ink/20 to-transparent"}`}
                />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-cream">
                  <div
                    className={`transition-all duration-500 ${isActive ? "translate-y-0 opacity-100" : "translate-y-3 opacity-90"}`}
                  >
                    <h3 className="text-lg md:text-xl font-serif leading-tight">{plate.name}</h3>
                    <p
                      className={`mt-3 text-sm leading-relaxed text-cream/80 transition-all duration-500 ${isActive ? "max-h-32 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
                    >
                      {plate.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RestaurantePage() {
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="bg-cream text-ink font-sans selection:bg-retama/30">
      {/* Nav: nuestra historia | logo | reservas y delivery */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 py-0 md:py-1 transition-all duration-500 pointer-events-none ${isScrolled ? "bg-cream text-ink shadow-md" : "bg-transparent text-cream"}`}
      >
        <div className="flex-1 hidden md:flex gap-8 text-sm uppercase tracking-[0.15em] font-semibold pointer-events-auto">
          <Link to="/" className="hover:text-retama transition-colors">
            NUESTRA TIERRA
          </Link>
        </div>
        <Link
          to="/restaurante"
          className="flex-none pointer-events-auto"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src="/images.png"
            alt="Las Flores Logo"
            className={`h-10 md:h-16 w-auto object-contain transition-all duration-500 ${isScrolled ? "" : "brightness-0 invert"}`}
          />
        </Link>
        <div className="flex-1 flex justify-end items-center gap-3 md:gap-8 text-[11px] md:text-sm uppercase tracking-widest md:tracking-[0.15em] font-semibold pointer-events-auto">
          <button
            onClick={() => setIsReservationOpen(true)}
            className="hover:text-retama transition-colors"
          >
            RESERVAS
          </button>
          <button
            onClick={() => startTransition(() => setIsMenuOpen(true))}
            className="hover:text-retama transition-colors"
          >
            DELIVERY
          </button>
          {totalItems > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative hover:text-retama transition-colors"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-retama text-ink text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          )}
        </div>
      </nav>

      <header
        id="historia"
        className="relative min-h-[100svh] w-full overflow-hidden bg-ink flex items-center pt-32 pb-24"
      >
        <img
          src={cocinaImg}
          alt="Cocina de Las Flores con ambiente cálido y tonalidades terracota"
          width={1920}
          fetchPriority="high"
          height={800}
          className="absolute inset-0 w-full h-full object-cover opacity-55 animate-hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/35 to-ink/90" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-center px-4 sm:px-6 lg:px-8 text-cream">
          <div className="max-w-3xl text-center">
            <h1 className="font-serif italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] text-balance animate-reveal [animation-delay:200ms]">
              La familia detrás de cada plato
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-[1.7] text-cream/80">
              Cada generación ha dejado una huella distinta: una fundadora que abrió el fuego, una
              segunda etapa que consolidó el proyecto y una tercera que lo lleva al presente con una
              mirada contemporánea.
            </p>
          </div>
        </div>
      </header>

      <GenerationsSection />

      <ChefAccordionSection />

      {/* Eventos Corporativos */}
      <section id="corporativo" className="bg-ink text-cream py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-20">
          <div className="flex-1 max-w-[50ch]">
            <span className="text-retama font-medium uppercase tracking-[0.3em] text-xs mb-6 block">
              Eventos Corporativos
            </span>
            <h2 className="font-serif text-4xl md:text-5xl leading-[1.1] text-balance mb-6">
              El mejor escenario para sus negocios en Ayacucho
            </h2>
            <p className="text-lg text-cream/70 leading-[1.7] mb-8">
              Contamos con ambientes exclusivos y un servicio de primera categoría, diseñados
              especialmente para almuerzos de negocios, cenas de gala, conferencias y reuniones
              corporativas. Garantice el éxito de su evento con la mejor propuesta gastronómica y el
              prestigio del mejor restaurante de la ciudad.
            </p>
            <Link
              to="/eventos"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center justify-center px-10 py-5 text-[11px] uppercase tracking-[0.25em] font-bold rounded-sm btn-yellow-hover"
            >
              <span>CONOCE MÁS</span>
            </Link>
          </div>
          <div className="flex-1 w-full">
            <div className="relative aspect-4/3 rounded-sm overflow-hidden group">
              <img
                src={casaImg}
                alt="Salón para eventos corporativos"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 border border-cream/20 m-4 rounded-sm pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Reservas y Delivery */}
      <section id="reservas" className="bg-cream py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-eucalipto font-medium uppercase tracking-[0.3em] text-xs block mb-6">
            Reservas y Delivery
          </span>
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] mb-8 text-balance">
            Reserve su mesa o disfrute Las Flores en casa
          </h2>
          <p className="text-lg text-ink/70 leading-[1.7] max-w-[52ch] mx-auto mb-12">
            Separe su lugar con anticipación o pida nuestros platos con delivery y recojo en
            Ayacucho.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-4">
            <button
              onClick={() => setIsReservationOpen(true)}
              className="px-10 py-5 font-serif font-bold text-lg tracking-wide rounded-xl btn-yellow-hover"
            >
              <span>Reservar mesa</span>
            </button>
            <button
              onClick={() => startTransition(() => setIsMenuOpen(true))}
              className="px-10 py-5 font-serif font-bold text-lg tracking-wide transition-all shadow-md hover:shadow-lg rounded-xl hover:-translate-y-0.5"
              style={{ background: "#3b0944", color: "white" }}
            >
              Pedir delivery
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
      <Suspense fallback={null}>
        {isReservationOpen && (
          <ReservationModal open={isReservationOpen} onClose={() => setIsReservationOpen(false)} />
        )}
        {isMenuOpen && <MenuModal open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />}
      </Suspense>
    </div>
  );
}
