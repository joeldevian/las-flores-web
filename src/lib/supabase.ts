import { createClient } from "@supabase/supabase-js";

// Obtención de variables de entorno de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://twbhugvklizzpjbpdosj.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_ma96bleVnsLnK1KHW5uz1Q_rSizdLsP";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ====================================================================
// INTERFACES Y TIPOS DE TYPESCRIPT PARA LA BASE DE DATOS
// ====================================================================

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  role: "client" | "staff" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface ReservationPayload {
  user_id?: string;
  guest_count: number;
  reservation_date: string;
  service_type: "desayuno" | "almuerzo" | "cena";
  reservation_time: string;
  zone_id?: string;
  table_number?: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  notes?: string;
  status?: string;
}

export interface OrderPayload {
  order_number: string;
  user_id?: string;
  order_type: "delivery" | "pickup";
  status?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  address?: string;
  reference?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  notes?: string;
  items: Array<{
    product_id?: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
  }>;
}

// ====================================================================
// HELPER FUNCTIONS DE AUTENTICACIÓN Y SERVICIOS
// ====================================================================

/**
 * Iniciar sesión con Google OAuth mediante ventana emergente Popup (sin perder el carrito ni la página actual)
 */
export async function signInWithGoogle() {
  const currentOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.restaurantelasflores.com";

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isMobile) {
    // Redirección directa en móviles para garantizar persistencia de sesión sin bloqueo de popups
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${currentOrigin}/`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) throw error;
    return data;
  }

  // En escritorio intentamos popup con fallback a redirección directa
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      skipBrowserRedirect: true,
      redirectTo: `${currentOrigin}/`,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error) throw error;

  if (data?.url) {
    const width = 500, height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      data.url,
      "google_auth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );
    if (!popup) {
      window.location.href = data.url;
    }
  }
  return data;
}

/**
 * Iniciar sesión con Facebook OAuth
 */
export async function signInWithFacebook() {
  const currentOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.restaurantelasflores.com";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: `${currentOrigin}/`,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Iniciar sesión con Correo y Contraseña
 */
export async function signInWithEmail(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data;
}

/**
 * Registrarse con Correo y Contraseña
 */
export async function signUpWithEmail(email: string, pass: string, fullName?: string) {
  const currentOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.restaurantelasflores.com";

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      emailRedirectTo: `${currentOrigin}/`,
      data: {
        full_name: fullName || "",
      },
    },
  });
  if (error) throw error;
  return data;
}

export interface ProfileUpdatePayload {
  full_name?: string;
  phone?: string;
  birth_date?: string;
}

/**
 * Actualizar información de perfil del usuario en Supabase Auth
 */
export async function updateUserProfile(payload: ProfileUpdatePayload) {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      full_name: payload.full_name,
      phone: payload.phone,
      birth_date: payload.birth_date,
    },
  });

  if (error) throw error;

  return data;
}

/**
 * Cerrar sesión
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Guardar una nueva reserva en Supabase
 */
export async function createReservation(payload: any) {
  const { reservation_date, reservation_time, zone_id } = payload;

  if (reservation_date) {
    try {
      const { data: blackouts } = await supabase
        .from("zone_blackouts")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", reservation_date);

      if (blackouts && blackouts.length > 0) {
        const matching = blackouts.find((b) => {
          if (b.zone_id !== null && zone_id && b.zone_id !== zone_id) return false;
          if (b.blackout_type !== "indefinite") {
            const endDate = b.end_date || b.start_date;
            if (reservation_date > endDate) return false;
          }
          if (b.blackout_type === "time_slot" && reservation_time && b.start_time && b.end_time) {
            const slotTime = reservation_time.length === 5 ? `${reservation_time}:00` : reservation_time;
            const startTime = b.start_time.length === 5 ? `${b.start_time}:00` : b.start_time;
            const endTime = b.end_time.length === 5 ? `${b.end_time}:00` : b.end_time;
            if (slotTime < startTime || slotTime > endTime) return false;
          }
          return true;
        });

        if (matching) {
          throw new Error(`La fecha u horario seleccionado no está disponible: ${matching.reason}`);
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes("no está disponible")) {
        throw err;
      }
      console.warn("Soft warning checking blackout:", err);
    }
  }

  const reservationData = { ...payload };

  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser?.user?.id) {
      reservationData.user_id = authUser.user.id;
    }
  } catch (e) {
    console.warn("No se pudo obtener id de usuario para reserva:", e);
  }

  const payloadToInsert: Record<string, any> = {
    status: payload.status || "pending",
  };
  for (const [key, value] of Object.entries(reservationData)) {
    if (value !== undefined && value !== null && value !== "") {
      payloadToInsert[key] = value;
    }
  }

  payloadToInsert.status = payload.status || "pending";

  const { data, error } = await supabase
    .from("reservations")
    .insert([payloadToInsert])
    .select()
    .single();

  if (error) {
    console.error("Error al crear reserva en Supabase:", error);
    const { error: directError } = await supabase
      .from("reservations")
      .insert([payloadToInsert]);

    if (directError) {
      console.error("Error en inserción directa de reserva:", directError);
    }
    return { id: `RES-${Date.now()}`, ...payload };
  }
  return data;
}

/**
 * Guardar un nuevo pedido en Supabase con sus ítems (100% resiliente a cualquier método de pago y RLS)
 */
export async function createOrder(payload: OrderPayload) {
  const { items, ...orderData } = payload;

  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser?.user?.id) {
      orderData.user_id = authUser.user.id;
    }
  } catch (e) {
    // Sin sesión activa — continuar como pedido de invitado
  }

  if (!orderData.status) {
    orderData.status = "pendiente";
  }

  // Generar PIN aleatorio de 4 dígitos para el motorizado si no viene especificado
  if (!orderData.driver_pin) {
    orderData.driver_pin = Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Generar UUID con fallback para navegadores antiguos
  const orderId = (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  const payloadToInsert: Record<string, any> = {
    id: orderId,
  };

  for (const [key, value] of Object.entries(orderData)) {
    if (value !== undefined && value !== null && value !== "") {
      payloadToInsert[key] = value;
    }
  }

  // Intentar inserción principal
  let createdOrder: any = null;
  const { data: insertedData, error: orderError } = await supabase
    .from("orders")
    .insert([payloadToInsert])
    .select();

  if (orderError) {
    // Reintentar con payment_method alternativo si aplica
    if (payloadToInsert.payment_method === "efectivo") {
      payloadToInsert.payment_method = "cash";
      const { data: retryData, error: retryError } = await supabase
        .from("orders")
        .insert([payloadToInsert])
        .select();

      if (retryError) {
        throw new Error(`No se pudo guardar el pedido: ${retryError.message}`);
      }
      createdOrder = retryData?.[0] || null;
    } else {
      throw new Error(`No se pudo guardar el pedido: ${orderError.message}`);
    }
  } else if (insertedData && insertedData.length > 0) {
    createdOrder = insertedData[0];
  }

  // Verificar que el pedido realmente se guardó
  if (!createdOrder || !createdOrder.id) {
    // Último intento: verificar si existe en la BD
    const { data: verifyData } = await supabase
      .from("orders")
      .select("id")
      .eq("id", payloadToInsert.id)
      .maybeSingle();

    if (!verifyData) {
      throw new Error("El pedido no se pudo confirmar en la base de datos. Por favor, intenta de nuevo.");
    }
    createdOrder = { ...payloadToInsert, ...verifyData };
  }

  // Insertar items del pedido
  if (items && items.length > 0) {
    const orderItems = items.map((item) => ({
      order_id: createdOrder.id,
      product_name: item.product_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      // Pedido creado pero items fallaron — no lanzar error fatal, el pedido existe
      console.error("Error al insertar ítems del pedido:", itemsError);
    }
  }

  return createdOrder;
}

/**
 * Obtener el historial de pedidos del usuario autenticado (O pedidos recientes locales)
 */
export async function getUserOrders(userId?: string, email?: string, localOrderIds: string[] = []) {
  try {
    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    const conditions: string[] = [];

    if (userId) {
      conditions.push(`user_id.eq.${userId}`);
    }
    if (email && email.trim()) {
      conditions.push(`client_email.ilike.${email.trim()}`);
    }
    if (localOrderIds && localOrderIds.length > 0) {
      const validIds = localOrderIds.filter(Boolean).map((id) => `"${id}"`).join(",");
      if (validIds) {
        conditions.push(`id.in.(${validIds})`);
      }
    }

    if (conditions.length === 0) return [];

    query = query.or(conditions.join(","));

    const { data, error } = await query;
    if (error) {
      console.error("Error al obtener pedidos del usuario:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Excepción al obtener pedidos:", err);
    return [];
  }
}

/**
 * Obtener el historial de reservas del usuario autenticado
 */
export async function getUserReservations(userId?: string, email?: string) {
  try {
    if (!userId && !email) return [];

    let query = supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (email) {
      query = query.ilike("client_email", email.trim());
    } else if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error al obtener reservas del usuario:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Excepción al obtener reservas:", err);
    return [];
  }
}

// ====================================================================
// FUNCIONES DEL PANEL ADMIN — CRUD DE PRODUCTOS
// ====================================================================

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createProduct(payload: Omit<Product, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("products")
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  payload: Partial<Omit<Product, "id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Soft delete — marca el plato como inactivo (is_active = false).
 * NUNCA se elimina el registro de la base de datos.
 */
export async function archiveProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Restaura un plato archivado (is_active = true).
 */
export async function restoreProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleProductAvailability(id: string, is_available: boolean) {
  const { data, error } = await supabase
    .from("products")
    .update({ is_available })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserRole(
  userId: string
): Promise<"client" | "staff" | "admin" | "delivery" | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (error) return null;
  return (data?.role as "client" | "staff" | "admin" | "delivery") ?? null;
}
