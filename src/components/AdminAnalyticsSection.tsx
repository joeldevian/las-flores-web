import { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Calendar,
  Download,
  Printer,
  PieChart as PieChartIcon,
  BarChart3,
  CheckCircle2,
  Percent,
} from "lucide-react";

interface AdminAnalyticsSectionProps {
  orders: any[];
  orderItems: any[];
  products: any[];
}

export function AdminAnalyticsSection({
  orders,
  orderItems,
  products,
}: AdminAnalyticsSectionProps) {
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month" | "all">("month");

  // Filter orders by timeframe
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      if (!order.created_at) return true;
      const orderDate = new Date(order.created_at);

      if (timeframe === "today") {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }

      if (timeframe === "week") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= sevenDaysAgo;
      }

      if (timeframe === "month") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }

      return true; // 'all'
    });
  }, [orders, timeframe]);

  // Valid orders (not cancelled)
  const validOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.status !== "cancelled");
  }, [filteredOrders]);

  // KPI Calculations
  const totalRevenue = useMemo(() => {
    return validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  }, [validOrders]);

  const averageTicket = useMemo(() => {
    return validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
  }, [totalRevenue, validOrders]);

  const completionRate = useMemo(() => {
    if (filteredOrders.length === 0) return 100;
    return (validOrders.length / filteredOrders.length) * 100;
  }, [filteredOrders, validOrders]);

  const deliveryCount = useMemo(() => {
    return validOrders.filter((o) => o.order_type === "delivery").length;
  }, [validOrders]);

  const pickupCount = useMemo(() => {
    return validOrders.filter((o) => o.order_type === "pickup").length;
  }, [validOrders]);

  const deliveryPercentage = useMemo(() => {
    if (validOrders.length === 0) return 0;
    return Math.round((deliveryCount / validOrders.length) * 100);
  }, [deliveryCount, validOrders]);

  // Top Selling Products Calculation
  const topProducts = useMemo(() => {
    const productStats: Record<string, { name: string; quantity: number; revenue: number; image?: string }> = {};

    const validOrderIds = new Set(validOrders.map((o) => o.id));

    orderItems.forEach((item) => {
      if (validOrderIds.has(item.order_id)) {
        const rawName = item.product_name || item.products?.name || "Producto Desconocido";
        const pId = rawName;
        const pName = rawName;
        const qty = Number(item.quantity || 1);
        const price = Number(item.unit_price || 0);

        if (!productStats[pId]) {
          productStats[pId] = {
            name: pName,
            quantity: 0,
            revenue: 0,
            image: item.products?.image_url,
          };
        }

        productStats[pId].quantity += qty;
        productStats[pId].revenue += qty * price;
      }
    });

    const result = Object.values(productStats).sort((a, b) => b.quantity - a.quantity);
    return result.slice(0, 5); // Top 5
  }, [validOrders, orderItems]);

  // Daily Sales Trend (for chart)
  const dailySalesData = useMemo(() => {
    const daysMap: Record<string, number> = {};

    // Sort valid orders by date
    const sorted = [...validOrders].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sorted.forEach((o) => {
      const dateStr = new Date(o.created_at).toLocaleDateString("es-PE", {
        month: "short",
        day: "numeric",
      });
      daysMap[dateStr] = (daysMap[dateStr] || 0) + Number(o.total || 0);
    });

    const entries = Object.entries(daysMap);
    const maxVal = Math.max(...entries.map(([, val]) => val), 1);

    return { entries, maxVal };
  }, [validOrders]);

  // Export to CSV Function
  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No hay datos para exportar en este período.");
      return;
    }

    const headers = ["N° Orden", "Fecha", "Cliente", "Telefono", "Tipo", "Total (S/)", "Estado"];
    const rows = filteredOrders.map((o) => [
      `"#${o.order_number}"`,
      `"${new Date(o.created_at).toLocaleString("es-PE")}"`,
      `"${(o.client_name || "").replace(/"/g, '""')}"`,
      `"${(o.client_phone || "").replace(/"/g, '""')}"`,
      `"${o.order_type === "delivery" ? "Delivery" : "Recojo"}"`,
      `"${Number(o.total || 0).toFixed(2)}"`,
      `"${o.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Ventas_LasFlores_${timeframe}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Timeframe & Export Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-eucalipto" size={20} />
            Inteligencia de Negocios y Analítica
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Analizando {validOrders.length} pedidos efectivos en el período seleccionado
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Timeframe selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center shadow-sm text-xs font-semibold">
            {[
              { id: "today", label: "Hoy" },
              { id: "week", label: "7 Días" },
              { id: "month", label: "Este Mes" },
              { id: "all", label: "Histórico" },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === tf.id
                    ? "bg-[#14231D] text-cream shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Export buttons */}
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Descargar reporte en formato Excel / CSV"
          >
            <Download size={14} />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors hidden md:flex"
            title="Imprimir vista de reporte"
          >
            <Printer size={14} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* BI Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-[#14231D] to-[#1E322A] text-cream p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 w-16 h-16 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-cream/70 text-xs font-bold uppercase tracking-wider">
            <span>Facturación Total</span>
            <DollarSign size={18} className="text-retama" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-retama">S/ {totalRevenue.toFixed(2)}</span>
            <p className="text-[11px] text-cream/70 mt-1 font-medium flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-400" /> Basado en pedidos efectivos
            </p>
          </div>
        </div>

        {/* Average Ticket Size */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
            <span>Ticket Promedio (AOV)</span>
            <ShoppingBag size={18} className="text-eucalipto" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-gray-900">S/ {averageTicket.toFixed(2)}</span>
            <p className="text-[11px] text-gray-500 mt-1">Gasto medio por cliente en compra</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
            <span>Efectividad de Venta</span>
            <Percent size={18} className="text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-gray-900">{completionRate.toFixed(1)}%</span>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> {validOrders.length} de {filteredOrders.length} pedidos entregados
            </p>
          </div>
        </div>

        {/* Top Product Star */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
            <span>Plato Estrella</span>
            <Award size={18} className="text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-gray-900 line-clamp-1">
              {topProducts[0]?.name || "Sin ventas aún"}
            </span>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              {topProducts[0] ? `${topProducts[0].quantity} unidades vendidas (S/ ${topProducts[0].revenue.toFixed(2)})` : "Esperando pedidos"}
            </p>
          </div>
        </div>

      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Evolution Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-eucalipto" />
                Evolución de Ingresos por Día (S/)
              </h3>
              <p className="text-xs text-gray-500">Facturación agrupada por fecha</p>
            </div>
          </div>

          {dailySalesData.entries.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-gray-400 border border-dashed rounded-xl">
              No hay suficientes ventas en este rango de fechas.
            </div>
          ) : (
            <div className="pt-6 pb-2">
              <div className="h-48 flex items-end justify-between gap-2 border-b border-gray-100 pb-2">
                {dailySalesData.entries.map(([date, val]) => {
                  const heightPercent = Math.max(Math.round((val / dailySalesData.maxVal) * 100), 8);
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                      {/* Tooltip value */}
                      <span className="text-[10px] font-bold text-eucalipto opacity-0 group-hover:opacity-100 transition-opacity">
                        S/{val.toFixed(0)}
                      </span>
                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-eucalipto/80 hover:bg-eucalipto rounded-t-lg transition-all shadow-sm"
                      />
                      {/* X label */}
                      <span className="text-[10px] text-gray-400 font-medium truncate w-full text-center">
                        {date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Channel Distribution Doughnut/Bar (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <PieChartIcon size={18} className="text-blue-600" />
            Canal de Venta Preferido
          </h3>
          <p className="text-xs text-gray-500">Proporción Delivery vs Recojo en Local</p>

          <div className="pt-4 space-y-4">
            {/* Delivery */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-700 flex items-center gap-1">🛵 Delivery a Domicilio</span>
                <span className="text-gray-900">{deliveryPercentage}% ({deliveryCount})</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  style={{ width: `${deliveryPercentage}%` }}
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Pickup */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-purple-700 flex items-center gap-1">🛍️ Recojo en Tienda</span>
                <span className="text-gray-900">{100 - deliveryPercentage}% ({pickupCount})</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  style={{ width: `${100 - deliveryPercentage}%` }}
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 mt-4">
              💡 <strong>Insight:</strong> El {deliveryPercentage >= 50 ? "Delivery predomina en tus clientes" : "Recojo en tienda es el canal favorito"}.
            </div>
          </div>
        </div>

      </div>

      {/* Top 5 Products Table / Ranking */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              Ranking: Top 5 Platos Más Vendidos & Facturación
            </h3>
            <p className="text-xs text-gray-500">Basado en volumen de unidades e ingresos generados</p>
          </div>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center border border-dashed rounded-xl">
            No hay información de items vendidos en este período.
          </p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                    idx === 0 ? "bg-amber-400 text-black shadow-sm" :
                    idx === 1 ? "bg-gray-300 text-gray-800" :
                    idx === 2 ? "bg-amber-700/20 text-amber-900" :
                    "bg-gray-200 text-gray-600"
                  }`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">{p.name}</span>
                    <span className="text-xs text-gray-500">{p.quantity} unidades despachadas</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-eucalipto block">
                    S/ {p.revenue.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Generado</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
