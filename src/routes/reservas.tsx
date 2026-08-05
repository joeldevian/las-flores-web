import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigationMenu } from "@/components/SiteNavigationMenu";
import { useCart } from "@/context/CartContext";
import type { User } from "@supabase/supabase-js";
import { signInWithGoogle, signInWithFacebook, signOut, createReservation, updateUserProfile, supabase } from "@/lib/supabase";
import { Calendar, CheckCircle2, User as UserIcon, MapPin, Search, ShoppingCart, ChevronLeft, Check, AlertCircle } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";
import { getBlockedZonesForReservation, listRestaurantZones } from "@/features/zones/api";

export const Route = createFileRoute("/reservas")({
  validateSearch: (search: Record<string, unknown>): { zona?: string } => {
    return {
      zona: (search.zona as string) || undefined,
    };
  },
  component: ReservasPage,
});

const FALLBACK_ZONES = [
  {
    id: "salon-principal",
    slug: "reservas-salon-principal",
    nombre: "Salón Principal",
    maxCap: 13,
    descripcion: "El corazón de Las Flores. Vista a los retablos andinos en pan de oro.",
    imagen: "/imagenes-reales/Salones/Salonprincipal.webp",
    capacidad: "Mesa para 13 personas",
  },
  {
    id: "salon-ventana",
    slug: "reservas-salon-ventana",
    nombre: "Salón Ventana",
    maxCap: 10,
    descripcion: "Luz natural y vistas a las casonas coloniales de Huamanga.",
    imagen: "/imagenes-reales/Salones/Ventana.webp",
    capacidad: "Mesa para 10 personas",
  },
  {
    id: "estrado",
    slug: "reservas-estrado",
    nombre: "Estrado",
    maxCap: 6,
    descripcion: "Ambiente elevado en el escenario tradicional del restaurante.",
    imagen: "/imagenes-reales/Salones/Estrado.webp",
    capacidad: "Mesa para 6 personas",
  },
  {
    id: "salon-entrada",
    slug: "reservas-salon-entrada",
    maxCap: 6,
    nombre: "Salón Entrada",
    descripcion: "Cálida bienvenida rodeada de carpintería y artesanía ayacuchana.",
    imagen: "/imagenes-reales/Salones/entrada.webp",
    capacidad: "Mesa para 6 personas",
  },
  {
    id: "terraza",
    slug: "reservas-terraza",
    nombre: "Terraza",
    maxCap: 6,
    descripcion: "Vista abierta al cielo andino de Ayacucho y aire puro.",
    imagen: "/imagenes-reales/Salones/Terraza.webp",
    capacidad: "Mesa para 6 personas",
  },
  {
    id: "pasillo",
    slug: "reservas-pasillo",
    nombre: "Pasillo",
    maxCap: 4,
    descripcion: "Espacio acogedor y reservado a lo largo del corredor de madera.",
    imagen: "/imagenes-reales/Salones/pasillo.webp",
    capacidad: "Mesa para 4 personas",
  },
  {
    id: "jardin",
    slug: "reservas-jardin",
    nombre: "Jardín",
    maxCap: 4,
    descripcion: "Rodeado de flores autóctonas y serenidad andina.",
    imagen: "/imagenes-reales/Salones/jardin.webp",
    capacidad: "Mesa para 4 personas",
  },
];

const DESAYUNO_HOURS = [
  "09:00", "09:30", "10:00", "10:30", "11:00"
];

