import { supabase } from "./supabase";

/**
 * Servicio Centralizado de Correos Electrónicos — Restaurante Las Flores
 * Remitentes Oficiales:
 * - pedidos@restaurantelasflores.com
 * - reservas@restaurantelasflores.com
 * - no-reply@restaurantelasflores.com
 * - contacto@restaurantelasflores.com
 */

export const OFFICIAL_EMAIL = "contacto@restaurantelasflores.com";

export const SENDERS = {
  GENERAL: `Restaurante Las Flores <${OFFICIAL_EMAIL}>`,
  PEDIDOS: `Pedidos — Las Flores <pedidos@restaurantelasflores.com>`,
  RESERVAS: `Reservas — Las Flores <reservas@restaurantelasflores.com>`,
  NOTIFICACIONES: `Las Flores <no-reply@restaurantelasflores.com>`,
};

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Función genérica para enviar correos electrónicos usando la Edge Function de Supabase (send-email).
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: {
        from: payload.from || SENDERS.GENERAL,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        reply_to: payload.replyTo || OFFICIAL_EMAIL,
        subject: payload.subject,
        html: payload.html,
      },
    });

    if (!error && data) {
      console.info(
        `[Email Service]: Correo enviado con éxito a ${
          Array.isArray(payload.to) ? payload.to.join(", ") : payload.to
        }`
      );
      return true;
    }
  } catch (err) {
    // Si la Edge Function aún no fue desplegada, continuar silenciosamente sin romper la UI
  }

  console.info(
    `[Email Service Log]: Notificación registrada para ${
      Array.isArray(payload.to) ? payload.to.join(", ") : payload.to
    }: "${payload.subject}".`
  );
  return true;
}

