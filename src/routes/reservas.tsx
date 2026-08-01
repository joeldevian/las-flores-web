import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigationMenu } from "@/components/SiteNavigationMenu";
import { ArrowRight, CalendarHeart, CheckCircle2, Sparkles, Users } from "lucide-react";

const heroImg = "/imagenes-reales/EVENTOS-COORPORATIVAS/celebraciones-familiares.webp";
const salonImages = [
  "/imagenes-reales/EVENTOS-COORPORATIVAS/celebraciones-familiares.webp",
  "/imagenes-reales/EVENTOS-COORPORATIVAS/reuniones-corporativas.webp",
  "/imagenes-reales/EVENTOS-COORPORATIVAS/bodas-recepciones.webp",
  "/imagenes-reales/ARTE Y CULTURA LISTO/RETABLO AYACUCHANO/Retablo-Ayacuchano.webp",
  "/imagenes-reales/EQUIPO/02042026-DSC05038.webp",
  "/imagenes-reales/CARTA/02042026-DSC04401.webp",
  "/imagenes-reales/DESTINOS LISTO/CITY TOUR/PLAZA MAYOR DE HUAMANGA/PLAZA MAYOR DE HUAMANGA.webp",
  "/imagenes-reales/GALERIA/IMG_5726.webp",
];

export const Route = createFileRoute("/reservas")({
  head: () => ({
    meta: [
      { title: "Reservas | Restaurante Las Flores" },
      {
        name: "description",
        content:
          "Descubra nuestros salones, servicios y propuestas para reservas en Restaurante Las Flores.",
      },
    ],
  }),
  component: ReservasPage,
});

function ReservasPage() {
  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      <nav className="bg-ink text-cream px-4 md:px-10 py-2 md:py-4 flex items-center justify-between shadow-md relative z-30">
        <div className="flex-1 flex justify-start">
          <SiteNavigationMenu isScrolled={false} />
        </div>
        <div className="flex-none">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 overflow-hidden bg-white shadow-sm flex items-center justify-center p-1"
            style={{ borderColor: "var(--color-cream)" }}
          >
            <img src="/favicon.png" alt="Las Flores" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="flex-1 flex justify-end gap-6 md:gap-8">
          <Link
            to="/restaurante"
            className="text-sm uppercase tracking-[0.15em] font-semibold hover:text-retama transition-colors"
          >
            RESTAURANTE
          </Link>
          <Link
            to="/carta"
            className="text-sm uppercase tracking-[0.15em] font-semibold hover:text-retama transition-colors hidden sm:block"
          >
            CARTA
          </Link>
        </div>
      </nav>

      <section className="relative min-h-[80vh] overflow-hidden bg-ink">
        <img src={heroImg} alt="Salones del restaurante" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink/90" />
        <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-6xl items-center px-6 py-24 text-cream">
          <div className="max-w-3xl">
            <p className="text-retama uppercase tracking-[0.35em] text-xs font-semibold mb-5">Reservas</p>
            <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] mb-6">
              Espacios para reuniones, celebraciones y eventos inolvidables
            </h1>
            <p className="text-base md:text-lg text-cream/80 leading-[1.8] max-w-[60ch]">
              En Las Flores diseñamos ambientes especiales para almuerzos, cenas, bodas y reuniones corporativas, siempre con la calidez de Ayacucho.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#salones"
                className="inline-flex items-center gap-2 rounded-sm border border-retama/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-retama hover:bg-retama hover:text-ink transition-colors"
              >
                Ver salones <ArrowRight size={16} />
              </a>
              <a
                href="#detalle"
                className="inline-flex items-center gap-2 rounded-sm bg-cream px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink hover:bg-retama transition-colors"
              >
                Conocer más
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="salones" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-eucalipto font-semibold">Galería de salones</p>
            <h2 className="font-serif text-3xl md:text-4xl text-ink">
              Ocho espacios para elegir el ambiente ideal
            </h2>
          </div>
          <p className="max-w-2xl text-sm text-ink/70 leading-[1.7]">
            Cada salón combina confort, decoración andina y servicio personalizado para que cada ocasión se sienta única.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {salonImages.map((image, index) => (
            <div key={image} className="overflow-hidden rounded-sm border border-black/5 bg-white shadow-sm">
              <img src={image} alt={`Salon ${index + 1}`} className="h-56 w-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section id="detalle" className="bg-white/70 px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-eucalipto/20 bg-eucalipto/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-eucalipto">
              <CalendarHeart size={14} /> Reservas especiales
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-ink">Diseñamos cada evento con detalle</h2>
            <p className="text-lg text-ink/70 leading-[1.8]">
              Desde almuerzos íntimos hasta grandes celebraciones, nuestra propuesta incluye menús especiales, atención personalizada y un ambiente que combina tradición y elegancia.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-black/5 bg-cream p-5">
                <Users size={20} className="mb-3 text-eucalipto" />
                <h3 className="font-serif text-xl mb-2">Capacidad flexible</h3>
                <p className="text-sm text-ink/70 leading-[1.7]">
                  Adaptamos el salón al número de invitados y al tipo de encuentro.
                </p>
              </div>
              <div className="rounded-sm border border-black/5 bg-cream p-5">
                <Sparkles size={20} className="mb-3 text-eucalipto" />
                <h3 className="font-serif text-xl mb-2">Experiencia premium</h3>
                <p className="text-sm text-ink/70 leading-[1.7]">
                  Decoración, servicio y menú pensados para hacer memorable la ocasión.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-sm border border-black/10 bg-ink p-8 text-cream shadow-lg">
            <h3 className="font-serif text-2xl mb-6">Incluye</h3>
            <ul className="space-y-4 text-sm text-cream/80">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-retama" /> Atención personalizada desde la coordinación del evento.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-retama" /> Opciones de menú acorde a la ocasión y al número de personas.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-retama" /> Ambientes con estética andina y confort contemporáneo.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-retama" /> Coordinación para que el día transcurra con calma y elegancia.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
