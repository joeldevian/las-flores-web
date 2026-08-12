import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Phone, Calendar, Check, Loader2, X, Mail, User, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";

interface CompleteProfileModalProps {
  userId: string;
  initialName?: string;
  initialPhone?: string;
  initialBirthdate?: string;
  initialEmail?: string;
  onSuccess: (updatedProfile: any) => void;
  onClose?: () => void;
}

const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const DAYS = Array.from({ length: 31 }, (_, i) => {
  const d = i + 1;
  return { value: d < 10 ? `0${d}` : `${d}`, label: `${d}` };
});

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => {
  const y = currentYear - 6 - i;
  return { value: `${y}`, label: `${y}` };
});

export function CompleteProfileModal({
  userId,
  initialName = "",
  initialPhone = "",
  initialBirthdate = "",
  initialEmail = "",
  onSuccess,
  onClose,
}: CompleteProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  
  // Parse initial birthdate (YYYY-MM-DD)
  const parts = (initialBirthdate || "").split("-");
  const [year, setYear] = useState(parts[0] || "");
  const [month, setMonth] = useState(parts[1] || "");
  const [day, setDay] = useState(parts[2] || "");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 9) {
      setErrorMsg("Ingresa un número de celular válido de 9 dígitos.");
      return;
    }

    if (!day || !month || !year) {
      setErrorMsg("Selecciona tu fecha de nacimiento completa (Día, Mes y Año).");
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg("Por favor ingresa tu correo electrónico.");
      return;
    }

    const birthdateFormatted = `${year}-${month}-${day}`;

    setSaving(true);
    try {
      // 1. Intentar UPDATE directo en public.profiles por ID
      const updatePayload: Record<string, any> = {
        phone: cleanPhone,
        birth_date: birthdateFormatted,
        birthdate: birthdateFormatted,
        email: cleanEmail,
        updated_at: new Date().toISOString(),
      };
      if (name.trim()) updatePayload.full_name = name.trim();

      let { data: updatedData, error: updateErr } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", userId)
        .select();

      let isSavedInDb = updatedData && updatedData.length > 0;

      // Si UPDATE falló o devolvió 0 filas
      if (!isSavedInDb || updateErr) {
        delete updatePayload.birthdate;

        const { data: updatedData2, error: updateErr2 } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", userId)
          .select();

        isSavedInDb = updatedData2 && updatedData2.length > 0;

        // Si la fila no existía en la tabla profiles, hacer UPSERT completo
        if (!isSavedInDb || updateErr2) {
          const upsertPayload: Record<string, any> = {
            id: userId,
            email: cleanEmail,
            phone: cleanPhone,
            birth_date: birthdateFormatted,
            role: "client",
            updated_at: new Date().toISOString(),
          };
          if (name.trim()) upsertPayload.full_name = name.trim();

          const { error: finalUpsertErr } = await supabase
            .from("profiles")
            .upsert(upsertPayload);

          if (finalUpsertErr) {
            console.error("Error al guardar en base de datos:", finalUpsertErr);
            setErrorMsg(`No se pudo guardar en la BD (${finalUpsertErr.message}). Reintenta.`);
            setSaving(false);
            return;
          }
        }
      }

      // 2. Actualizar user_metadata en Supabase Auth
      await supabase.auth.updateUser({
        data: {
          phone: cleanPhone,
          birth_date: birthdateFormatted,
          full_name: name.trim() || undefined,
        },
      });

      onSuccess({ phone: cleanPhone, birthdate: birthdateFormatted, full_name: name, email: cleanEmail });
    } catch (err: any) {
      console.error("Error al actualizar perfil:", err);
      setErrorMsg("No se pudieron guardar los datos. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#1b2a24]/80 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto">
      <div className="bg-[#FAF6ED] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#2C4A3E]/15 animate-in zoom-in-95 duration-200 relative pointer-events-auto">
        
        {/* Botón Cerrar X */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-95"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        )}

        {/* Header Elegante */}
        <div className="bg-[#2C4A3E] text-[#FAF6ED] p-7 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center mx-auto mb-3 border border-[#D4AF37]/30 shadow-inner">
            <ShieldCheck size={24} />
          </div>
          <h2 className="font-serif font-bold text-2xl tracking-wide text-white">
            Completa tu Perfil
          </h2>
          <p className="text-xs text-[#FAF6ED]/75 mt-1.5 max-w-xs mx-auto leading-relaxed font-sans">
            Ingresa tu información para agilizar tus pedidos de delivery y ofrecerte sorpresas en tu cumpleaños.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4.5">
          
          {/* Nombre */}
          <div>
            <label className="block text-[11px] font-bold text-[#2C4A3E] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User size={13} className="text-[#2C4A3E]/70" /> Nombre Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: María García"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-[#2C4A3E]/20 bg-white text-xs font-semibold text-[#1b2a24] focus:outline-none focus:ring-2 focus:ring-[#2C4A3E] focus:border-transparent transition-all shadow-xs"
            />
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-[11px] font-bold text-[#2C4A3E] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail size={13} className="text-[#2C4A3E]/70" /> Correo Electrónico *
            </label>
            <input
              type="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-[#2C4A3E]/20 bg-white text-xs font-semibold text-[#1b2a24] focus:outline-none focus:ring-2 focus:ring-[#2C4A3E] focus:border-transparent transition-all shadow-xs"
            />
          </div>

          {/* Celular */}
          <div>
            <label className="block text-[11px] font-bold text-[#2C4A3E] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone size={13} className="text-[#2C4A3E]/70" /> Celular / WhatsApp *
            </label>
            <input
              type="tel"
              required
              inputMode="numeric"
              maxLength={9}
              placeholder="Ej: 980723422"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
              className="w-full px-4 py-3.5 rounded-xl border border-[#2C4A3E]/20 bg-white text-xs font-semibold text-[#1b2a24] focus:outline-none focus:ring-2 focus:ring-[#2C4A3E] focus:border-transparent transition-all shadow-xs"
            />
          </div>

          {/* Cumpleaños */}
          <div>
            <label className="block text-[11px] font-bold text-[#2C4A3E] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-[#2C4A3E]/70" /> Fecha de Nacimiento *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                required
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="px-3 py-3 rounded-xl border border-[#2C4A3E]/20 bg-white text-xs font-semibold text-[#1b2a24] focus:outline-none focus:ring-2 focus:ring-[#2C4A3E] cursor-pointer shadow-xs"
              >
                <option value="">Día</option>
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>

              <select
                required
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-3 py-3 rounded-xl border border-[#2C4A3E]/20 bg-white text-xs font-semibold text-[#1b2a24] focus:outline-none focus:ring-2 focus:ring-[#2C4A3E] cursor-pointer shadow-xs"
              >
                <option value="">Mes</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-3 py-3 rounded-xl border border-[#2C4A3E]/20 bg-white text-xs font-semibold text-[#1b2a24] focus:outline-none focus:ring-2 focus:ring-[#2C4A3E] cursor-pointer shadow-xs"
              >
                <option value="">Año</option>
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 text-center">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-xl font-serif font-bold text-sm tracking-wide bg-[#2C4A3E] text-[#FAF6ED] hover:bg-[#233b31] active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Check size={18} /> Guardar y Continuar
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
