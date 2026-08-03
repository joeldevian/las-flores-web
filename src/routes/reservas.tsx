import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SeatSelector } from "@/components/SeatSelector";
import { SiteNavigationMenu } from "@/components/SiteNavigationMenu";
import { useCart } from "@/context/CartContext";
import { signInWithGoogle, signOut, createReservation, updateUserProfile, supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Calendar, CheckCircle2, User as UserIcon, MapPin, Search, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/reservas")({
  component: ReservasPage,
});

const SERVICES = [
  {
    id: "desayuno",
    name: "Desayuno",
    times: ["09:00", "09:30", "10:00", "10:30", "11:00"],
  },
  {
    id: "almuerzo",
    name: "Almuerzo",
    times: ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"],
  },
];

const COUNTRY_CODES = [
  { code: "+51", iso: "pe", name: "Perú" },
  { code: "+54", iso: "ar", name: "Argentina" },
  { code: "+56", iso: "cl", name: "Chile" },
  { code: "+57", iso: "co", name: "Colombia" },
  { code: "+52", iso: "mx", name: "México" },
  { code: "+1", iso: "us", name: "USA" },
  { code: "+34", iso: "es", name: "España" },
];

function ReservasPage() {
  const navigate = useNavigate();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // main steps: 1 = Encontrar, 2 = Información, 3 = Adicional, 4 = Confirmación
  const [mainStep, setMainStep] = useState(1);
  // sub steps for 'Encontrar': 1 = Guests, 2 = Date, 3 = Time
  const [subStep, setSubStep] = useState(1);

  const [form, setForm] = useState({
    guests: "2",
    customGuests: "",
    date: "",
    service: "",
    time: "",
    table: "",
    name: "",
    email: "",
    phone: "",
    phoneCountry: "+51",
  });

  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [calendarOffset, setCalendarOffset] = useState(0); // months offset from today

  // Build a full calendar month grid
  const buildCalendarMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    // Monday-first: 0=Mon..6=Sun
    let startDow = firstDay.getDay(); // 0=Sun,1=Mon..6=Sat
    startDow = startDow === 0 ? 6 : startDow - 1; // shift so Mon=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const today = useMemo(() => new Date(), []);

  const DATES = useMemo(() => {
    const t = new Date();
    return Array.from({ length: 60 }).map((_, i) => {
      const d = new Date(t);
      d.setDate(t.getDate() + i);
      return {
        value: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("es-PE", { weekday: "short" }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString("es-PE", { month: "short" }),
      };
    });
  }, []);

  // Set default date to today
  useEffect(() => {
    if (!form.date && DATES.length > 0) {
      setForm((f) => ({ ...f, date: DATES[0].value }));
    }
  }, [DATES, form.date]);

  // Sync Supabase Session
  useEffect(() => {
    let isCancelled = false;
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isCancelled) return;
      const newUser = session?.user || null;
      setActiveUser(newUser);

      if (newUser) {
        setForm((f) => ({
          ...f,
          email: newUser.email || f.email,
          name: newUser.user_metadata?.full_name || newUser.user_metadata?.name || f.name,
          phone: newUser.user_metadata?.phone || f.phone,
        }));
      }
    };
    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isCancelled) return;
      setActiveUser(session?.user || null);
      if (session?.user) {
        setForm((f) => ({
          ...f,
          email: session.user.email || f.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || f.name,
          phone: session.user.user_metadata?.phone || f.phone,
        }));
        // Auto-advance if we were stuck on step 2 (Login)
        if (mainStep === 2) {
           checkProfileAndAdvance(session.user);
        }
      }
    });

    return () => {
      isCancelled = true;
      subscription.unsubscribe();
    };
  }, [mainStep]);

  const checkProfileAndAdvance = (user: User) => {
    const hasPhone = !!user.user_metadata?.phone;
    if (hasPhone) {
      setMainStep(3); // Go to table selection
    } else {
      // Stay on step 2 to ask for phone
    }
  };

  // Handlers for Encontrar (Step 1)
  const handleSelectGuests = (n: string) => {
    setForm((f) => ({ ...f, guests: n, customGuests: "" }));
    setSubStep(2); // Auto-advance to date
  };

  const handleSelectDate = (dateVal: string) => {
    setForm((f) => ({ ...f, date: dateVal }));
    setSubStep(3); // Auto-advance to time
  };

  const handleSelectTime = (time: string, serviceId: string) => {
    setForm((f) => ({ ...f, time, service: serviceId }));
    
    // Auto-advance to Information (Step 2)
    setMainStep(2);
    
    // If already logged in, check profile
    if (activeUser) {
       checkProfileAndAdvance(activeUser);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error("Google login error:", e);
    }
  };

  const handleCompleteProfile = async () => {
    if (!form.phone) return alert("Por favor, ingresa tu número de teléfono.");
    setIsSavingProfile(true);
    try {
      const fullPhone = form.phone.startsWith("+") ? form.phone.trim() : `${form.phoneCountry} ${form.phone}`.trim();
      await updateUserProfile({
        full_name: form.name,
        phone: fullPhone,
      });
      setMainStep(3); // Advance to Table Selection
    } catch (e) {
      console.warn("Error updating profile", e);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleTableSelect = async (tableId: string) => {
    setForm((f) => ({ ...f, table: tableId }));
    try {
      const fullPhone = form.phone.startsWith("+") ? form.phone.trim() : `${form.phoneCountry} ${form.phone}`.trim();
      await createReservation({
        guest_count: parseInt(form.guests) || 1,
        reservation_date: form.date,
        service_type: (form.service as "desayuno" | "almuerzo") || "almuerzo",
        reservation_time: form.time,
        table_number: tableId,
        client_name: form.name || "Usuario",
        client_email: form.email || "",
        client_phone: fullPhone,
        status: "pending",
      });
      setMainStep(4); // Advance to Confirmation
    } catch (e) {
      console.error("Reservation save error:", e);
      alert("Error al guardar la reserva.");
    }
  };

  const renderProgressBar = () => {
    const steps = [
      { num: 1, label: "Encontrar", icon: <Search size={16} /> },
      { num: 2, label: "Información", icon: <UserIcon size={16} /> },
      { num: 3, label: "Adicional", icon: <MapPin size={16} /> },
      { num: 4, label: "Confirmación", icon: <CheckCircle2 size={16} /> },
    ];

    return (
      <div className="w-full max-w-4xl mx-auto mb-12 mt-8">
        <div className="flex justify-between items-center relative">
          {/* Connecting Line */}
          <div className="absolute left-[12%] right-[12%] top-6 h-[2px] bg-nogal/10 -z-10" />
          
          {steps.map((s, i) => {
            const isActive = mainStep === s.num;
            const isCompleted = mainStep > s.num;
            return (
              <div key={s.num} className="flex flex-col items-center gap-3 w-1/4">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white
                    ${isActive ? "border-eucalipto text-eucalipto shadow-lg scale-110" : 
                      isCompleted ? "border-eucalipto text-eucalipto opacity-50" : 
                      "border-nogal/20 text-nogal/40"}`}
                >
                  {isCompleted ? <CheckCircle2 size={24} /> : <span className="font-serif text-lg font-bold">{s.num}</span>}
                </div>
                <span className={`text-xs uppercase tracking-widest font-bold transition-colors
                  ${isActive ? "text-eucalipto" : isCompleted ? "text-nogal" : "text-nogal/40"}`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f4e6] flex flex-col">
      {/* Nav — transparente en top, sólido al scrollear */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 py-2 md:py-3 transition-all duration-500 pointer-events-none
          ${isScrolled
            ? "bg-[#f8f4e6] text-nogal shadow-md border-b border-nogal/10"
            : "bg-transparent text-piedra"}`}
      >
        <div className="flex-1 flex justify-start items-center">
          <SiteNavigationMenu isScrolled={isScrolled} />
        </div>
        <Link
          to="/"
          className="flex-none pointer-events-auto"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src="/images.png"
            alt="Las Flores Logo"
            className={`w-auto object-contain transition-all duration-500 h-10`}
            style={isScrolled
              ? { filter: 'brightness(0) saturate(100%) invert(19%) sepia(16%) saturate(740%) hue-rotate(346deg) brightness(96%) contrast(89%)' }
              : { filter: 'brightness(0) invert(1)' }}
          />
        </Link>
        <div className="flex-1 flex justify-end items-center gap-6 md:gap-8 text-[11px] md:text-sm uppercase tracking-widest md:tracking-[0.15em] font-semibold pointer-events-auto">
          {totalItems > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative hover:opacity-70 transition-opacity"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-chilca text-nogal text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          )}
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img 
            src="/imagenes-reales/GALERIA/evento_corporativo.webp" 
            alt="Ambiente del Restaurante" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-6">
          <span className="text-eucalipto-light uppercase tracking-[0.3em] text-xs font-bold mb-4 block drop-shadow-md">
            Las Flores
          </span>
          <h1 className="font-serif text-5xl md:text-7xl mb-4 drop-shadow-lg">Reservas</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light drop-shadow">
            Un espacio pensado para disfrutar la gastronomía con mayor profundidad, donde cada visita es una experiencia única.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
        {renderProgressBar()}

        <div className="w-full min-h-[400px]">
          
          {/* --- PASO 1: ENCONTRAR --- */}
          {mainStep === 1 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Comensales */}
              <div className={subStep < 1 ? "opacity-50 pointer-events-none" : ""}>
                <h3 className="font-serif text-2xl text-nogal mb-6 flex items-center gap-3">
                  <span className="bg-eucalipto/10 text-eucalipto w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Personas
                </h3>
                <div className="flex flex-wrap gap-3">
                  {["1", "2", "3", "4", "5", "6"].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleSelectGuests(n)}
                      className={`w-14 h-12 rounded-xl border-2 transition-all font-bold text-sm
                        ${form.guests === n 
                          ? "bg-eucalipto text-piedra border-eucalipto shadow-sm" 
                          : "bg-white text-eucalipto border-nogal/10 hover:border-eucalipto/50 shadow-sm"}`}
                    >
                      {n}
                    </button>
                  ))}
                  <div className="flex items-center gap-2 bg-black/5 px-4 rounded-xl border border-nogal/10 focus-within:border-eucalipto transition-colors shadow-sm">
                    <span className="text-xs font-bold text-nogal/70 uppercase tracking-widest">Más:</span>
                    <input
                      type="number"
                      min="7"
                      max="30"
                      placeholder="Ej. 8"
                      value={form.customGuests}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, customGuests: e.target.value, guests: e.target.value }));
                        if (e.target.value) setSubStep(2);
                      }}
                      className="bg-transparent border-none outline-none w-12 py-3 text-center font-bold text-eucalipto text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Fecha — Calendario dos meses */}
              <div className={`transition-all duration-500 ${subStep < 2 ? "opacity-30 pointer-events-none filter blur-[2px]" : ""}`}>
                <hr className="border-nogal/10 mb-8 mt-8" />
                <h3 className="font-serif text-2xl text-nogal mb-6 flex items-center gap-3">
                  <span className="bg-eucalipto/10 text-eucalipto w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Fecha
                </h3>

                {/* Month navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCalendarOffset((o) => Math.max(0, o - 1))}
                    disabled={calendarOffset === 0}
                    className="w-8 h-8 rounded-full border border-nogal/20 flex items-center justify-center text-nogal hover:border-eucalipto hover:text-eucalipto transition-all disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <span className="text-sm font-semibold text-nogal/50 uppercase tracking-widest">
                    Selecciona una fecha
                  </span>
                  <button
                    onClick={() => setCalendarOffset((o) => o + 1)}
                    disabled={calendarOffset >= 1}
                    className="w-8 h-8 rounded-full border border-nogal/20 flex items-center justify-center text-nogal hover:border-eucalipto hover:text-eucalipto transition-all disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>

                {/* Two-month grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[calendarOffset, calendarOffset + 1].map((mOff) => {
                    const baseDate = new Date(today.getFullYear(), today.getMonth() + mOff, 1);
                    const year = baseDate.getFullYear();
                    const month = baseDate.getMonth();
                    const monthName = baseDate.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
                    const cells = buildCalendarMonth(year, month);
                    const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

                    return (
                      <div key={mOff}>
                        <h4 className="text-center font-semibold text-nogal/80 capitalize mb-4 text-sm tracking-wide">
                          {monthName}
                        </h4>
                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-2">
                          {DAY_LABELS.map((dl) => (
                            <div key={dl} className="text-center text-[11px] font-bold uppercase text-nogal/40">
                              {dl}
                            </div>
                          ))}
                        </div>
                        {/* Day cells */}
                        <div className="grid grid-cols-7 gap-y-1">
                          {cells.map((day, idx) => {
                            if (!day) return <div key={idx} />;
                            const dateObj = new Date(year, month, day);
                            const iso = dateObj.toISOString().split("T")[0];
                            const todayIso = today.toISOString().split("T")[0];
                            const isPast = iso < todayIso;
                            const isSelected = form.date === iso;
                            const isToday = iso === todayIso;
                            return (
                              <button
                                key={idx}
                                disabled={isPast}
                                onClick={() => handleSelectDate(iso)}
                                className={`mx-auto w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all
                                  ${isPast ? "text-nogal/20 cursor-default" :
                                    isSelected ? "bg-eucalipto text-piedra shadow-md" :
                                    isToday ? "ring-2 ring-eucalipto text-eucalipto font-bold hover:bg-eucalipto/10" :
                                    "text-nogal border border-nogal/20 hover:border-eucalipto hover:text-eucalipto"}
                                `}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hora */}
              <div className={`transition-all duration-500 ${subStep < 3 ? "opacity-30 pointer-events-none filter blur-[2px]" : ""}`}>
                <hr className="border-nogal/10 mb-8 mt-8" />
                <h3 className="font-serif text-2xl text-nogal mb-6 flex items-center gap-3">
                  <span className="bg-eucalipto/10 text-eucalipto w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Hora
                </h3>
                
                <div className="space-y-6">
                  {SERVICES.map((srv) => (
                    <div key={srv.id}>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-nogal/50 mb-3 text-left border-b border-nogal/10 pb-2">
                        {srv.name}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {srv.times.map((t) => (
                          <button
                            key={t}
                            onClick={() => handleSelectTime(t, srv.id)}
                            className={`w-20 py-2.5 rounded-lg border-2 transition-all font-bold text-sm
                              ${form.time === t 
                                ? "bg-eucalipto text-piedra border-eucalipto shadow-sm" 
                                : "bg-white text-nogal border-nogal/10 hover:border-eucalipto/50 shadow-sm"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* --- PASO 2: INFORMACIÓN --- */}
          {mainStep === 2 && (
            <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center mb-10">
                <h2 className="font-serif text-3xl text-nogal mb-3">Información</h2>
                <p className="text-nogal/60">Necesitamos tus datos para confirmar la reserva.</p>
              </div>

              {!activeUser ? (
                <div className="space-y-6">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full py-4 px-6 rounded-xl border border-nogal/20 hover:bg-nogal/5 flex items-center justify-center gap-3 transition-colors font-bold text-nogal text-lg"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                    Continuar con Google
                  </button>
                  <p className="text-center text-xs text-nogal/50">
                    Al continuar, aceptas nuestras políticas de privacidad.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-nogal/5 p-4 rounded-xl flex items-center gap-4">
                    {activeUser.user_metadata?.avatar_url ? (
                      <img src={activeUser.user_metadata.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 bg-nogal/20 rounded-full flex items-center justify-center font-bold text-nogal text-xl">
                        {form.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-nogal text-lg">{form.name}</p>
                      <p className="text-sm text-nogal/60">{form.email}</p>
                    </div>
                  </div>

                  {!activeUser.user_metadata?.phone && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-nogal uppercase tracking-widest">
                        Número de Teléfono
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={form.phoneCountry}
                          onChange={(e) => setForm({ ...form, phoneCountry: e.target.value })}
                          className="bg-black/5 border border-black/10 rounded-xl px-3 py-3 outline-none focus:border-eucalipto"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>{c.iso.toUpperCase()} {c.code}</option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="Tu número"
                          className="flex-1 bg-black/5 border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-eucalipto w-full"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCompleteProfile}
                    disabled={isSavingProfile}
                    className="w-full bg-eucalipto text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-eucalipto-dark transition-colors disabled:opacity-50 text-lg"
                  >
                    {isSavingProfile ? "Guardando..." : "Siguiente"}
                  </button>
                  
                  <button onClick={async () => { await signOut(); setMainStep(2); }} className="w-full text-center text-xs text-nogal/50 underline">
                    Usar otra cuenta
                  </button>
                </div>
              )}
            </div>
          )}
          {/* --- PASO 3: ADICIONAL (Selección de Ambiente y Mesa) --- */}
          {mainStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl text-nogal mb-3">Elige tu Ambiente</h2>
                <p className="text-nogal/60 text-lg">Selecciona el espacio perfecto para tu experiencia en Las Flores.</p>
              </div>

              {!form.table.startsWith("zone:") ? (
                <>
                  {/* Zone Photo Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {[
                      { id: "salon-entrada",   name: "Salón Entrada",   desc: "El primer saludo del restaurante. Ideal para grupos pequeños.",                     tables: 7,  img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80" },
                      { id: "salon-ventana",   name: "Salón Ventana",   desc: "Luz natural y vistas al exterior. Ambiente íntimo y cálido.",                       tables: 6,  img: "https://images.unsplash.com/photo-1550966871-3ed3cbe818b0?w=600&q=80" },
                      { id: "estrado",         name: "Estrado",         desc: "El escenario del restaurante. Perfecto para ocasiones especiales.",                  tables: 6,  img: "https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=600&q=80" },
                      { id: "salon-principal", name: "Salón Principal", desc: "El corazón del restaurante. Amplio y elegante para grupos grandes.",                tables: 13, img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80" },
                      { id: "jardin",          name: "Jardín",          desc: "Rodeado de naturaleza. La experiencia más fresca y tranquila.",                      tables: 4,  img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80" },
                      { id: "terraza",         name: "Terraza",         desc: "Vista al cielo de Ayacucho. El ambiente más especial y abierto.",                    tables: 14, img: "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80" },
                    ].map((zone) => (
                      <button
                        key={zone.id}
                        onClick={() => setForm((f) => ({ ...f, table: `zone:${zone.id}` }))}
                        className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 text-left focus:outline-none focus:ring-2 focus:ring-eucalipto"
                      >
                        {/* Photo */}
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={zone.img}
                            alt={zone.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        {/* Tables badge */}
                        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/30">
                          {zone.tables} mesas
                        </div>
                        {/* Text content */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h3 className="text-white font-serif text-xl font-bold mb-1 drop-shadow">{zone.name}</h3>
                          <p className="text-white/70 text-xs leading-relaxed line-clamp-2">{zone.desc}</p>
                        </div>
                        {/* Hover CTA */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="bg-white text-eucalipto font-bold text-sm px-5 py-2.5 rounded-full shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            Elegir este ambiente →
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => handleTableSelect("Aleatoria")}
                      className="text-nogal/50 hover:text-eucalipto text-sm underline underline-offset-4 transition-colors"
                    >
                      Asignarme la mejor mesa disponible automáticamente
                    </button>
                  </div>
                </>
              ) : (
                /* After zone selection → show seat map */
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button
                    onClick={() => setForm((f) => ({ ...f, table: "" }))}
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-nogal/60 hover:text-nogal transition-colors"
                  >
                    ← Cambiar ambiente
                  </button>
                  {(() => {
                    const ZONE_NAMES: Record<string, string> = {
                      "salon-entrada": "Salón Entrada", "salon-ventana": "Salón Ventana",
                      "estrado": "Estrado", "salon-principal": "Salón Principal",
                      "jardin": "Jardín", "terraza": "Terraza",
                    };
                    const zoneId = form.table.replace("zone:", "");
                    return (
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-8 bg-eucalipto rounded-full" />
                        <div>
                          <p className="text-xs text-nogal/50 uppercase tracking-widest font-bold">Ambiente seleccionado</p>
                          <h3 className="font-serif text-2xl text-nogal">{ZONE_NAMES[zoneId] ?? zoneId}</h3>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="w-full bg-[#f8f4e6] p-6 rounded-3xl border border-nogal/10 mb-6">
                    <SeatSelector
                      onSelectTable={handleTableSelect}
                      onSkip={() => handleTableSelect("Aleatoria")}
                      guestCount={parseInt(form.guests) || 1}
                      initialZone={form.table.replace("zone:", "")}
                    />
                  </div>
                </div>
              )}
            </div>
          )}


          {/* --- PASO 4: CONFIRMACIÓN --- */}
          {mainStep === 4 && (
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-eucalipto/10 text-eucalipto rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="font-serif text-4xl text-nogal mb-4">¡Reserva Confirmada!</h2>
              <p className="text-lg text-nogal/70 mb-8">
                Gracias, <strong>{form.name.split(" ")[0]}</strong>. Hemos enviado los detalles a tu correo.
              </p>
              
              <div className="w-full bg-[#f8f4e6] p-6 rounded-2xl border border-nogal/10 text-left space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-nogal/10 pb-4">
                  <span className="text-nogal/60 font-bold uppercase text-xs">Fecha y Hora</span>
                  <span className="font-serif text-lg text-nogal">{form.date} a las {form.time}</span>
                </div>
                <div className="flex justify-between items-center border-b border-nogal/10 pb-4">
                  <span className="text-nogal/60 font-bold uppercase text-xs">Comensales</span>
                  <span className="font-serif text-lg text-nogal">{form.guests} Personas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-nogal/60 font-bold uppercase text-xs">Mesa</span>
                  <span className="font-serif text-lg text-nogal uppercase tracking-widest">{form.table}</span>
                </div>
              </div>

              <button
                onClick={() => navigate({ to: "/" })}
                className="w-full bg-nogal text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-colors text-lg"
              >
                Volver al Inicio
              </button>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// Helper para ocultar scrollbars en el selector de fechas
const styles = `
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`;
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}
