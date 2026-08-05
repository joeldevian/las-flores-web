import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteNavigationMenu } from "../components/SiteNavigationMenu";
import { SiteFooter } from "../components/site-footer";
import { JobCard } from "../features/jobs/components/JobCard";
import { JobApplicationForm } from "../features/jobs/components/JobApplicationForm";
import { listPublicJobOffers } from "../features/jobs/api";
import { sortPublicOffers } from "../features/jobs/rules";
import type { PublicJobOffer } from "../features/jobs/types";
import { Heart, Users, Award, Loader2, AlertCircle, Briefcase } from "lucide-react";

export const Route = createFileRoute("/unete-al-equipo")({
  head: () => ({
    meta: [
      { title: "Únete al Equipo | Restaurante Las Flores" },
      {
        name: "description",
        content:
          "Desarróllate profesionalmente en Restaurante Las Flores Ayacucho. Conoce nuestras convocatorias abiertas y forma parte de nuestra familia.",
      },
    ],
  }),
  component: UneteAlEquipoPage,
});

const heroImg = "/imagenes-reales/EQUIPO/02042026-DSC05038.webp";

function UneteAlEquipoPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [offers, setOffers] = useState<PublicJobOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<PublicJobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPublicJobOffers();
      const sorted = sortPublicOffers(data);
      setOffers(sorted);
      if (sorted.length > 0) {
        setSelectedOffer(sorted[0]);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las convocatorias. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // Filtros dinámicos
  const departments = Array.from(new Set(offers.map((o) => o.department))).filter(Boolean);
  const workModes = Array.from(new Set(offers.map((o) => o.work_mode))).filter(Boolean);

  const filteredOffers = offers.filter((offer) => {
    const matchDept = selectedDepartment === "all" || offer.department === selectedDepartment;
    const matchMode = selectedWorkMode === "all" || offer.work_mode === selectedWorkMode;
    return matchDept && matchMode;
  });

  return (
    <div className="min-h-screen bg-piedra flex flex-col font-sans text-nogal selection:bg-chilca/20">
      {/* ── HEADER FIJO ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-piedra/90 backdrop-blur-md shadow-sm border-nogal/10 py-3"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 flex justify-between items-center">
          <SiteNavigationMenu isScrolled={isScrolled} />

          <a href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group">
            <img
              src="/images.png"
              alt="Las Flores"
              className={`transition-all duration-300 origin-center ${
                isScrolled ? "h-8 opacity-100" : "h-10 md:h-12 opacity-100 invert brightness-0"
              }`}
              style={
                isScrolled
                  ? {
                      filter:
                        "brightness(0) saturate(100%) invert(19%) sepia(16%) saturate(740%) hue-rotate(346deg) brightness(96%) contrast(89%)",
                    }
                  : {}
              }
            />
          </a>

          <div className="w-8" />
        </div>
      </header>

      {/* ── HERO PORTADA COMPLETA (FULLSCREEN 100VH) ── */}
      <section className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center items-center px-6 md:px-12 lg:px-20">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Equipo de Restaurante Las Flores"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-nogal/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-piedra via-black/20 to-black/75" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 pt-16">
          <span className="inline-block text-xs uppercase tracking-[0.3em] font-bold text-cream/90 bg-eucalipto/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 border border-white/20 shadow-md">
            Trabaja con nosotros
          </span>
          <h1 className="font-serif font-medium text-5xl md:text-7xl lg:text-8xl text-piedra mb-6 tracking-tight drop-shadow-2xl">
            Crece con nosotros
          </h1>
          <p className="font-sans text-piedra/90 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            Forma parte de la tradición gastronómica y cultural de Ayacucho. Construye tu futuro laboral en la familia de Restaurante Las Flores.
          </p>
        </div>

        {/* Indicador de scroll "Desliza" */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-piedra/70 text-[10px] uppercase tracking-[0.4em] font-bold animate-bounce">
          <span>Desliza</span>
          <div className="w-1 h-3 rounded-full border border-piedra/50" />
        </div>
      </section>

      {/* ── PRINCIPIOS DE CULTURA ── */}
      <section className="py-16 md:py-20 px-6 md:px-12 lg:px-20 bg-white/60 border-b border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-ink mb-3">Nuestra Cultura Laboral</h2>
            <p className="text-ink/60 text-sm max-w-xl mx-auto">
              Nuestros valores fundamentales nos guían día a día para brindar experiencias inolvidables a nuestros visitantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-black/5 shadow-sm text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-eucalipto/10 text-eucalipto flex items-center justify-center mb-5">
                <Heart size={28} />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink mb-3">Pasión por el Servicio</h3>
              <p className="text-xs text-ink/70 leading-relaxed">
                Brindamos calidez, respeto y hospitalidad auténtica a cada uno de nuestros comensales y compañeros de trabajo.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-black/5 shadow-sm text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-eucalipto/10 text-eucalipto flex items-center justify-center mb-5">
                <Users size={28} />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink mb-3">Identidad y Equipo</h3>
              <p className="text-xs text-ink/70 leading-relaxed">
                Promovemos un ambiente colaborativo, inclusivo y orgulloso de la riqueza histórica y cultural de Ayacucho.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-black/5 shadow-sm text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-eucalipto/10 text-eucalipto flex items-center justify-center mb-5">
                <Award size={28} />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink mb-3">Desarrollo Constante</h3>
              <p className="text-xs text-ink/70 leading-relaxed">
                Apostamos por la capacitación continua, el reconocimiento del talento y la línea de carrera interna.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN DE VACANTES Y FORMULARIO ── */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto w-full flex-1">
        <div className="mb-10 text-center md:text-left">
          <h2 className="font-serif text-3xl md:text-4xl text-ink mb-2">Convocatorias Abiertas</h2>
          <p className="text-ink/60 text-sm">
            Explora las oportunidades laborales disponibles y envía tu postulación.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-ink/50 gap-4">
            <Loader2 size={36} className="animate-spin text-eucalipto" />
            <p className="text-sm font-medium">Cargando convocatorias disponibles…</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-red-50 border border-red-200 text-center max-w-md mx-auto">
            <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={loadOffers}
              className="px-5 py-2.5 bg-eucalipto text-cream font-bold text-xs rounded-xl hover:bg-eucalipto/90 transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-black/10 text-center max-w-lg mx-auto">
            <Briefcase size={48} className="text-ink/30 mx-auto mb-4" />
            <h3 className="font-serif font-bold text-2xl text-ink mb-2">Sin convocatorias activas</h3>
            <p className="text-sm text-ink/60 leading-relaxed">
              En este momento no tenemos convocatorias abiertas. ¡Vuelve pronto a revisar nuestras publicaciones!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filtros dinámicos (solo si hay más de 1 opción) */}
            {(departments.length > 1 || workModes.length > 1) && (
              <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-ink/60">Filtrar por:</span>

                {departments.length > 1 && (
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-cream border border-black/10 text-xs font-semibold text-ink outline-none cursor-pointer focus:border-eucalipto"
                  >
                    <option value="all">Todas las áreas ({departments.length})</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                )}

                {workModes.length > 1 && (
                  <select
                    value={selectedWorkMode}
                    onChange={(e) => setSelectedWorkMode(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-cream border border-black/10 text-xs font-semibold text-ink outline-none cursor-pointer focus:border-eucalipto"
                  >
                    <option value="all">Todas las modalidades</option>
                    {workModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode === "onsite" ? "Presencial" : mode === "hybrid" ? "Híbrido" : "Remoto"}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Layout en 2 columnas: Lista de Ofertas y Formulario Lateral */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem] gap-8 items-start">
              {/* Columna Izquierda: Tarjetas de Ofertas y Detalle */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOffers.map((offer) => (
                    <JobCard
                      key={offer.id}
                      offer={offer}
                      isSelected={selectedOffer?.id === offer.id}
                      onSelect={(o) => setSelectedOffer(o)}
                    />
                  ))}
                </div>

                {/* Detalle extendido de la oferta seleccionada */}
                {selectedOffer && (
                  <div className="p-6 lg:p-8 rounded-2xl bg-white border border-black/10 shadow-sm space-y-6 animate-in fade-in">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-eucalipto">
                        {selectedOffer.department} • {selectedOffer.location}
                      </span>
                      <h3 className="font-serif font-bold text-2xl lg:text-3xl text-ink mt-1">
                        {selectedOffer.title}
                      </h3>
                    </div>

                    <div className="prose prose-sm max-w-none text-ink/80 leading-relaxed">
                      <p>{selectedOffer.description || selectedOffer.summary}</p>

                      {selectedOffer.responsibilities?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-bold text-sm text-ink uppercase tracking-wider mb-2">
                            Responsabilidades
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-xs">
                            {selectedOffer.responsibilities.map((resp, i) => (
                              <li key={i}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedOffer.requirements?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-bold text-sm text-ink uppercase tracking-wider mb-2">
                            Requisitos
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-xs">
                            {selectedOffer.requirements.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedOffer.benefits?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-bold text-sm text-ink uppercase tracking-wider mb-2">
                            Beneficios
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-xs">
                            {selectedOffer.benefits.map((ben, i) => (
                              <li key={i}>{ben}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Formulario de Postulación */}
              <div className="sticky top-28">
                {selectedOffer ? (
                  <JobApplicationForm offer={selectedOffer} />
                ) : (
                  <div className="p-8 rounded-2xl bg-white border border-black/10 text-center text-ink/50">
                    <p className="text-sm">Selecciona una vacante de la lista para completar tu postulación.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── CIERRE EDITORIAL CON FOTO DEL EQUIPO ── */}
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-eucalipto text-cream relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 z-10">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-cream/75">
              Familia Las Flores
            </span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight">
              Más que un equipo, una familia apasionada por Ayacucho
            </h2>
            <p className="text-cream/90 text-sm md:text-base leading-relaxed">
              En Restaurante Las Flores valoramos la calidez humana, el respeto mutuo y el compromiso con nuestros clientes. Si buscas un ambiente de trabajo enriquecedor y con propósito, te estamos esperando.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
            <img
              src={heroImg}
              alt="Fotografía del equipo Las Flores"
              className="w-full h-80 lg:h-96 object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
