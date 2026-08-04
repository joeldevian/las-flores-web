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
  payment_method: "yape" | "card" | "cash";
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
      : "https://las-flores-web-oo79.vercel.app";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      skipBrowserRedirect: true,
      redirectTo: `${currentOrigin}/`,
    },
  });

  if (error) throw error;

  if (data?.url) {
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      data.url,
      "google_auth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );

    if (!popup) {
      // Fallback si el navegador bloquea las ventanas emergentes
      window.location.href = data.url;
    }
    // No usamos setInterval/polling — la sesión se detecta automáticamente
    // mediante supabase.auth.onAuthStateChange() ya suscrito en los componentes.
    // El popup se auto-cierra en __root.tsx y dispara eventos de sincronización.
  }
  return data;
}

/**
 * Iniciar sesión con Facebook OAuth mediante ventana emergente Popup
 */
export async function signInWithFacebook() {
  const currentOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://las-flores-web-oo79.vercel.app";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      skipBrowserRedirect: true,
      redirectTo: `${currentOrigin}/`,
    },
  });

  if (error) throw error;

  if (data?.url) {
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      data.url,
      "facebook_auth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );

    if (!popup) {
      window.location.href = data.url;
    }
  }
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
export async function createReservation(payload: ReservationPayload) {
  const reservationData = { ...payload };

  // Asociar el id del usuario autenticado si existe en la sesión
  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser?.user?.id) {
      reservationData.user_id = authUser.user.id;
    }
  } catch (e) {
    console.log("No se pudo obtener id de usuario para reserva:", e);
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

  // Garantizar 100% que status sea 'pending' para que no use el default 'confirmed' de Postgres
  payloadToInsert.status = payload.status || "pending";

  const { data, error } = await supabase
    .from("reservations")
    .insert([payloadToInsert])
    .select()
    .single();

  if (error) {
    console.error("Error al crear reserva en Supabase:", error);
    // Reintento de inserción directa por si RLS bloqueó la cláusula .select()
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
 * Guardar un nuevo pedido en Supabase con sus ítems
 */
export async function createOrder(payload: OrderPayload) {
  const { items, ...orderData } = payload;

  // Asociar el id del usuario autenticado si existe en la sesión
  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser?.user?.id) {
      orderData.user_id = authUser.user.id;
    }
  } catch (e) {
    console.log("No se pudo obtener id de usuario:", e);
  }

  // Garantizar estado por defecto 'pendiente'
  if (!orderData.status) {
    orderData.status = "pendiente";
  }

  // Filtrar valores nulos o indefinidos
  const payloadToInsert: Record<string, any> = {};
  for (const [key, value] of Object.entries(orderData)) {
    if (value !== undefined && value !== null && value !== "") {
      payloadToInsert[key] = value;
    }
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([payloadToInsert])
    .select()
    .single();

  if (orderError) {
    console.error("Error al crear pedido en Supabase:", orderError);
    // Reintento de inserción directa por si RLS bloqueó la cláusula .select()
    const { error: directInsertError } = await supabase
      .from("orders")
      .insert([payloadToInsert]);
      
    if (directInsertError) {
      console.error("Error en inserción directa de pedido:", directInsertError);
    }
    return { id: `ORDER-${Date.now()}`, order_number: payload.order_number };
  }

  if (order && items.length > 0) {
    const orderItems = items.map((item) => ({
      order_id: order.id,
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

  return order;
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
