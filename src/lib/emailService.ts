/**
 * Servicio Centralizado de Correos Electrónicos — Restaurante Las Flores
 * Soporte para Alias / Remitentes Especializados:
 * - pedidos@restaurantelasflores.com (Confirmación de Delivery y Recojo)
 * - reservas@restaurantelasflores.com (Confirmación de Mesas)
 * - no-reply@restaurantelasflores.com (Notificaciones del sistema)
 * - contacto@restaurantelasflores.com (Atención al cliente y buzón principal)
 */

export const OFFICIAL_EMAIL = "contacto@restaurantelasflores.com";

export const SENDERS = {
  GENERAL: `Restaurante Las Flores <${OFFICIAL_EMAIL}>`,
  PEDIDOS: `Pedidos — Las Flores <pedidos@restaurantelasflores.com>`,
  RESERVAS: `Reservas — Las Flores <reservas@restaurantelasflores.com>`,
  NOTIFICACIONES: `Las Flores <no-reply@restaurantelasflores.com>`,
};

// Clave API de Resend enviada por entorno
const RESEND_API_KEY =
  (typeof process !== "undefined" && process.env?.VITE_RESEND_API_KEY) ||
  (import.meta as any)?.env?.VITE_RESEND_API_KEY ||
  "";

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Función genérica para enviar correos electrónicos usando la API de Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = SENDERS.GENERAL,
  replyTo = OFFICIAL_EMAIL,
}: EmailPayload): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.info(
      `[Email Service] Correo registrado de ${from} para ${Array.isArray(to) ? to.join(", ") : to}: "${subject}". (Configurar VITE_RESEND_API_KEY en producción)`
    );
    return true;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        reply_to: replyTo,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("[Email Service Warning]:", errorText);

      // Si el dominio personalizado aún no está verificado en Resend, reintentar con el remitente de pruebas (onboarding@resend.dev)
      if (errorText.includes("validation_error") || errorText.includes("not verified") || response.status === 403) {
        console.info("[Email Service] Reintentando envío con el emisor por defecto onboarding@resend.dev mientras se verifica el dominio...");
        const retryRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Restaurante Las Flores <onboarding@resend.dev>",
            to: Array.isArray(to) ? to : [to],
            reply_to: replyTo,
            subject,
            html,
          }),
        });

        if (retryRes.ok) {
          console.info("[Email Service] ¡Correo de prueba enviado exitosamente vía onboarding@resend.dev!");
          return true;
        }
      }

      return false;
    }

    return true;
  } catch (error: any) {
    // Si la llamada fue bloqueada por CORS en el cliente navegador, silenciar la advertencia
    console.info("[Email Service]: El envío directo por navegador requiere delegación en servidor o webhook de producción.");
    return false;
  }
}

/**
 * 1. Enviar Resumen de Pedido de Delivery / Recojo desde pedidos@restaurantelasflores.com
 */
