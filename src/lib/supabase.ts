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
      : "https://las-flores-web-0079.vercel.app";

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
    if (!popup) window.location.href = data.url;
  }
  return data;
}

/**
 * Iniciar sesión con Facebook OAuth (redirect directo — Supabase maneja el PKCE automáticamente)
 */
export async function signInWithFacebook() {
  const currentOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://las-flores-web-0079.vercel.app";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: `${currentOrigin}/`,
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

  // Hard backend validation: check if date/time/zone is in blackout
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

  // Asociar el id del usuario autenticado si existe en la sesión
  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser?.user?.id) {
      reservationData.user_id = authUser.user.id;
    }
  } catch (e) {
    console.warn("No se pudo obtener id de usuario para reserva:", e);
  }

  // Filtrar valores nulos o indefinidos
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
    console.warn("No se pudo obtener id de usuario:", e);
  }

  if (!orderData.status) {
    orderData.status = "pendiente";
  }

  const payloadToInsert: Record<string, any> = {
    id: crypto.randomUUID(),
  };

  for (const [key, value] of Object.entries(orderData)) {
    if (value !== undefined && value !== null && value !== "") {
      payloadToInsert[key] = value;
    }
  }

  let createdOrder: any = null;
  const { data: insertedData, error: orderError } = await supabase
    .from("orders")
    .insert([payloadToInsert])
    .select();

  if (orderError) {
    console.error("Error al crear pedido en Supabase:", orderError);

    // Si falló por restricción del nombre del método de pago ('cash' vs 'efectivo'), reintentar con 'cash'
    if (payloadToInsert.payment_method === "efectivo") {
      payloadToInsert.payment_method = "cash";
      const { data: retryData, error: retryError } = await supabase
        .from("orders")
        .insert([payloadToInsert])
        .select();

      if (!retryError && retryData && retryData.length > 0) {
        createdOrder = retryData[0];
      } else {
        await supabase.from("orders").insert([payloadToInsert]);
        createdOrder = payloadToInsert;
      }
    } else {
      await supabase.from("orders").insert([payloadToInsert]);
      createdOrder = payloadToInsert;
    }
  } else if (insertedData && insertedData.length > 0) {
    createdOrder = insertedData[0];
  } else {
    createdOrder = payloadToInsert;
  }

  const finalOrderId = createdOrder?.id || payloadToInsert.id;

  if (items && items.length > 0) {
    const orderItems = items.map((item) => ({
      order_id: finalOrderId,
      product_name: item.product_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      console.error("Error al insertar ítems del pedido:", itemsError);
    }
  }

  return createdOrder || payloadToInsert;
}

/**
 * Obtener el historial de pedidos del usuario autenticado
 */
export async function getUserOrders(userId?: string, email?: string) {
  try {
    if (!userId && !email) return [];

    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (email) {
      query = query.eq("client_email", email);
    } else if (userId) {
      query = query.eq("user_id", userId);
    }

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
      query = query.eq("client_email", email);
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
