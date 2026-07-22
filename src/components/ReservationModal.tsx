import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

interface FormData {
  date: string;
  time: string;
  guests: string;
  name: string;
  phone: string;
  email: string;
  comments: string;
}

const TIMES = [
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM',
];

/* ─── Paleta Retablo Ayacuchano ─── */
const R = {
  rojo:    "#C0392B",  // Rojo vivo
  verde:   "#2A6135",  // Verde hoja
  morado:  "#3b0944",  // Morado profundo
  amarillo:"#F4C430",  // Amarillo oro vibrante
  crema:   "#FBF5E6",  // Crema retablo
  blanco:  "#FFFFFF",
};

const inputCls =
  "w-full border-2 border-transparent border-b-black/15 rounded-t-xl rounded-b-sm px-4 py-3 text-sm bg-black/4 " +
  "focus:outline-none focus:border-b-[#F4C430] focus:bg-white transition-all placeholder:text-black/30 font-medium";

export function ReservationModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    date: '', time: '', guests: '2', name: '', phone: '', email: '', comments: '',
  });

  if (!open) return null;

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const step1Valid = form.date && form.time && form.guests;
  const step2Valid = form.name && form.phone && form.email;

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setForm({ date: '', time: '', guests: '2', name: '', phone: '', email: '', comments: '' });
    }, 300);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay oscuro con blur */}
      <div 
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* Panel Lateral */}
      <div className="relative w-full max-w-md text-ink h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" style={{ background: R.crema }}>
        
        {/* ══ CABECERA ══ */}
        <div className="relative flex-shrink-0 overflow-hidden" style={{ background: R.morado }}>
          <div className="absolute bottom-0 left-0 right-0 h-[4px]"
            style={{ background: `linear-gradient(90deg, ${R.verde} 0%, ${R.verde} 25%, ${R.amarillo} 25%, ${R.amarillo} 50%, ${R.rojo} 50%, ${R.rojo} 75%, ${R.morado} 75%)` }}
          />
          <div className="flex items-center justify-between p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 overflow-hidden flex-shrink-0 bg-white shadow-sm flex items-center justify-center p-1" style={{ borderColor: R.amarillo }}>
                <img src="/favicon.png" alt="Las Flores" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-serif text-2xl font-bold tracking-wide text-white">Reservar Mesa</h3>
            </div>
            <button 
              onClick={handleClose}
              className="text-white/50 hover:text-white transition-colors text-3xl font-light leading-none pb-1"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Step indicators */}
        {step < 3 && (
          <div className="flex bg-white border-b border-black/5 shadow-sm">
            <div className="flex-1 py-3 text-center text-[10px] uppercase tracking-[0.2em] font-bold transition-all"
                 style={{ borderBottom: step === 1 ? `3px solid ${R.amarillo}` : "3px solid transparent", color: step === 1 ? R.morado : "rgba(0,0,0,0.3)" }}>
              1. Fecha y Hora
            </div>
            <div className="flex-1 py-3 text-center text-[10px] uppercase tracking-[0.2em] font-bold transition-all"
                 style={{ borderBottom: step === 2 ? `3px solid ${R.amarillo}` : "3px solid transparent", color: step === 2 ? R.morado : "rgba(0,0,0,0.3)" }}>
              2. Tus Datos
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* STEP 1 — Date, time, guests */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-ink/60 text-sm leading-relaxed font-light">
                Seleccione la fecha y la hora en la que desea visitarnos.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold block px-1" style={{ color: R.morado }}>Fecha de tu visita</label>
                <input
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={set('date')}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold block px-1" style={{ color: R.morado }}>Número de personas</label>
                <div className="flex gap-2 flex-wrap">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '+8'].map((n) => (
                    <button
                      key={n}
                      onClick={() => setForm((f) => ({ ...f, guests: n }))}
                      className="w-10 h-10 rounded-xl text-sm font-bold border-2 transition-all shadow-sm"
                      style={{
                        background: form.guests === n ? R.amarillo : "transparent",
                        color: form.guests === n ? R.morado : "rgba(0,0,0,0.6)",
                        borderColor: form.guests === n ? R.amarillo : "rgba(0,0,0,0.1)",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold block px-1" style={{ color: R.morado }}>Hora</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm((f) => ({ ...f, time: t }))}
                      className="py-2.5 rounded-xl text-[11px] font-bold transition-all duration-300 border-2 shadow-sm"
                      style={{
                        background: form.time === t ? R.amarillo : "transparent",
                        color: form.time === t ? R.morado : "rgba(0,0,0,0.6)",
                        borderColor: form.time === t ? R.amarillo : "rgba(0,0,0,0.1)",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 2 — Personal info */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white rounded-xl p-4 border shadow-sm mb-4" style={{ borderColor: `${R.amarillo}50` }}>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: R.morado }}>Tu selección:</p>
                <p className="font-bold text-sm" style={{ color: R.morado }}>
                  {new Date(form.date + 'T12:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })} · {form.time} <br/> {form.guests} persona{form.guests !== '1' ? 's' : ''}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold block px-1" style={{ color: R.morado }}>Nombre completo *</label>
                <input
                  required
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Juan Pérez"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold block px-1" style={{ color: R.morado }}>Teléfono *</label>
                  <input
                    required
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="987 654 321"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold block px-1" style={{ color: R.morado }}>Correo *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={set('email')}
                    placeholder="juan@correo.com"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold block px-1" style={{ color: R.morado }}>Comentarios</label>
                <textarea
                  value={form.comments}
                  onChange={set('comments')}
                  rows={2}
                  placeholder="Alergias, solicitudes especiales..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          )}

          {/* STEP 3 — Success */}
          {step === 3 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative mb-6">
                <div className="absolute -inset-2 rounded-full"
                  style={{ background:`conic-gradient(${R.verde} 0%,${R.amarillo} 25%,${R.rojo} 50%,${R.morado} 75%,${R.verde} 100%)`, opacity:0.5 }} />
                <div className="absolute -inset-2 rounded-full" style={{ boxShadow:`inset 0 0 0 4px ${R.crema}` }} />
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: R.amarillo }}>
                  <div className="text-white text-4xl">✓</div>
                </div>
              </div>
              <h3 className="font-serif text-3xl font-bold" style={{ color: R.morado }}>¡Reserva Confirmada!</h3>
              <p className="text-sm font-medium leading-[1.7]" style={{ color: R.morado }}>
                Te hemos enviado un correo con los detalles. Te esperamos.
              </p>
              
              <div className="bg-white rounded-xl p-6 text-sm text-left w-full mt-4 shadow-sm border" style={{ borderColor: `${R.amarillo}50` }}>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: R.morado }}>Resumen de reserva</p>
                <div className="space-y-2 font-medium" style={{ color: R.morado }}>
                  <p><strong>A nombre de:</strong> {form.name}</p>
                  <p className="capitalize"><strong>Fecha:</strong> {new Date(form.date + 'T12:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <p><strong>Hora:</strong> {form.time}</p>
                  <p><strong>Invitados:</strong> {form.guests} persona{form.guests !== '1' ? 's' : ''}</p>
                  <p className="text-[10px] uppercase tracking-wider mt-4 block opacity-50">Código: #LF-{Date.now().toString().slice(-6)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-ink/10 flex-shrink-0 bg-cream">
          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="w-full py-4 font-serif font-bold text-lg tracking-wide transition-all shadow-md hover:shadow-lg rounded-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
              style={{ background: "#F4C430", color: "#3b0944" }}
            >
              Continuar
            </button>
          )}
          {step === 2 && (
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-[1] py-4 font-serif font-bold text-lg tracking-wide transition-all shadow-md hover:shadow-lg rounded-xl border-2"
                style={{ borderColor: "#F4C430", color: "#3b0944" }}
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                className="flex-[2] py-4 font-serif font-bold text-lg tracking-wide transition-all shadow-md hover:shadow-lg rounded-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                style={{ background: "#F4C430", color: "#3b0944" }}
              >
                Confirmar 
              </button>
            </div>
          )}
          {step === 3 && (
            <button
              onClick={handleClose}
              className="w-full py-4 font-serif font-bold text-lg tracking-wide transition-all shadow-md hover:shadow-lg rounded-xl hover:-translate-y-0.5"
              style={{ background: "#3b0944", color: "#F4C430" }}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
