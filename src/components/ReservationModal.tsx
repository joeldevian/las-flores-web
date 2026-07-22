import { useState, useMemo } from 'react';
import { SeatSelector } from './SeatSelector';

interface ReservationModalProps {
  open: boolean;
  onClose: () => void;
}

const R = {
  morado: "#3b0944",
  amarillo: "#F4C430",
  crema: "#f8f4e6",
  tierra: "#8B4513",
  verde: "#2E8B57",
  rojo: "#8B0000"
};

// Generar fechas próximas
const today = new Date();
const DATES = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
  return {
    value: d.toISOString().split('T')[0],
    dayName: d.toLocaleDateString('es-PE', { weekday: 'short' }),
    dayNum: d.getDate(),
    month: d.toLocaleDateString('es-PE', { month: 'short' })
  };
});

const SERVICES = [
  { id: 'almuerzo', name: 'Almuerzo', times: ['12:30', '13:00', '13:30', '14:00', '14:30', '15:00'] },
  { id: 'cena', name: 'Cena', times: ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30'] }
];

export function ReservationModal({ open, onClose }: ReservationModalProps) {
  // Step 1: Comensales, 2: Fecha, 3: Hora, 4: Login, 5: Mesa, 6: Exito
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    guests: '',
    customGuests: '',
    date: '',
    service: '',
    time: '',
    table: '',
    name: '', // Guardado por Google Login (mock)
    email: '' // Guardado por Google Login (mock)
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => 
    setForm(f => ({ ...f, [key]: e.target.value }));

  // Handlers para avanzar
  const handleGuestsNext = () => setStep(2);
  const handleDateNext = () => setStep(3);
  const handleTimeNext = () => setStep(4);
  
  // Mock Google Login
  const handleGoogleLogin = () => {
    setForm(f => ({ ...f, name: 'Usuario Google', email: 'usuario@gmail.com' }));
    setStep(5);
  };

  const handleTableSelect = (tableId: string) => {
    setForm(f => ({ ...f, table: tableId }));
    setStep(6);
  };

  const handleRandomTable = () => {
    setForm(f => ({ ...f, table: 'Aleatoria' }));
    setStep(6);
  };

  if (!open) return null;

  // Calculo de progreso
  const progressPercent = ((step - 1) / 5) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Sidebar */}
      <div className="relative w-full md:w-[450px] bg-[#f8f4e6] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
        
        {/* Header / Nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10 bg-white/50 backdrop-blur-md z-10">
          {step > 1 && step < 6 ? (
            <button onClick={() => setStep(s => s - 1)} className="p-2 hover:bg-black/5 rounded-full transition-colors" aria-label="Volver">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={R.morado} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          ) : (
            <div className="w-10"></div> // Spacer
          )}
          <img src="/images.png" alt="Logo" className="h-10 object-contain drop-shadow-sm" />
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors" aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={R.morado} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Contenedor Principal con Scroll */}
        <div className="flex-1 overflow-y-auto relative p-6 custom-scrollbar bg-cover bg-center" style={{ backgroundImage: "url('/inicio/ayacucho.webp')" }}>
          {/* Overlay blanco semitransparente para legibilidad */}
          <div className="absolute inset-0 bg-white/85" />
          
          <div className="relative z-10 h-full">
            
            {/* --- PASO 1: COMENSALES --- */}
            {step === 1 && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-3xl font-bold text-ink mb-2">¿Cuántos comensales?</h2>
                  <p className="text-sm text-ink/70">Selecciona el tamaño de tu grupo</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {['1', '2', '3', '4'].map(n => (
                    <button
                      key={n}
                      onClick={() => setForm(f => ({ ...f, guests: n, customGuests: '' }))}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1
                        ${form.guests === n 
                          ? 'bg-[#3b0944] text-white border-[#3b0944] shadow-md scale-[1.02]' 
                          : 'bg-white/80 border-[#3b0944]/20 hover:border-[#3b0944]/50 text-[#3b0944]'}`}
                    >
                      <span className="text-3xl font-serif">{n}</span>
                      <span className="text-xs uppercase tracking-widest">{n === '1' ? 'Persona' : 'Personas'}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border-2 border-[#3b0944]/20 mt-2">
                  <p className="text-xs uppercase tracking-widest text-ink/60 mb-3 font-bold">Tamaño personalizado</p>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      min="5" 
                      max="20" 
                      placeholder="Ej. 6"
                      value={form.customGuests}
                      onChange={(e) => setForm(f => ({ ...f, customGuests: e.target.value, guests: e.target.value }))}
                      className="flex-1 bg-transparent border-b-2 border-ink/20 focus:border-ink outline-none px-2 py-1 text-xl font-serif text-center transition-colors"
                    />
                    <span className="text-sm font-bold text-ink/70">Personas</span>
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <button
                    onClick={handleGuestsNext}
                    disabled={!form.guests}
                    className="w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:transform-none hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                    style={{ background: "#3b0944", color: "#F4C430" }}
                  >
                    Continuar con {form.guests || '...'} comensales
                  </button>
                </div>
              </div>
            )}

            {/* --- PASO 2: FECHA --- */}
            {step === 2 && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-ink/10">
                    <span className="text-xs font-bold text-ink flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      {form.guests} Personas
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-ink mb-2 leading-tight">¿Cuándo te<br/>gustaría visitarnos?</h2>
                  <p className="text-sm text-ink/70 mt-2">Selecciona tu fecha preferida</p>
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                  {DATES.map((d, i) => (
                    <button
                      key={d.value}
                      onClick={() => setForm(f => ({ ...f, date: d.value }))}
                      className={`flex-none w-[100px] h-[120px] snap-center rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1
                        ${form.date === d.value 
                          ? 'bg-[#3b0944] text-white border-[#3b0944] shadow-md scale-[1.02]' 
                          : 'bg-white/80 border-[#3b0944]/20 hover:border-[#3b0944]/50 text-[#3b0944]'}`}
                    >
                      <span className="text-xs uppercase tracking-widest opacity-80">{i === 0 ? 'Hoy' : d.dayName}</span>
                      <span className="text-4xl font-serif">{d.dayNum}</span>
                      <span className="text-xs uppercase opacity-80">{d.month}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <button
                    onClick={handleDateNext}
                    disabled={!form.date}
                    className="w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:transform-none hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                    style={{ background: "#3b0944", color: "#F4C430" }}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* --- PASO 3: SERVICIO Y HORA --- */}
            {step === 3 && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center gap-2 mb-6">
                    <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-ink border border-ink/10 shadow-sm">{form.guests} Personas</span>
                    <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-ink border border-ink/10 shadow-sm">
                      {new Date(form.date + 'T12:00').toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-ink mb-2">Selecciona una hora</h2>
                  <p className="text-sm text-ink/70">Elige tu horario disponible</p>
                </div>
                
                {!form.service ? (
                  <div className="flex flex-col gap-4">
                    {SERVICES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setForm(f => ({ ...f, service: s.id }))}
                        className="p-8 bg-white/90 backdrop-blur-sm border-2 border-transparent hover:border-[#F4C430] rounded-2xl shadow-sm hover:shadow-md transition-all text-center"
                      >
                        <span className="text-2xl font-serif text-[#3b0944]">{s.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <button 
                      onClick={() => setForm(f => ({ ...f, service: '', time: '' }))}
                      className="text-xs font-bold uppercase tracking-widest text-[#3b0944] mb-4 hover:opacity-70 flex items-center justify-center gap-2"
                    >
                      &larr; Cambiar a {form.service === 'almuerzo' ? 'Cena' : 'Almuerzo'}
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
                      {SERVICES.find(s => s.id === form.service)?.times.map(t => (
                        <button
                          key={t}
                          onClick={() => setForm(f => ({ ...f, time: t }))}
                          className={`py-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2
                            ${form.time === t 
                              ? 'bg-[#3b0944] text-[#F4C430] border-[#3b0944] shadow-md' 
                              : 'bg-white/80 border-transparent hover:border-[#3b0944]/30 text-[#3b0944]'}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <span className="font-bold text-lg">{t}</span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <button
                        onClick={handleTimeNext}
                        disabled={!form.time}
                        className="w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:transform-none hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                        style={{ background: "#3b0944", color: "#F4C430" }}
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- PASO 4: LOGIN GOOGLE --- */}
            {step === 4 && (
              <div className="flex flex-col h-full items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                  <h2 className="font-serif text-3xl font-bold text-ink mb-4">Casi listo</h2>
                  <p className="text-sm text-ink/70 px-4">Ingresa con Google para asegurar tu reserva rápidamente sin llenar formularios largos.</p>
                </div>
                
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-4 bg-white px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all border border-gray-200 hover:-translate-y-1"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="font-bold text-gray-700">Continuar con Google</span>
                </button>

                <p className="text-[10px] text-ink/50 mt-8 text-center max-w-[250px]">
                  Al continuar, aceptas nuestras políticas de privacidad y términos de servicio.
                </p>
              </div>
            )}

            {/* --- PASO 5: MESA (CROQUIS) --- */}
            {step === 5 && (
              <SeatSelector onSelectTable={handleTableSelect} onSkip={handleRandomTable} />
            )}

            {/* --- PASO 6: CONFIRMACION --- */}
            {step === 6 && (
              <div className="flex flex-col h-full items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="relative mb-8">
                  <div className="absolute -inset-4 rounded-full bg-[#F4C430] opacity-20 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-[#3b0944] flex items-center justify-center shadow-lg text-[#F4C430]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                </div>
                
                <h3 className="font-serif text-3xl font-bold text-ink mb-2">¡Reserva Confirmada!</h3>
                <p className="text-sm font-medium text-ink/70">
                  Hola {form.name.split(' ')[0]}, te hemos enviado los detalles a {form.email}.
                </p>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-sm text-left w-full mt-8 shadow-sm border border-ink/10">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/50 mb-4">Resumen</p>
                  <div className="space-y-3 font-medium text-ink">
                    <p className="flex justify-between border-b border-ink/10 pb-2">
                      <span className="opacity-70">Mesa:</span>
                      <strong>{form.table === 'Aleatoria' ? 'Asignación a la llegada' : form.table}</strong>
                    </p>
                    <p className="flex justify-between border-b border-ink/10 pb-2">
                      <span className="opacity-70">Fecha:</span>
                      <span className="capitalize">{new Date(form.date + 'T12:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
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
                  className="w-full mt-auto py-4 rounded-xl font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  style={{ background: "#3b0944", color: "#F4C430" }}
                >
                  Finalizar
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Barra de Progreso Inferior */}
        {step < 6 && (
          <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-t border-ink/10 relative z-10 flex flex-col gap-2">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#3b0944] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-ink/50 text-center">
              Paso {step} de 5
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
