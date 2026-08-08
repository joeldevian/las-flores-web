/**
 * Helper de Despacho de Delivery por WhatsApp & CallMeBot
 * Restaurante Las Flores — Ayacucho
 */

export function generateDeliveryGoogleMapsUrl(
  latitude?: number | null,
  longitude?: number | null,
  address?: string | null
): string {
  if (latitude && longitude) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }
  if (address && address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address.trim() + ", Huamanga, Ayacucho"
    )}`;
  }
  // Default Huamanga Ayacucho fallback
  return `https://www.google.com/maps?q=-13.1588,-74.2239`;
}

export function buildDeliveryWhatsAppMessage(order: any, items: any[]): string {
  const orderNum = order.order_number || order.id?.slice(0, 8) || "S/N";
  const clientName = order.client_name || "Cliente General";
  const rawPhone = (order.client_phone || "").replace(/\D/g, "");
  const clientPhoneFormatted = rawPhone ? `51${rawPhone}` : "";
  const phoneText = rawPhone
    ? `${order.client_phone} ( https://wa.me/${clientPhoneFormatted} )`
    : "No especificado";

  const address = order.address || "Recojo / En restaurante";
  const reference = order.reference ? ` (Ref: ${order.reference})` : "";
  const mapsUrl = generateDeliveryGoogleMapsUrl(
    order.latitude,
    order.longitude,
    order.address
  );

  const orderItems = items.filter(
    (item) => item.order_id === order.id || item.orderId === order.id
  );

  const itemsListText =
    orderItems.length > 0
      ? orderItems
          .map((i) => `• ${i.quantity}x ${i.product_name || i.name} (S/ ${Number(i.subtotal || i.unit_price * i.quantity).toFixed(2)})`)
          .join("\n")
      : "• Sin especificación de platos";

  const paymentMethod = (order.payment_method || "YAPE").toUpperCase();
  const total = Number(order.total || 0).toFixed(2);

  return `*DESPACHO DE DELIVERY — LAS FLORES*
----------------------------------------
*Orden:* #${orderNum}
*Cliente:* ${clientName}
*Teléfono:* ${phoneText}
*Dirección:* ${address}${reference}
*Ubicación GPS Mapa:* ${mapsUrl}

*DETALLE DE LA COMANDA:*
${itemsListText}

*TOTAL A COBRAR AL CLIENTE:* S/ ${total}
*MÉTODO DE PAGO:* ${paymentMethod}

*PANEL DEL MOTORIZADO (Iniciar Viaje):*
${window.location.origin}/d/${order.id || order.order_id}
----------------------------------------
*¡Gracias por llevar el sabor de Las Flores!*`;
}

export function openWhatsAppDispatch(
  order: any,
  items: any[],
  targetDriverPhone?: string
) {
  const message = buildDeliveryWhatsAppMessage(order, items);
  const encodedText = encodeURIComponent(message);
  
  let targetUrl = `https://wa.me/?text=${encodedText}`;
  if (targetDriverPhone && targetDriverPhone.trim()) {
    const cleanPhone = targetDriverPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;
    targetUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;
  }

  window.open(targetUrl, "_blank", "noopener,noreferrer");
}

export async function sendCallMeBotNotification(
  order: any,
  items: any[],
  phone: string,
  apiKey: string
): Promise<boolean> {
  try {
    const message = buildDeliveryWhatsAppMessage(order, items);
    const encodedText = encodeURIComponent(message);
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${encodedText}&apikey=${apiKey}`;
    
    // CallMeBot request
    const response = await fetch(url, { method: "GET", mode: "no-cors" });
    console.info("CallMeBot notification triggered:", response.status || "no-cors");
    return true;
  } catch (err) {
    console.error("Error triggering CallMeBot notification:", err);
    return false;
  }
}
