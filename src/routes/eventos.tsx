import { createFileRoute, Link } from "@tanstack/react-router";
const heroImg = "/imagenes-reales/DESTINOS LISTO/CITY TOUR/PLAZA MAYOR DE HUAMANGA/PLAZA MAYOR DE HUAMANGA.webp";
const casaImg = "/imagenes-reales/CARTA/02042026-DSC04401.webp";
const equipoImg = "/imagenes-reales/EQUIPO/02042026-DSC05038.webp";
const retabloImg = "/imagenes-reales/ARTE Y CULTURA LISTO/RETABLO AYACUCHANO/Retablo-Ayacuchano.webp";
import { SiteFooter } from "@/components/site-footer";
import { useState, useTransition, lazy, Suspense } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
const ReservationModal = lazy(() => import("@/components/ReservationModal").then(m => ({ default: m.ReservationModal })));
const MenuModal = lazy(() => import("@/components/MenuModal").then(m => ({ default: m.MenuModal })));

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos y Recepciones | Restaurante Las Flores" },
      {
        name: "description",
        content:
          "Celebre bodas, almuerzos de negocios y reuniones familiares en los exclusivos ambientes de Restaurante Las Flores en Ayacucho.",
      },
    ],
  }),
  component: EventosPage,
});

function EventosPage() {
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    // Simulate network request
    setTimeout(() => {
      setFormStatus("success");
    }, 1500);
  };

  return (
    <div className="bg-cream text-ink font-sans selection:bg-retama/30">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 pt-4 pb-24 bg-gradient-to-b from-ink/95 via-ink/50 to-transparent text-cream pointer-events-none">
        <div className="flex-1 hidden md:flex gap-8 text-sm uppercase tracking-[0.15em] font-semibold pointer-events-auto">
          <Link to="/restaurante" className="hover:text-retama transition-colors">
            RESTAURANTE
          </Link>
        </div>
        <Link to="/" className="flex-none pointer-events-auto" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src="/images.png" alt="Las Flores Logo" className="h-14 md:h-16 w-auto object-contain brightness-0 invert" />
        </Link>
        <div className="flex-1 flex justify-end items-center gap-6 md:gap-8 text-sm uppercase tracking-[0.15em] font-semibold pointer-events-auto">
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

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-ink pt-20 pb-10">
        {/* Background Image with Slow Zoom */}
        <img
          src={heroImg}
          alt="Eventos en Restaurante Las Flores Ayacucho"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover opacity-60 animate-hero"
        />
        {/* Elegant Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/20 to-ink/95" />
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-10 pb-4 flex flex-col items-center text-center mt-8">
          {/* Decorative Top Accent */}
          <div className="w-px h-8 md:h-10 bg-retama/60 mb-5 animate-reveal"></div>
          
          <span className="text-retama font-semibold uppercase tracking-[0.4em] text-[10px] md:text-xs mb-5 block animate-reveal [animation-delay:100ms]">
            Celebre con nosotros
          </span>
          
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05] mb-6 w-full animate-reveal [animation-delay:200ms]">
            Eventos Memorables <br/> 
            <span className="italic font-light text-cream/90">en Ayacucho</span>
          </h1>
          
          <p className="text-sm md:text-base text-cream/80 max-w-[50ch] font-light leading-[1.8] animate-reveal [animation-delay:300ms]">
            Nuestros espacios, impregnados de historia y elegancia, son el escenario ideal para sus celebraciones más importantes. Celebre rodeado de la magia de Huamanga.
          </p>

          <button 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-transparent border border-retama/30 text-retama text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-retama hover:text-ink transition-colors animate-reveal [animation-delay:400ms] rounded-sm group"
          >
            Explorar Espacios 
            <span className="group-hover:translate-y-1 transition-transform">↓</span>
          </button>
        </div>
      </section>

      {/* Servicios de Eventos */}
      <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto space-y-32">
        
        {/* Bodas y Recepciones */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="flex-1">
            <div className="aspect-[4/3] rounded-sm overflow-hidden shadow-lg">
              <img src={retabloImg} alt="Bodas y Recepciones" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Bodas y Recepciones</h2>
            <p className="text-lg text-ink/70 leading-[1.7] mb-8">
              Haga de su día especial un momento inolvidable. Ofrecemos ambientes íntimos y majestuosos, un servicio impecable y propuestas gastronómicas diseñadas a medida para usted y sus invitados, fusionando la alta cocina con los sabores tradicionales.
            </p>
            <ul className="space-y-4 text-ink/80 font-medium">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-pantiwaita rounded-full"></span>
                Menú de degustación personalizado
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-pantiwaita rounded-full"></span>
                Salones privados exclusivos
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-pantiwaita rounded-full"></span>
                Atención preferencial
              </li>
            </ul>
          </div>
        </div>

        {/* Corporativo */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
          <div className="flex-1">
            <div className="aspect-[4/3] rounded-sm overflow-hidden shadow-lg">
              <img src={casaImg} alt="Eventos Corporativos" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Reuniones Corporativas</h2>
            <p className="text-lg text-ink/70 leading-[1.7] mb-8">
              El entorno perfecto para los negocios. Contamos con salones acondicionados para almuerzos ejecutivos, conferencias, y cenas de gala empresariales, garantizando privacidad y distinción.
            </p>
            <ul className="space-y-4 text-ink/80 font-medium">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-pantiwaita rounded-full"></span>
                Opciones de menú ejecutivo
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-pantiwaita rounded-full"></span>
                Equipamiento audiovisual (bajo solicitud)
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-pantiwaita rounded-full"></span>
                Coffee breaks premium
              </li>
            </ul>
          </div>
        </div>

        {/* Familiares */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="flex-1">
            <div className="aspect-[4/3] rounded-sm overflow-hidden shadow-lg">
              <img src={equipoImg} alt="Almuerzos Especiales" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Celebraciones Familiares</h2>
            <p className="text-lg text-ink/70 leading-[1.7] mb-8">
              Desde cumpleaños hasta aniversarios, Las Flores es el hogar perfecto para celebrar la vida con sus seres queridos. Disfrute de nuestra propuesta tradicional de compartir en el centro de la mesa, rodeado de un ambiente cálido y acogedor.
            </p>
            <ul className="space-y-4 text-ink/80 font-medium">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-pantiwaita rounded-full"></span>
                Platos diseñados para compartir
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-pantiwaita rounded-full"></span>
                Espacios modulares según la cantidad de invitados
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ink text-cream py-32 px-6 flex flex-col items-center justify-center text-center">
        <span className="text-retama font-medium uppercase tracking-[0.4em] text-xs mb-6 block animate-reveal">
          SU CELEBRACIÓN COMIENZA AQUÍ
        </span>
        <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-12 max-w-3xl text-balance animate-reveal [animation-delay:100ms]">
          Hagamos de su evento un recuerdo imborrable
        </h2>
        <button 
          onClick={() => setIsContactOpen(true)}
          className="px-10 py-5 text-[11px] uppercase tracking-[0.25em] font-bold rounded-sm animate-reveal [animation-delay:200ms] btn-yellow-hover"
        >
          <span>Solicitar Cotización</span>
        </button>
      </section>

      <SiteFooter />
      <Suspense fallback={null}>
        {isReservationOpen && <ReservationModal open={isReservationOpen} onClose={() => setIsReservationOpen(false)} />}
        {isMenuOpen && <MenuModal open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />}
      </Suspense>
      
      {/* Drawer Formulario Lateral */}
      {isContactOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Overlay oscuro con blur */}
          <div 
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsContactOpen(false)}
          />
          
          {/* Panel Lateral */}
          <div className="relative w-full max-w-md bg-cream text-ink h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
            <div className="p-8 border-b border-ink/10 flex justify-between items-center bg-cream sticky top-0 z-10">
              <h3 className="font-serif text-2xl">Cotizar Evento</h3>
              <button 
                onClick={() => setIsContactOpen(false)}
                className="text-ink/60 hover:text-ink transition-colors text-3xl font-light leading-none pb-1"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            
            <div className="p-8 flex-1">
              {formStatus === "success" ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-eucalipto/20 text-eucalipto rounded-full flex items-center justify-center text-3xl mb-4">
                    ✓
                  </div>
                  <h3 className="font-serif text-3xl">¡Solicitud Enviada!</h3>
                  <p className="text-ink/70 leading-[1.7]">
                    Hemos recibido su información. Nuestro equipo se pondrá en contacto pronto para afinar los detalles de su evento.
                  </p>
                  <button 
                    onClick={() => { setIsContactOpen(false); setTimeout(() => setFormStatus("idle"), 500); }}
                    className="mt-8 px-8 py-4 bg-ink text-cream text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-ink/80 transition-colors w-full rounded-sm"
                  >
                    CERRAR
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <p className="text-ink/60 text-sm mb-8 leading-relaxed font-light">
                    Complete los datos a continuación y nuestro coordinador se comunicará con usted a la brevedad.
                  </p>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="nombre" className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold block px-1">Nombre Completo</label>
                    <input type="text" id="nombre" required className="w-full bg-ink/[0.03] border border-ink/10 rounded-sm px-4 py-3 text-ink text-sm focus:outline-none focus:border-retama focus:bg-ink/[0.02] transition-colors" placeholder="Ej. Juan Pérez" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold block px-1">Correo Electrónico</label>
                    <input type="email" id="email" required className="w-full bg-ink/[0.03] border border-ink/10 rounded-sm px-4 py-3 text-ink text-sm focus:outline-none focus:border-retama focus:bg-ink/[0.02] transition-colors" placeholder="juan@correo.com" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="telefono" className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold block px-1">Teléfono</label>
                      <input type="tel" id="telefono" required className="w-full bg-ink/[0.03] border border-ink/10 rounded-sm px-4 py-3 text-ink text-sm focus:outline-none focus:border-retama focus:bg-ink/[0.02] transition-colors" placeholder="+51 987 654 321" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="invitados" className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold block px-1">Invitados</label>
                      <input type="number" id="invitados" min="1" className="w-full bg-ink/[0.03] border border-ink/10 rounded-sm px-4 py-3 text-ink text-sm focus:outline-none focus:border-retama focus:bg-ink/[0.02] transition-colors" placeholder="50" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="tipo" className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold block px-1">Tipo de Evento</label>
                    <div className="relative">
                      <select id="tipo" required defaultValue="" className="w-full bg-ink/[0.03] border border-ink/10 rounded-sm px-4 py-3 text-ink text-sm focus:outline-none focus:border-retama focus:bg-ink/[0.02] transition-colors appearance-none cursor-pointer">
                        <option value="" disabled>Seleccione...</option>
                        <option value="boda">Boda / Recepción</option>
                        <option value="corporativo">Corporativo</option>
                        <option value="familiar">Familiar</option>
                        <option value="otro">Otro</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink/40">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="fecha" className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold block px-1">Fecha Deseada</label>
                    <input type="date" id="fecha" className="w-full bg-ink/[0.03] border border-ink/10 rounded-sm px-4 py-3 text-ink text-sm focus:outline-none focus:border-retama focus:bg-ink/[0.02] transition-colors min-h-[44px]" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="mensaje" className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-semibold block px-1">Detalles Adicionales</label>
                    <textarea id="mensaje" rows={2} className="w-full bg-ink/[0.03] border border-ink/10 rounded-sm px-4 py-3 text-ink text-sm focus:outline-none focus:border-retama focus:bg-ink/[0.02] transition-colors resize-none" placeholder="Cuéntenos más sobre su evento..."></textarea>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={formStatus === "submitting"}
                      className="w-full py-4 bg-ink text-cream text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-retama hover:text-ink transition-colors disabled:opacity-50 rounded-sm shadow-md hover:shadow-lg"
                    >
                      {formStatus === "submitting" ? "ENVIANDO..." : "SOLICITAR COTIZACIÓN"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