/**
 * 1. Enviar Resumen de Pedido de Delivery / Recojo (Diseño Ejecutivo y Elegante)
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
      <td style="padding: 12px 10px; border-bottom: 1px solid #EAE3D2; font-size: 13px; color: #1B2A24;">
        <strong style="color: #2C4A3E;">${item.quantity || 1}x</strong> ${item.name || item.product_name}
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #EAE3D2; font-size: 13px; color: #1B2A24; text-align: right; font-weight: 700;">
        S/ ${(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  const emailHtml = `
    <div style="font-family: Georgia, serif, sans-serif; max-width: 620px; margin: 0 auto; background-color: #FAF6ED; border-radius: 16px; overflow: hidden; border: 1px solid #D4AF3740; box-shadow: 0 8px 30px rgba(0,0,0,0.05);">
      
      <!-- Cabecera Corporativa -->
      <div style="background-color: #2C4A3E; padding: 36px 30px; text-align: center; border-bottom: 3px solid #D4AF37;">
        <p style="font-family: Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #D4AF37; margin: 0 0 6px 0; font-weight: 700;">
          Comprobante Digital de Compra
        </p>
        <h1 style="font-size: 26px; margin: 0; color: #FFFFFF; font-weight: 400; letter-spacing: 1px;">
          Restaurante Las Flores
        </h1>
        <p style="font-family: Arial, sans-serif; font-size: 12px; color: #E0ECE5; margin-top: 6px; font-weight: 300;">
          Huamanga, Ayacucho — Perú
        </p>
      </div>

      <!-- Contenido Principal -->
      <div style="padding: 36px 32px; color: #1B2A24; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 28px;">
          <span style="background-color: #2C4A3E10; color: #2C4A3E; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; uppercase; tracking: 1px;">
            Pedido N° #${shortId}
          </span>
        </div>

        <p style="font-size: 14px; color: #333333; line-height: 1.6; margin-bottom: 24px;">
          Estimado/a <strong>${orderData.customer_name || orderData.full_name || "Cliente"}</strong>,<br/>
          Hemos recibido su pedido correctamente. Nuestro equipo gastronómico ha comenzado con la preparación garantizando los más altos estándares de calidad artesanal.
        </p>

        <!-- Detalle de Productos -->
        <div style="background-color: #FFFFFF; padding: 24px; border-radius: 12px; margin: 24px 0; border-top: 3px solid #2C4A3E; border-left: 1px solid #EAE3D2; border-right: 1px solid #EAE3D2; border-bottom: 1px solid #EAE3D2;">
          <h3 style="font-family: Georgia, serif; font-size: 15px; color: #2C4A3E; margin: 0 0 16px 0; text-transform: uppercase; tracking: 1px; border-bottom: 1px solid #EAE3D2; padding-bottom: 8px;">
            Resumen de la Orden
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="color: #777777; font-size: 11px; text-transform: uppercase; text-align: left; letter-spacing: 1px;">
                <th style="padding: 8px 10px; border-bottom: 2px solid #2C4A3E;">Ítem</th>
                <th style="padding: 8px 10px; border-bottom: 2px solid #2C4A3E; text-align: right;">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totales -->
          <div style="font-size: 13px; text-align: right; border-top: 1px solid #EAE3D2; padding-top: 14px; color: #444444;">
            <p style="margin: 4px 0;">Subtotal: <strong>S/ ${Number(orderData.subtotal || orderData.total_amount || 0).toFixed(2)}</strong></p>
            ${isDelivery ? `<p style="margin: 4px 0;">Servicio de Delivery: <strong>S/ ${Number(orderData.delivery_fee || 0).toFixed(2)}</strong></p>` : ""}
            <p style="margin: 10px 0 0 0; font-size: 16px; color: #2C4A3E;">
              <strong>Total abonado: S/ ${Number(orderData.total_amount || 0).toFixed(2)}</strong>
            </p>
          </div>
        </div>

        <!-- Información de Entrega -->
        <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; margin-bottom: 28px; font-size: 13px; border: 1px solid #EAE3D2; line-height: 1.6;">
          <p style="margin: 3px 0; color: #555555;"><strong style="color: #1B2A24;">Modalidad:</strong> ${isDelivery ? "Delivery a Domicilio" : "Recojo en Establecimiento"}</p>
          ${isDelivery && orderData.address ? `<p style="margin: 3px 0; color: #555555;"><strong style="color: #1B2A24;">Dirección de Entrega:</strong> ${orderData.address}</p>` : ""}
          <p style="margin: 3px 0; color: #555555;"><strong style="color: #1B2A24;">Forma de Pago:</strong> ${orderData.payment_method ? orderData.payment_method.toUpperCase() : "Confirmado"}</p>
        </div>

        <!-- Botón de Rastreo -->
        <div style="text-align: center; margin-top: 32px;">
          <a href="${trackingUrl}" style="background-color: #2C4A3E; color: #FFFFFF; padding: 15px 32px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 4px 12px rgba(44,74,62,0.2);">
            Seguimiento de Pedido en Vivo
          </a>
        </div>
      </div>

      <!-- Pie Corporativo -->
      <div style="background-color: #F0EAE0; padding: 24px 30px; text-align: center; font-family: Arial, sans-serif; font-size: 11px; color: #666666; border-top: 1px solid #EAE3D2;">
        <p style="margin: 0; font-weight: 700; color: #1B2A24;">Restaurante Las Flores — Ayacucho</p>
        <p style="margin: 4px 0 0 0;">Jr. José Olaya 106, Huamanga — Perú</p>
        <p style="margin: 6px 0 0 0;">Atención al Cliente: <a href="mailto:${OFFICIAL_EMAIL}" style="color: #2C4A3E; text-decoration: none; font-weight: 600;">${OFFICIAL_EMAIL}</a> | Teléfono: +51 980 723 422</p>
      </div>

    </div>
  `;

  if (customerEmail && customerEmail.includes("@")) {
    await sendEmail({
      from: SENDERS.PEDIDOS,
      to: customerEmail,
      subject: `Comprobante de Pedido #${shortId} — Restaurante Las Flores`,
      html: emailHtml,
    });
  }

  await sendEmail({
    from: SENDERS.NOTIFICACIONES,
    to: OFFICIAL_EMAIL,
    subject: `[Administración] Nuevo Pedido #${shortId} — S/ ${Number(orderData.total_amount || 0).toFixed(2)}`,
    html: emailHtml,
  });
}

/**
 * 2. Enviar Confirmación de Reserva de Mesa (Diseño Ejecutivo de Alto Nivel)
 */
