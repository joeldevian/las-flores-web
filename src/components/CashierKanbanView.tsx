import { CashierOrderCard } from "./CashierOrderCard";
import { Utensils, Clock, Truck, CheckCircle2, XCircle } from "lucide-react";
import { normalizeOrderStatus, isCancelledStatus } from "../lib/orderStatus";

interface CashierKanbanViewProps {
  orders: any[];
  orderItems: any[];
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  onViewDetail: (order: any) => void;
}

export function CashierKanbanView({
  orders,
  orderItems,
  onStatusChange,
  onViewDetail,
}: CashierKanbanViewProps) {
  const getLocalYYYYMMDD = (d?: Date | string) => {
    if (!d) return "";
    const dateObj = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toLocaleDateString("sv-SE");
  };
  const todayStr = getLocalYYYYMMDD(new Date());

  const pending = orders.filter(
    (o) => !isCancelledStatus(o.status) && normalizeOrderStatus(o.status) === "pendiente"
  );
  const inKitchen = orders.filter(
    (o) => !isCancelledStatus(o.status) && normalizeOrderStatus(o.status) === "en_preparacion"
  );
  const onWay = orders.filter(
    (o) => !isCancelledStatus(o.status) && normalizeOrderStatus(o.status) === "en_camino"
  );
  const completed = orders.filter((o) => {
    if (isCancelledStatus(o.status)) return false;
    if (normalizeOrderStatus(o.status) !== "entregado") return false;
    const ordDateStr = o.created_at ? getLocalYYYYMMDD(o.created_at) : "";
    return ordDateStr === todayStr || !ordDateStr;
  });
  const cancelled = orders.filter((o) => isCancelledStatus(o.status));

  const columns = [
    {
      id: "pendiente",
      title: "1. Pendientes",
      count: pending.length,
      icon: Clock,
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-400",
      textColor: "text-amber-950",
      badgeColor: "bg-amber-500 text-white",
      items: pending,
    },
    {
      id: "en_preparacion",
      title: "2. En Cocina",
      count: inKitchen.length,
      icon: Utensils,
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-400",
      textColor: "text-blue-950",
      badgeColor: "bg-blue-600 text-white",
      items: inKitchen,
    },
    {
      id: "en_camino",
      title: "3. Listos / Despacho",
      count: onWay.length,
      icon: Truck,
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-400",
      textColor: "text-purple-950",
      badgeColor: "bg-purple-600 text-white",
      items: onWay,
    },
    {
      id: "entregado",
      title: "4. Entregados Hoy",
      count: completed.length,
      icon: CheckCircle2,
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-400",
      textColor: "text-emerald-950",
      badgeColor: "bg-emerald-600 text-white",
      items: completed,
    },
    {
      id: "cancelado",
      title: "5. Cancelados",
      count: cancelled.length,
      icon: XCircle,
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-400",
      textColor: "text-rose-950",
      badgeColor: "bg-rose-600 text-white",
      items: cancelled,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start font-sans">
      {columns.map((col) => {
        const Icon = col.icon;
        return (
          <div
            key={col.id}
            className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col"
          >
            {/* Header Column */}
            <div className={`p-3.5 border-b flex items-center justify-between ${col.bgColor} ${col.borderColor}`}>
              <div className="flex items-center gap-2">
                <Icon size={18} className={col.textColor} />
                <h3 className={`font-serif font-black text-sm uppercase tracking-wide ${col.textColor}`}>
                  {col.title}
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs ${col.badgeColor}`}>
                {col.count}
              </span>
            </div>

            {/* Column Cards Feed */}
            <div className="p-3 space-y-3 flex-1 bg-gray-50/40">
              {col.items.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 font-medium italic border-2 border-dashed border-gray-200 rounded-xl">
                  Sin comandas en esta columna
                </div>
              ) : (
                col.items.map((order) => (
                  <CashierOrderCard
                    key={order.id}
                    order={order}
                    orderItems={orderItems}
                    onStatusChange={onStatusChange}
                    onViewDetail={onViewDetail}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
