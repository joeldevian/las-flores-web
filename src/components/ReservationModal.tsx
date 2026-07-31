import { useState, useRef, useEffect, useMemo } from "react";
import { SeatSelector } from "./SeatSelector";
import { signInWithGoogle, signOut, createReservation, updateUserProfile, supabase } from "../lib/supabase";
import { CustomerHistoryModal } from "./CustomerHistoryModal";
import type { User } from "@supabase/supabase-js";
import { Clock, Calendar } from "lucide-react";

interface ReservationModalProps {
  open: boolean;
  onClose: () => void;
}

const SERVICES = [
  {
    id: "almuerzo",
    name: "Almuerzo",
    times: ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00"],
  },
  { id: "cena", name: "Cena", times: ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"] },
];

const COUNTRY_CODES = [
  { code: "+598", iso: "uy", name: "Uruguay" },
  { code: "+54", iso: "ar", name: "Argentina" },
  { code: "+56", iso: "cl", name: "Chile" },
  { code: "+595", iso: "py", name: "Paraguay" },
  { code: "+57", iso: "co", name: "Colombia" },
  { code: "+55", iso: "br", name: "Brasil" },
  { code: "+52", iso: "mx", name: "México" },
  { code: "+51", iso: "pe", name: "Perú" },
  { code: "+1", iso: "us", name: "USA" },
  { code: "+591", iso: "bo", name: "Bolivia" },
  { code: "+593", iso: "ec", name: "Ecuador" },
  { code: "+34", iso: "es", name: "España" },
];

// ─── Número total de pasos antes de la confirmación ───
const TOTAL_STEPS = 6;

export function ReservationModal({ open, onClose }: ReservationModalProps) {
  const [step, setStep] = useState(1);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const DATES = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return {
        value: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("es-PE", { weekday: "short" }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString("es-PE", { month: "short" }),
      };
    });
  }, []);

  const [form, setForm] = useState({
    guests: "",
    customGuests: "",
    date: "",
    service: "",
    time: "",
    table: "",
    name: "",
    email: "",
    phone: "+51 ",
    phoneCountry: "+51",
    acceptMarketing: true,
  });

  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [stepBeforeProfile, setStepBeforeProfile] = useState<number | null>(null);
  const [imgError, setImgError] = useState(false);
  const isLoggingInRef = useRef(false);

  // Evitar scroll en el fondo cuando el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const userFormEditedRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    let isCancelled = false;

    const syncSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (isCancelled) return;

        const newUser = session?.user || null;
        setActiveUser((prev) => {
          if (!prev && !newUser) return null;
          if (!prev || !newUser) return newUser;
          if (
            prev.id !== newUser.id ||
            JSON.stringify(prev.user_metadata) !== JSON.stringify(newUser.user_metadata)
          ) {
            return newUser;
          }
          return prev;
        });

        if (session?.user) {
          const hasPhone = !!session.user.user_metadata?.phone;

          if (!userFormEditedRef.current) {
            setForm((f) => ({
              ...f,
              email: session.user.email || f.email,
              name:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email ||
                f.name ||
                "Usuario Google",
              phone:
                session.user.user_metadata?.phone ||
                f.phone,
            }));
          }
          if (isLoggingInRef.current) {
            setStep((s) => {
              if (!hasPhone) {
                setStepBeforeProfile(s);
                return 5;
              }
              if (s === 4) return 6;
              if (s === 1) return 0;
              return s;
            });
            isLoggingInRef.current = false;
          } else {
            setStep((s) => (s === 4 ? (hasPhone ? 6 : 5) : s));
          }
        }
      } catch (e) {
        console.error("Error syncing session:", e);
      }
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isCancelled) return;
      const newUser = session?.user || null;
      setActiveUser((prev) => {
        if (!prev && !newUser) return null;
        if (!prev || !newUser) return newUser;
        if (
          prev.id !== newUser.id ||
          JSON.stringify(prev.user_metadata) !== JSON.stringify(newUser.user_metadata)
        ) {
          return newUser;
        }
        return prev;
      });

      if (session?.user) {
        const hasPhone = !!session.user.user_metadata?.phone;

        if (!userFormEditedRef.current) {
          setForm((f) => ({
            ...f,
            email: session.user.email || f.email,
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email ||
              f.name ||
              "Usuario Google",
            phone:
              session.user.user_metadata?.phone ||
              f.phone,
          }));
        }
        if (isLoggingInRef.current) {
          setStep((s) => {
            if (!hasPhone) {
              setStepBeforeProfile(s);
              return 5;
            }
            if (s === 4) return 6;
            if (s === 1) return 0;
            return s;
          });
          isLoggingInRef.current = false;
        } else {
          setStep((s) => (s === 4 ? (hasPhone ? 6 : 5) : s));
        }
      }
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SUPABASE_AUTH_SUCCESS") {
        isLoggingInRef.current = true;
        syncSession();
      }
    };
    const handleCustomAuth = (e: Event) => {
      const customUser = (e as CustomEvent).detail;
      if (customUser) {
        setActiveUser(customUser);
      }
      syncSession();
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes("supabase")) {
        syncSession();
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("supabase_auth_changed", handleCustomAuth);
    window.addEventListener("storage", handleStorage);

    return () => {
      isCancelled = true;
      subscription.unsubscribe();
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("supabase_auth_changed", handleCustomAuth);
      window.removeEventListener("storage", handleStorage);
    };
  }, [open]);

  // Handlers de navegación
  const handleGuestsNext = () => setStep(2);
  const handleDateNext = () => setStep(3);
  const handleTimeNext = async () => {
    if (form.email) {
      // Consultar la sesión activa directamente para evitar estado desactualizado
      const { data: { session } } = await supabase.auth.getSession();
      const hasPhone = !!(session?.user?.user_metadata?.phone);
      if (hasPhone) {
        setStep(6); // Ya logueado y tiene teléfono → ir directo a selección de mesa
      } else {
        setStep(5); // Ya logueado pero le falta teléfono → completar perfil
      }
    } else {
      setStep(4); // No logueado → pedir login
    }
  };

  const handleGoogleLogin = async () => {
    try {
      isLoggingInRef.current = true;
      await signInWithGoogle();
    } catch (e) {
      console.error("Google login error:", e);
      isLoggingInRef.current = false;
    }
  };

  // Guardar perfil en Supabase y avanzar al selector de mesa
  const handleCompleteProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        full_name: form.name,
        phone: form.phone.startsWith("+") ? form.phone.trim() : `${form.phoneCountry} ${form.phone}`.trim(),
      });
    } catch (e) {
      console.warn("No se pudo actualizar el perfil (continuando):", e);
    } finally {
      setIsSavingProfile(false);
      if (stepBeforeProfile !== null) {
        setStep(stepBeforeProfile === 4 ? 6 : stepBeforeProfile === 1 ? 0 : stepBeforeProfile);
        setStepBeforeProfile(null);
      } else {
        setStep(6);
      }
    }
  };

  const handleTableSelect = async (tableId: string) => {
    setForm((f) => ({ ...f, table: tableId }));
    try {
      await createReservation({
        guest_count: parseInt(form.guests) || 1,
        reservation_date: form.date,
        service_type: (form.service as "almuerzo" | "cena") || "almuerzo",
        reservation_time: form.time,
        table_number: tableId,
        client_name: form.name || "Usuario Google",
        client_email: form.email || "usuario@gmail.com",
        client_phone: form.phone ? (form.phone.startsWith("+") ? form.phone.trim() : `${form.phoneCountry} ${form.phone}`.trim()) : undefined,
        status: "pending",
      });
      setStep(7);
    } catch (e) {
      console.error("Reservation save error:", e);
      alert("Error al guardar la reserva. Por favor, intenta de nuevo.");
    }
  };

  const handleRandomTable = async () => {
    setForm((f) => ({ ...f, table: "Aleatoria" }));
    try {
      await createReservation({
        guest_count: parseInt(form.guests) || 1,
        reservation_date: form.date,
        service_type: (form.service as "almuerzo" | "cena") || "almuerzo",
        reservation_time: form.time,
        table_number: "Aleatoria",
        client_name: form.name || "Usuario Google",
        client_email: form.email || "usuario@gmail.com",
        client_phone: form.phone ? (form.phone.startsWith("+") ? form.phone.trim() : `${form.phoneCountry} ${form.phone}`.trim()) : undefined,
        status: "pending",
      });
      setStep(7);
    } catch (e) {
      console.error("Reservation save error:", e);
      alert("Error al guardar la reserva. Por favor, intenta de nuevo.");
    }
  };

  if (!open) return null;

  const progressPercent = ((step - 1) / TOTAL_STEPS) * 100;
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === form.phoneCountry) || COUNTRY_CODES[0];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-start sm:pt-2">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[390px] bg-[#f8f4e6] h-[92dvh] sm:h-[calc(100dvh-80px)] sm:max-h-[950px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-400 overflow-hidden rounded-t-3xl sm:rounded-3xl shrink-0">

        {/* ── HEADER FIJO ── */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#f8f4e6] border-b border-ink/8 z-10 shrink-0">

          {/* Izquierda: Selector de idioma */}
          <div className="w-12 flex items-center gap-1 text-ink/70">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-[10px] font-bold">ES</span>
          </div>

          {/* Centro: Logo */}
          <img
            src="/images.png"
            alt="Logo Las Flores"
            className="h-9 object-contain drop-shadow-sm scale-[1.25] origin-center"
          />

          {/* Derecha: avatar/saludo o ícono de persona */}
          <div className="w-12 flex justify-end">
            {activeUser ? (
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="Mi perfil e historial"
              >
                {activeUser.user_metadata?.avatar_url && !imgError ? (
                  <img
                    src={activeUser.user_metadata.avatar_url}
                    alt="Foto de perfil"
                    className="w-7 h-7 rounded-full object-cover border border-eucalipto/30 shadow-sm"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-black/5 text-ink flex items-center justify-center text-xs font-serif font-bold border border-black/10">
                    {(activeUser.user_metadata?.full_name || activeUser.email || "C")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center text-ink/50 hover:text-eucalipto transition-colors"
                aria-label="Iniciar sesión"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <div className="flex-1 overflow-y-auto relative px-6 pt-5 pb-4 custom-scrollbar bg-gradient-to-br from-[#f8f4e6] via-[#f8f4e6] to-[#eaddcd]">
          <div className="relative z-10 h-full">

            {/* ── PASO 0: BIENVENIDO DE NUEVO ── */}
            {step === 0 && (
              <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in-95 duration-500 text-center pb-8 pt-4">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-1">
                  Bienvenido de nuevo
                </h2>
                <p className="text-xl text-ink/70 mb-8">
                  {form.name.split(" ")[0]}
                </p>
                <button
                  onClick={async () => {
                     await signOut();
                     setStep(1);
                  }}
                  className="text-xs text-[#611224] font-bold uppercase tracking-widest hover:underline mb-12"
                >
                  ¿NO ERES TÚ?
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full max-w-[280px] py-4 rounded-xl bg-[#611224] text-cream font-bold text-sm tracking-wider transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  Hacer una reserva
                </button>
                
                <div className="mt-auto pt-8">
                   <p className="text-[10px] text-ink/40">desarrollado por <span className="font-bold text-[#f84c5c]">Meitre</span></p>
                </div>
              </div>
            )}

            {/* ── PASO 1: COMENSALES ── */}
            {step === 1 && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-6 mt-1">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink mb-1">
                    ¿Cuántos comensales?
                  </h2>
                  <p className="text-xs text-ink/70">Selecciona la cantidad de personas</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {["1", "2", "3", "4", "5", "6"].map((n) => (
                    <button
                      key={n}
                      onClick={() => setForm((f) => ({ ...f, guests: n, customGuests: "" }))}
                      className={`py-3.5 px-2 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-0.5
                        ${form.guests === n && !form.customGuests
                          ? "bg-eucalipto text-cream border-eucalipto shadow-sm scale-[1.02]"
                          : "bg-white border-black/10 hover:border-eucalipto/40 text-eucalipto shadow-xs"
                        }`}
                    >
                      <span className="text-2xl font-serif font-bold">{n}</span>
                      <span className="text-[10px] uppercase tracking-wider opacity-80">
                        {n === "1" ? "Persona" : "Personas"}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="bg-white/90 p-3.5 rounded-xl border border-black/10 mt-1 shadow-xs">
                  <p className="text-[10px] uppercase tracking-widest text-ink/60 mb-2 font-bold text-center">
                    Grupo de más de 6 personas
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="7"
                      max="30"
                      placeholder="Ej. 8"
                      value={form.customGuests}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, customGuests: e.target.value, guests: e.target.value }))
                      }
                      className="flex-1 bg-black/5 border border-black/10 rounded-lg focus:border-eucalipto outline-none px-3 py-1.5 text-base font-serif text-center transition-colors"
                    />
                    <span className="text-xs font-bold text-ink/70">Personas</span>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={handleGuestsNext}
                    disabled={!form.guests}
                    className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 text-sm
                      ${!form.guests
                        ? "bg-black/10 text-ink/40 border border-black/5 cursor-not-allowed"
                        : "bg-eucalipto text-cream hover:bg-eucalipto-dark hover:shadow-md"
                      }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {form.guests
                      ? `Continuar con ${form.guests} comensal${form.guests === "1" ? "" : "es"}`
                      : "Selecciona comensales"}
                  </button>
                </div>
              </div>
            )}

            {/* ── PASO 2: FECHA ── */}
            {step === 2 && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-ink/10">
                    <span className="text-xs font-bold text-ink flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {form.guests} Personas
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-ink mb-2 leading-tight">
                    ¿Cuándo te<br />gustaría visitarnos?
                  </h2>
                  <p className="text-sm text-ink/70 mt-2">Selecciona tu fecha preferida</p>
                </div>

                <div className="relative group">
                  <button
                    onClick={() => scrollContainerRef.current?.scrollBy({ left: -120, behavior: "smooth" })}
                    className="absolute left-[-15px] top-[45%] -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-ink/10 shadow-md rounded-full w-10 h-10 flex items-center justify-center text-ink hover:scale-105 transition-all"
                    aria-label="Anterior"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <div
                    ref={scrollContainerRef}
                    className="flex gap-3 overflow-x-auto py-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
                  >
                    {DATES.map((d, i) => (
                      <button
                        key={d.value}
                        onClick={() => setForm((f) => ({ ...f, date: d.value }))}
                        className={`flex-none w-[100px] h-[120px] snap-center rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1
                          ${form.date === d.value
                            ? "bg-eucalipto text-cream border-eucalipto shadow-md scale-[1.02]"
                            : "bg-white shadow-sm border-transparent hover:border-eucalipto/30 text-eucalipto"
                          }`}
                      >
                        <span className="text-xs uppercase tracking-widest opacity-80">{i === 0 ? "Hoy" : d.dayName}</span>
                        <span className="text-4xl font-serif">{d.dayNum}</span>
                        <span className="text-xs uppercase opacity-80">{d.month}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => scrollContainerRef.current?.scrollBy({ left: 120, behavior: "smooth" })}
                    className="absolute right-[-15px] top-[45%] -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-ink/10 shadow-md rounded-full w-10 h-10 flex items-center justify-center text-ink hover:scale-105 transition-all"
                    aria-label="Siguiente"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                <div className="mt-2 flex justify-center">
                  <button
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="flex items-center gap-2 text-sm font-bold text-ink hover:opacity-70 transition-opacity bg-white/50 backdrop-blur-md px-6 py-3 rounded-full border border-ink/10 shadow-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {form.date && !DATES.find((d) => d.value === form.date)
                      ? new Date(form.date + "T12:00").toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "long" })
                      : "Ver calendario completo"}
                  </button>
                  <input
                    ref={dateInputRef}
                    type="date"
                    style={{ width: 0, height: 0, opacity: 0, border: 0, padding: 0, margin: 0, position: "absolute" }}
                    min={new Date().toISOString().split("T")[0]}
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>

                <div className="mt-auto pt-8">
                  <button
                    onClick={handleDateNext}
                    disabled={!form.date}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2
                      ${!form.date
                        ? "bg-white/80 text-ink/40 backdrop-blur-md border border-ink/10 cursor-not-allowed"
                        : "bg-eucalipto text-cream hover:-translate-y-0.5 hover:shadow-lg"
                      }`}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* ── PASO 3: SERVICIO Y HORA ── */}
            {step === 3 && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center gap-2 mb-6">
                    <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-ink border border-ink/10 shadow-sm">
                      {form.guests} Personas
                    </span>
                    <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-ink border border-ink/10 shadow-sm">
                      {new Date(form.date + "T12:00").toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-ink mb-2">Selecciona una hora</h2>
                  <p className="text-sm text-ink/70">Elige tu horario disponible</p>
                </div>

                {!form.service ? (
                  <div className="flex flex-col gap-4">
                    {SERVICES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setForm((f) => ({ ...f, service: s.id }))}
                        className="p-8 bg-white/90 backdrop-blur-sm border-2 border-transparent hover:border-eucalipto/30 rounded-2xl shadow-sm hover:shadow-md transition-all text-center"
                      >
                        <span className="text-2xl font-serif text-eucalipto">{s.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <button
                      onClick={() => setForm((f) => ({ ...f, service: "", time: "" }))}
                      className="text-xs font-bold uppercase tracking-widest text-eucalipto mb-4 hover:opacity-70 flex items-center justify-center gap-2"
                    >
                      &larr; Cambiar a {form.service === "almuerzo" ? "Cena" : "Almuerzo"}
                    </button>

                    <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
                      {SERVICES.find((s) => s.id === form.service)?.times.map((t) => (
                        <button
                          key={t}
                          onClick={() => setForm((f) => ({ ...f, time: t }))}
                          className={`py-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2
                            ${form.time === t
                              ? "bg-eucalipto text-cream border-eucalipto shadow-md"
                              : "bg-white/80 border-transparent hover:border-eucalipto/30 text-eucalipto"
                            }`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span className="font-bold text-lg">{t}</span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <button
                        onClick={handleTimeNext}
                        disabled={!form.time}
                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2
                          ${!form.time
                            ? "bg-white/80 text-ink/40 backdrop-blur-md border border-ink/10 cursor-not-allowed"
                            : "bg-eucalipto text-cream hover:-translate-y-0.5 hover:shadow-lg"
                          }`}
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PASO 4: LOGIN GOOGLE ── */}
            {step === 4 && (
              <div className="flex flex-col h-full items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-3xl font-bold text-ink mb-3">Casi listo</h2>
                  <p className="text-sm text-ink/70 px-4 leading-relaxed">
                    Inicia sesión con Google para asociar tu reserva a tu cuenta de forma rápida y segura.
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-4 bg-white px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all border border-black/10 hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="font-serif font-bold text-ink">Continuar con Google</span>
                </button>
              </div>
            )}

            {/* ── PASO 5: PERFIL "Ya casi" ── */}
            {step === 5 && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h2 className="font-serif text-3xl font-bold text-ink mb-2">Ya casi</h2>
                  <p className="text-sm text-ink/70 px-2 leading-relaxed">
                    Agrega un teléfono para completar tu registro.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Indicador de Google */}
                  <div className="flex items-center gap-3 bg-white/80 border border-black/10 rounded-xl px-4 py-3 shadow-xs">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-sm font-medium text-ink/70">Continuando con Google</span>
                  </div>

                  {/* Nombre */}
                  <div className="flex items-center gap-3 bg-white/80 border border-black/10 rounded-xl px-4 py-3 shadow-xs">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-ink/40 shrink-0">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        userFormEditedRef.current = true;
                        setForm((f) => ({ ...f, name: e.target.value }));
                      }}
                      placeholder="Tu nombre completo"
                      className="flex-1 bg-transparent outline-none text-sm font-medium text-ink placeholder:text-ink/40"
                    />
                  </div>

                  {/* Teléfono con código de país */}
                  <div className="flex items-center gap-0 bg-white/80 border border-black/10 rounded-xl shadow-xs relative">
                    {/* Selector de país */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowCountryPicker((v) => !v)}
                        className="flex items-center gap-1.5 px-3 py-3 border-r border-black/10 bg-white/60 hover:bg-white/90 transition-colors text-sm font-bold text-ink rounded-l-xl h-full"
                      >
                        <img src={`https://flagcdn.com/w20/${selectedCountry.iso}.png`} alt={selectedCountry.name} className="w-5 h-auto rounded-[2px] shadow-sm" />
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/40">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {showCountryPicker && (
                        <div className="absolute top-full left-0 z-20 bg-white border border-black/10 rounded-xl shadow-xl mt-1 w-44 overflow-hidden max-h-52 overflow-y-auto">
                          {COUNTRY_CODES.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setForm((f) => {
                                  let newPhone = f.phone.trim();
                                  if (newPhone.startsWith(f.phoneCountry)) {
                                    newPhone = newPhone.slice(f.phoneCountry.length).trim();
                                  } else if (newPhone.startsWith("+")) {
                                    const spaceIdx = newPhone.indexOf(" ");
                                    if (spaceIdx !== -1) {
                                      newPhone = newPhone.slice(spaceIdx + 1).trim();
                                    }
                                  }
                                  return { ...f, phoneCountry: c.code, phone: c.code + " " + newPhone };
                                });
                                setShowCountryPicker(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-eucalipto/10 transition-colors text-left
                                ${form.phoneCountry === c.code ? "bg-eucalipto/5 font-bold text-eucalipto" : "text-ink"}`}
                            >
                              <img src={`https://flagcdn.com/w20/${c.iso}.png`} alt={c.name} className="w-5 h-auto rounded-[2px] shadow-sm" />
                              <span>{c.name}</span>
                              <span className="ml-auto text-xs text-ink/50">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder={`Ej: ${form.phoneCountry} 912 345 678`}
                      className="flex-1 bg-transparent outline-none px-3 py-3 text-sm font-medium text-ink placeholder:text-ink/30 rounded-r-xl"
                    />
                  </div>

                  {/* Email (solo lectura) */}
                  <div className="flex items-center gap-3 bg-black/5 border border-black/8 rounded-xl px-4 py-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-ink/30 shrink-0">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span className="text-sm text-ink/50 font-medium truncate">{form.email}</span>
                  </div>

                  {/* Checkbox marketing */}
                  <label className="flex items-start gap-3 cursor-pointer mt-1">
                    <div
                      onClick={() => setForm((f) => ({ ...f, acceptMarketing: !f.acceptMarketing }))}
                      className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all shrink-0 mt-0.5 cursor-pointer
                        ${form.acceptMarketing ? "bg-eucalipto border-eucalipto" : "bg-white border-black/20"}`}
                    >
                      {form.acceptMarketing && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2 6 5 9 10 3" />
                        </svg>
                      )}
                    </div>
                    <span
                      onClick={() => setForm((f) => ({ ...f, acceptMarketing: !f.acceptMarketing }))}
                      className="text-xs text-ink/70 leading-relaxed"
                    >
                      Acepto que el restaurante me envíe información ocasional sobre eventos especiales o celebraciones.
                    </span>
                  </label>
                </div>

                {/* Botón completar */}
                <div className="mt-auto pt-6 flex flex-col gap-3">
                  <button
                    onClick={handleCompleteProfile}
                    disabled={isSavingProfile || !form.phone}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2
                      ${isSavingProfile || !form.phone
                        ? "bg-black/10 text-ink/40 cursor-not-allowed"
                        : "bg-eucalipto text-cream hover:-translate-y-0.5 hover:shadow-lg"
                      }`}
                  >
                    {isSavingProfile ? (
                      <>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      "Completar registro"
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (stepBeforeProfile !== null) {
                        setStep(stepBeforeProfile === 4 ? 6 : stepBeforeProfile === 1 ? 0 : stepBeforeProfile);
                        setStepBeforeProfile(null);
                      } else {
                        setStep(6);
                      }
                    }}
                    className="text-xs text-ink/50 hover:text-ink/70 transition-colors text-center underline underline-offset-2"
                  >
                    Omitir por ahora
                  </button>
                </div>
              </div>
            )}

            {/* ── PASO 6: MESA (CROQUIS) ── */}
            {step === 6 && (
              <SeatSelector onSelectTable={handleTableSelect} onSkip={handleRandomTable} />
            )}

            {/* ── PASO 7: CONFIRMACIÓN ── */}
            {step === 7 && (
              <div className="flex flex-col h-full items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="relative mb-8">
                  <div className="absolute -inset-4 rounded-full bg-cream opacity-20 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-eucalipto flex items-center justify-center shadow-lg text-cream">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                </div>

                <h3 className="font-serif text-3xl font-bold text-ink mb-2">¡Reserva Confirmada!</h3>
                <p className="text-sm font-medium text-ink/70">
                  Hola {form.name.split(" ")[0]}, te hemos enviado los detalles a {form.email}.
                </p>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-sm text-left w-full mt-8 shadow-sm border border-ink/10">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/50 mb-4">Resumen</p>
                  <div className="space-y-3 font-medium text-ink">
                    <p className="flex justify-between border-b border-ink/10 pb-2">
                      <span className="opacity-70">Mesa:</span>
                      <strong>{form.table === "Aleatoria" ? "Asignación a la llegada" : form.table}</strong>
                    </p>
                    <p className="flex justify-between border-b border-ink/10 pb-2">
                      <span className="opacity-70">Fecha:</span>
                      <span className="capitalize">
                        {new Date(form.date + "T12:00").toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
                      </span>
                    </p>
                    <p className="flex justify-between border-b border-ink/10 pb-2">
                      <span className="opacity-70">Hora:</span>
                      <span>{form.time}</span>
                    </p>
                    <p className="flex justify-between border-b border-ink/10 pb-2">
                      <span className="opacity-70">Invitados:</span>
                      <span>{form.guests}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full mt-auto py-4 rounded-xl font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg bg-eucalipto text-cream"
                >
                  Finalizar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── BARRA INFERIOR: volver + progreso ── */}
        {step < 7 && (
          <div className="px-5 py-4 bg-[#f8f4e6] border-t border-ink/8 relative z-10 flex items-center gap-4 shrink-0">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="w-10 h-10 rounded-full border-2 border-eucalipto/30 bg-white flex items-center justify-center text-eucalipto hover:border-eucalipto hover:bg-eucalipto hover:text-cream transition-all shrink-0 shadow-sm"
                aria-label="Volver"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            ) : (
              <div className="w-10 h-10 shrink-0" />
            )}

            <div className="flex-1 h-1 bg-ink/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-eucalipto transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="text-[10px] uppercase tracking-widest font-bold text-ink/40 shrink-0 w-6 text-right">
              {step}/{TOTAL_STEPS}
            </span>
          </div>
        )}
      </div>

      {/* ── BOTÓN CERRAR FLOTANTE (fuera del modal, abajo centrado) ── */}
      <button
        onClick={onClose}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 sm:w-[50px] sm:h-[50px] rounded-full bg-eucalipto text-cream flex items-center justify-center shadow-xl hover:bg-[#1e3329] hover:scale-105 active:scale-95 transition-all z-[102]"
        aria-label="Cerrar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <CustomerHistoryModal
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        user={activeUser}
      />
    </div>
  );
}
