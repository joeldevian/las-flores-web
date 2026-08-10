/**
 * Utilidad centralizada para normalizar estados de pedidos.
 * Resuelve la inconsistencia entre estados en español (Caja) e inglés (Admin).
 *
 * Uso: normalizeOrderStatus("preparing") => "en_preparacion"
 *      normalizeOrderStatus("en_camino")  => "en_camino"
 */

const STATUS_MAP: Record<string, string> = {
  // Español (canónico)
  pendiente: "pendiente",
  en_preparacion: "en_preparacion",
  en_camino: "en_camino",
  entregado: "entregado",
  cancelado: "cancelado",
  completado: "entregado",

  // Inglés → Español
  received: "pendiente",
  pending: "pendiente",
  preparing: "en_preparacion",
  in_preparation: "en_preparacion",
  on_the_way: "en_camino",
  in_transit: "en_camino",
  delivered: "entregado",
  completed: "entregado",
  cancelled: "cancelado",
  canceled: "cancelado",

  // Delivery driver phases
  to_restaurant: "en_preparacion",
  to_customer: "en_camino",
};

/**
 * Normaliza cualquier string de status a su equivalente canónico en español.
 */
export function normalizeOrderStatus(status: string | null | undefined): string {
  if (!status) return "pendiente";
  const key = status.toLowerCase().trim().replace(/\s+/g, "_");
  return STATUS_MAP[key] || "pendiente";
}

/**
 * Labels en español para mostrar en la UI.
 */
export const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_preparacion: "En Preparación",
  en_camino: "En Camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

/**
 * Colores de badges para cada status canónico.
 */
export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pendiente: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  en_preparacion: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  en_camino: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  entregado: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  cancelado: { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-300" },
};

/**
 * Determina si un status equivale a "cancelado" (en cualquier idioma).
 */
export function isCancelledStatus(status: string | null | undefined): boolean {
  return normalizeOrderStatus(status) === "cancelado";
}

/**
 * Devuelve el siguiente status lógico en el flujo de un pedido.
 */
export function getNextOrderStatus(currentStatus: string): string | null {
  const normalized = normalizeOrderStatus(currentStatus);
  switch (normalized) {
    case "pendiente":
      return "en_preparacion";
    case "en_preparacion":
      return "en_camino";
    case "en_camino":
      return "entregado";
    default:
      return null; // ya está entregado o cancelado
  }
}
