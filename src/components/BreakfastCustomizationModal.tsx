import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, GlassWater, Coffee, Sandwich, Utensils, Check, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import type { Dish } from "./MenuModal";

interface BreakfastCustomizationModalProps {
  dish: Dish | null;
  open: boolean;
  onClose: () => void;
}

const BEBIDAS_FRIAS = [
  { id: "platano", name: "Jugo de plátano", desc: "Refrescante y cremoso de fruta natural" },
  { id: "mango", name: "Jugo de mango", desc: "Dulce y tropical recién preparado" },
  { id: "frutos_rojos", name: "Jugo de frutos rojos", desc: "Mezcla antioxidante y llena de sabor" },
  { id: "naranja", name: "Jugo de naranja", desc: "100% natural exprimidito al momento" },
  { id: "pina", name: "Jugo de piña", desc: "Digestivo y refrescante de piña selecta" },
];

const BEBIDAS_CALIENTES = [
  { id: "cafe", name: "Taza de café", desc: "Café pasado artesanal de grano andino" },
  { id: "chocolate", name: "Chocolate ayacuchano", desc: "Tradicional cacao especiado hervido a fuego lento" },
  { id: "infusion", name: "Infusión", desc: "Hierbas aromáticas naturales (Manzanilla, Anís o Muña)" },
];

const SANDWICHES = [
  {
    id: "butifarra",
    name: "Pan con Butifarra",
    desc: "Jugoso jamón del país acompañado de cebolla encurtida y pan crujiente, una combinación tradicional llena de sabor.",
  },
  {
    id: "chicharron",
    name: "Pan con Chicharrón",
    desc: "Chicharrón tierno y crocante acompañado de camote frito y cebolla encurtida, logrando un equilibrio perfecto entre lo dulce y lo salado.",
  },
];

const ACOMPANAMIENTOS = [
  { id: "humita", name: "Humita", desc: "Auténtica humita dulce o salada hecha en casa" },
  { id: "huevos", name: "Huevos revueltos", desc: "Huevos de corral frescos preparados al gusto" },
  { id: "palta", name: "Ensalada de palta", desc: "Láminas de palta hass fresca con limón y sal marina" },
  { id: "frutas", name: "Ensalada de frutas", desc: "Variedad de frutas de estación picadas" },
];

