import { useState } from "react";
import { Phone, Calendar, Sparkles, Check, Loader2, X } from "lucide-react";
import { supabase } from "../lib/supabase";

interface CompleteProfileModalProps {
  userId: string;
  initialName?: string;
  initialPhone?: string;
  initialBirthdate?: string;
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
  onSuccess,
  onClose,
}: CompleteProfileModalProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  
  // Parse initial birthdate (YYYY-MM-DD)
  const parts = (initialBirthdate || "").split("-");
  const [year, setYear] = useState(parts[0] || "");
  const [month, setMonth] = useState(parts[1] || "");
  const [day, setDay] = useState(parts[2] || "");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    const birthdateFormatted = `${year}-${month}-${day}`;

    setSaving(true);
    try {
      // 1. Actualizar tabla profiles
      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: name.trim() || undefined,
        phone: cleanPhone,
        birthdate: birthdateFormatted,
        updated_at: new Date().toISOString(),
      });

      if (profileErr) {
        console.warn("Upsert profiles error:", profileErr);
      }

      // 2. Actualizar user_metadata en Supabase Auth
      await supabase.auth.updateUser({
        data: {
          phone: cleanPhone,
          birth_date: birthdateFormatted,
          full_name: name.trim() || undefined,
        },
      });

      onSuccess({ phone: cleanPhone, birthdate: birthdateFormatted, full_name: name });
    } catch (err: any) {
      console.error("Error al actualizar perfil:", err);
      setErrorMsg("No se pudieron guardar los datos. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-ink/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#f8f4e6] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-black/10 animate-in zoom-in-95 duration-200 relative">
        
        {/* Botón Cerrar X */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        )}

        {/* Header */}
        <div className="bg-eucalipto text-piedra p-6 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-chilca flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Sparkles size={28} />
          </div>
          <h2 className="font-serif font-bold text-2xl tracking-wide text-white">
            ¡Queremos conocerte mejor! 🌸
          </h2>
          <p className="text-xs text-piedra/80 mt-1 max-w-xs mx-auto leading-relaxed">
            Completa tu celular para coordinar tus entregas y tu cumpleaños para regalarte sorpresas en tu día.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Nombre (opcional/editable) */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: María García"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-eucalipto font-medium"
            />
          </div>

          {/* Celular */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone size={13} className="text-eucalipto" /> Celular (WhatsApp) *
            </label>
            <input
              type="tel"
              required
              inputMode="numeric"
              maxLength={9}
              placeholder="Ej: 980723422"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
              className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm text-ink font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-eucalipto"
            />
            <p className="text-[11px] text-ink/50 mt-1">
              Necesario para notificarte cuando tu pedido vaya en camino.
            </p>
          </div>

          {/* Cumpleaños */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-eucalipto" /> Fecha de Nacimiento (Cumpleaños) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                required
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="px-2 py-3 rounded-xl border border-black/15 bg-white text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-eucalipto"
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
                className="px-2 py-3 rounded-xl border border-black/15 bg-white text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-eucalipto"
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
                className="px-2 py-3 rounded-xl border border-black/15 bg-white text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-eucalipto"
              >
                <option value="">Año</option>
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-ink/50 mt-1">
              ¡Te prepararemos sorpresas y promociones exclusivas en tu mes!
            </p>
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 text-center animate-shake">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-xl font-serif font-bold text-base bg-eucalipto text-piedra hover:bg-eucalipto/90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
}