export async function sendOrderEmails(orderData: any, items: any[] = []): Promise<void> {
  const shortId = orderData.id ? orderData.id.slice(0, 8).toUpperCase() : "LF-ORDER";
  const customerEmail = orderData.customer_email || orderData.email;
  const isDelivery = orderData.order_type === "delivery";
  const trackingUrl = `https://www.restaurantelasflores.com/rastreo/${orderData.id || ""}`;

  const itemsHtml = items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${item.quantity || 1}x ${item.name || item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold;">S/ ${(
        Number(item.price || 0) * (item.quantity || 1)
      ).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const emailHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf6ed; border-radius: 16px; overflow: hidden; border: 1px solid #2c4a3e20;">
      <div style="background-color: #2c4a3e; padding: 30px; text-align: center; color: #faf6ed;">
        <h1 style="font-size: 24px; margin: 0; font-family: serif; color: #ffffff;">Restaurante Las Flores</h1>
        <p style="font-size: 13px; opacity: 0.8; margin-top: 5px;">¡Gracias por tu pedido!</p>
      </div>

      <div style="padding: 30px; color: #1b2a24;">
        <h2 style="font-size: 18px; color: #2c4a3e; margin-top: 0;">Resumen del Pedido #${shortId}</h2>
        <p style="font-size: 14px; color: #555555; line-height: 1.5;">
          Hola <strong>${orderData.customer_name || orderData.full_name || "Cliente"}</strong>, hemos recibido tu pedido y nuestro equipo lo está preparando con los mejores insumos de Ayacucho.
        </p>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #2c4a3e15;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #2c4a3e; color: #2c4a3e; text-align: left;">
                <th style="padding: 8px;">Producto</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eeeeee; font-size: 14px; text-align: right;">
            <p style="margin: 4px 0;">Subtotal: <strong>S/ ${Number(orderData.subtotal || orderData.total_amount || 0).toFixed(2)}</strong></p>
            ${isDelivery ? `<p style="margin: 4px 0;">Delivery: <strong>S/ ${Number(orderData.delivery_fee || 0).toFixed(2)}</strong></p>` : ""}
            <p style="margin: 8px 0 0 0; font-size: 16px; color: #2c4a3e;"><strong>Total Pagado: S/ ${Number(orderData.total_amount || 0).toFixed(2)}</strong></p>
          </div>
        </div>

        <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; margin-bottom: 20px; font-size: 13px;">
          <p style="margin: 3px 0;"><strong>Tipo de Pedido:</strong> ${isDelivery ? "Delivery a Domicilio" : "Recojo en Restaurante"}</p>
          ${isDelivery && orderData.address ? `<p style="margin: 3px 0;"><strong>Dirección:</strong> ${orderData.address}</p>` : ""}
          <p style="margin: 3px 0;"><strong>Método de Pago:</strong> ${orderData.payment_method ? orderData.payment_method.toUpperCase() : "Confirmado"}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${trackingUrl}" style="background-color: #2c4a3e; color: #faf6ed; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            📍 Ver Estado y Rastreo en Vivo
          </a>
        </div>
      </div>

      <div style="background-color: #f0eae0; padding: 20px; text-align: center; font-size: 11px; color: #666666;">
        <p style="margin: 0;">Restaurante Las Flores — Jr. José Olaya 106, Huamanga, Ayacucho</p>
        <p style="margin: 4px 0 0 0;">Consultas o Soporte: <a href="mailto:${OFFICIAL_EMAIL}" style="color: #2c4a3e; text-decoration: none;">${OFFICIAL_EMAIL}</a> | Tel: +51 980 723 422</p>
      </div>
    </div>
  `;

  // 1. Enviar correo de confirmación al cliente desde pedidos@restaurantelasflores.com
  if (customerEmail && customerEmail.includes("@")) {
    await sendEmail({
      from: SENDERS.PEDIDOS,
      to: customerEmail,
      subject: `¡Pedido Confirmado! #${shortId} — Restaurante Las Flores`,
      html: emailHtml,
    });
  }

  // 2. Enviar notificación a la Caja principal
  await sendEmail({
    from: SENDERS.NOTIFICACIONES,
    to: OFFICIAL_EMAIL,
    subject: `🔔 NUEVO PEDIDO #${shortId} — S/ ${Number(orderData.total_amount || 0).toFixed(2)}`,
    html: emailHtml,
  });
}

/**
 * 2. Enviar Confirmación de Reserva desde reservas@restaurantelasflores.com
 */
