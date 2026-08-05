import { useState, useEffect } from "react";
import type { RestaurantZone, ZoneBlackout } from "../features/zones/types";
import { listRestaurantZones, listZoneBlackouts, toggleBlackoutStatus } from "../features/zones/api";
import { AdminZoneModal } from "./AdminZoneModal";
import { AdminBlackoutModal } from "./AdminBlackoutModal";
import { LayoutGrid, ShieldAlert, Power, Edit3, Users, RefreshCw, Loader2, AlertCircle } from "lucide-react";

export function AdminZonesSection() {
  const [zones, setZones] = useState<RestaurantZone[]>([]);
  const [blackouts, setBlackouts] = useState<ZoneBlackout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<"zones" | "blackouts">("zones");

  const [selectedZoneToEdit, setSelectedZoneToEdit] = useState<RestaurantZone | null>(null);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isBlackoutModalOpen, setIsBlackoutModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [zData, bData] = await Promise.all([
        listRestaurantZones(),
        listZoneBlackouts(),
      ]);
      setZones(zData);
      setBlackouts(bData);
    } catch (err: any) {
      console.error(err);
      setError("No se pudieron cargar las zonas y bloqueos. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlackout = async (id: string, currentStatus: boolean) => {
    try {
      await toggleBlackoutStatus(id, !currentStatus);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error al cambiar el estado del apagado.");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-ink/60 space-y-3">
        <Loader2 size={32} className="animate-spin mx-auto text-eucalipto" />
        <p className="text-sm font-semibold">Cargando salones y configuración de apagado...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-center space-y-3">
        <AlertCircle size={32} className="mx-auto" />
        <p className="text-sm font-bold">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const activeBlackoutsCount = blackouts.filter((b) => b.is_active).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold text-eucalipto tracking-wider block">
            Gestión del Establecimiento
          </span>
          <h2 className="font-serif font-bold text-2xl lg:text-3xl text-ink">
            Salones & Apagado de Reservas
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBlackoutModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-md transition-all flex items-center gap-2"
          >
            <ShieldAlert size={16} />
            <span>⚡ Apagar Zona / Local</span>
          </button>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-black/5 hover:bg-black/10 text-ink/70 transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Selector de Sub-pestañas */}
      <div className="flex border-b border-black/10 bg-cream/30 p-1 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveSubTab("zones")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "zones"
              ? "bg-white text-eucalipto shadow-sm"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          <LayoutGrid size={15} />
          <span>Salones del Local ({zones.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("blackouts")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "blackouts"
              ? "bg-white text-red-600 shadow-sm"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          <Power size={15} />
          <span>Bloqueos / Apagados ({activeBlackoutsCount})</span>
        </button>
      </div>

      {/* Sub-pestaña 1: Zonas del Local */}
      {activeSubTab === "zones" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white rounded-3xl border border-black/10 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-cream overflow-hidden">
                  {zone.image_url ? (
                    <img
                      src={zone.image_url}
                      alt={zone.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/30 font-bold">
                      Sin foto asignada
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {zone.max_tables_count} Mesas
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-xl text-ink">{zone.name}</h3>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: zone.color }}
                      title={`Color identificador: ${zone.color}`}
                    />
                  </div>

                  <p className="text-xs text-ink/70 leading-relaxed min-h-[36px]">
                    {zone.description || "Sin descripción asignada."}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-black/5 text-ink/80">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Users size={15} className="text-eucalipto" />
                      <span>Aforo: {zone.max_capacity_persons} pers.</span>
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        zone.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {zone.is_active ? "Habilitado" : "Deshabilitado"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#fcfaf5] border-t border-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedZoneToEdit(zone);
                    setIsZoneModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-white border border-black/10 hover:border-eucalipto text-ink font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 size={14} className="text-eucalipto" />
                  <span>Editar Foto y Datos</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-pestaña 2: Bloqueos / Apagados Activos */}
      {activeSubTab === "blackouts" && (
        <div className="bg-white rounded-3xl border border-black/10 shadow-sm overflow-hidden">
          <div className="p-5 bg-[#fcfaf5] border-b border-black/10 flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-ink">Historial de Apagados y Bloqueos</h3>
            <span className="text-xs text-ink/60 font-semibold">
              Total registrados: {blackouts.length}
            </span>
          </div>

          {blackouts.length === 0 ? (
            <div className="p-12 text-center text-ink/50 space-y-3">
              <ShieldAlert size={40} className="mx-auto text-ink/30" />
              <p className="text-sm font-semibold">No hay apagados o bloqueos registrados.</p>
              <p className="text-xs text-ink/60">
                Las reservas públicas están funcionando normalmente en todas las zonas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream/50 text-ink/70 font-bold uppercase tracking-wider border-b border-black/10">
                  <tr>
                    <th className="py-3.5 px-4">Zona / Ámbito</th>
                    <th className="py-3.5 px-4">Tipo Bloqueo</th>
                    <th className="py-3.5 px-4">Fecha / Horario</th>
                    <th className="py-3.5 px-4">Motivo</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {blackouts.map((b) => (
                    <tr key={b.id} className="hover:bg-cream/20 transition-colors">
                      <td className="py-4 px-4 font-bold text-ink">
                        {b.zone_id ? (
                          <span className="flex items-center gap-1.5 text-eucalipto">
                            📍 {b.restaurant_zones?.name || b.zone_id}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-black uppercase text-[10px]">
                            🔴 TODO EL LOCAL
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize font-medium">
                          {b.blackout_type === "full_day"
                            ? "Día Completo"
                            : b.blackout_type === "time_slot"
                            ? "Turno / Horas"
                            : "Indefinido"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-ink">
                            {b.start_date} {b.end_date ? ` al ${b.end_date}` : ""}
                          </span>
                          {b.start_time && b.end_time && (
                            <span className="text-ink/60">
                              ⏰ {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)} hrs
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-ink/80 max-w-xs truncate" title={b.reason}>
                        {b.reason}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            b.is_active
                              ? "bg-red-100 text-red-700 animate-pulse"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {b.is_active ? "⚡ Apagado Activo" : "Encendido / Inactivo"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleBlackout(b.id, b.is_active)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ml-auto ${
                            b.is_active
                              ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                              : "bg-black/5 hover:bg-black/10 text-ink/70"
                          }`}
                        >
                          <Power size={13} />
                          <span>{b.is_active ? "Encender Zona" : "Reactivar Apagado"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <AdminZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => {
          setIsZoneModalOpen(false);
          setSelectedZoneToEdit(null);
        }}
        zone={selectedZoneToEdit}
        onSaved={loadData}
      />

      <AdminBlackoutModal
        isOpen={isBlackoutModalOpen}
        onClose={() => setIsBlackoutModalOpen(false)}
        zones={zones}
        onCreated={loadData}
      />
    </div>
  );
}