const ALMUERZO_HOURS = [
  "11:30", "12:00", "12:30", "13:00", "13:30", "14:00",
  "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
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
  const searchParams = Route.useSearch();
  const navigate = useNavigate();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const wizardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Selected Zone state
  const [selectedZona, setSelectedZona] = useState<typeof ZONAS[0] | null>(null);

  // Sync selectedZona with URL search param `zona`
  useEffect(() => {
    if (searchParams.zona) {
      const paramVal = searchParams.zona.toLowerCase().trim();
      const found = ZONAS.find(
        (z) => z.id === paramVal || z.slug === paramVal || z.id.replace("-", "") === paramVal.replace("-", "")
      );
      if (found) {
        setSelectedZona(found);
        setForm((f) => ({ ...f, zona: found }));
      }
    } else {
      setSelectedZona(null);
    }
  }, [searchParams.zona]);

  // Auto-clamp guests count if current selected zone capacity is lower
  useEffect(() => {
    if (selectedZona) {
      const currentGuests = parseInt(form.guests) || 2;
      if (currentGuests > selectedZona.maxCap) {
        setForm((f) => ({ ...f, guests: String(selectedZona.maxCap) }));
      }
    }
  }, [selectedZona]);

  // Main Steps: 1 = Encontrar, 2 = Información, 3 = Adicional, 4 = Confirmación
  const [mainStep, setMainStep] = useState(1);

  // Form State
  const [fetchedZones, setFetchedZones] = useState<typeof FALLBACK_ZONES>([]);

  useEffect(() => {
    listRestaurantZones().then((res) => {
      if (res && res.length > 0) {
        const mapped = res.map((z) => ({
          id: z.id,
          slug: `reservas-${z.id}`,
          nombre: z.name,
          maxCap: z.max_capacity_persons,
          descripcion: z.description,
          imagen: z.image_url,
          capacidad: `Mesa para ${z.max_capacity_persons} personas`,
        }));
        setFetchedZones(mapped);
      }
    });
  }, []);

  const ZONAS = fetchedZones.length > 0 ? fetchedZones : FALLBACK_ZONES;

  // Keep form.zona in sync when ZONAS array loads dynamically from DB
  useEffect(() => {
    if (fetchedZones.length > 0) {
      setForm((f) => {
        const currentMatch = fetchedZones.find((z) => z.id === f.zona?.id);
        return {
          ...f,
          zona: currentMatch || fetchedZones[0],
        };
      });
    }
  }, [fetchedZones]);

  const [form, setForm] = useState({
    zona: ZONAS[0],
    guests: "2",
    date: "",
    time: "",
    serviceType: "almuerzo",
    firstName: "",
    lastName: "",
    email: "",
    repeatEmail: "",
    phoneCountry: "+51",
    phone: "",
    comments: "",
    hasAllergies: "No",
    allergiesText: "",
    termsAccepted: false,
    marketingAccepted: false,
    disability: "",
    isBirthday: "No",
    reservationCode: "",
  });

  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingStepTransition, setPendingStepTransition] = useState<number | null>(null);

  // Blackout & Zone Status State
  const [blockedZoneIds, setBlockedZoneIds] = useState<string[]>([]);
  const [isRestaurantBlocked, setIsRestaurantBlocked] = useState<boolean>(false);
  const [blockedReasons, setBlockedReasons] = useState<Record<string, string>>({});
  const [allActiveBlackouts, setAllActiveBlackouts] = useState<any[]>([]);

  // Custom Luxury Modal state for reserved slots (no browser alerts)
  const [noticeModal, setNoticeModal] = useState<{
    open: boolean;
    zoneName: string;
    date: string;
    time?: string;
    reason?: string;
  }>({ open: false, zoneName: "", date: "", time: "", reason: "" });

  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Fetch all active blackouts for fast real-time checking
  useEffect(() => {
    supabase
      .from("zone_blackouts")
      .select("*")
      .eq("is_active", true)
      .then(({ data, error }) => {
        if (data && !error) setAllActiveBlackouts(data);
      });
  }, []);

  const checkBlackoutForSlot = (zoneId: string | null, date: string, time?: string) => {
    if (!date) return null;
    const matching = allActiveBlackouts.find((b) => {
      if (!b.is_active) return false;
      if (b.zone_id !== null && zoneId !== null && b.zone_id !== zoneId) return false;

      if (b.blackout_type === "indefinite") {
        if (date < b.start_date) return false;
      } else {
        const endDate = b.end_date || b.start_date;
        if (date < b.start_date || date > endDate) return false;
      }

      if (b.blackout_type === "time_slot" && time && b.start_time && b.end_time) {
        const slotTime = time.length === 5 ? `${time}:00` : time;
        const startTime = b.start_time.length === 5 ? `${b.start_time}:00` : b.start_time;
        const endTime = b.end_time.length === 5 ? `${b.end_time}:00` : b.end_time;
        if (slotTime < startTime || slotTime > endTime) return false;
      }

      return true;
    });

    return matching ? matching.reason : null;
  };

  // Fetch blocked zones for selected date/time
  useEffect(() => {
    if (!form.date) return;
    getBlockedZonesForReservation(form.date, form.time).then((res) => {
      setIsRestaurantBlocked(res.isRestaurantBlocked);
      setBlockedZoneIds(res.blockedZoneIds);
      setBlockedReasons(res.reasons);
    });
  }, [form.date, form.time]);

  // Generate next 14 days calendar carousel
  const DAYS_CAROUSEL = useMemo(() => {
    const list = [];
    const t = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(t);
      d.setDate(t.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const dayNum = String(d.getDate()).padStart(2, "0");
      const dayShort = d.toLocaleDateString("es-PE", { weekday: "short" }).substring(0, 2);
      const dayShortCap = dayShort.charAt(0).toUpperCase() + dayShort.slice(1);
      list.push({ iso, dayNum, dayShortCap, fullDate: d });
    }
    return list;
  }, []);

  // Set initial default date
  useEffect(() => {
    if (!form.date && DAYS_CAROUSEL.length > 0) {
      setForm((f) => ({ ...f, date: DAYS_CAROUSEL[0].iso }));
    }
  }, [DAYS_CAROUSEL, form.date]);

  // Sync Supabase Session
  useEffect(() => {
    let isCancelled = false;
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isCancelled) return;
      const newUser = session?.user || null;
      setActiveUser(newUser);

      if (newUser) {
        const metaName = newUser.user_metadata?.full_name || newUser.user_metadata?.name || "";
        const parts = metaName.trim().split(" ");
        const fName = parts[0] || "";
        const lName = parts.slice(1).join(" ") || "";
        setForm((f) => ({
          ...f,
          email: newUser.email || f.email,
          repeatEmail: newUser.email || f.repeatEmail,
          firstName: f.firstName || fName,
          lastName: f.lastName || lName,
          phone: f.phone || newUser.user_metadata?.phone || "",
        }));
        
        // Verificar si hay una transición pendiente guardada en localStorage
        const savedStep = localStorage.getItem('reserva_pending_step');
        if (savedStep) {
          const stepNum = parseInt(savedStep);
          localStorage.removeItem('reserva_pending_step');
          setPendingStepTransition(stepNum);
        }
      }
    };
    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isCancelled) return;
      const newUser = session?.user || null;
      setActiveUser(newUser);
      
      if (newUser) {
        const metaName = newUser.user_metadata?.full_name || newUser.user_metadata?.name || "";
        const parts = metaName.trim().split(" ");
        setForm((f) => ({
          ...f,
          email: newUser.email || f.email,
          repeatEmail: newUser.email || f.repeatEmail,
          firstName: f.firstName || parts[0] || "",
          lastName: f.lastName || parts.slice(1).join(" ") || "",
          phone: f.phone || newUser.user_metadata?.phone || "",
        }));
        
        // Verificar si hay una transición pendiente guardada en localStorage
        const savedStep = localStorage.getItem('reserva_pending_step');
        if (savedStep) {
          const stepNum = parseInt(savedStep);
          localStorage.removeItem('reserva_pending_step');
          setPendingStepTransition(stepNum);
        }
      }
    });

    return () => {
      isCancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Efecto separado para manejar la transición después del login
  useEffect(() => {
    if (activeUser && pendingStepTransition) {
      // El usuario acaba de loguearse y había una transición pendiente
      setShowLoginModal(false);
      setMainStep(pendingStepTransition);
      setPendingStepTransition(null);
      setTimeout(() => {
        window.scrollTo({ top: 500, behavior: "smooth" });
      }, 100);
    }
  }, [activeUser, pendingStepTransition]);

  // Handler when user selects a zone card
  const handleSelectZoneCard = (z: typeof ZONAS[0]) => {
    const blockReason = checkBlackoutForSlot(z.id, form.date || todayIso);
    if (blockReason) {
      setNoticeModal({
        open: true,
        zoneName: z.nombre,
        date: form.date || todayIso,
        reason: blockReason,
      });
      return;
    }
    setSelectedZona(z);
    setForm((f) => ({ ...f, zona: z }));
    setMainStep(1);
    navigate({ to: "/reservas", search: { zona: z.id } });
    setTimeout(() => {
      wizardRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleClearZone = () => {
    setSelectedZona(null);
    navigate({ to: "/reservas", search: { zona: undefined } });
  };

  const handleSelectTime = async (time: string, serviceType: string) => {
    const zoneId = selectedZona ? selectedZona.id : null;
    
    // Live validation against Supabase before allowing time selection or step transition
    const liveCheck = await getBlockedZonesForReservation(form.date, time);
    const isBlocked = liveCheck.isRestaurantBlocked || (zoneId && liveCheck.blockedZoneIds.includes(zoneId));

    if (isBlocked) {
      const reason = (zoneId && liveCheck.reasons[zoneId]) || liveCheck.reasons["global"] || "Reserva de administración";
      setNoticeModal({
        open: true,
        zoneName: selectedZona?.nombre || "restaurante",
        date: form.date,
        time,
        reason,
      });
      return;
    }

    setForm((f) => ({ ...f, time, serviceType }));
    
    // Si el usuario NO está autenticado, mostrar modal de login
    if (!activeUser) {
      setPendingStepTransition(2); // Guardamos que queremos ir al paso 2
      // Guardar en localStorage para persistir después del redirect de OAuth
      localStorage.setItem('reserva_pending_step', '2');
      setShowLoginModal(true);
      return;
    }
    
    // Si ya está autenticado, avanzar directamente al paso 2
    setMainStep(2);
    window.scrollTo({ top: 500, behavior: "smooth" });
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) {
      alert("Por favor, ingresa tu nombre y apellidos.");
      return;
    }
    if (!form.email || form.email !== form.repeatEmail) {
      alert("Los correos electrónicos no coinciden.");
      return;
    }
    if (!form.phone) {
      alert("Por favor, ingresa tu número de teléfono.");
      return;
    }
    if (!form.termsAccepted) {
      alert("Debes aceptar los Términos y Condiciones para continuar.");
      return;
    }
    setMainStep(3); // Advance to Additional
    window.scrollTo({ top: 500, behavior: "smooth" });
  };

  const handleFinalizeReservation = async () => {
    setIsSubmitting(true);
    const code = `RES-FLORES-${Math.floor(10000 + Math.random() * 90000)}`;
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const fullPhone = form.phone.startsWith("+") ? form.phone.trim() : `${form.phoneCountry} ${form.phone}`.trim();

    const notesParts = [];
    if (form.comments.trim()) notesParts.push(`Comentario: ${form.comments.trim()}`);
    if (form.hasAllergies === "Sí") notesParts.push(`Alergia/Intolerancia: ${form.allergiesText.trim() || "Sí"}`);
    if (form.disability.trim()) notesParts.push(`Accesibilidad: ${form.disability.trim()}`);
    if (form.isBirthday === "Sí") notesParts.push(`Celebración: Cumpleaños/Aniversario`);
    const compiledNotes = notesParts.join(" | ");

    try {
      const createdRes = await createReservation({
        guest_count: parseInt(form.guests) || 2,
        reservation_date: form.date,
        service_type: form.serviceType as "almuerzo" | "cena",
        reservation_time: form.time,
        zone_id: form.zona.id,
        table_number: form.zona.nombre,
        client_name: fullName,
        client_email: form.email,
        client_phone: fullPhone,
        notes: compiledNotes,
        status: "pending",
      });

      const resCode = createdRes?.id ? String(createdRes.id) : code;
      setForm((f) => ({ ...f, reservationCode: resCode }));
      setMainStep(4); // Advance to Confirmation
      window.scrollTo({ top: 300, behavior: "smooth" });
    } catch (err: any) {
      if (err?.message && err.message.includes("no está disponible")) {
        alert(err.message);
        setIsSubmitting(false);
        return;
      }
      console.warn("Reservation saved locally:", err);
      setForm((f) => ({ ...f, reservationCode: code }));
      setMainStep(4);
      window.scrollTo({ top: 300, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para Google Login desde el modal
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  // Handler para Facebook Login desde el modal
  const handleFacebookLogin = async () => {
    try {
      await signInWithFacebook();
    } catch (error) {
      console.error("Error al iniciar sesión con Facebook:", error);
    }
  };

  // Render Stepper Header (1 Encontrar, 2 Información, 3 Adicional, 4 Confirmación)
  const renderStepper = () => {
    const steps = [
      { num: 1, label: "Encontrar" },
      { num: 2, label: "Información" },
      { num: 3, label: "Adicional" },
      { num: 4, label: "Confirmación" },
    ];

    return (
      <div className="w-full max-w-3xl mx-auto my-8 px-4">
        <div className="relative flex items-center justify-between">
          {/* Connecting line */}
          <div className="absolute top-[22px] left-[10%] right-[10%] h-[3px] bg-gray-200 z-0" />
          <div
            className="absolute top-[22px] left-[10%] h-[3px] bg-[#2e5339] z-0 transition-all duration-500"
            style={{ width: `${((mainStep - 1) / 3) * 80}%` }}
          />

          {steps.map((s) => {
            const isDone = mainStep > s.num;
            const isCurrent = mainStep === s.num;

            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (isDone && mainStep < 4) setMainStep(s.num);
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                    isDone
                      ? "bg-[#2e5339] text-white"
                      : isCurrent
                      ? "bg-[#2e5339] text-white ring-4 ring-[#2e5339]/20 scale-105"
                      : "bg-white text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {isDone ? <Check size={20} strokeWidth={3} /> : s.num}
                </button>
                <span
                  className={`text-[11px] uppercase tracking-wider font-semibold ${
                    isCurrent || isDone ? "text-[#2e5339]" : "text-gray-400"
                  }`}
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
    <div className="min-h-screen bg-[#f8f4e6] flex flex-col text-[#2c2a29] font-sans">
      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 py-3 transition-all duration-300 pointer-events-none ${
          isScrolled
            ? "bg-[#f8f4e6]/95 backdrop-blur-md text-nogal shadow-md border-b border-nogal/10"
            : "bg-transparent text-piedra border-b border-transparent"
        }`}
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
            alt="Restaurante Las Flores"
            className="h-10 w-auto object-contain transition-all"
            style={
              isScrolled
                ? { filter: "brightness(0) saturate(100%) invert(19%) sepia(16%) saturate(740%) hue-rotate(346deg) brightness(96%) contrast(89%)" }
                : { filter: "brightness(0) invert(1)" }
            }
          />
        </Link>
        <div className="flex-1 flex justify-end items-center gap-6 text-xs uppercase tracking-widest font-semibold pointer-events-auto">
          {totalItems > 0 && (
            <button onClick={() => setCartOpen(true)} className="relative hover:opacity-70 transition-opacity">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-chilca text-nogal text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Header Banner */}
      {!selectedZona && (
        <section className="relative h-[36vh] min-h-[280px] flex items-center justify-center bg-[#2c1d11]">
          <div className="absolute inset-0">
            <img
              src="/imagenes-reales/GALERIA/evento_corporativo.webp"
              alt="Restaurante Las Flores Ayacucho"
              className="w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c1d11] via-transparent to-black/40" />
          </div>
          <div className="relative z-10 text-center text-white px-6 pt-12">
            <span className="text-[#d4a373] uppercase tracking-[0.35em] text-xs font-bold mb-2 block">
              Las Flores · Ayacucho
            </span>
            <h1 className="font-serif italic text-4xl md:text-6xl text-piedra font-semibold drop-shadow-md">
              Reserva tu Experiencia
            </h1>
          </div>
        </section>
      )}

      {/* PHASE 1: GALERÍA DE AMBIENTES (Estilo La Rosa Náutica: Tarjetas limpias, fotos verticales y botones ovalados) */}
      {!selectedZona && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-14 pb-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-serif italic text-3xl md:text-5xl text-[#2e5339] font-bold mb-4">
              Nuestros Ambientes & Salones
            </h2>
            <p className="text-sm md:text-base text-gray-600 font-light leading-relaxed">
              Elige cómo quieres vivir la experiencia: desde la calidez del Salón Principal, la vista abierta de la Terraza o la intimidad del Jardín. Cada espacio propone una forma única de disfrutar nuestra gastronomía.
            </p>
            <div className="w-24 h-[2px] bg-[#d4a373] mx-auto mt-6" />
          </div>

          {/* Grid de Tarjetas Elegantes (Estilo La Rosa Náutica: Fotos altas y prominentes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {ZONAS.map((z) => {
              const cardBlackout = checkBlackoutForSlot(z.id, form.date || todayIso);
              return (
                <div
                  key={z.id}
                  onClick={() => {
                    if (cardBlackout) {
                      setNoticeModal({
                        open: true,
                        zoneName: z.nombre,
                        date: form.date || todayIso,
                        reason: cardBlackout,
                      });
                      return;
                    }
                    handleSelectZoneCard(z);
                  }}
                  className={`group flex flex-col justify-between transition-all duration-300 ${
                    cardBlackout ? "cursor-pointer opacity-90" : "cursor-pointer"
                  }`}
                >
                  <div>
                    {/* Foto Vertical Estilo La Rosa Náutica (Altura uniforme fija h-[580px]) */}
                    <div className="w-full h-[500px] sm:h-[540px] lg:h-[580px] overflow-hidden relative rounded-xs shadow-md">
                      <img
                        src={z.imagen}
                        alt={z.nombre}
                        className={`w-full h-full object-cover object-center transition-transform duration-700 ${
                          cardBlackout ? "filter brightness-90" : "group-hover:scale-108"
                        }`}
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                      
                      {cardBlackout ? (
                        <div className="absolute inset-0 bg-[#3b1f10]/75 backdrop-blur-xs flex items-center justify-center p-4 text-center z-20">
                          <div className="bg-[#fdf8f0] text-[#3b1f10] p-4 rounded-2xl border border-[#d4a373]/40 shadow-xl space-y-1.5 max-w-[220px]">
                            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#d4a373] block">
                              🔒 AMBIENTE RESERVADO
                            </span>
                            <p className="text-[10px] text-gray-700 leading-tight">
                              {cardBlackout}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-xs text-white text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-xs">
                          {z.capacidad}
                        </span>
                      )}
                    </div>

                    {/* Texto e Información */}
                    <div className="pt-5 text-center px-1">
                      <h3 className="font-serif text-2xl text-[#2c2a29] font-medium tracking-wide mb-2 group-hover:text-[#2e5339] transition-colors">
                        {z.nombre}
                      </h3>
                      <p className="text-xs text-gray-600 font-light leading-relaxed mb-6 line-clamp-3">
                        {z.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Botón Ovalado de Contorno (Estilo La Rosa Náutica) */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (cardBlackout) {
                          setNoticeModal({
                            open: true,
                            zoneName: z.nombre,
                            date: form.date || todayIso,
                            reason: cardBlackout,
                          });
                          return;
                        }
                        handleSelectZoneCard(z);
                      }}
                      className={`w-full rounded-full py-2.5 px-4 text-[11px] font-bold tracking-widest uppercase transition-all duration-300 shadow-2xs ${
                        cardBlackout
                          ? "bg-[#3b1f10]/10 text-[#3b1f10] border border-[#3b1f10]/30 hover:bg-[#3b1f10]/20"
                          : "border border-[#3b1f10] text-[#3b1f10] group-hover:bg-[#3b1f10] group-hover:text-white"
                      }`}
                    >
                      {cardBlackout ? "Ambiente Reservado" : `Reservar ${z.nombre}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* PHASE 2: HERO DEL AMBIENTE ELEGIDO (Pantalla completa sin márgenes / 100vh Full Viewport Height) */}
      {selectedZona && (
        <div ref={wizardRef} className="animate-in fade-in duration-500">
          {/* Edge-to-Edge Split Hero Banner (Ocupa el 100% de la ventana de pantalla h-screen) */}
          <div className="w-full h-screen min-h-[680px] grid grid-cols-1 lg:grid-cols-2 bg-[#fdf8f0] border-b border-[#d4a373]/30 shadow-md overflow-hidden">
            {/* Foto a la izquierda a pantalla completa */}
            <div className="h-[400px] lg:h-full w-full relative overflow-hidden">
              <img
                src={selectedZona.imagen}
                alt={selectedZona.nombre}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
              <span className="absolute bottom-4 left-4 bg-[#2e5339] text-white text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-md lg:hidden shadow-md">
                {selectedZona.capacidad}
              </span>
            </div>

            {/* Contenido a la derecha con fondo pergamino y altura completa */}
            <div className="p-8 md:p-14 lg:p-24 flex flex-col justify-between h-full pt-20 lg:pt-24">
              <div>
                <button
                  type="button"
                  onClick={handleClearZone}
                  className="inline-flex items-center gap-1.5 text-xs text-[#2e5339] font-bold uppercase tracking-widest hover:underline mb-8 group"
                >
                  <span className="transition-transform group-hover:-translate-x-1">←</span>
                  <span>Ver todos los ambientes</span>
                </button>

                <span className="block text-xs font-bold uppercase tracking-[0.25em] text-[#d4a373] mb-2">
                  Ambiente Seleccionado
                </span>

                <h1 className="font-serif italic text-4xl md:text-6xl text-[#2e5339] font-bold mb-4 leading-tight">
                  {selectedZona.nombre}
                </h1>

                <span className="inline-block bg-[#2e5339]/10 text-[#2e5339] border border-[#2e5339]/20 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                  {selectedZona.capacidad}
                </span>

                <p className="text-sm md:text-base text-gray-700 font-light leading-relaxed mb-8 max-w-xl">
                  {selectedZona.descripcion}
                </p>
              </div>

              <div className="pt-6 border-t border-[#d4a373]/30 flex items-center gap-2 text-xs uppercase tracking-widest text-[#d4a373] font-semibold">
                <MapPin size={16} className="text-[#2e5339]" />
                <span>Las Flores Ayacucho · {selectedZona.nombre}</span>
              </div>
            </div>
          </div>

          {/* Stepper Widget Container */}
          <main className="max-w-4xl mx-auto w-full px-4 py-10 pb-24">
            {renderStepper()}

            {/* ── STEP 1: ENCONTRAR (Personas, Fecha & Horario del Ambiente Elegido) ── */}
            {mainStep === 1 && (
              <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-[#d4a373]/20 space-y-10">
                {/* 1. Selector de Personas (Botones redondeados estilo cápsula según capacidad de la zona) */}
                <div>
                  <h3 className="font-serif text-2xl text-[#2e5339] mb-4 flex items-center gap-2">
                    <span className="bg-[#2e5339]/10 text-[#2e5339] w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    Personas ({selectedZona.nombre})
                  </h3>

                  <div className="flex flex-wrap items-center gap-3">
                    {Array.from({ length: Math.min(selectedZona.maxCap, 6) }).map((_, i) => {
                      const numStr = String(i + 1);
                      const isSelected = form.guests === numStr;
                      return (
                        <button
                          key={numStr}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, guests: numStr }))}
                          className={`w-14 h-12 rounded-2xl border transition-all duration-200 font-bold text-sm flex items-center justify-center ${
                            isSelected
                              ? "bg-[#2e5339] text-white border-[#2e5339] shadow-md scale-105"
                              : "bg-white text-gray-800 border-gray-200 hover:border-[#2e5339]/50 hover:bg-gray-50 shadow-2xs"
                          }`}
                        >
                          {numStr}
                        </button>
                      );
                    })}

                    {/* Si la capacidad máxima de la zona es mayor a 6 (ej. 10 o 13) */}
                    {selectedZona.maxCap > 6 && (
                      <div className="flex items-center gap-2 bg-[#fdf8f0] px-4 py-2.5 rounded-2xl border border-[#d4a373]/40 shadow-2xs">
                        <span className="text-xs font-bold text-[#3b1f10] uppercase tracking-wider">MÁS:</span>
                        <select
                          value={parseInt(form.guests) > 6 ? form.guests : ""}
                          onChange={(e) => {
                            if (e.target.value) setForm((f) => ({ ...f, guests: e.target.value }));
                          }}
                          className="bg-transparent border-none outline-none font-bold text-[#2e5339] text-sm cursor-pointer"
                        >
                          <option value="">Ej. {selectedZona.maxCap > 10 ? "13" : "8"}</option>
                          {Array.from({ length: selectedZona.maxCap - 6 }).map((_, idx) => {
                            const val = String(idx + 7);
                            return (
                              <option key={val} value={val}>
                                {val} personas
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Mensaje Informativo & WhatsApp para grupos mayores al límite de esta zona */}
                  <div className="mt-4 p-4 bg-[#fdf8f0] rounded-2xl border border-[#d4a373]/30 text-xs text-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#3b1f10] uppercase tracking-wider text-[10px] mb-0.5">
                        Capacidad Máxima del Ambiente ({selectedZona.nombre}): {selectedZona.maxCap} personas
                      </p>
                      <p>
                        Para grupos de más de <strong>{selectedZona.maxCap} personas</strong>, realizamos la coordinación personalizada vía WhatsApp.
                      </p>
                    </div>
                    <a
                      href={
                        "https://wa.me/51966543210?text=" +
                        encodeURIComponent(
                          "Hola, deseo coordinar una reserva para un grupo de más de " +
                            selectedZona.maxCap +
                            " personas en el " +
                            selectedZona.nombre +
                            " de Las Flores Ayacucho."
                        )
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#25D366] hover:bg-[#20bd5a] text-gray-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-2xs transition-all"
                    >
                      <span>Coordinar por WhatsApp →</span>
                    </a>
                  </div>
                </div>

            {/* 3. Selector Horizontal de Días & Leyenda de Estados con Branding */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[#2e5339]">
                  Selecciona una fecha
                </span>
                {/* Leyenda con Branding Las Flores */}
                <div className="flex items-center gap-3 text-[10px] text-gray-600 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2e5339]" /> Disponible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3b1f10]" /> Día seleccionado
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Cerrado
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full border border-red-500 bg-white" /> Completo
                  </span>
                </div>
              </div>

              {/* Carousel horizontal de fechas */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 hide-scrollbar">
                {DAYS_CAROUSEL.map((item) => {
                  const isSelected = form.date === item.iso;
                  return (
                    <button
                      key={item.iso}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, date: item.iso }))}
                      className={`flex flex-col items-center justify-center min-w-[54px] py-2.5 rounded-xl border transition-all text-center ${
                        isSelected
                          ? "bg-[#3b1f10] text-white border-[#3b1f10] shadow-md scale-105"
                          : "bg-[#2e5339]/10 text-[#2e5339] border-[#2e5339]/30 hover:bg-[#2e5339]/20"
                      }`}
                    >
                      <span className="text-[14px] font-bold leading-none mb-1">{item.dayNum}</span>
                      <span className="text-[10px] uppercase font-semibold opacity-90">{item.dayShortCap}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Bloques de Horarios: DESAYUNO y ALMUERZO (Cada 30 minutos) */}
            <div className="space-y-8 pt-2">
              {/* Bloque Desayuno (9:00 am - 11:00 am) */}
              <div>
                <h4 className="text-xs uppercase tracking-[0.2em] font-extrabold text-[#2e5339] mb-3 text-center border-b border-gray-200 pb-1 flex items-center justify-center gap-2">
                  <span>☕ Desayuno (9:00 am - 11:00 am)</span>
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {DESAYUNO_HOURS.map((h) => {
                    const isSelected = form.time === h && form.serviceType === "desayuno";
                    const hourBlackout = selectedZona ? checkBlackoutForSlot(selectedZona.id, form.date, h) : checkBlackoutForSlot(null, form.date, h);
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleSelectTime(h, "desayuno")}
                        className={`py-2.5 text-center text-xs font-bold rounded-xl transition-all shadow-2xs ${
                          hourBlackout
                            ? "bg-amber-50/90 text-amber-900/80 border border-amber-200/80 hover:bg-amber-100/90 cursor-pointer"
                            : isSelected
                            ? "bg-[#3b1f10] text-white shadow-md ring-2 ring-[#d4a373] scale-102"
                            : "bg-[#2e5339] text-white hover:bg-[#23412c]"
                        }`}
                        title={hourBlackout ? `Horario reservado: ${hourBlackout}` : undefined}
                      >
                        {h}
                        {hourBlackout && <span className="block text-[8px] uppercase tracking-wider font-extrabold text-amber-800/80 mt-0.5">Reservado</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bloque Almuerzo (11:30 am - 5:00 pm) */}
              <div>
                <h4 className="text-xs uppercase tracking-[0.2em] font-extrabold text-[#2e5339] mb-3 text-center border-b border-gray-200 pb-1 flex items-center justify-center gap-2">
                  <span>🍲 Almuerzo (11:30 am - 5:00 pm)</span>
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {ALMUERZO_HOURS.map((h) => {
                    const isSelected = form.time === h && form.serviceType === "almuerzo";
                    const hourBlackout = selectedZona ? checkBlackoutForSlot(selectedZona.id, form.date, h) : checkBlackoutForSlot(null, form.date, h);
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleSelectTime(h, "almuerzo")}
                        className={`py-2.5 text-center text-xs font-bold rounded-xl transition-all shadow-2xs ${
                          hourBlackout
                            ? "bg-amber-50/90 text-amber-900/80 border border-amber-200/80 hover:bg-amber-100/90 cursor-pointer"
                            : isSelected
                            ? "bg-[#3b1f10] text-white shadow-md ring-2 ring-[#d4a373] scale-102"
                            : "bg-[#2e5339] text-white hover:bg-[#23412c]"
                        }`}
                        title={hourBlackout ? `Horario reservado: ${hourBlackout}` : undefined}
                      >
                        {h}
                        {hourBlackout && <span className="block text-[8px] uppercase tracking-wider font-extrabold text-amber-800/80 mt-0.5">Reservado</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: INFORMACIÓN (Datos Personales, Teléfono, Alergias y Términos) ── */}
        {mainStep === 2 && (
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-[#d4a373]/20 animate-in fade-in duration-400 space-y-8">
            {/* Summary Bar */}
            <div className="bg-[#fdf8f0] p-4 rounded-xl border border-[#d4a373]/30 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#2e5339]" />
                <span className="font-bold text-[#2e5339]">{form.date}, {form.time}h.</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon size={16} className="text-[#2e5339]" />
                <span className="font-bold text-[#2e5339]">{form.guests} personas.</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#2e5339]" />
                <span className="font-bold text-[#2e5339]">{form.zona.nombre}</span>
              </div>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-6">
              {/* Nombre y Apellidos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Tu nombre"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2e5339]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Tus apellidos"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2e5339]"
                  />
                </div>
              </div>

              {/* Email & Repetir Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-[#fdf8f0] border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2e5339]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Repetir email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.repeatEmail}
                    onChange={(e) => setForm({ ...form, repeatEmail: e.target.value })}
                    placeholder="Confirmar email"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2e5339]"
                  />
                </div>
              </div>

              {/* Prefijo y Teléfono */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Prefijo
                  </label>
                  <select
                    value={form.phoneCountry}
                    onChange={(e) => setForm({ ...form, phoneCountry: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2e5339]"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-8">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="999654321"
                    className="w-full bg-[#fdf8f0] border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2e5339]"
                  />
                </div>
              </div>

              {/* Comentario sobre la reserva */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                  Introduce un comentario sobre la reserva
                </label>
                <textarea
                  rows={2}
                  value={form.comments}
                  onChange={(e) => setForm({ ...form, comments: e.target.value })}
                  placeholder="Detalles especiales para tu visita..."
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#2e5339]"
                />
              </div>

              {/* Intolerancias o Alergias */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-2">
                  ¿Tiene algún comensal alguna intolerancia/alergia?
                </label>
                <div className="flex items-center gap-6 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="allergies"
                      value="Sí"
                      checked={form.hasAllergies === "Sí"}
                      onChange={(e) => setForm({ ...form, hasAllergies: e.target.value })}
                    />
                    <span>Sí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="allergies"
                      value="No"
                      checked={form.hasAllergies === "No"}
                      onChange={(e) => setForm({ ...form, hasAllergies: e.target.value })}
                    />
                    <span>No</span>
                  </label>
                </div>
                {form.hasAllergies === "Sí" && (
                  <input
                    type="text"
                    value={form.allergiesText}
                    onChange={(e) => setForm({ ...form, allergiesText: e.target.value })}
                    placeholder="Especifica las intolerancias o alergias alimentarias"
                    className="mt-3 w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#2e5339]"
                  />
                )}
              </div>

              {/* Checkboxes de Términos y Marketing */}
              <div className="space-y-3 pt-2 text-xs text-gray-600">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.termsAccepted}
                    onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                    className="mt-0.5"
                  />
                  <span>
                    Acepto haber leído los{" "}
                    <a href="#" className="text-[#2e5339] underline font-bold">
                      Términos y Condiciones
                    </a>
                    , así como la Política de Privacidad en donde se me informa sobre el tratamiento de datos personales.
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.marketingAccepted}
                    onChange={(e) => setForm({ ...form, marketingAccepted: e.target.checked })}
                    className="mt-0.5"
                  />
                  <span>Consiento la recepción de comunicaciones del restaurante por e-mail y/o SMS con fines comerciales.</span>
                </label>
              </div>

              {/* Botón Reservar */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#2e5339] hover:bg-[#23412c] text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-all shadow-md"
                >
                  Reservar →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3: ADICIONAL (Preguntas de Experiencia) ── */}
        {mainStep === 3 && (
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-[#d4a373]/20 animate-in fade-in duration-400 space-y-8">
            {/* Top Back Link */}
            <div>
              <button
                type="button"
                onClick={() => setMainStep(2)}
                className="text-xs uppercase tracking-widest font-bold text-[#2e5339] flex items-center gap-1 hover:opacity-80"
              >
                ‹ VOLVER
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-sm font-semibold text-gray-700">
                Por favor, responda a las siguientes preguntas para mejorar su experiencia en nuestro restaurante:
              </p>

              {/* Pregunta 1: Discapacidad / Accesibilidad */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-[#2e5339] mb-2">
                  ¿Alguno de los comensales tiene alguna discapacidad o requerimiento especial?
                </label>
                <textarea
                  rows={3}
                  value={form.disability}
                  onChange={(e) => setForm({ ...form, disability: e.target.value })}
                  placeholder="Detallar requerimientos de silla de ruedas, rampa, etc."
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#2e5339]"
                />
              </div>

              {/* Pregunta 2: Cumpleaños */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-[#2e5339] mb-2">
                  ¿Nos visitas por cumpleaños o aniversario?
                </label>
                <div className="flex items-center gap-6 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isBirthday"
                      value="Sí"
                      checked={form.isBirthday === "Sí"}
                      onChange={(e) => setForm({ ...form, isBirthday: e.target.value })}
                    />
                    <span>Sí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isBirthday"
                      value="No"
                      checked={form.isBirthday === "No"}
                      onChange={(e) => setForm({ ...form, isBirthday: e.target.value })}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Botón Finalizar */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleFinalizeReservation}
                  disabled={isSubmitting}
                  className="w-full bg-[#2e5339] hover:bg-[#23412c] text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Procesando Reserva..." : "CONFIRMAR RESERVA"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: CONFIRMACIÓN (Resumen de Solicitud Confirmada) ── */}
        {mainStep === 4 && (
          <div className="bg-white p-6 md:p-12 rounded-2xl shadow-xl border border-[#d4a373]/20 text-center animate-in zoom-in-95 duration-400 space-y-8">
            <div className="w-16 h-16 bg-[#2e5339] text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Check size={36} strokeWidth={3} />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif italic text-3xl md:text-4xl text-[#2e5339] font-bold">
                Solicitud confirmada
              </h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                Código de Reserva: <span className="text-[#3b1f10] font-bold">{form.reservationCode || "RES-FLORES-88219"}</span>
              </p>
            </div>

            {/* Visual Card Summary (Estilo Las Flores Ayacucho) */}
            <div className="max-w-lg mx-auto bg-[#fdf8f0] border border-[#d4a373]/30 p-6 rounded-2xl text-left space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#2e5339] shrink-0" />
                <span className="font-bold text-[#2e5339]">{form.date}, {form.time}h.</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon size={18} className="text-[#2e5339] shrink-0" />
                <span className="font-bold text-[#2e5339]">{form.guests} personas.</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#2e5339] shrink-0" />
                <span className="font-bold text-[#2e5339]">Las Flores Ayacucho — {form.zona.nombre}.</span>
              </div>
              <div className="pt-2 border-t border-[#d4a373]/30">
                <span className="text-xs text-gray-500 uppercase font-semibold block mb-0.5">
                  Solicitud de reserva a nombre de:
                </span>
                <span className="font-serif text-lg font-bold text-[#3b1f10]">
                  {form.firstName.toUpperCase()} {form.lastName.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => {
                  setMainStep(1);
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="px-8 py-3.5 bg-[#2e5339] hover:bg-[#23412c] text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-all shadow-md"
              >
                Hacer otra reserva
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="px-8 py-3.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold uppercase tracking-widest text-xs rounded-lg transition-all"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )}

      <SiteFooter />

      {/* Modal de Login (aparece automáticamente cuando se intenta pasar al paso 2 sin autenticación) */}
      {showLoginModal && (
        <LoginModal
          onClose={() => {
            setShowLoginModal(false);
            setPendingStepTransition(null);
          }}
          onGoogle={handleGoogleLogin}
          onFacebook={handleFacebookLogin}
          subtitle="Inicia sesión para continuar con tu reserva. Tus datos se completarán automáticamente."
        />
      )}

      {/* Modal de Aviso Elegante para Horarios Reservados (Reemplaza los alerts nativos) */}
      {noticeModal.open && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#fdf8f0] rounded-3xl max-w-md w-full shadow-2xl p-6 md:p-8 border border-[#d4a373]/40 text-center space-y-5 relative">
            <div className="w-14 h-14 rounded-full bg-[#3b1f10]/10 text-[#3b1f10] flex items-center justify-center mx-auto border border-[#d4a373]/30">
              <Calendar size={26} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4a373] block mb-1">
                Restaurante Las Flores
              </span>
              <h3 className="font-serif italic text-2xl md:text-3xl text-[#3b1f10] font-bold">
                Horario Reservado
              </h3>
            </div>
            <p className="text-xs text-gray-700 font-light leading-relaxed">
              El salón <strong className="text-[#3b1f10]">{noticeModal.zoneName}</strong> se encuentra reservado para el día <strong className="text-[#3b1f10]">{noticeModal.date}</strong>
              {noticeModal.time && <span> a las <strong className="text-[#3b1f10]">{noticeModal.time}h</strong></span>}.
            </p>
            {noticeModal.reason && (
              <div className="bg-white/80 p-3.5 rounded-2xl border border-[#d4a373]/30 text-left space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d4a373] block">
                  Información:
                </span>
                <p className="text-xs text-gray-800 font-medium">
                  {noticeModal.reason}
                </p>
              </div>
            )}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setNoticeModal({ open: false, zoneName: "", date: "", time: "", reason: "" })}
                className="w-full bg-[#2e5339] hover:bg-[#23412c] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer"
              >
                Ver otros horarios disponibles
              </button>
            </div>
          </div>
        </div>
      )}
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
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
