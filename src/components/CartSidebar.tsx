import { useState, lazy, Suspense, useEffect } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  MapPin,
  CreditCard,
  CheckCircle,
  Truck,
  Store,
  Smartphone,
  Lock,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import {
  calculateDistanceKm,
  calculateDeliveryCost,
  RESTAURANT_LOCATION,
  DELIVERY_CONFIG,
} from "../utils/deliveryUtils";

const LocationSelector = lazy(() =>
  import("./LocationSelector").then((m) => ({ default: m.LocationSelector })),
);

type Step = "cart" | "delivery" | "payment" | "success";
type OrderType = "delivery" | "pickup";

interface DeliveryForm {
  name: string;
  phone: string;
  address: string;
  reference: string;
  email: string;
  notes: string;
}
interface PaymentForm {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

/* ─── Paleta de Lujo (Eucalipto & Crema) ─── */
const R = {
  rojo: "#8B261D",
  verde: "var(--color-eucalipto)",
  morado: "var(--color-eucalipto)",
  eucalipto: "var(--color-eucalipto)",
  amarillo: "var(--color-eucalipto)",
  crema: "#FBF5E6",
  blanco: "#FFFFFF",
};

const inputCls =
  "w-full border-2 border-transparent border-b-black/15 rounded-t-xl rounded-b-sm px-4 py-3 text-base md:text-sm bg-black/4 focus:border-b-cream/50 focus:bg-white transition-all placeholder:text-black/30 font-medium";

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-black/50 mb-2">
    {children}
  </label>
);

