import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Car, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  Compass, 
  CreditCard, 
  HelpCircle, 
  ExternalLink 
} from "lucide-react";
import { SiteNavigationMenu } from "../components/SiteNavigationMenu";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto & Concierge | Restaurante Las Flores Ayacucho" },
      { name: "description", content: "Póngase en contacto con Restaurante Las Flores en Ayacucho. Atención al cliente, reservas corporativas, concierge por WhatsApp y ubicación." },
    ],
  }),
  component: ContactoPage,
});

const heroImg = "/imagenes-reales/DESTINOS LISTO/CITY TOUR/PLAZA MAYOR DE HUAMANGA/PLAZA MAYOR DE HUAMANGA.webp";

// FAQS reales del Restaurante Las Flores Ayacucho
const FAQS = [
  {
    q: "¿Cuáles son sus horarios de atención?",
    a: "Atendemos de Lunes a Domingo de 7:00 a.m. a 5:30 p.m. Servimos desayunos tradicionales ayacuchanos desde temprano y almuerzos típicos hasta la tarde.",
  },
  {
    q: "¿Con cuánta anticipación debo realizar una reserva?",
    a: "Recomendamos reservar con al menos 24 horas de anticipación para fines de semana, días festivos (como Semana Santa o Fiestas Patrias) o para grupos mayores a 6 personas.",
  },
  {
    q: "¿Realizan envíos a domicilio (Delivery)?",
    a: "Sí, realizamos delivery a todo Huamanga y también puedes hacer tu pedido para llevar directamente en el restaurante o por WhatsApp.",
  },
  {
    q: "¿Cuáles son las especialidades tradicionales de la casa?",
    a: "Nuestros platos estrella son el Chicharrón con Chapla Ayacuchana, Cuy Chactado, Puca Picante, Mondongo Ayacuchano y nuestro tradicional Ponche Ayacuchano.",
  },
  {
    q: "¿Cuáles son los métodos de pago aceptados?",
    a: "Aceptamos pagos con Yape, Plin, tarjetas de crédito y débito (Visa, Mastercard, Amex), transferencias bancarias y efectivo.",
  },
];

function ContactoPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [language, setLanguage] = useState<"ES" | "EN">("ES");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Detección de horario de atención en vivo
  const [isOpenNow, setIsOpenNow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    // Calcular si está abierto
    const now = new Date();
    const hours = now.getHours();
    setIsOpenNow(hours >= 7 && hours < 18);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8f4e6] flex flex-col font-sans text-[#2c2a29] selection:bg-[#2e5339]/20">
      {/* ── HEADER FIJO ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          isScrolled ? "bg-[#f8f4e6]/95 backdrop-blur-md shadow-sm border-nogal/10 py-3" : "bg-transparent border-transparent py-5"
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

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-all ${
                isScrolled ? "text-nogal border-nogal/20 hover:bg-black/5" : "text-white border-white/30 hover:bg-white/10"
              }`}
            >
              <img
                src={language === "ES" ? "https://flagcdn.com/w40/pe.png" : "https://flagcdn.com/w40/us.png"}
                alt={language === "ES" ? "Peru Flag" : "USA Flag"}
                className="w-4 h-auto rounded-[2px]"
              />
              <span className="text-xs font-bold">{language}</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${isLangDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 py-1.5 bg-white border border-[#d4a373]/30 rounded-xl shadow-xl min-w-[110px] z-50 animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    setLanguage("ES");
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold transition-colors ${
                    language === "ES" ? "bg-[#2e5339]/10 text-[#2e5339]" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <img src="https://flagcdn.com/w40/pe.png" alt="Peru Flag" className="w-4 h-auto rounded-[2px]" />
                  <span>ES (Español)</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage("EN");
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold transition-colors ${
                    language === "EN" ? "bg-[#2e5339]/10 text-[#2e5339]" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <img src="https://flagcdn.com/w40/us.png" alt="USA Flag" className="w-4 h-auto rounded-[2px]" />
                  <span>EN (English)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO DE LUJO CON IMAGEN & MEDALLA DORADA ── */}
      <section className="relative pt-40 pb-28 md:pt-48 md:pb-36 px-6 md:px-12 lg:px-20 overflow-hidden flex items-center min-h-[540px]">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Ambiente de Restaurante Las Flores Ayacucho"
            className="w-full h-full object-cover object-center scale-105 animate-pulse duration-10000"
          />
          <div className="absolute inset-0 bg-[#1a120b]/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f4e6] via-[#1a120b]/40 to-[#1a120b]/80" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#d4a373]/20 border border-[#d4a373]/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-[0.25em] uppercase shadow-lg">
            <Sparkles size={14} className="text-[#d4a373]" />
            <span>Concierge & Atención al Cliente</span>
          </div>

          <h1 className="font-serif font-bold text-4xl sm:text-6xl md:text-7xl text-white tracking-tight drop-shadow-xl leading-tight">
            Estamos a tu Servicio
          </h1>

          <p className="font-sans text-white/90 text-base md:text-xl max-w-2xl mx-auto leading-relaxed drop-shadow-md font-light">
            Ya sea para coordinar una reserva de mesa especial, organizar un banquete privado o realizar consultas sobre nuestra propuesta gastronómica.
          </p>

          {/* Bar de Beneficios Rápidos */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-white/90">
            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/10">
              <Phone size={14} className="text-[#d4a373]" /> Respuesta Inmediata
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/10">
              <Car size={14} className="text-[#d4a373]" /> Estacionamiento Privado & Valet
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/10">
              <ShieldCheck size={14} className="text-[#d4a373]" /> Atención VIP Personalizada
            </span>
          </div>
        </div>
      </section>

      {/* ── MAIN LAYOUT (2 COLUMNAS DE LUJO) ── */}
      <section className="px-4 md:px-12 lg:px-20 pb-24 flex-1 -mt-14 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* COLUMNA IZQUIERDA: Información de Contacto (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tarjeta 1: Estado en Vivo & Ubicación */}
            <div className="bg-[#fdf8f0] p-6 md:p-8 rounded-3xl shadow-xl border border-[#d4a373]/30 space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#d4a373]/20 pb-4">
                <span className="font-serif text-xl font-bold text-[#2e5339]">
                  Nuestra Casa Colonial
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                    isOpenNow
                      ? "bg-emerald-100/80 text-emerald-900 border border-emerald-300"
                      : "bg-amber-100/80 text-amber-900 border border-amber-300"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isOpenNow ? "bg-emerald-600 animate-ping" : "bg-amber-600"}`} />
                  {isOpenNow ? "Abierto Ahora" : "Atención por WhatsApp"}
                </span>
              </div>

              {/* Ítem: Dirección */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#2e5339]/10 text-[#2e5339] rounded-2xl flex items-center justify-center shrink-0 border border-[#2e5339]/20 shadow-xs">
                  <MapPin size={22} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#d4a373]">
                    Ubicación Estratégica
                  </h4>
                  <p className="font-serif text-base font-bold text-[#2c2a29]">
                    Jr. José Olaya 106
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    Huamanga — Ayacucho, Perú (A 2 cuadras de la Plaza Mayor).
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href="https://www.google.com/maps?q=-13.162825034398038,-74.21792188690533"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f4e6] hover:bg-[#2e5339] hover:text-white text-[#2c2a29] border border-[#d4a373]/30 rounded-xl text-[11px] font-bold transition-all shadow-xs"
                    >
                      <Compass size={12} />
                      <span>Google Maps</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Ítem: Horario */}
              <div className="flex items-start gap-4 pt-2 border-t border-[#d4a373]/20">
                <div className="w-12 h-12 bg-[#2e5339]/10 text-[#2e5339] rounded-2xl flex items-center justify-center shrink-0 border border-[#2e5339]/20 shadow-xs">
                  <Clock size={22} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#d4a373]">
                    Horario de Atención
                  </h4>
                  <div className="text-xs text-gray-700 space-y-1 font-medium">
                    <p className="flex justify-between gap-4">
                      <span>Lunes a Viernes:</span>
                      <strong className="text-[#2e5339]">07:00 am – 05:00 pm</strong>
                    </p>
                    <p className="flex justify-between gap-4">
                      <span>Sábados y Domingos:</span>
                      <strong className="text-[#2e5339]">07:00 am – 05:30 pm</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Ítem: Teléfonos & Direct WhatsApp */}
              <div className="flex items-start gap-4 pt-2 border-t border-[#d4a373]/20">
                <div className="w-12 h-12 bg-[#25D366]/15 text-[#125e2e] rounded-2xl flex items-center justify-center shrink-0 border border-[#25D366]/30 shadow-xs">
                  <MessageSquare size={22} strokeWidth={2.5} />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#d4a373]">
                    Atención Directa
                  </h4>
                  <p className="text-xs text-gray-600 font-medium">
                    Consultas & Envíos a Domicilio:
                  </p>
                  <a
                    href="https://wa.me/51980723422?text=Hola%20Restaurante%20Las%20Flores,%20deseo%20realizar%20una%20consulta"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-gray-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <MessageSquare size={16} />
                    <span>Chatear por WhatsApp (+51 980 723 422)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Mapa Interactivo con Borde Dorado */}
            <div className="bg-[#fdf8f0] p-2 rounded-3xl shadow-xl border border-[#d4a373]/30 overflow-hidden relative group">
              <div className="w-full h-64 rounded-2xl overflow-hidden relative">
                <iframe 
                  title="Mapa de Restaurante Las Flores"
                  src="https://www.google.com/maps?q=-13.162825034398038,-74.21792188690533&z=17&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="relative z-10 grayscale-[0.1] contrast-[1.05] transition-all group-hover:grayscale-0"
                />
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: Formulario de Mensaje Elegante (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-[#fdf8f0] rounded-3xl p-8 md:p-12 shadow-2xl border border-[#d4a373]/30 relative overflow-hidden">
              {/* Decoración de Pan de Oro */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a373]/10 rounded-bl-full pointer-events-none" />

              {submitted ? (
                <div className="text-center py-16 animate-in fade-in zoom-in duration-500 space-y-6">
                  <div className="w-20 h-20 bg-[#2e5339] text-white rounded-full flex items-center justify-center mx-auto shadow-xl ring-4 ring-[#2e5339]/20">
                    <CheckCircle2 size={44} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#d4a373] block">
                      Solicitud Recibida
                    </span>
                    <h3 className="font-serif text-3xl md:text-4xl text-[#2e5339] font-bold">
                      ¡Gracias por Escribirnos!
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
                    Nuestro equipo revisará tu mensaje y se pondrá en contacto contigo a la brevedad.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-8 py-3.5 bg-[#2e5339] hover:bg-[#23412c] text-white rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-md active:scale-[0.99] cursor-pointer"
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-8 space-y-2">
                    <span className="text-xs uppercase tracking-[0.3em] font-extrabold text-[#d4a373] block">
                      Atención Personalizada
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl text-[#2e5339] font-bold">
                      Envíanos un Mensaje
                    </h2>
                    <p className="text-xs text-gray-500">
                      Completa el siguiente formulario y nos comunicaremos contigo de forma prioritaria.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-700 ml-1">
                          Nombre Completo *
                        </label>
                        <input 
                          required
                          type="text" 
                          id="name" 
                          className="w-full px-4 py-3.5 bg-[#f8f4e6] border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2e5339] focus:bg-white transition-all text-sm placeholder:text-gray-400 font-medium"
                          placeholder="Ej. Juan Pérez"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-700 ml-1">
                          Teléfono / WhatsApp *
                        </label>
                        <input 
                          required
                          type="tel" 
                          id="phone" 
                          className="w-full px-4 py-3.5 bg-[#f8f4e6] border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2e5339] focus:bg-white transition-all text-sm placeholder:text-gray-400 font-medium"
                          placeholder="Ej. 987 654 321"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-700 ml-1">
                        Correo Electrónico *
                      </label>
                      <input 
                        required
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-3.5 bg-[#f8f4e6] border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2e5339] focus:bg-white transition-all text-sm placeholder:text-gray-400 font-medium"
                        placeholder="tucorreo@ejemplo.com"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-gray-700 ml-1">
                        Motivo de Consulta *
                      </label>
                      <select 
                        required
                        defaultValue=""
                        id="subject" 
                        className="w-full px-4 py-3.5 bg-[#f8f4e6] border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2e5339] focus:bg-white transition-all text-sm text-gray-800 font-medium cursor-pointer"
                      >
                        <option value="" disabled>Selecciona el motivo de tu consulta</option>
                        <option value="reserva">Reserva de Mesa o Zona Especial</option>
                        <option value="delivery">Consulta de Delivery / Pedidos para Llevar</option>
                        <option value="eventos">Eventos Privados & Reuniones Familiares</option>
                        <option value="facturacion">Consultas de Facturación & Comprobantes</option>
                        <option value="sugerencia">Sugerencias o Comentarios</option>
                        <option value="otro">Otras Consultas</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-gray-700 ml-1">
                        Detalle de tu Mensaje *
                      </label>
                      <textarea 
                        required
                        id="message" 
                        rows={4}
                        className="w-full px-4 py-3.5 bg-[#f8f4e6] border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2e5339] focus:bg-white transition-all text-sm placeholder:text-gray-400 resize-none font-medium"
                        placeholder="Escribe tu mensaje, sugerencia o detalle del pedido aquí..."
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[#2e5339] hover:bg-[#23412c] text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg hover:shadow-xl active:scale-[0.99] cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Enviando Mensaje...
                        </span>
                      ) : (
                        <>
                          <span>Enviar Mensaje</span>
                          <Send size={16} strokeWidth={2.5} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>

        {/* ── SECCIÓN PREGUNTAS FRECUENTES (FAQS ELEGANTES & REALES) ── */}
        <div className="max-w-5xl mx-auto pt-20">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] font-extrabold text-[#d4a373] block">
              Información Útil
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#2e5339] font-bold">
              Preguntas Frecuentes
            </h2>
            <p className="text-xs text-gray-600">
              Resolvemos tus dudas sobre nuestros horarios, delivery, reservas y especialidades.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#fdf8f0] rounded-2xl border border-[#d4a373]/30 overflow-hidden shadow-xs hover:border-[#d4a373]/60 transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer hover:bg-[#f8f4e6]/70 transition-colors"
                  >
                    <span className="font-serif font-bold text-base text-[#2c2a29] flex items-center gap-3">
                      <HelpCircle size={18} className="text-[#d4a373] shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-[#2e5339] shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-xs text-gray-700 leading-relaxed border-t border-[#d4a373]/20 bg-[#f8f4e6]/50 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </section>

      <SiteFooter />
    </div>
  );
}

