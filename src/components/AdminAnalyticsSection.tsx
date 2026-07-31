import { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Download,
  Printer,
  PieChart as PieChartIcon,
  BarChart3,
  CheckCircle2,
  Percent,
  Clock,
  CreditCard,
  Truck,
  Store,
  Info,
} from "lucide-react";

interface AdminAnalyticsSectionProps {
  orders: any[];
  orderItems: any[];
  products: any[];
  reservations?: any[];
}

export function AdminAnalyticsSection({
  orders,
  orderItems,
  products,
  reservations = [],
}: AdminAnalyticsSectionProps) {
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month" | "all" | "custom">("month");
  
  // Custom Date Range
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Hover state for chart tooltip
  const [hoveredBar, setHoveredBar] = useState<{ date: string; value: number; count: number } | null>(null);

  // Filter orders by timeframe or custom range
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

      if (timeframe === "custom") {
        if (!customStartDate && !customEndDate) return true;
        const start = customStartDate ? new Date(customStartDate + "T00:00:00") : new Date(0);
        const end = customEndDate ? new Date(customEndDate + "T23:59:59") : new Date(8640000000000000);
        return orderDate >= start && orderDate <= end;
      }

      return true; // 'all'
    });
  }, [orders, timeframe, customStartDate, customEndDate]);

  const dateRangeString = useMemo(() => {
    const now = new Date();
    const formatDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    
    if (timeframe === "today") {
      return `(solo hoy, ${formatDate(now)})`;
    }
    if (timeframe === "week") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return `(del ${formatDate(sevenDaysAgo)} al ${formatDate(now)})`;
    }
    if (timeframe === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return `(del ${formatDate(firstDay)} al ${formatDate(lastDay)})`;
    }
    if (timeframe === "custom") {
      if (!customStartDate && !customEndDate) return "";
      const startStr = customStartDate ? formatDate(new Date(customStartDate + "T00:00:00")) : "inicio";
      const endStr = customEndDate ? formatDate(new Date(customEndDate + "T23:59:59")) : "fin";
      return `(del ${startStr} al ${endStr})`;
    }
    return "(Histórico completo)";
  }, [timeframe, customStartDate, customEndDate]);

  // Total Revenue & Valid Orders
  const { totalRevenue, validOrders, averageTicket } = useMemo(() => {
    const valid = filteredOrders.filter((o) => o.status !== "cancelado");
    const rev = valid.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const avg = valid.length > 0 ? rev / valid.length : 0;

    return { totalRevenue: rev, validOrders: valid, averageTicket: avg };
  }, [filteredOrders]);

  // Discounts & Promotions Metrics (BI Analytics)
  const { totalDiscountGiven, ordersWithCouponCount } = useMemo(() => {
    const totalDiscount = validOrders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);
    const couponOrders = validOrders.filter((o) => Number(o.discount_amount || 0) > 0 || Boolean(o.coupon_code)).length;
    return { totalDiscountGiven: totalDiscount, ordersWithCouponCount: couponOrders };
  }, [validOrders]);

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

  // Reservation BI Metrics
  const reservationMetrics = useMemo(() => {
    const totalRes = reservations.length;
    const confirmedRes = reservations.filter((r) => {
      const s = (r.status || "").toLowerCase();
      return s === "confirmed" || s === "confirmada";
    }).length;
    const completedRes = reservations.filter((r) => {
      const s = (r.status || "").toLowerCase();
      return s === "completed" || s === "completada" || s === "asistio";
    }).length;

    const conversionRate = totalRes > 0 ? (completedRes / totalRes) * 100 : 0;
    
    // Service split
    const lunchCount = reservations.filter((r) => (r.service_type || "almuerzo").toLowerCase().includes("almuerzo")).length;
    const dinnerCount = reservations.filter((r) => (r.service_type || "").toLowerCase().includes("cena")).length;

    return { totalRes, confirmedRes, completedRes, conversionRate, lunchCount, dinnerCount };
  }, [reservations]);

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

  // Daily Sales Trend
  const dailySalesData = useMemo(() => {
    const daysMap: Record<string, { total: number; count: number }> = {};

    const sorted = [...validOrders].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sorted.forEach((o) => {
      const dateStr = new Date(o.created_at).toLocaleDateString("es-PE", {
        month: "short",
        day: "numeric",
      });
      if (!daysMap[dateStr]) {
        daysMap[dateStr] = { total: 0, count: 0 };
      }
      daysMap[dateStr].total += Number(o.total || 0);
      daysMap[dateStr].count += 1;
    });

    const entries = Object.entries(daysMap);
    const maxVal = Math.max(...entries.map(([, val]) => val.total), 1);

    return { entries, maxVal };
  }, [validOrders]);

  // Peak Hours Analysis
  const peakHoursData = useMemo(() => {
    const hoursSlots = [
      { label: "08:00 - 11:00 (Mañana)", count: 0, revenue: 0 },
      { label: "11:00 - 14:00 (Almuerzo)", count: 0, revenue: 0 },
      { label: "14:00 - 17:00 (Tarde)", count: 0, revenue: 0 },
      { label: "17:00 - 20:00 (Cena)", count: 0, revenue: 0 },
      { label: "20:00 - 23:00 (Noche)", count: 0, revenue: 0 },
    ];

    validOrders.forEach((o) => {
      if (!o.created_at) return;
      const h = new Date(o.created_at).getHours();
      const val = Number(o.total || 0);

      if (h >= 8 && h < 11) {
        hoursSlots[0].count += 1;
        hoursSlots[0].revenue += val;
      } else if (h >= 11 && h < 14) {
        hoursSlots[1].count += 1;
        hoursSlots[1].revenue += val;
      } else if (h >= 14 && h < 17) {
        hoursSlots[2].count += 1;
        hoursSlots[2].revenue += val;
      } else if (h >= 17 && h < 20) {
        hoursSlots[3].count += 1;
        hoursSlots[3].revenue += val;
      } else if (h >= 20 && h <= 23) {
        hoursSlots[4].count += 1;
        hoursSlots[4].revenue += val;
      }
    });

    const maxSlotCount = Math.max(...hoursSlots.map((s) => s.count), 1);

    return { slots: hoursSlots, maxSlotCount };
  }, [validOrders]);

  // Payment Methods Breakdown
  const paymentMethodsData = useMemo(() => {
    const methods: Record<string, { label: string; count: number; revenue: number }> = {
      yape: { label: "Yape / Plin", count: 0, revenue: 0 },
      card: { label: "Tarjeta de Crédito / Débito", count: 0, revenue: 0 },
      cash: { label: "Efectivo", count: 0, revenue: 0 },
      other: { label: "Otro / Transferencia", count: 0, revenue: 0 },
    };

    validOrders.forEach((o) => {
      const pm = (o.payment_method || "yape").toLowerCase();
      const val = Number(o.total || 0);

      if (pm.includes("yape") || pm.includes("plin")) {
        methods.yape.count += 1;
        methods.yape.revenue += val;
      } else if (pm.includes("card") || pm.includes("tarjeta")) {
        methods.card.count += 1;
        methods.card.revenue += val;
      } else if (pm.includes("cash") || pm.includes("efectivo")) {
        methods.cash.count += 1;
        methods.cash.revenue += val;
      } else {
        methods.other.count += 1;
        methods.other.revenue += val;
      }
    });

    return Object.values(methods).filter((m) => m.count > 0 || validOrders.length === 0);
  }, [validOrders]);

  // Export to CSV
  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const headers = ["N° Orden", "Fecha y Hora", "Cliente", "Telefono", "Tipo", "Metodo Pago", "Total (S/)", "Estado"];
    const rows = filteredOrders.map((o) => [
      `"#${o.order_number}"`,
      `"${new Date(o.created_at).toLocaleString("es-PE")}"`,
      `"${(o.client_name || "").replace(/"/g, '""')}"`,
      `"${(o.client_phone || "").replace(/"/g, '""')}"`,
      `"${o.order_type === "delivery" ? "Delivery" : "Recojo"}"`,
      `"${o.payment_method || "N/A"}"`,
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
      
      {/* Printable Executive Header */}
      <div className="hidden print:block mb-8 text-center border-b border-gray-300 pb-6 text-gray-900">
        <h1 className="text-2xl font-serif font-bold">RESTAURANTE LAS FLORES S.A.C.</h1>
        <p className="text-xs text-gray-600">Informe Ejecutivo de Inteligencia de Negocios & Ventas</p>
        <p className="text-xs text-gray-400 mt-1">Fecha de generación: {new Date().toLocaleString("es-PE")}</p>
      </div>

      {/* Timeframe & Controls Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#5F8575]/20 print:hidden">
        <div>
          <h2 className="font-serif text-base font-bold text-[#2A4237] flex items-center gap-2.5">
            <BarChart3 size={20} className="text-[#5F8575]" />
            Inteligencia de Negocios & Analítica Avanzada
            <span className="font-sans text-[10px] px-2.5 py-0.5 rounded-full bg-[#5F8575]/15 text-[#2A4237] font-bold uppercase tracking-wider border border-[#5F8575]/30">
              Corporativo
            </span>
          </h2>
          <p className="text-xs text-gray-600 mt-0.5 font-sans">
            Analizando {validOrders.length} pedidos efectivos por un monto total de <strong>S/ {totalRevenue.toFixed(2)}</strong> <span className="font-medium text-emerald-800">{dateRangeString}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto flex-wrap">
          
          {/* Timeframe Selector Pills */}
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center shadow-sm text-xs font-bold font-serif overflow-x-auto">
            {[
              { id: "today", label: "Hoy" },
              { id: "week", label: "7 Días" },
              { id: "month", label: "Este Mes" },
              { id: "all", label: "Histórico" },
              { id: "custom", label: "Personalizado" },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as any)}
                className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  timeframe === tf.id
                    ? "bg-[#5F8575] text-white font-bold shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {timeframe === "custom" && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm animate-in fade-in">
              <span className="text-[11px] font-bold text-gray-600 pl-1 font-serif">Desde:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#5F8575]"
              />
              <span className="text-[11px] font-bold text-gray-600 font-serif">Hasta:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#5F8575]"
              />
            </div>
          )}

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 rounded-xl bg-[#5F8575] hover:bg-[#4d7061] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Descargar reporte en Excel / CSV"
            >
              <Download size={14} />
              <span>Excel / CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Imprimir reporte ejecutivo"
            >
              <Printer size={14} />
              <span>Imprimir</span>
            </button>
          </div>

        </div>
      </div>

      {/* BI Executive KPI Cards Grid - Clean Harmonized Palette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-sans font-bold uppercase tracking-wider">
            <span>Facturación Total</span>
            <div className="w-8 h-8 rounded-lg bg-[#5F8575]/10 text-[#5F8575] flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-sans text-3xl font-black tracking-tight tabular-nums text-[#2A4237]">S/ {totalRevenue.toFixed(2)}</span>
            <p className="text-[11px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
              <TrendingUp size={12} /> {validOrders.length} pedidos efectivos
            </p>
          </div>
        </div>

        {/* Average Ticket Size */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-sans font-bold uppercase tracking-wider">
            <span>Ticket Promedio (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-[#5F8575]/10 text-[#5F8575] flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-sans text-2xl font-black tracking-tight tabular-nums text-[#2A4237]">S/ {averageTicket.toFixed(2)}</span>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">Gasto medio por orden</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-sans font-bold uppercase tracking-wider">
            <span>Efectividad de Venta</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Percent size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-sans text-2xl font-black tracking-tight tabular-nums text-[#2A4237]">{completionRate.toFixed(1)}%</span>
            <p className="text-[11px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> {validOrders.length} de {filteredOrders.length} pedidos entregados
            </p>
          </div>
        </div>

        {/* Top Product Star */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-sans font-bold uppercase tracking-wider">
            <span>Plato Estrella</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-base font-extrabold text-[#2A4237] line-clamp-1">
              {topProducts[0]?.name || "Sin ventas aún"}
            </span>
            <p className="text-[11px] text-amber-800 font-semibold mt-1">
              {topProducts[0] ? `${topProducts[0].quantity} unidades (S/ ${topProducts[0].revenue.toFixed(2)})` : "Esperando pedidos"}
            </p>
          </div>
        </div>

        {/* Total Discounts Given KPI Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all sm:col-span-2 lg:col-span-4">
          <div className="flex items-center justify-between text-gray-700 text-[11px] font-sans font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Percent size={16} className="text-[#5F8575]" />
              Impacto de Promociones & Descuentos Otorgados (BI)
            </span>
            <span className="text-[#2A4237] bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200 font-sans font-bold">
              {ordersWithCouponCount} pedidos con cupón
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="font-sans text-3xl font-black tracking-tight tabular-nums text-[#2A4237]">S/ {totalDiscountGiven.toFixed(2)}</span>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Inversión total otorgada en códigos promocionales y descuentos a clientes</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Analytics Grid: Daily Sales + Channel Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Daily Sales Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#5F8575]/20 shadow-sm space-y-4 relative">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-sm font-bold text-[#2A4237] flex items-center gap-2">
                <TrendingUp size={18} className="text-[#5F8575]" />
                Evolución de Ingresos por Día (S/)
              </h3>
              <p className="text-xs text-gray-500 font-medium">Facturación diaria acumulada con guías de nivel</p>
            </div>

            {/* Hover Tooltip display */}
            {hoveredBar && (
              <div className="bg-[#5F8575] text-[#FAF8F5] px-3 py-1.5 rounded-xl text-xs shadow-md border border-[#D4AF37]/30 animate-in fade-in">
                <span className="font-bold text-[#D4AF37]">{hoveredBar.date}:</span> S/ {hoveredBar.value.toFixed(2)} ({hoveredBar.count} pedidos)
              </div>
            )}
          </div>

          {dailySalesData.entries.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-gray-400 border border-dashed rounded-xl">
              No hay suficientes ventas registradas en este rango de fechas.
            </div>
          ) : (
            <div className="pt-6 pb-2 relative">
              {/* Y Axis Guide Lines */}
              <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-20 z-0">
                <div className="border-b border-[#5F8575] border-dashed w-full flex justify-end pr-2 text-[9px] font-mono">S/ {dailySalesData.maxVal.toFixed(0)}</div>
                <div className="border-b border-[#5F8575] border-dashed w-full flex justify-end pr-2 text-[9px] font-mono">S/ {(dailySalesData.maxVal / 2).toFixed(0)}</div>
                <div className="border-b border-[#5F8575] w-full" />
              </div>

              {/* Bar Chart Container */}
              <div className="h-60 flex items-end justify-between gap-3 border-b border-gray-200 pb-2 relative z-10 pt-4">
                {dailySalesData.entries.map(([date, dataObj]) => {
                  const heightPercent = Math.max(Math.round((dataObj.total / dailySalesData.maxVal) * 100), 8);
                  return (
                    <div
                      key={date}
                      onMouseEnter={() => setHoveredBar({ date, value: dataObj.total, count: dataObj.count })}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="flex-1 h-full flex flex-col justify-end items-center gap-1 group cursor-pointer"
                    >
                      {/* Amount Label */}
                      <span className="text-[10px] font-mono font-extrabold text-[#2A4237] group-hover:scale-110 transition-transform">
                        S/{dataObj.total.toFixed(0)}
                      </span>

                      {/* Bar Wrapper */}
                      <div className="w-full flex-1 max-h-[170px] flex items-end bg-gray-100/70 rounded-t-xl p-0.5 border border-gray-200">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-[#5F8575] via-[#4d7061] to-[#7B9F90] hover:from-[#4d7061] hover:to-[#5F8575] rounded-t-lg transition-all shadow-md group-hover:brightness-110"
                        />
                      </div>

                      {/* Date Label */}
                      <span className="text-[10px] text-gray-600 font-bold truncate w-full text-center tracking-tight">
                        {date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Channel Distribution (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-[#5F8575]/20 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-sm font-bold text-[#2A4237] flex items-center gap-2">
              <PieChartIcon size={18} className="text-blue-700" />
              Canal de Venta Preferido
            </h3>
            <p className="text-xs text-gray-500 font-medium">Proporción Delivery vs Recojo en Local</p>

            <div className="pt-6 space-y-5">
              {/* Delivery */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-blue-700 flex items-center gap-1.5">
                    <Truck size={14} /> Delivery a Domicilio
                  </span>
                  <span className="text-gray-900">{deliveryPercentage}% ({deliveryCount})</span>
                </div>
                <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-gray-200">
                  <div
                    style={{ width: `${deliveryPercentage}%` }}
                    className="bg-blue-600 h-full rounded-full transition-all duration-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Pickup */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-purple-700 flex items-center gap-1.5">
                    <Store size={14} /> Recojo en Tienda
                  </span>
                  <span className="text-gray-900">{100 - deliveryPercentage}% ({pickupCount})</span>
                </div>
                <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-gray-200">
                  <div
                    style={{ width: `${100 - deliveryPercentage}%` }}
                    className="bg-purple-600 h-full rounded-full transition-all duration-500 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2 mt-4 font-medium">
            <Info size={15} className="shrink-0 text-blue-700 mt-0.5" />
            <span>
              <strong>Análisis de Canal:</strong> {deliveryPercentage >= 50 ? "El servicio de delivery registra la mayor demanda del período." : "El recojo directo en local predomina entre los clientes."}
            </span>
          </div>
        </div>

      </div>

      {/* Second Analytics Grid: Peak Hours & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Peak Hours Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-[#5F8575]/20 shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-sm font-bold text-[#2A4237] flex items-center gap-2">
              <Clock size={18} className="text-amber-600" />
              Mapa de Horas Pico de Pedidos (Cocina)
            </h3>
            <p className="text-xs text-gray-500 font-medium">Distribución de demanda por rango horario</p>
          </div>

          <div className="space-y-3 pt-2">
            {peakHoursData.slots.map((slot) => {
              const barPercent = Math.max(Math.round((slot.count / peakHoursData.maxSlotCount) * 100), 4);
              return (
                <div key={slot.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">{slot.label}</span>
                    <span className="text-[#2A4237] font-bold">{slot.count} pedidos (S/ {slot.revenue.toFixed(2)})</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                    <div
                      style={{ width: `${barPercent}%` }}
                      className="bg-gradient-to-r from-amber-600 to-amber-500 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-[#5F8575]/20 shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-sm font-bold text-[#2A4237] flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-700" />
              Métodos de Pago Utilizados
            </h3>
            <p className="text-xs text-gray-500 font-medium">Volumen cobrado por pasarela o efectivo</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {paymentMethodsData.map((pm) => (
              <div key={pm.label} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1">
                <span className="text-xs font-bold text-gray-700 block">{pm.label}</span>
                <span className="font-sans text-lg font-black tracking-tight tabular-nums text-[#2A4237] block">S/ {pm.revenue.toFixed(2)}</span>
                <span className="text-[11px] text-gray-500 font-semibold block">{pm.count} transacciones</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top 5 Products Ranking */}
      <div className="bg-white p-6 rounded-2xl border border-[#5F8575]/20 shadow-sm space-y-4">
        <div>
          <h3 className="font-serif text-sm font-bold text-[#2A4237] flex items-center gap-2">
            <Award size={18} className="text-amber-600" />
            Ranking: Top 5 Platos Más Vendidos & Facturación
          </h3>
          <p className="text-xs text-gray-500 font-medium">Basado en volumen de unidades e ingresos generados</p>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center border border-dashed rounded-xl">
            No hay información de items vendidos en este período.
          </p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/60 hover:bg-gray-100/80 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl text-xs font-sans font-black flex items-center justify-center shadow-sm ${
                    idx === 0 ? "bg-[#D4AF37] text-[#2A4237]" :
                    idx === 1 ? "bg-gray-300 text-gray-800" :
                    idx === 2 ? "bg-amber-700/20 text-amber-900" :
                    "bg-gray-200 text-gray-600"
                  }`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-serif text-sm font-bold text-gray-900 block">{p.name}</span>
                    <span className="text-xs text-gray-500 font-medium">{p.quantity} unidades despachadas</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-sans text-sm font-black tracking-tight tabular-nums text-[#2A4237] block">
                    S/ {p.revenue.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Facturado</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Printable Executive Signatures */}
      <div className="hidden print:flex justify-between pt-16 border-t border-gray-400 mt-12 text-xs font-semibold text-gray-900">
        <div className="text-center w-48 border-t border-gray-400 pt-2">
          Administrador de Turno
        </div>
        <div className="text-center w-48 border-t border-gray-400 pt-2">
          Gerencia General Las Flores
        </div>
      </div>

    </div>
  );
}
