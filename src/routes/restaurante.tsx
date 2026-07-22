import { createFileRoute, Link } from "@tanstack/react-router";
const equipoImg = "/imagenes-reales/EQUIPO/02042026-DSC04926.webp";
const casaImg = "/inicio/inicio-pagina-restaurante.webp";
const platoPucaImg = "/gastronomia/puca-picante.webp"; // placeholder
const platoCuyImg = "/gastronomia/cuy-chactado.webp"; // placeholder
const platoMaizImg = "/gastronomia/chicharron.webp"; // placeholder
import { SiteFooter } from "@/components/site-footer";
import { useState, useTransition, lazy, Suspense } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
const ReservationModal = lazy(() => import("@/components/ReservationModal").then(m => ({ default: m.ReservationModal })));
const MenuModal = lazy(() => import("@/components/MenuModal").then(m => ({ default: m.MenuModal })));

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
        content:
          "La historia, el equipo y la firma del chef de Restaurante Las Flores.",
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

function RestaurantePage() {
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="bg-cream text-ink font-sans selection:bg-retama/30">
      {/* Nav: nuestra historia | logo | reservas y delivery */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 pt-4 pb-12 bg-gradient-to-b from-ink/80 via-ink/40 to-transparent text-cream pointer-events-none">
        <div className="flex-1 hidden md:flex gap-8 text-sm uppercase tracking-[0.15em] font-semibold pointer-events-auto">
          <Link to="/" className="hover:text-retama transition-colors">
            NUESTRA TIERRA
          </Link>
        </div>
        <Link to="/restaurante" className="flex-none pointer-events-auto" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img loading="lazy" src="/images.png" alt="Las Flores Logo" className="h-10 md:h-16 w-auto object-contain brightness-0 invert" />
        </Link>
        <div className="flex-1 flex justify-end items-center gap-3 md:gap-8 text-[11px] md:text-sm uppercase tracking-[0.1em] md:tracking-[0.15em] font-semibold pointer-events-auto">
          <button onClick={() => setIsReservationOpen(true)} className="hover:text-retama transition-colors">
            RESERVAS
          </button>
          <button onClick={() => startTransition(() => setIsMenuOpen(true))} className="hover:text-retama transition-colors">
            DELIVERY
          </button>
          {totalItems > 0 && (
            <button onClick={() => setCartOpen(true)} className="relative hover:text-retama transition-colors">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-retama text-ink text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Hero — Historia de Tres Generaciones */}
      <header
        id="historia"
        className="relative min-h-[100svh] w-full overflow-hidden bg-ink flex items-center pt-32 pb-24"
      >
        <img
          src={casaImg}
          alt="Interior del restaurante Las Flores con muros de adobe y textiles ayacuchanos"
          width={1920}
          fetchPriority="high"
          height={800}
          className="absolute inset-0 w-full h-full object-cover opacity-50 animate-hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink/90" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-cream">
          <span className="uppercase tracking-[0.4em] text-xs md:text-sm text-cream/80 mb-6 block animate-reveal">
            Historia · 1964 – Hoy
          </span>
          <h1 className="font-serif italic text-5xl md:text-7xl lg:text-8xl leading-[1.05] text-balance max-w-[18ch] mb-12 animate-reveal [animation-delay:200ms]">
            Tres generaciones frente al mismo fogón
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 mt-16 animate-reveal [animation-delay:400ms]">
            <div>
              <span className="font-serif text-5xl text-retama leading-none block mb-4">
                01
              </span>
              <h3 className="font-serif text-xl mb-3">El Origen · 1980</h3>
              <p className="text-cream/70 text-sm leading-[1.7]">
                Mamina comenzó la tradición familiar ofreciendo un cálido espacio
                en su hogar. Sus recetas, especialmente el cuy a la leña, sentaron
                las bases de nuestro sabor andino.
              </p>
            </div>
            <div>
              <span className="font-serif text-5xl text-retama leading-none block mb-4">
                02
              </span>
              <h3 className="font-serif text-xl mb-3">La Consolidación · 1990s</h3>
              <p className="text-cream/70 text-sm leading-[1.7]">
                Gloria tomó las riendas y transformó el comedor familiar en un
                santuario gastronómico, formalizando el negocio y llevando el 
                sabor de Ayacucho a nuevos horizontes sin perder la esencia.
              </p>
            </div>
            <div>
              <span className="font-serif text-5xl text-retama leading-none block mb-4">
                03
              </span>
              <h3 className="font-serif text-xl mb-3">El Legado Vivo · Hoy</h3>
              <p className="text-cream/70 text-sm leading-[1.7]">
                Mijail lidera la tercera generación, preservando el fuego original
                y llevando nuestra tradición culinaria hacia una experiencia
                contemporánea.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Nuestro Equipo */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
          <div className="md:col-span-7 order-2 md:order-1">
            <span className="text-eucalipto font-medium uppercase tracking-[0.3em] text-xs mb-6 block">
              Nuestro Equipo
            </span>
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-balance mb-8">
              La familia detrás de cada plato
            </h2>
            <p className="text-lg leading-[1.7] text-pretty text-ink/75 mb-6">
              Mamina, Gloria y Mijail conforman las tres voces de una
              misma cocina. A su alrededor, un equipo dedicado cuida
              cada detalle: desde la selección del maíz en el valle hasta el
              montaje final en la mesa.
            </p>
            <p className="text-lg leading-[1.7] text-pretty text-ink/75">
              No hay improvisación. Hay memoria compartida.
            </p>

            <dl className="mt-12 grid grid-cols-3 gap-8 max-w-md">
              <div>
                <dt className="text-xs uppercase tracking-[0.25em] text-ink/50 mb-2">
                  Familia
                </dt>
                <dd className="font-serif text-3xl">3</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.25em] text-ink/50 mb-2">
                  Equipo
                </dt>
                <dd className="font-serif text-3xl">12</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.25em] text-ink/50 mb-2">
                  Años
                </dt>
                <dd className="font-serif text-3xl">60+</dd>
              </div>
            </dl>
          </div>

          <div className="md:col-span-5 order-1 md:order-2 relative">
            <div className="absolute inset-0 bg-retama/10 translate-x-4 translate-y-4 rounded-sm -z-10"></div>
            <img
              src={equipoImg}
              alt="Retrato en blanco y negro de las tres generaciones del equipo de Las Flores"
              width={1600}
              height={1200}
              loading="lazy"
              className="w-full aspect-[4/5] object-cover rounded-sm shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Especialidad de Casa / Recomendaciones del Chef */}
      <section className="bg-eucalipto/5 py-10 md:py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
            <div className="max-w-[48ch]">
              <span className="text-eucalipto font-medium uppercase tracking-[0.3em] text-xs mb-6 block">
                Especialidad de Casa
              </span>
              <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-balance">
                Recomendaciones del Chef
              </h2>
              <p className="mt-6 text-lg text-ink/70 leading-[1.7]">
                Tres platos que nuestro equipo considera indispensables
                para entender la esencia de Las Flores.
              </p>
            </div>
            <Link
              to="/carta"
              className="inline-flex items-center gap-3 border border-ink/15 py-3 pr-4 pl-6 rounded-full hover:bg-ink hover:text-cream transition-colors text-xs uppercase tracking-[0.2em] font-medium"
            >
              Ver carta completa
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mt-12">
            <article className="bg-white rounded-md flex flex-col shadow-md hover:shadow-xl transition-all duration-300 group border-b-4 border-transparent hover:border-retama h-full overflow-hidden">
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-ink/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                <img
                  src="/gastronomia/puca-picante.webp"
                  alt="Puca Picante Ancestral"
                  width={1000}
                  height={800}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="text-xl font-serif leading-tight text-ink group-hover:text-retablo transition-colors">
                    Puca Picante Ancestral
                  </h3>
                  <span className="text-retablo font-bold text-sm flex-shrink-0 tracking-wide bg-retablo/10 px-2 py-1 rounded-sm">S/ 65</span>
                </div>
                <p className="text-ink/60 text-sm flex-1 mb-6 leading-relaxed font-light">
                  Remolacha fermentada, maní tostado y jugoso chicharrón crocante
                  hecho en leña de molle.
                </p>
                <div className="flex items-center justify-between border-t border-ink/10 pt-4 mt-auto">
                  <button className="text-xs uppercase tracking-[0.2em] font-bold text-eucalipto hover:text-eucalipto-dark transition-colors flex items-center gap-2">
                    Pedir Ahora <span aria-hidden>→</span>
                  </button>
                </div>
              </div>
            </article>

            <article className="bg-white rounded-md flex flex-col shadow-md hover:shadow-xl transition-all duration-300 group border-b-4 border-transparent hover:border-retama h-full overflow-hidden relative">
              <div className="absolute top-4 -right-2 z-20 bg-retablo text-cream text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-l-md shadow-md">
                Recomendado
              </div>
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-ink/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                <img
                  src="/gastronomia/cuy-chactado.webp"
                  alt="Cuy Chactado de la Casa"
                  width={1000}
                  height={800}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="text-xl font-serif leading-tight text-ink group-hover:text-retablo transition-colors">
                    Cuy Chactado de la Casa
                  </h3>
                  <span className="text-retablo font-bold text-sm flex-shrink-0 tracking-wide bg-retablo/10 px-2 py-1 rounded-sm">S/ 85</span>
                </div>
                <p className="text-ink/60 text-sm flex-1 mb-6 leading-relaxed font-light">
                  El orgullo de Las Flores. Confitado con hierbas aromáticas y
                  servido bajo la piedra caliente con papas doradas.
                </p>
                <div className="flex items-center justify-between border-t border-ink/10 pt-4 mt-auto">
                  <button className="text-xs uppercase tracking-[0.2em] font-bold text-eucalipto hover:text-eucalipto-dark transition-colors flex items-center gap-2">
                    Pedir Ahora <span aria-hidden>→</span>
                  </button>
                </div>
              </div>
            </article>

            <article className="bg-white rounded-md flex flex-col shadow-md hover:shadow-xl transition-all duration-300 group border-b-4 border-transparent hover:border-retama h-full overflow-hidden">
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-ink/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                <img
                  src="/gastronomia/chicharron.webp"
                  alt="Chicharrón Tradicional"
                  width={1000}
                  height={800}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="text-xl font-serif leading-tight text-ink group-hover:text-retablo transition-colors">
                    Chicharrón Tradicional
                  </h3>
                  <span className="text-retablo font-bold text-sm flex-shrink-0 tracking-wide bg-retablo/10 px-2 py-1 rounded-sm">S/ 70</span>
                </div>
                <p className="text-ink/60 text-sm flex-1 mb-6 leading-relaxed font-light">
                  Panceta de cerdo dorada lentamente en su propia manteca hasta 
                  lograr la crocancia perfecta, con mote y sarsa.
                </p>
                <div className="flex items-center justify-between border-t border-ink/10 pt-4 mt-auto">
                  <button className="text-xs uppercase tracking-[0.2em] font-bold text-eucalipto hover:text-eucalipto-dark transition-colors flex items-center gap-2">
                    Pedir Ahora <span aria-hidden>→</span>
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

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
              Contamos con ambientes exclusivos y un servicio de primera categoría, diseñados especialmente para almuerzos de negocios, cenas de gala, conferencias y reuniones corporativas. Garantice el éxito de su evento con la mejor propuesta gastronómica y el prestigio del mejor restaurante de la ciudad.
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
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden group">
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
            Separe su lugar con anticipación o pida nuestros platos con delivery
            y recojo en Ayacucho.
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
        {isReservationOpen && <ReservationModal open={isReservationOpen} onClose={() => setIsReservationOpen(false)} />}
        {isMenuOpen && <MenuModal open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />}
      </Suspense>
    </div>
  );
}
