import { useState, useRef } from "react";
import { Shuffle, ChevronRight, Users, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

// ─── Zonas con layout en el plano SVG ────────────────────────────────────────
const ZONES = [
  {
    id: "salon-entrada",
    name: "Salón Entrada",
    shortName: "S. Entrada",
    color: "#C8966A",
    colorLight: "#EDD9C0",
    labelX: 49, labelY: 36,
    // rect: x=20, y=0, w=60, h=65
    shape: "rect" as const,
    rx: 20, ry: 0, rw: 60, rh: 65,
    tables: [
      { id: "SE-1", capacity: 6, x: 20, y: 25 },
      { id: "SE-2", capacity: 6, x: 50, y: 25 },
      { id: "SE-3", capacity: 6, x: 80, y: 25 },
      { id: "SE-4", capacity: 6, x: 20, y: 57 },
      { id: "SE-5", capacity: 6, x: 50, y: 57 },
      { id: "SE-6", capacity: 6, x: 80, y: 57 },
      { id: "SE-7", capacity: 4,  x: 50, y: 85 },
    ],
  },
  {
    id: "salon-ventana",
    name: "Salón Ventana",
    shortName: "S. Ventana",
    color: "#5A8C8C",
    colorLight: "#B8D4D4",
    labelX: 39, labelY: 93,
    shape: "rect" as const,
    rx: 0, ry: 66, rw: 80, rh: 54,
    tables: [
      { id: "SV-1", capacity: 10, x: 20, y: 30 },
      { id: "SV-2", capacity: 6,  x: 50, y: 30 },
      { id: "SV-3", capacity: 6,  x: 80, y: 30 },
      { id: "SV-4", capacity: 4,  x: 20, y: 70 },
      { id: "SV-5", capacity: 6,  x: 50, y: 70 },
      { id: "SV-6", capacity: 6,  x: 80, y: 70 },
    ],
  },
  {
    id: "estrado",
    name: "Estrado",
    shortName: "Estrado",
    color: "#B8735A",
    colorLight: "#DDBB9E",
    labelX: 106, labelY: 36,
    shape: "rect" as const,
    rx: 82, ry: 0, rw: 50, rh: 65,
    tables: [
      { id: "EST-1", capacity: 5, x: 20, y: 30 },
      { id: "EST-2", capacity: 6, x: 50, y: 30 },
      { id: "EST-3", capacity: 5, x: 80, y: 30 },
      { id: "EST-4", capacity: 5, x: 20, y: 70 },
      { id: "EST-5", capacity: 6, x: 50, y: 70 },
      { id: "EST-6", capacity: 5, x: 80, y: 70 },
    ],
  },
  {
    id: "salon-principal",
    name: "Salón Principal",
    shortName: "S. Principal",
    color: "#5F8575",
    colorLight: "#B0CBBD",
    labelX: 196, labelY: 40,
    shape: "rect" as const,
    rx: 148, ry: 0, rw: 98, rh: 75,
    tables: [
      { id: "SP-1",  capacity: 8,  x: 14, y: 16 },
      { id: "SP-2",  capacity: 6,  x: 38, y: 16 },
      { id: "SP-3",  capacity: 13, x: 62, y: 16 },
      { id: "SP-4",  capacity: 6,  x: 86, y: 16 },
      { id: "SP-5",  capacity: 5,  x: 14, y: 42 },
      { id: "SP-6",  capacity: 5,  x: 38, y: 42 },
      { id: "SP-7",  capacity: 6,  x: 62, y: 42 },
      { id: "SP-8",  capacity: 3,  x: 86, y: 42 },
      { id: "SP-9",  capacity: 6,  x: 14, y: 68 },
      { id: "SP-10", capacity: 6,  x: 38, y: 68 },
      { id: "SP-11", capacity: 6,  x: 62, y: 68 },
      { id: "SP-12", capacity: 6,  x: 86, y: 68 },
      { id: "SP-13", capacity: 6,  x: 50, y: 96 },
    ],
  },
  {
    id: "jardin",
    name: "Jardín",
    shortName: "Jardín",
    color: "#4A8A5A",
    colorLight: "#A8D4B0",
    labelX: 178, labelY: 100,
    shape: "rect" as const,
    rx: 148, ry: 76, rw: 62, rh: 44,
    tables: [
      { id: "JAR-1", capacity: 4, x: 30, y: 30 },
      { id: "JAR-2", capacity: 4, x: 70, y: 30 },
      { id: "JAR-3", capacity: 4, x: 30, y: 70 },
      { id: "JAR-4", capacity: 4, x: 70, y: 70 },
    ],
  },
  {
    id: "terraza",
    name: "Terraza",
    shortName: "Terraza",
    color: "#9A7850",
    colorLight: "#D4C0A0",
    labelX: 269, labelY: 62,
    shape: "poly" as const,
    points: "248,0 298,0 298,28 276,50 296,82 268,120 248,120",
    tables: [
      { id: "TER-1",  capacity: 6,  x: 14, y: 15 },
      { id: "TER-2",  capacity: 3,  x: 38, y: 15 },
      { id: "TER-3",  capacity: 3,  x: 62, y: 15 },
      { id: "TER-4",  capacity: 10, x: 86, y: 15 },
      { id: "TER-5",  capacity: 3,  x: 14, y: 42 },
      { id: "TER-6",  capacity: 6,  x: 38, y: 42 },
      { id: "TER-7",  capacity: 10, x: 62, y: 42 },
      { id: "TER-8",  capacity: 3,  x: 86, y: 42 },
      { id: "TER-9",  capacity: 6,  x: 14, y: 69 },
      { id: "TER-10", capacity: 10, x: 38, y: 69 },
      { id: "TER-11", capacity: 3,  x: 62, y: 69 },
      { id: "TER-12", capacity: 3,  x: 86, y: 69 },
      { id: "TER-13", capacity: 10, x: 26, y: 97 },
      { id: "TER-14", capacity: 6,  x: 74, y: 97 },
    ],
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface SeatSelectorProps {
  onSelectTable: (tableId: string) => void;
  onSkip: () => void;
  guestCount?: number;
  initialZone?: string;
  blockedZoneIds?: string[];
  isRestaurantBlocked?: boolean;
  blockedReasons?: Record<string, string>;
}

export function SeatSelector({
  onSelectTable,
  onSkip,
  guestCount = 2,
  initialZone,
  blockedZoneIds = [],
  isRestaurantBlocked = false,
  blockedReasons = {},
}: SeatSelectorProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(initialZone ?? null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const lastDistRef = useRef(0);

  const zone = ZONES.find((z) => z.id === selectedZone);

  // ─── Pinch-to-zoom ────────────────────────────────────────────────────────
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastDistRef.current > 0) {
        const delta = dist / lastDistRef.current;
        setZoom((prev) => Math.min(Math.max(prev * delta, 1), 4));
      }
      lastDistRef.current = dist;
    }
  };
  const handleTouchEnd = () => { lastDistRef.current = 0; };

  // ─── Vista zona: plano detallado con círculos ─────────────────────────────
  if (selectedZone && zone) {
    return (
      <div className="text-nogal animate-in fade-in slide-in-from-right-4 duration-400">
        <button
          onClick={() => { setSelectedZone(null); setSelectedTable(null); }}
          className="text-sm font-bold flex items-center gap-1.5 text-eucalipto hover:opacity-70 transition-opacity mb-3"
        >
          ← Volver al plano
        </button>

        <h3 className="font-serif text-2xl font-bold mb-0.5">{zone.name}</h3>
        <p className="text-xs opacity-50 mb-4">
          Toca una mesa · Los números indican la capacidad de personas
        </p>

        {/* SVG detallado de la zona */}
        <div
          className="rounded-2xl overflow-hidden shadow-inner mb-4 p-3"
          style={{ background: zone.colorLight + "60", border: `1.5px solid ${zone.color}40` }}
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-center mb-2"
            style={{ color: zone.color }}
          >
            {zone.name.toUpperCase()}
          </p>

          <svg viewBox={zone.tables.length > 10 ? "0 0 100 115" : zone.tables.length <= 4 ? "0 0 100 100" : "0 0 100 100"}
            className="w-full max-w-[300px] mx-auto">
            <rect x="1" y="1" width="98"
              height={zone.tables.length > 10 ? 113 : 98}
              rx="6" fill="#fdf8f0" stroke={zone.color + "40"} strokeWidth="0.8" />

            {/* Planta decorativa para jardín/terraza */}
            {(zone.id === "jardin" || zone.id === "terraza") && (
              <>
                <circle cx="7" cy="7" r="4" fill={zone.color} opacity="0.2" />
                <circle cx="93" cy="7" r="4" fill={zone.color} opacity="0.2" />
              </>
            )}

            <text x="50" y={zone.tables.length > 10 ? 111 : 97}
              fontSize="4" textAnchor="middle" fill={zone.color} fontWeight="bold" opacity="0.5">
              ENTRADA
            </text>

            {zone.tables.map((t) => {
              const fits = t.capacity >= guestCount;
              const isSelected = selectedTable === t.id;
              const fill = isSelected ? zone.color : fits ? "#ffffff" : "#ede9e0";
              const stroke = isSelected ? zone.color : fits ? "#c8a96e" : "#ccc4b4";
              const textFill = isSelected ? "#ffffff" : fits ? zone.color : "#b0a898";

              return (
                <g key={t.id}
                  onClick={() => fits && setSelectedTable(selectedTable === t.id ? null : t.id)}
                  style={{ cursor: fits ? "pointer" : "not-allowed", opacity: fits ? 1 : 0.4 }}
                >
                  <rect x={t.x - 13} y={t.y - 3} width="3" height="6" rx="1"
                    fill={isSelected ? zone.colorLight : "#ddd0bb"} />
                  <rect x={t.x + 10} y={t.y - 3} width="3" height="6" rx="1"
                    fill={isSelected ? zone.colorLight : "#ddd0bb"} />
                  <circle cx={t.x} cy={t.y} r="9" fill={fill} stroke={stroke}
                    strokeWidth={isSelected ? "2" : "1"} />
                  <text x={t.x} y={t.y + 1.5} fontSize="5" textAnchor="middle"
                    dominantBaseline="middle" fontWeight="bold" fill={textFill}>
                    {t.capacity}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Leyenda */}
        <div className="flex justify-center gap-4 text-xs font-semibold opacity-70 mb-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-white border border-[#c8a96e] inline-block" />
            Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ede9e0] inline-block opacity-50" />
            Muy pequeña
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: zone.color }} />
            Tu mesa
          </span>
        </div>

        {/* Info mesa seleccionada */}
        {selectedTable && (
          <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
            style={{ background: zone.colorLight + "80", border: `1px solid ${zone.color}40` }}>
            <Users size={16} style={{ color: zone.color }} className="shrink-0" />
            <div>
              <p className="text-sm font-bold" style={{ color: zone.color }}>Mesa {selectedTable}</p>
              <p className="text-xs opacity-60">
                Capacidad: hasta {zone.tables.find((t) => t.id === selectedTable)?.capacity} personas
              </p>
            </div>
          </div>
        )}

        <button
          disabled={!selectedTable}
          onClick={() => onSelectTable(`${zone.name} · Mesa ${selectedTable}`)}
          className="w-full py-4 font-serif font-bold text-lg tracking-wide transition-all shadow-md hover:shadow-lg rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
          style={{ background: "var(--color-cream)", color: "var(--color-eucalipto)" }}
        >
          {selectedTable ? `Confirmar Mesa ${selectedTable}` : "Selecciona una mesa"}
        </button>
      </div>
    );
  }

  // ─── Vista principal: plano interactivo ──────────────────────────────────
  return (
    <div className="text-nogal animate-in fade-in duration-500">
      <div className="text-center mb-4">
        <h3 className="font-serif text-3xl font-bold mb-1">Elige tu mesa</h3>
        <p className="text-sm opacity-60">Toca una zona en el plano o déjanos asignarte una</p>
      </div>

      {/* Botón aleatoria */}
      <button
        onClick={onSkip}
        className="w-full mb-4 p-4 rounded-2xl flex items-center gap-3 text-left transition-all hover:scale-[1.01] hover:shadow-lg active:scale-100"
        style={{
          background: "linear-gradient(135deg, var(--color-eucalipto) 0%, #3d6b56 100%)",
          color: "var(--color-cream)",
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Shuffle size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif font-bold text-base leading-tight">
            Asígname la mejor mesa disponible
          </p>
          <p className="text-xs opacity-80 mt-0.5">
            Ideal para {guestCount} {guestCount === 1 ? "persona" : "personas"}
          </p>
        </div>
        <ChevronRight size={18} className="opacity-70 shrink-0" />
      </button>

      {/* ─── PLANO INTERACTIVO ─── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider opacity-50">
            Plano del restaurante
          </span>
          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setZoom((p) => Math.min(p + 0.4, 4))}
              className="w-7 h-7 rounded-full bg-white border border-nogal/15 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ZoomIn size={13} />
            </button>
            <button onClick={() => setZoom((p) => Math.max(p - 0.4, 1))}
              className="w-7 h-7 rounded-full bg-white border border-nogal/15 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ZoomOut size={13} />
            </button>
            <button onClick={() => setZoom(1)}
              className="w-7 h-7 rounded-full bg-white border border-nogal/15 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        <div
          className="w-full rounded-2xl border border-nogal/10 bg-[#fdf8f0] shadow-sm overflow-hidden"
          style={{ height: "220px", touchAction: "none" }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg
              viewBox="0 0 300 125"
              style={{ width: "100%", height: "100%" }}
            >
              {/* ── Fondo del edificio ── */}
              <polygon
                points="0,22 0,120 248,120 268,120 296,82 276,52 298,28 298,0 248,0 148,0 82,0 20,0 20,22"
                fill="#f0e8d8" stroke="#d4c4a0" strokeWidth="1.5"
              />

              {/* ── Área no-seleccionable: Entrada ── */}
              <rect x="0" y="22" width="20" height="44" rx="2"
                fill="#e0d4c0" stroke="#c8b89a" strokeWidth="0.8" />
              <text x="10" y="47" fontSize="6" textAnchor="middle" fill="#a08060" fontWeight="bold"
                transform="rotate(-90,10,47)">ENTRADA</text>

              {/* ── Área no-seleccionable: Pasillo/Caja/SSHH/Juegos ── */}
              <rect x="82" y="66" width="66" height="54" rx="2"
                fill="#e8e0d0" stroke="#c8b89a" strokeWidth="0.6" />
              <text x="115" y="83" fontSize="7" textAnchor="middle" fill="#a09070" fontWeight="bold">Pasillo</text>
              <rect x="84" y="90" width="28" height="14" rx="2" fill="#d8d0c0" />
              <text x="98" y="99" fontSize="5.5" textAnchor="middle" fill="#907860">Caja</text>
              <rect x="114" y="90" width="28" height="14" rx="2" fill="#d8d0c0" />
              <text x="128" y="99" fontSize="5.5" textAnchor="middle" fill="#907860">SS.HH</text>

              {/* ── Área no-seleccionable: Caja derecha ── */}
              <rect x="212" y="76" width="34" height="44" rx="2"
                fill="#e8e0d0" stroke="#c8b89a" strokeWidth="0.6" />
              <text x="229" y="100" fontSize="5.5" textAnchor="middle" fill="#a09070" fontWeight="bold">Caja</text>

              {/* ── ZONAS SELECCIONABLES ── */}
              {ZONES.map((z) => {
                const isBlocked = isRestaurantBlocked || blockedZoneIds.includes(z.id);
                const compatible = isBlocked ? 0 : z.tables.filter((t) => t.capacity >= guestCount).length;
                const isHovered = hoveredZone === z.id;
                const opacity = isBlocked ? 0.35 : compatible === 0 ? 0.4 : 1;

                const commonProps = {
                  fill: isBlocked ? "#fee2e2" : isHovered ? z.color : z.colorLight,
                  stroke: isBlocked ? "#ef4444" : z.color,
                  strokeWidth: isBlocked ? "1.5" : isHovered ? "2" : "1",
                  opacity,
                  style: { cursor: isBlocked ? "not-allowed" : compatible > 0 ? "pointer" : "not-allowed", transition: "all 0.15s" },
                  onClick: () => {
                    if (isBlocked) {
                      const reason = blockedReasons[z.id] || blockedReasons["global"] || "Reservada / Apagada por administración";
                      alert(`La zona "${z.name}" se encuentra temporalmente bloqueada para reservas en línea.\nMotivo: ${reason}`);
                    } else if (compatible > 0) {
                      setSelectedZone(z.id);
                    }
                  },
                  onMouseEnter: () => setHoveredZone(z.id),
                  onMouseLeave: () => setHoveredZone(null),
                };

                return (
                  <g key={z.id}>
                    {z.shape === "rect" ? (
                      <rect x={z.rx} y={z.ry} width={z.rw} height={z.rh} rx="3" {...commonProps} />
                    ) : (
                      <polygon points={z.points} {...commonProps} />
                    )}

                    {/* Etiqueta de zona */}
                    <text
                      x={z.labelX} y={z.labelY - 4}
                      fontSize="9"
                      textAnchor="middle"
                      fontWeight="bold"
                      fill={isBlocked ? "#dc2626" : isHovered ? "#ffffff" : z.color}
                      style={{ pointerEvents: "none", transition: "fill 0.15s" }}
                    >
                      {z.shortName}
                    </text>
                    {/* Contador de mesas / Estado Bloqueado */}
                    <text
                      x={z.labelX} y={z.labelY + 7}
                      fontSize="6.5"
                      textAnchor="middle"
                      fill={isBlocked ? "#dc2626" : isHovered ? "#ffffff" : z.color}
                      fontWeight={isBlocked ? "bold" : "normal"}
                      opacity="0.9"
                      style={{ pointerEvents: "none", transition: "fill 0.15s" }}
                    >
                      {isBlocked ? "BLOQUEADA" : `${compatible} mesa${compatible !== 1 ? "s" : ""}`}
                    </text>
                  </g>
                );
              })}

              {/* Etiqueta "Toca una zona" */}
              <text x="150" y="8" fontSize="4" textAnchor="middle" fill="#a08060" opacity="0.6">
                Toca una zona para elegir tu mesa
              </text>
            </svg>
          </div>
        </div>

        <p className="text-[10px] text-center mt-1.5 opacity-40">
          Usa + / − para hacer zoom · Pellizca la pantalla con dos dedos
        </p>
      </div>

      {/* ─── Leyenda de colores ─── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ZONES.map((z) => (
          <button
            key={z.id}
            onClick={() => {
              const compatible = z.tables.filter((t) => t.capacity >= guestCount).length;
              if (compatible > 0) setSelectedZone(z.id);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105"
            style={{
              background: z.colorLight,
              borderColor: z.color + "60",
              color: z.color,
            }}
          >
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: z.color }} />
            {z.shortName}
          </button>
        ))}
      </div>
    </div>
  );
}