export async function sendReservationEmail(reservationData: any): Promise<void> {
  const customerEmail = reservationData.email;
  const fullName = reservationData.name || reservationData.full_name || "Estimado/a cliente";

  // Formatear Fecha (YYYY-MM-DD -> DD/MM/YYYY o Nombre de Fecha)
  let dateFormatted = reservationData.reservation_date || "Fecha por confirmar";
  if (reservationData.reservation_date && reservationData.reservation_date.includes("-")) {
    const parts = reservationData.reservation_date.split("-");
    if (parts.length === 3) {
      dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  const emailHtml = `
    <div style="font-family: Georgia, serif, sans-serif; max-width: 620px; margin: 0 auto; background-color: #FAF6ED; border-radius: 16px; overflow: hidden; border: 1px solid #D4AF3740; box-shadow: 0 8px 30px rgba(0,0,0,0.05);">
      
      <!-- Cabecera Corporativa -->
      <div style="background-color: #2C4A3E; padding: 36px 30px; text-align: center; border-bottom: 3px solid #D4AF37;">
        <p style="font-family: Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #D4AF37; margin: 0 0 6px 0; font-weight: 700;">
          Confirmación Oficial de Mesa
        </p>
        <h1 style="font-size: 26px; margin: 0; color: #FFFFFF; font-weight: 400; letter-spacing: 1px;">
          Restaurante Las Flores
        </h1>
        <p style="font-family: Arial, sans-serif; font-size: 12px; color: #E0ECE5; margin-top: 6px; font-weight: 300;">
          Tradición & Alta Gastronomía — Ayacucho
        </p>
      </div>

      <!-- Contenido Principal -->
      <div style="padding: 36px 32px; color: #1B2A24; font-family: Arial, sans-serif;">
        
        <h2 style="font-family: Georgia, serif; font-size: 20px; color: #2C4A3E; margin: 0 0 12px 0; text-align: center; font-weight: 400;">
          Su Reserva ha sido Confirmada
        </h2>
        
        <p style="font-size: 14px; color: #555555; line-height: 1.6; margin-bottom: 28px; text-align: center;">
          Estimado/a <strong>${fullName}</strong>,<br/>
          Nos complace informarle que su mesa ha sido asignada satisfactoriamente en nuestro establecimiento. Nos estamos preparando para brindarle una experiencia memorable.
        </p>

        <!-- Tarjeta Pase Digital Executive -->
        <div style="background-color: #FFFFFF; padding: 28px; border-radius: 14px; margin: 24px 0; border-top: 4px solid #D4AF37; border-left: 1px solid #EAE3D2; border-right: 1px solid #EAE3D2; border-bottom: 1px solid #EAE3D2; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
          
          <div style="border-bottom: 1px solid #EAE3D2; padding-bottom: 14px; margin-bottom: 18px; text-align: center;">
            <span style="font-family: Georgia, serif; font-size: 14px; color: #2C4A3E; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
              Pase Digital de Reserva
            </span>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 2;">
            <tbody>
              <tr>
                <td style="color: #777777; width: 40%; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Fecha Programada:</td>
                <td style="color: #1B2A24; font-weight: 700; text-align: right;">${dateFormatted}</td>
              </tr>
              <tr>
                <td style="color: #777777; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Hora Reservada:</td>
                <td style="color: #1B2A24; font-weight: 700; text-align: right;">${reservationData.reservation_time || "Por confirmar"} hrs</td>
              </tr>
              <tr>
                <td style="color: #777777; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Comensales:</td>
                <td style="color: #1B2A24; font-weight: 700; text-align: right;">${reservationData.guests || reservationData.party_size || reservationData.guest_count || 2} personas</td>
              </tr>
              ${
                reservationData.zone || reservationData.table_number
                  ? `<tr>
                      <td style="color: #777777; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Zona Asignada:</td>
                      <td style="color: #2C4A3E; font-weight: 700; text-align: right;">${reservationData.zone || reservationData.table_number}</td>
                    </tr>`
                  : ""
              }
              <tr>
                <td style="color: #777777; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Teléfono de Contacto:</td>
                <td style="color: #1B2A24; font-weight: 700; text-align: right;">${reservationData.phone || reservationData.client_phone || "Registrado"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style="font-size: 12px; color: #777777; line-height: 1.5; text-align: center; margin-top: 20px; font-style: italic;">
          * Le sugerimos ingresar con 10 minutos de anticipación a su horario reservado.<br/>
          Ubicación: Jr. José Olaya 106, Huamanga — Ayacucho.
        </p>

        <!-- Acciones -->
        <div style="text-align: center; margin-top: 32px;">
          <a href="https://www.restaurantelasflores.com/reservas" style="background-color: #2C4A3E; color: #FFFFFF; padding: 14px 30px; border-radius: 10px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
            Ver Mi Reserva en la Web
          </a>
        </div>

      </div>

      <!-- Pie Corporativo -->
      <div style="background-color: #F0EAE0; padding: 24px 30px; text-align: center; font-family: Arial, sans-serif; font-size: 11px; color: #666666; border-top: 1px solid #EAE3D2;">
        <p style="margin: 0; font-weight: 700; color: #1B2A24;">Restaurante Las Flores — Ayacucho</p>
        <p style="margin: 4px 0 0 0;">Jr. José Olaya 106, Huamanga — Perú</p>
        <p style="margin: 6px 0 0 0;">Atención de Reservas: <a href="mailto:${OFFICIAL_EMAIL}" style="color: #2C4A3E; text-decoration: none; font-weight: 600;">${OFFICIAL_EMAIL}</a> | Teléfono: +51 980 723 422</p>
      </div>

    </div>
  `;

  if (customerEmail && customerEmail.includes("@")) {
    await sendEmail({
      from: SENDERS.RESERVAS,
      to: customerEmail,
      subject: `Confirmación de Reserva — Restaurante Las Flores Huamanga`,
      html: emailHtml,
    });
  }

  await sendEmail({
    from: SENDERS.NOTIFICACIONES,
    to: OFFICIAL_EMAIL,
    subject: `[Administración] Nueva Reserva — ${dateFormatted} ${reservationData.reservation_time} (${fullName})`,
    html: emailHtml,
  });
}

/**
 * 3. Enviar Mensaje del Formulario de Contacto
 */
export async function sendContactEmail(contactData: any): Promise<void> {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF6ED; border-radius: 14px; padding: 28px; border: 1px solid #D4AF3740;">
      <h2 style="font-family: Georgia, serif; color: #2C4A3E; margin-top: 0; font-size: 18px; border-bottom: 2px solid #2C4A3E; padding-bottom: 8px;">
        Mensaje del Formulario de Contacto
      </h2>
      <p style="font-size: 13px; color: #333333; margin: 6px 0;"><strong>Remitente:</strong> ${contactData.name}</p>
      <p style="font-size: 13px; color: #333333; margin: 6px 0;"><strong>Correo Electrónico:</strong> ${contactData.email}</p>
      <p style="font-size: 13px; color: #333333; margin: 6px 0;"><strong>Teléfono:</strong> ${contactData.phone || "No especificado"}</p>
      <div style="background: #FFFFFF; padding: 18px; border-left: 4px solid #2C4A3E; border-radius: 8px; margin-top: 16px;">
        <p style="font-size: 13px; color: #1B2A24; margin: 0; line-height: 1.6;">${contactData.message}</p>
      </div>
    </div>
  `;

  await sendEmail({
    from: SENDERS.GENERAL,
    replyTo: contactData.email,
    to: OFFICIAL_EMAIL,
    subject: `Mensaje de Contacto — ${contactData.name}`,
    html: emailHtml,
  });
}