export async function sendReservationEmail(reservationData: any): Promise<void> {
  const customerEmail = reservationData.email;

  const emailHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf6ed; border-radius: 16px; overflow: hidden; border: 1px solid #2c4a3e20;">
      <div style="background-color: #2c4a3e; padding: 30px; text-align: center; color: #faf6ed;">
        <h1 style="font-size: 24px; margin: 0; font-family: serif; color: #ffffff;">Restaurante Las Flores</h1>
        <p style="font-size: 13px; opacity: 0.8; margin-top: 5px;">Confirmación de Reserva de Mesa</p>
      </div>

      <div style="padding: 30px; color: #1b2a24;">
        <h2 style="font-size: 18px; color: #2c4a3e; margin-top: 0;">¡Tu mesa está lista!</h2>
        <p style="font-size: 14px; color: #555555;">
          Hola <strong>${reservationData.name || reservationData.full_name || "Estimado cliente"}</strong>, hemos registrado tu reserva exitosamente en el Restaurante Las Flores.
        </p>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #2c4a3e; font-size: 14px; line-height: 1.6;">
          <p style="margin: 4px 0;">📅 <strong>Fecha:</strong> ${reservationData.reservation_date}</p>
          <p style="margin: 4px 0;">⏰ <strong>Hora:</strong> ${reservationData.reservation_time}</p>
          <p style="margin: 4px 0;">👥 <strong>Personas:</strong> ${reservationData.guests || reservationData.party_size} comensales</p>
          ${reservationData.zone ? `<p style="margin: 4px 0;">📍 <strong>Zona:</strong> ${reservationData.zone}</p>` : ""}
          <p style="margin: 4px 0;">📞 <strong>Celular:</strong> ${reservationData.phone}</p>
        </div>

        <p style="font-size: 12px; color: #777777;">
          * Recuerda llegar con 10 minutos de anticipación. Te esperamos en Jr. José Olaya 106, Huamanga.
        </p>
      </div>

      <div style="background-color: #f0eae0; padding: 20px; text-align: center; font-size: 11px; color: #666666;">
        <p style="margin: 0;">Restaurante Las Flores — Ayacucho</p>
        <p style="margin: 4px 0 0 0;">Contacto: <a href="mailto:${OFFICIAL_EMAIL}">${OFFICIAL_EMAIL}</a> | Tel: +51 980 723 422</p>
      </div>
    </div>
  `;

  // Copia al cliente desde reservas@restaurantelasflores.com
  if (customerEmail && customerEmail.includes("@")) {
    await sendEmail({
      from: SENDERS.RESERVAS,
      to: customerEmail,
      subject: `✨ Reserva Confirmada — Restaurante Las Flores Ayacucho`,
      html: emailHtml,
    });
  }

  // Notificación al restaurante
  await sendEmail({
    from: SENDERS.NOTIFICACIONES,
    to: OFFICIAL_EMAIL,
    subject: `📌 NUEVA RESERVA — ${reservationData.reservation_date} ${reservationData.reservation_time} (${reservationData.name})`,
    html: emailHtml,
  });
}

/**
 * 3. Enviar Mensaje del Formulario de Contacto
 */
export async function sendContactEmail(contactData: any): Promise<void> {
  const emailHtml = `
    <div style="font-family: sans-serif; padding: 20px; background-color: #FAF6ED; border-radius: 12px; border: 1px solid #2C4A3E20;">
      <h2 style="color: #2C4A3E; margin-top: 0;">Nuevo Mensaje desde la Web</h2>
      <p><strong>Nombre:</strong> ${contactData.name}</p>
      <p><strong>Correo:</strong> ${contactData.email}</p>
      <p><strong>Celular:</strong> ${contactData.phone || "No especificado"}</p>
      <p><strong>Mensaje:</strong></p>
      <blockquote style="background: #ffffff; padding: 15px; border-left: 4px solid #2C4A3E; border-radius: 6px;">
        ${contactData.message}
      </blockquote>
    </div>
  `;

  await sendEmail({
    from: SENDERS.GENERAL,
    replyTo: contactData.email,
    to: OFFICIAL_EMAIL,
    subject: `✉️ Mensaje de Contacto Web: ${contactData.name}`,
    html: emailHtml,
  });
}