export function CartSidebar() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    clearCart,
    totalPrice,
    totalItems,
  } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [deliverySubStep, setDeliverySubStep] = useState<"location" | "details">("location");
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"yape" | "card">("yape");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [delivery, setDelivery] = useState<DeliveryForm>({
    name: "",
    phone: "",
    address: "",
    reference: "",
    email: "",
    notes: "",
  });
  const [payment, setPayment] = useState<PaymentForm>({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [processing, setProcessing] = useState(false);
  const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleUseGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setClientLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.error("GPS error:", err);
        }
      );
    }
  };

  // Solicitar ubicación GPS automáticamente al entrar a la etapa de ubicación
  useEffect(() => {
    if (
      step === "delivery" &&
      orderType === "delivery" &&
      delivery.email &&
      deliverySubStep === "location" &&
      !clientLocation
    ) {
      handleUseGPS();
    }
  }, [step, orderType, delivery.email, deliverySubStep, clientLocation]);

  // Calcular la distancia y el costo
  const distanceKm = clientLocation
    ? calculateDistanceKm(
        RESTAURANT_LOCATION.lat,
        RESTAURANT_LOCATION.lng,
        clientLocation.lat,
        clientLocation.lng,
      )
    : 0;

  const DELIVERY_FEE =
    orderType === "delivery"
      ? clientLocation
        ? calculateDeliveryCost(distanceKm)
        : DELIVERY_CONFIG.baseCost
      : 0;

  const isTooFar = distanceKm > DELIVERY_CONFIG.maxRadiusKm;
  const total = totalPrice + DELIVERY_FEE;

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const formatExpiry = (v: string) => {
    const c = v.replace(/\D/g, "").slice(0, 4);
    return c.length >= 3 ? `${c.slice(0, 2)}/${c.slice(2)}` : c;
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep("success");
    }, 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (step === "success") {
      clearCart();
      setStep("cart");
      setDelivery({ name: "", phone: "", address: "", reference: "", email: "", notes: "" });
      setPayment({ cardNumber: "", cardName: "", expiry: "", cvv: "" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div
        className="w-full max-w-md flex flex-col h-full shadow-2xl overflow-hidden"
        style={{ background: R.crema }}
      >
        {/* ══ CABECERA — Elegante y Fina ══ */}
        <div className="relative flex-shrink-0 bg-cream/95 backdrop-blur-md border-b border-black/5 shadow-sm">
          <div className="flex items-center py-4 px-5 relative h-16">
            {/* Logo a la izquierda */}
            <div className="absolute left-5 flex items-center">
              <img
                src="/favicon.png"
                alt="Las Flores"
                className="w-[38px] h-[38px] rounded-full object-cover border shadow-sm bg-white p-0.5 border-eucalipto/20"
              />
            </div>

            {/* Título centrado */}
            <div className="flex-1 text-center">
              <span className="font-serif text-[1.15rem] font-bold tracking-wide text-eucalipto">
                {step === "cart" && "Tu Pedido"}
                {step === "delivery" && "Datos de Entrega"}
                {step === "payment" && "Método de Pago"}
                {step === "success" && "Pedido Confirmado"}
              </span>
            </div>

            {/* Carrito e ícono de cerrar a la derecha */}
            <div className="absolute right-5 flex items-center gap-4">
              <div className="relative hidden sm:block">
                <ShoppingBag size={20} className="text-eucalipto" strokeWidth={2} />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-2 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm bg-[#8B261D] text-white"
                  >
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="text-ink/50 hover:text-ink transition-colors p-1 rounded-full hover:bg-black/5"
              >
                <X size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* ══ BARRA DE PASOS ══ */}
        {step !== "success" && (
          <div className="flex flex-shrink-0 bg-white border-b border-black/5 shadow-sm">
            {(["cart", "delivery", "payment"] as const).map((s, i) => {
              const stepList = ["cart", "delivery", "payment"];
              const cur = stepList.indexOf(step);
              const isActive = step === s;
              const isPast = cur > i;

              return (
                <div
                  key={s}
                  className="flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-bold tracking-wider uppercase transition-all"
                  style={{
                    borderBottom: isActive ? `3px solid var(--color-eucalipto)` : "3px solid transparent",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                    style={{
                      background: isActive ? "rgba(36,63,50,0.1)" : isPast ? "var(--color-eucalipto)" : "rgba(0,0,0,0.05)",
                      color: isActive ? "var(--color-eucalipto)" : isPast ? "white" : "rgba(0,0,0,0.3)",
                      border: isActive ? "1.5px solid var(--color-eucalipto)" : "none",
                    }}
                  >
                    {isPast ? "✓" : i + 1}
                  </div>
                  <span
                    style={{ color: isActive || isPast ? "var(--color-eucalipto)" : "rgba(0,0,0,0.3)" }}
                  >
                    {s === "cart" ? "Carrito" : s === "delivery" ? "Entrega" : "Pago"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ CONTENIDO ══ */}
        <div className="flex-1 overflow-y-auto">
          {/* PASO 1: CARRITO */}
          {step === "cart" && (
            <div className="p-5 min-h-full">
              {items.length === 0 ? (
                <div className="text-center py-24 px-6 flex flex-col items-center">
                  <div
                    className="relative w-24 h-32 mb-6 flex flex-col items-center justify-center rounded-t-full rounded-b-xl border-[3px] shadow-sm"
                    style={{ borderColor: R.morado, background: `${R.amarillo}15` }}
                  >
                    <div
                      className="absolute inset-1.5 rounded-t-full rounded-b-lg border-2 border-dashed"
                      style={{ borderColor: `${R.rojo}60` }}
                    />
                    <ShoppingBag size={36} style={{ color: R.rojo }} className="relative z-10" />
                  </div>
                  <p className="font-serif text-xl font-bold text-black/80">
                    Tu canasta está vacía
                  </p>
                  <p className="text-sm mt-3 text-black/45 leading-relaxed">
                    Las puertas de nuestro retablo están abiertas. Explora la carta y añade
                    delicias.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, i) => {
                    // Distribución de colores retablo
                    const accents = [R.rojo, R.verde, R.morado, R.amarillo];
                    const accent = accents[i % accents.length];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3.5 bg-white rounded-xl p-3 shadow-xs border border-black/5 group hover:shadow-sm transition-all"
                      >
                        {item.image && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-black/5 shadow-xs bg-white">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-16 py-0.5">
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-serif text-sm font-bold leading-snug text-ink truncate">
                              {item.name}
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-black/30 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50 -mr-1 -mt-1 flex-shrink-0"
                              title="Eliminar plato"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-auto">
                            <p className="text-xs font-serif font-bold text-eucalipto">
                              S/ {item.price.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-1.5 bg-black/4 rounded-lg p-0.5 border border-black/5">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-ink/70 hover:text-eucalipto hover:bg-white transition-all"
                              >
                                <Minus size={11} strokeWidth={2.5} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center text-ink">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-ink/70 hover:text-eucalipto hover:bg-white transition-all"
                              >
                                <Plus size={11} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {items.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-black/40 mb-3">
                    Tipo de pedido
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      {
                        type: "delivery" as OrderType,
                        label: "Delivery",
                        sub: "A tu puerta",
                        Icon: Truck,
                      },
                      {
                        type: "pickup" as OrderType,
                        label: "Para Llevar",
                        sub: "En restaurante",
                        Icon: Store,
                      },
                    ].map(({ type, label, sub, Icon }) => {
                      const active = orderType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setOrderType(type)}
                          className={`rounded-xl p-3 text-left transition-all border-2 flex items-center gap-3 ${
                            active
                              ? "bg-eucalipto/10 border-eucalipto text-eucalipto shadow-xs"
                              : "bg-white border-black/10 text-ink/60 hover:border-black/20 hover:text-ink"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              active ? "bg-eucalipto text-cream" : "bg-black/5 text-ink/60"
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <span className="block font-serif font-bold text-xs leading-tight">
                              {label}
                            </span>
                            <span className="block text-[9.5px] mt-0.5 opacity-70 truncate font-sans">
                              {sub}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm space-y-2 text-sm">
                    <div className="flex justify-between text-black/50 font-medium">
                      <span>
                        Subtotal ({totalItems} {totalItems === 1 ? "plato" : "platos"})
                      </span>
                      <span>S/ {totalPrice.toFixed(2)}</span>
                    </div>
                    {orderType === "delivery" && (
                      <div className="flex justify-between text-black/50 font-medium">
                        <span>Costo de delivery</span>
                        <span>S/ {DELIVERY_FEE.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-serif font-bold text-base pt-2 border-t border-black/5">
                      <span className="text-ink/80">Total</span>
                      <span className="text-eucalipto font-serif font-bold text-lg">S/ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 2: ENTREGA */}
          {step === "delivery" && (
            <form
              id="delivery-form"
              className="p-5 space-y-4 min-h-full"
              onSubmit={(e) => {
                e.preventDefault();
                setStep("payment");
              }}
            >
              {orderType === "delivery" && (
                <div
                  className="rounded-xl p-3.5 flex gap-2.5 text-sm bg-eucalipto/8 border border-eucalipto/20 text-eucalipto"
                >
                  <MapPin size={15} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Solo en Huamanga, Ayacucho — <strong>30 minutos estimados</strong>
                  </span>
                </div>
              )}

              {!delivery.email ? (
                <div className="py-10 text-center px-6 bg-white rounded-xl border border-black/5 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-eucalipto/10 text-eucalipto flex items-center justify-center mx-auto mb-4">
                    <Lock size={22} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-ink mb-1">
                    Identifícate para continuar
                  </h3>
                  <p className="text-xs text-black/55 mb-6 leading-relaxed">
                    Inicia sesión con tu cuenta de Google para calcular el envío y personalizar tus notas.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDelivery({ ...delivery, name: "Luis Llocclla", email: "luis@ejemplo.com" });
                      setDeliverySubStep("location");
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-black/10 hover:border-black/25 rounded-xl px-4 py-3.5 text-sm font-bold text-black/75 transition-all shadow-sm active:scale-[0.99]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continuar con Google
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Banner de Usuario Google */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-medium border bg-eucalipto/10 border-eucalipto/20 text-eucalipto">
                    <CheckCircle size={16} />
                    <span className="flex-1 truncate font-bold">{delivery.name} ({delivery.email})</span>
                    <button
                      type="button"
                      onClick={() => setDelivery({ ...delivery, email: "", name: "" })}
                      className="text-[10px] uppercase tracking-wider font-bold underline underline-offset-2 opacity-80 hover:opacity-100"
                    >
                      Cambiar
                    </button>
                  </div>

                  {/* ETAPA A: PINEAR UBICACIÓN (Solo si es Delivery) */}
                  {orderType === "delivery" && deliverySubStep === "location" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
                      <div className="flex items-center justify-between">
                        <Label>1. Fijar Ubicación en el Mapa *</Label>
                        <button
                          type="button"
                          onClick={handleUseGPS}
                          className="text-[11px] font-bold text-eucalipto flex items-center gap-1 hover:underline mb-2"
                        >
                          <MapPin size={13} /> usar mi GPS
                        </button>
                      </div>

                      {isMounted && (
                        <Suspense
                          fallback={
                            <div className="w-full h-[220px] rounded-xl border border-black/10 bg-black/5 animate-pulse" />
                          }
                        >
                          <LocationSelector
                            initialLocation={clientLocation}
                            onLocationSelect={(lat, lng) => setClientLocation({ lat, lng })}
                          />
                        </Suspense>
                      )}

                      {clientLocation ? (
                        <div className="p-3 bg-white rounded-xl border border-black/5 text-xs text-ink/80 flex items-center justify-between">
                          <span>📍 Distancia estimada: <strong>{distanceKm.toFixed(1)} km</strong></span>
                          <span className="font-bold text-eucalipto">Costo: S/ {DELIVERY_FEE.toFixed(2)}</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-black/50 font-medium">
                          Mueve el pin rojo o haz clic en el mapa para marcar tu ubicación exacta en Huamanga.
                        </p>
                      )}

                      {isTooFar && (
                        <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                          <AlertTriangle size={14} /> Fuera de zona de reparto (Máx {DELIVERY_CONFIG.maxRadiusKm} km)
                        </p>
                      )}

                      <div>
                        <Label>Dirección exacta *</Label>
                        <input
                          required
                          value={delivery.address}
                          onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                          placeholder="Av. Principal 123, Dpto 201"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <Label>Referencia de entrega</Label>
                        <input
                          value={delivery.reference}
                          onChange={(e) => setDelivery({ ...delivery, reference: e.target.value })}
                          placeholder="Frente al parque, portón blanco..."
                          className={inputCls}
                        />
                      </div>
                    </div>
                  )}

                  {/* ETAPA B: TELÉFONO Y NOTAS (O cuando es Para Llevar) */}
                  {(deliverySubStep === "details" || orderType === "pickup") && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
                      {orderType === "delivery" && clientLocation && (
                        <div className="p-3 bg-white rounded-xl border border-black/10 flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-2">
                            <span className="block font-bold text-ink truncate">📍 {delivery.address || "Ubicación fijada"}</span>
                            <span className="block text-[10px] text-black/50">A {distanceKm.toFixed(1)} km del restaurante</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDeliverySubStep("location")}
                            className="text-[11px] font-bold text-eucalipto hover:underline flex-shrink-0"
                          >
                            Modificar mapa
                          </button>
                        </div>
                      )}

                      <div>
                        <Label>Teléfono / Celular *</Label>
                        <input
                          required
                          value={delivery.phone}
                          onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                          placeholder="987 654 321"
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <Label>Notas o Comentarios del pedido (Opcional)</Label>
                        <textarea
                          value={delivery.notes}
                          onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                          placeholder="Sin cebolla, aliño aparte, o entregar a las 2:00 PM..."
                          className={`${inputCls} resize-none min-h-[90px]`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}

          {/* PASO 3: PAGO */}
          {step === "payment" && (
            <form id="payment-form" className="p-5 space-y-4 min-h-full" onSubmit={handlePayment}>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { id: "yape", label: "Yape / Plin", Icon: Smartphone, color: R.morado },
                    { id: "card", label: "Tarjeta", Icon: CreditCard, color: "#0057A8" },
                  ] as const
                ).map(({ id, label, Icon, color }) => {
                  const active = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className="py-4 rounded-xl font-serif font-bold text-sm flex flex-col items-center gap-2 transition-all border-2"
                      style={{
                        background: active ? color : "white",
                        borderColor: active ? color : `${color}25`,
                        color: active ? "white" : `${color}99`,
                        boxShadow: active ? `0 4px 16px ${color}35` : "none",
                      }}
                    >
                      <Icon size={20} />
                      {label}
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "yape" ? (
                <div
                  className="bg-white rounded-xl p-5 border shadow-sm space-y-4"
                  style={{ borderColor: `${R.amarillo}50` }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-36 h-36 rounded-xl p-3 mb-3 border bg-white"
                      style={{ borderColor: `${R.amarillo}50` }}
                    >
                      <div
                        className="w-full h-full rounded-lg"
                        style={{
                          backgroundImage: `repeating-linear-gradient(0deg,${R.morado} 0,${R.morado} 2px,transparent 2px,transparent 10px),repeating-linear-gradient(90deg,${R.morado} 0,${R.morado} 2px,transparent 2px,transparent 10px)`,
                        }}
                      />
                    </div>
                    <p className="font-serif font-bold text-sm text-black/80">
                      Escanea con Yape o Plin
                    </p>
                    <p className="text-xs text-black/50 mt-0.5">
                      A nombre de <strong>Las Flores SAC</strong>
                    </p>
                  </div>
                  <div>
                    <Label>Titular de la cuenta origen *</Label>
                    <input required placeholder="Ej: Juan Pérez" className={inputCls} />
                  </div>
                  <div>
                    <Label>N° Operación (Yape/Plin) *</Label>
                    <input required placeholder="Ej: 123456" className={inputCls} />
                    <p className="text-[10px] text-black/40 mt-1.5 font-medium">
                      6 u 8 dígitos de aprobación de tu pantalla de éxito.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-5 border border-[#0057A8]/15 shadow-sm space-y-4">
                  <div
                    className="rounded-lg px-4 py-2.5 flex items-center justify-between"
                    style={{ background: "linear-gradient(135deg,#0057A8,#0088D1)" }}
                  >
                    <span className="font-bold text-white tracking-wider text-sm">culqi</span>
                    <div className="flex items-center gap-1 text-white/80 text-[10px] font-medium">
                      <Lock size={10} /> Pago Seguro SSL
                    </div>
                  </div>
                  <div>
                    <Label>Número de tarjeta *</Label>
                    <div className="relative">
                      <input
                        required
                        value={payment.cardNumber}
                        onChange={(e) =>
                          setPayment({ ...payment, cardNumber: formatCard(e.target.value) })
                        }
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className={`${inputCls} pr-10`}
                      />
                      <CreditCard
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Vencimiento *</Label>
                      <input
                        required
                        value={payment.expiry}
                        onChange={(e) =>
                          setPayment({ ...payment, expiry: formatExpiry(e.target.value) })
                        }
                        placeholder="MM/AA"
                        maxLength={5}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label>CVV *</Label>
                      <input
                        required
                        type="password"
                        value={payment.cvv}
                        onChange={(e) =>
                          setPayment({
                            ...payment,
                            cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                          })
                        }
                        placeholder="123"
                        maxLength={4}
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Titular de la tarjeta *</Label>
                    <input
                      required
                      value={payment.cardName}
                      onChange={(e) =>
                        setPayment({ ...payment, cardName: e.target.value.toUpperCase() })
                      }
                      placeholder="JUAN PEREZ"
                      className={`${inputCls} uppercase`}
                    />
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl p-4 border border-black/5 text-sm space-y-1.5 shadow-sm">
                <div className="flex justify-between text-black/50 font-medium">
                  <span>Subtotal</span>
                  <span>S/ {totalPrice.toFixed(2)}</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-black/50 font-medium">
                    <span>Delivery</span>
                    <span>S/ {DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-serif font-bold text-base pt-2 border-t border-black/5">
                  <span className="text-black/70">Total</span>
                  <span style={{ color: R.rojo }}>S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </form>
          )}

          {/* PASO 4: ÉXITO */}
          {step === "success" && (
            <div className="p-8 flex flex-col items-center text-center min-h-full justify-center">
              <div className="relative mb-6">
                <div
                  className="absolute -inset-2 rounded-full"
                  style={{
                    background: `conic-gradient(${R.verde} 0%,${R.amarillo} 25%,${R.rojo} 50%,${R.morado} 75%,${R.verde} 100%)`,
                    opacity: 0.5,
                  }}
                />
                <div
                  className="absolute -inset-2 rounded-full"
                  style={{ boxShadow: `inset 0 0 0 4px ${R.crema}` }}
                />
                <div
                  className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: R.amarillo }}
                >
                  <CheckCircle size={48} className="text-white" strokeWidth={2} />
                </div>
              </div>

              <h3 className="text-2xl font-serif font-bold mb-1" style={{ color: R.morado }}>
                Pedido confirmado
              </h3>
              <p className="text-black/60 text-sm mb-1 font-medium">Tu pedido ha sido recibido.</p>
              {orderType === "delivery" ? (
                <p className="text-black/50 text-xs mb-6">
                  Llegará a{" "}
                  <strong className="text-black/70">{delivery.address || "tu dirección"}</strong> en
                  aprox. <strong style={{ color: R.verde }}>30 min</strong>.
                </p>
              ) : (
                <p className="text-black/50 text-xs mb-6">
                  Listo para recoger en <strong style={{ color: R.verde }}>20 minutos</strong>.
                </p>
              )}
              {delivery.notes && (
                <p className="text-black/60 text-xs mb-6 px-4 py-3 bg-black/5 rounded-lg italic shadow-inner">
                  "{delivery.notes}"
                </p>
              )}

              <div className="w-full bg-white rounded-xl p-4 border border-black/5 text-left mb-4 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.12em] font-bold text-black/40 mb-3">
                  Resumen
                </p>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-black/60 font-medium mb-1.5"
                  >
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-serif font-bold text-base pt-2.5 border-t border-black/5 mt-2">
                  <span className="text-black/70">Total pagado</span>
                  <span style={{ color: R.rojo }}>S/ {total.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-black/30 font-medium">
                Pedido{" "}
                <strong style={{ color: R.morado }}>#LF{Date.now().toString().slice(-6)}</strong>
              </p>
            </div>
          )}
        </div>

        {/* ══ BOTONERA — Eucalipto & Crema ══ */}
        <div className="p-5 flex-shrink-0 border-t border-black/5 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          {step === "cart" && items.length > 0 && (
            <button
              onClick={() => setStep("delivery")}
              className="w-full py-4 rounded-xl font-serif font-bold text-lg tracking-wide transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: "var(--color-eucalipto)", color: "#FBF5E6" }}
            >
              Continuar — S/ {total.toFixed(2)}
            </button>
          )}

          {step === "delivery" && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (deliverySubStep === "details" && orderType === "delivery") {
                    setDeliverySubStep("location");
                  } else {
                    setStep("cart");
                  }
                }}
                className="flex-none w-12 h-[52px] rounded-xl flex items-center justify-center border-2 transition-colors hover:bg-black/5"
                style={{ borderColor: "var(--color-eucalipto)", color: "var(--color-eucalipto)" }}
              >
                <ArrowLeft size={20} />
              </button>

              {orderType === "delivery" && deliverySubStep === "location" ? (
                <button
                  type="button"
                  onClick={() => setDeliverySubStep("details")}
                  disabled={!delivery.email || !clientLocation || isTooFar || !delivery.address}
                  className="flex-1 py-3 rounded-xl font-serif font-bold text-base tracking-wide transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                  style={{ background: "var(--color-eucalipto)", color: "#FBF5E6" }}
                >
                  Continuar a datos &rarr;
                </button>
              ) : (
                <button
                  type="submit"
                  form="delivery-form"
                  disabled={!delivery.email || (orderType === "delivery" && (!clientLocation || isTooFar)) || !delivery.phone}
                  className="flex-1 py-3 rounded-xl font-serif font-bold text-base tracking-wide transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                  style={{ background: "var(--color-eucalipto)", color: "#FBF5E6" }}
                >
                  Ir al pago
                </button>
              )}
            </div>
          )}

          {step === "payment" && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("delivery")}
                className="flex-none w-12 h-[52px] rounded-xl flex items-center justify-center border-2 transition-colors hover:bg-black/5"
                style={{ borderColor: "var(--color-eucalipto)", color: "var(--color-eucalipto)" }}
              >
                <ArrowLeft size={20} />
              </button>
              <button
                type="submit"
                form="payment-form"
                disabled={processing}
                className="flex-1 py-3 rounded-xl font-serif font-bold text-base tracking-wide transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                style={{ background: "var(--color-eucalipto)", color: "#FBF5E6" }}
              >
                {processing ? "Procesando..." : `Pagar S/ ${total.toFixed(2)}`}
              </button>
            </div>
          )}

          {step === "success" && (
            <button
              onClick={handleClose}
              className="w-full py-4 rounded-xl font-serif font-bold text-lg tracking-wide transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: "var(--color-eucalipto)", color: "#FBF5E6" }}
            >
              Volver a la carta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