export function BreakfastCustomizationModal({ dish, open, onClose }: BreakfastCustomizationModalProps) {
  const { addItem, setIsOpen: setSidebarOpen } = useCart();

  const [bebidaFria, setBebidaFria] = useState<string>("");
  const [bebidaCaliente, setBebidaCaliente] = useState<string>("");
  const [sandwich, setSandwich] = useState<string>("");
  const [acompanamiento, setAcompanamiento] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reiniciar selecciones al abrir el modal
  useEffect(() => {
    if (open) {
      setBebidaFria("");
      setBebidaCaliente("");
      setSandwich("");
      setAcompanamiento("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !dish || !isMounted) return null;

  const priceNum = parseFloat(dish.price.replace("S/ ", ""));
  const selectedCount = [bebidaFria, bebidaCaliente, sandwich, acompanamiento].filter(Boolean).length;
  const isComplete = selectedCount === 4;

  const handleConfirm = () => {
    if (!isComplete) return;

    const itemUniqueId = `desayuno-${dish.name.replace(/\s+/g, "-")}-${Date.now()}`;

    addItem({
      id: itemUniqueId,
      name: dish.name,
      price: priceNum,
      image: dish.image,
      customizations: {
        bebidaFria,
        bebidaCaliente,
        sandwich,
        acompanamiento,
      },
    });

    onClose();
    setSidebarOpen(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-250">
      {/* Fondo oscuro traslúcido con blur */}
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-md cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Modal Principal */}
      <div className="relative z-10 w-full max-w-2xl bg-[#FAF6EE] text-ink rounded-[28px] shadow-2xl overflow-hidden border border-black/10 flex flex-col max-h-[92vh] md:max-h-[88vh] animate-in zoom-in-95 duration-300">
        
        {/* Cabecera con Imagen y Etiquetas */}
        <div className="relative h-44 sm:h-52 md:h-56 overflow-hidden flex-shrink-0 bg-ink">
          {dish.image ? (
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover brightness-[0.82] hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-eucalipto via-ink to-eucalipto flex items-center justify-center" />
          )}

          {/* Gradiente de sombra sobre la imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />

          {/* Botón de Cierre */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-ink transition-colors flex items-center justify-center shadow-md backdrop-blur-xs active:scale-95"
            title="Cerrar modal"
          >
            <X size={20} />
          </button>

          {/* Información del Desayuno */}
          <div className="absolute bottom-4 left-5 right-5 z-10 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase tracking-[0.22em] font-bold px-3 py-1 rounded-full bg-retablo text-white shadow-xs flex items-center gap-1">
                <Sparkles size={11} /> Arma tu Desayuno
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-cream">
                {selectedCount}/4 Seleccionados
              </span>
            </div>
            <div className="flex justify-between items-end gap-3">
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-cream drop-shadow-sm leading-tight">
                {dish.name}
              </h2>
              <span className="font-serif font-bold text-xl sm:text-2xl text-cream flex-shrink-0 bg-white/15 px-3.5 py-1 rounded-2xl backdrop-blur-md border border-white/20 shadow-xs">
                {dish.price}
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo Scrolleable con Opciones */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 custom-scrollbar">
          
          {/* 1. Bebida fría */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5">
            <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-eucalipto/10 text-eucalipto flex items-center justify-center">
                  <GlassWater size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink">1. Bebida fría</h3>
                  <p className="text-[11px] text-black/50 font-medium">Selección obligatoria • 1 opción</p>
                </div>
              </div>
              {bebidaFria ? (
                <span className="text-[11px] font-bold text-eucalipto bg-eucalipto/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check size={13} /> Listo
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Requerido
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BEBIDAS_FRIAS.map((item) => {
                const isSelected = bebidaFria === item.name;
                return (
                  <div
                    key={item.id}
                    onClick={() => setBebidaFria(item.name)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-eucalipto/10 border-eucalipto text-ink shadow-xs"
                        : "bg-black/2 border-transparent hover:border-black/10 hover:bg-black/4"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "border-eucalipto bg-eucalipto text-white" : "border-black/30 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-serif font-bold text-ink leading-tight">
                        {item.name}
                      </span>
                      <span className="block text-[10px] text-black/50 truncate font-medium">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Bebida caliente */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5">
            <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-eucalipto/10 text-eucalipto flex items-center justify-center">
                  <Coffee size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink">2. Bebida caliente</h3>
                  <p className="text-[11px] text-black/50 font-medium">Selección obligatoria • 1 opción</p>
                </div>
              </div>
              {bebidaCaliente ? (
                <span className="text-[11px] font-bold text-eucalipto bg-eucalipto/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check size={13} /> Listo
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Requerido
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {BEBIDAS_CALIENTES.map((item) => {
                const isSelected = bebidaCaliente === item.name;
                return (
                  <div
                    key={item.id}
                    onClick={() => setBebidaCaliente(item.name)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-eucalipto/10 border-eucalipto text-ink shadow-xs"
                        : "bg-black/2 border-transparent hover:border-black/10 hover:bg-black/4"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected ? "border-eucalipto bg-eucalipto text-white" : "border-black/30 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-serif font-bold text-ink leading-tight">
                        {item.name}
                      </span>
                      <span className="block text-[10px] text-black/50 leading-snug mt-0.5 font-medium">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Sándwich */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5">
            <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-eucalipto/10 text-eucalipto flex items-center justify-center">
                  <Sandwich size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink">3. Sándwich</h3>
                  <p className="text-[11px] text-black/50 font-medium">Selección obligatoria • 1 opción</p>
                </div>
              </div>
              {sandwich ? (
                <span className="text-[11px] font-bold text-eucalipto bg-eucalipto/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check size={13} /> Listo
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Requerido
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {SANDWICHES.map((item) => {
                const isSelected = sandwich === item.name;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSandwich(item.name)}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-eucalipto/10 border-eucalipto text-ink shadow-xs"
                        : "bg-black/2 border-transparent hover:border-black/10 hover:bg-black/4"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected ? "border-eucalipto bg-eucalipto text-white" : "border-black/30 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-sm font-serif font-bold text-ink leading-tight mb-1">
                        {item.name}
                      </span>
                      <span className="block text-xs text-black/60 leading-relaxed font-medium">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Acompañamiento */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5">
            <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-eucalipto/10 text-eucalipto flex items-center justify-center">
                  <Utensils size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink">4. Acompañamiento</h3>
                  <p className="text-[11px] text-black/50 font-medium">Selección obligatoria • 1 opción</p>
                </div>
              </div>
              {acompanamiento ? (
                <span className="text-[11px] font-bold text-eucalipto bg-eucalipto/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check size={13} /> Listo
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Requerido
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ACOMPANAMIENTOS.map((item) => {
                const isSelected = acompanamiento === item.name;
                return (
                  <div
                    key={item.id}
                    onClick={() => setAcompanamiento(item.name)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-eucalipto/10 border-eucalipto text-ink shadow-xs"
                        : "bg-black/2 border-transparent hover:border-black/10 hover:bg-black/4"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "border-eucalipto bg-eucalipto text-white" : "border-black/30 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-serif font-bold text-ink leading-tight">
                        {item.name}
                      </span>
                      <span className="block text-[10px] text-black/50 truncate font-medium">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Caja de Resumen idéntica al diseño solicitado */}
          <div className="bg-[#ECE5D8]/80 border border-[#DCD3C1] rounded-3xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3.5 text-[11px] font-serif font-bold tracking-[0.2em] uppercase text-ink/85">
              <ShoppingBag size={15} className="text-eucalipto" />
              <span>Resumen de tu Desayuno</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* B. Fría */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 ${
                  bebidaFria
                    ? "bg-white border-eucalipto/40 shadow-xs text-ink"
                    : "bg-white/60 border-black/5 text-ink/40"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-serif font-bold text-xs text-ink/90 flex-shrink-0">B. Fría:</span>
                  <span className={`text-xs truncate ${bebidaFria ? "font-medium text-ink" : "italic text-black/35"}`}>
                    {bebidaFria || "— No elegida —"}
                  </span>
                </div>
                {bebidaFria && <Check size={14} className="text-eucalipto flex-shrink-0 ml-1" />}
              </div>

              {/* B. Caliente */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 ${
                  bebidaCaliente
                    ? "bg-white border-eucalipto/40 shadow-xs text-ink"
                    : "bg-white/60 border-black/5 text-ink/40"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-serif font-bold text-xs text-ink/90 flex-shrink-0">B. Caliente:</span>
                  <span className={`text-xs truncate ${bebidaCaliente ? "font-medium text-ink" : "italic text-black/35"}`}>
                    {bebidaCaliente || "— No elegida —"}
                  </span>
                </div>
                {bebidaCaliente && <Check size={14} className="text-eucalipto flex-shrink-0 ml-1" />}
              </div>

              {/* Sándwich */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 ${
                  sandwich
                    ? "bg-white border-eucalipto/40 shadow-xs text-ink"
                    : "bg-white/60 border-black/5 text-ink/40"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-serif font-bold text-xs text-ink/90 flex-shrink-0">Sándwich:</span>
                  <span className={`text-xs truncate ${sandwich ? "font-medium text-ink" : "italic text-black/35"}`}>
                    {sandwich || "— No elegido —"}
                  </span>
                </div>
                {sandwich && <Check size={14} className="text-eucalipto flex-shrink-0 ml-1" />}
              </div>

              {/* Acompañante */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 ${
                  acompanamiento
                    ? "bg-white border-eucalipto/40 shadow-xs text-ink"
                    : "bg-white/60 border-black/5 text-ink/40"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-serif font-bold text-xs text-ink/90 flex-shrink-0">Acompañante:</span>
                  <span className={`text-xs truncate ${acompanamiento ? "font-medium text-ink" : "italic text-black/35"}`}>
                    {acompanamiento || "— No elegido —"}
                  </span>
                </div>
                {acompanamiento && <Check size={14} className="text-eucalipto flex-shrink-0 ml-1" />}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Barra de Acción */}
        <div className="p-4 sm:p-5 bg-white border-t border-black/10 flex items-center justify-between gap-4 shadow-lg flex-shrink-0">
          <div className="text-left">
            <span className="text-[11px] font-serif tracking-[0.15em] font-bold text-black/45 uppercase block">
              Precio Total
            </span>
            <span className="font-serif font-bold text-2xl md:text-3xl text-eucalipto">{dish.price}</span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!isComplete}
            className={`px-6 sm:px-8 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 ${
              isComplete
                ? "bg-eucalipto text-white hover:bg-eucalipto/90 shadow-md active:scale-[0.98]"
                : "bg-[#E5E5E5] text-[#8E8E8E] cursor-not-allowed shadow-none"
            }`}
          >
            <ShoppingBag size={18} />
            {isComplete ? "Confirmar y Agregar al Carrito" : `Elige tus opciones (${selectedCount}/4)`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
