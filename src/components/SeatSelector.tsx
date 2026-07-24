import { useState } from "react";

// Mock data for zones and tables
const ZONES = [
  { id: "salon", name: "Salón Principal", color: "#8B4513" },
  { id: "terraza", name: "Terraza (Exterior)", color: "#2E8B57" },
  { id: "balcon", name: "Balcón Privado", color: "#4682B4" },
];

const TABLES = [
  { id: "M1", x: 25, y: 30, available: true },
  { id: "M2", x: 50, y: 30, available: false },
  { id: "M3", x: 75, y: 30, available: true },
  { id: "M4", x: 25, y: 60, available: true },
  { id: "M5", x: 50, y: 60, available: true },
  { id: "M6", x: 75, y: 60, available: false },
];

interface SeatSelectorProps {
  onSelectTable: (tableId: string) => void;
  onSkip: () => void;
}

export function SeatSelector({ onSelectTable, onSkip }: SeatSelectorProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full text-ink animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-6">
        <h3 className="font-serif text-3xl font-bold mb-2">Elige tu mesa</h3>
        <p className="text-sm opacity-70">Selecciona la zona y luego la mesa de tu preferencia</p>
      </div>

      {!selectedZone ? (
        <div className="flex-1 flex flex-col items-center gap-4">
          {ZONES.map((z) => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.id)}
              className="w-full p-6 bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-cream/50 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
            >
              <span className="font-bold text-lg text-ink">{z.name}</span>
              <span className="text-sm font-normal opacity-0 group-hover:opacity-100 transition-opacity text-eucalipto">
                Ver mapa &rarr;
              </span>
            </button>
          ))}

          <button
            onClick={onSkip}
            className="mt-6 text-sm font-bold text-ink underline opacity-60 hover:opacity-100 transition-opacity"
          >
            Asignarme la mejor mesa disponible aleatoriamente
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <button
            onClick={() => {
              setSelectedZone(null);
              setSelectedTable(null);
            }}
            className="text-sm font-bold mb-4 self-start flex items-center gap-2 hover:text-cream transition-colors"
          >
            &larr; Volver a zonas
          </button>

          <div className="flex-1 bg-white/60 backdrop-blur-md border border-ink/10 rounded-2xl relative overflow-hidden shadow-inner p-4 flex flex-col items-center justify-center">
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">
              {ZONES.find((z) => z.id === selectedZone)?.name}
            </h4>

            <svg viewBox="0 0 100 100" className="w-full max-w-[280px] drop-shadow-md">
              <rect x="0" y="0" width="100" height="100" fill="#ffffff" rx="8" />
              {/* Decoración del salón */}
              <rect x="35" y="92" width="30" height="8" fill="var(--color-eucalipto)" opacity="0.1" />
              <text
                x="50"
                y="97"
                fontSize="4"
                textAnchor="middle"
                fill="var(--color-eucalipto)"
                opacity="0.5"
                fontWeight="bold"
              >
                ENTRADA
              </text>

              {/* Plantas */}
              <circle cx="10" cy="10" r="5" fill="#2E8B57" opacity="0.2" />
              <circle cx="90" cy="10" r="5" fill="#2E8B57" opacity="0.2" />

              {TABLES.map((t) => (
                <g
                  key={t.id}
                  onClick={() => t.available && setSelectedTable(t.id)}
                  className={`transition-all duration-300 ${t.available ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-40"}`}
                >
                  {/* Sillas */}
                  <rect x={t.x - 12} y={t.y - 4} width="3" height="8" fill="#e5e7eb" rx="1" />
                  <rect x={t.x + 9} y={t.y - 4} width="3" height="8" fill="#e5e7eb" rx="1" />

                  {/* Mesa */}
                  <circle
                    cx={t.x}
                    cy={t.y}
                    r="9"
                    fill={selectedTable === t.id ? "var(--color-eucalipto)" : t.available ? "#ffffff" : "#f3f4f6"}
                    stroke={selectedTable === t.id ? "var(--color-eucalipto-dark)" : "#d1d5db"}
                    strokeWidth={selectedTable === t.id ? "2" : "1"}
                  />
                  <text
                    x={t.x}
                    y={t.y + 1.5}
                    fontSize="4"
                    textAnchor="middle"
                    fontWeight="bold"
                    fill="var(--color-eucalipto)"
                  >
                    {t.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-6 flex justify-center gap-6 text-xs font-semibold opacity-80">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>{" "}
              Disponible
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></div>{" "}
              Ocupada
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cream border-2 border-eucalipto"></div> Tu
              mesa
            </span>
          </div>

          <button
            disabled={!selectedTable}
            onClick={() => onSelectTable(`${selectedZone}-${selectedTable}`)}
            className="w-full mt-6 py-4 font-serif font-bold text-lg tracking-wide transition-all shadow-md hover:shadow-lg rounded-xl disabled:opacity-50 disabled:transform-none hover:-translate-y-0.5"
            style={{ background: "var(--color-cream)", color: "var(--color-eucalipto)" }}
          >
            Confirmar Mesa {selectedTable || ""}
          </button>
        </div>
      )}
    </div>
  );
}
