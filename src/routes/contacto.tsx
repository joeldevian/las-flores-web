import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { SiteNavigationMenu } from "../components/SiteNavigationMenu";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto | Restaurante Las Flores" },
      { name: "description", content: "Póngase en contacto con Restaurante Las Flores. Estamos listos para atender sus dudas, sugerencias o reservas especiales." },
    ],
  }),
  component: ContactoPage,
});

const heroImg = "/imagenes-reales/DESTINOS LISTO/CITY TOUR/PLAZA MAYOR DE HUAMANGA/PLAZA MAYOR DE HUAMANGA.webp";

function ContactoPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulación de envío
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-piedra flex flex-col font-sans text-nogal selection:bg-chilca/20">
      {/* ── HEADER FIJO ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          isScrolled ? "bg-piedra/90 backdrop-blur-md shadow-sm border-nogal/10 py-3" : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 flex justify-between items-center">
          <SiteNavigationMenu isScrolled={isScrolled} />
          
          <a href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group">
            <img 
              src="/images.png" 
              alt="Las Flores" 
              className={`transition-all duration-300 origin-center ${isScrolled ? "h-8 opacity-100" : "h-10 md:h-12 opacity-100 invert brightness-0"}`}
              style={isScrolled ? { filter: "brightness(0) saturate(100%) invert(19%) sepia(16%) saturate(740%) hue-rotate(346deg) brightness(96%) contrast(89%)" } : {}}
            />
          </a>

          {/* Spacer para equilibrar el header */}
          <div className="w-8" />
        </div>
      </header>

      {/* ── HERO CON IMAGEN ── */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 px-6 md:px-12 lg:px-20 overflow-hidden flex items-center min-h-[500px]">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Ambiente de Restaurante Las Flores"
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay oscuro para legibilidad */}
          <div className="absolute inset-0 bg-nogal/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-piedra via-black/20 to-black/80" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 mt-10">
          <h1 className="font-serif font-medium text-5xl md:text-7xl text-piedra mb-6 tracking-tight drop-shadow-xl">
            Contacto
          </h1>
          <p className="font-sans text-piedra/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Estaremos encantados de escucharte. Ya sea que desees reservar para una ocasión especial, tengas dudas sobre nuestra carta o simplemente quieras dejarnos tus comentarios.
          </p>
        </div>
      </section>

      {/* ── MAIN LAYOUT (2 COLUMNAS) ── */}
      <section className="px-6 md:px-12 lg:px-20 pb-24 flex-1 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* COLUMNA IZQUIERDA: Información */}
          <div className="flex flex-col justify-start space-y-12">
            <div>
              <h2 className="font-serif text-3xl mb-8">Información de Contacto</h2>
              <div className="space-y-6">
                
                {/* Ítem: Dirección */}
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 border border-nogal/10 group-hover:border-chilca/30 group-hover:bg-chilca/5 transition-colors">
                    <MapPin className="text-chilca" size={20} strokeWidth={2} />
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Nuestra Ubicación</h3>
                    <p className="text-nogal/70 leading-relaxed text-sm">
                      Jr. José Olaya 106,<br/>
                      Ayacucho, Perú.
                    </p>
                  </div>
                </div>

                {/* Ítem: Teléfonos */}
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 border border-nogal/10 group-hover:border-chilca/30 group-hover:bg-chilca/5 transition-colors">
                    <Phone className="text-chilca" size={20} strokeWidth={2} />
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Llámanos</h3>
                    <p className="text-nogal/70 leading-relaxed text-sm">
                      Reservas: (066) 31 1234<br/>
                      WhatsApp: +51 980 723 422
                    </p>
                  </div>
                </div>

                {/* Ítem: Correo */}
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 border border-nogal/10 group-hover:border-chilca/30 group-hover:bg-chilca/5 transition-colors">
                    <Mail className="text-chilca" size={20} strokeWidth={2} />
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Escríbenos</h3>
                    <p className="text-nogal/70 leading-relaxed text-sm">
                      restaurantelasfloresperu@gmail.com
                    </p>
                  </div>
                </div>

                {/* Ítem: Horario */}
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 border border-nogal/10 group-hover:border-chilca/30 group-hover:bg-chilca/5 transition-colors">
                    <Clock className="text-chilca" size={20} strokeWidth={2} />
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Horario de Atención</h3>
                    <p className="text-nogal/70 leading-relaxed text-sm">
                      Lunes a Viernes<br/>
                      7:00 a. m. - 5:00 p. m.<br/>
                      Sábado y Domingo<br/>
                      7:00 a. m. - 5:30 p. m.
                    </p>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Espacio para mapa */}
            <div className="w-full h-64 bg-white/50 border border-nogal/10 rounded-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center group-hover:bg-black/0 transition-colors">
                 <span className="text-nogal/50 font-semibold tracking-widest uppercase text-xs">Mapa de Ubicación</span>
              </div>
              <iframe 
                title="Mapa de Restaurante Las Flores"
                src="https://www.google.com/maps?q=-13.162825034398038,-74.21792188690533&z=17&output=embed"
                width="100%" 
                height="100%" 
                style={{ border: 0, opacity: 0.8 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="relative z-10 grayscale-[0.2] contrast-[1.1] transition-all hover:grayscale-0"
              />
            </div>
          </div>

          {/* COLUMNA DERECHA: Formulario */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(44,74,62,0.1)] border border-white flex flex-col justify-center h-fit">
            {submitted ? (
              <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-eucalipto/10 text-eucalipto rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} strokeWidth={2} />
                </div>
                <h3 className="font-serif text-3xl text-nogal mb-4">¡Mensaje Enviado!</h3>
                <p className="text-nogal/70 mb-8 max-w-sm mx-auto">
                  Gracias por escribirnos. Hemos recibido tu mensaje y nos pondremos en contacto contigo a la brevedad posible.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3.5 bg-nogal text-piedra rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-chilca transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-3xl mb-8">Envíanos un Mensaje</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-nogal/60 ml-1">Nombre Completo</label>
                      <input 
                        required
                        type="text" 
                        id="name" 
                        className="w-full px-4 py-3.5 bg-piedra/30 border border-nogal/10 rounded-xl focus:outline-none focus:border-chilca focus:bg-white transition-all text-sm placeholder:text-nogal/30"
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-wider text-nogal/60 ml-1">Teléfono</label>
                      <input 
                        required
                        type="tel" 
                        id="phone" 
                        className="w-full px-4 py-3.5 bg-piedra/30 border border-nogal/10 rounded-xl focus:outline-none focus:border-chilca focus:bg-white transition-all text-sm placeholder:text-nogal/30"
                        placeholder="Ej. 987 654 321"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-nogal/60 ml-1">Correo Electrónico</label>
                    <input 
                      required
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-3.5 bg-piedra/30 border border-nogal/10 rounded-xl focus:outline-none focus:border-chilca focus:bg-white transition-all text-sm placeholder:text-nogal/30"
                      placeholder="tucorreo@ejemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-wider text-nogal/60 ml-1">Asunto</label>
                    <select 
                      required
                      defaultValue=""
                      id="subject" 
                      className="w-full px-4 py-3.5 bg-piedra/30 border border-nogal/10 rounded-xl focus:outline-none focus:border-chilca focus:bg-white transition-all text-sm text-nogal appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Selecciona el motivo</option>
                      <option value="reserva">Reservas Generales</option>
                      <option value="eventos">Eventos y Recepciones</option>
                      <option value="facturacion">Consultas de Facturación</option>
                      <option value="sugerencia">Sugerencia o Reclamo</option>
                      <option value="otro">Otras Consultas</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-wider text-nogal/60 ml-1">Tu Mensaje</label>
                    <textarea 
                      required
                      id="message" 
                      rows={4}
                      className="w-full px-4 py-3.5 bg-piedra/30 border border-nogal/10 rounded-xl focus:outline-none focus:border-chilca focus:bg-white transition-all text-sm placeholder:text-nogal/30 resize-none"
                      placeholder="Escribe los detalles aquí..."
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-eucalipto text-piedra rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-[#1e3329] hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2 shadow-md shadow-eucalipto/20"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </span>
                    ) : (
                      <>
                        Enviar Mensaje
                        <Send size={16} strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
