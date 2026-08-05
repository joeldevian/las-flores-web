import { supabase } from "../../lib/supabase";
import type { RestaurantZone, ZoneBlackout, ZoneBlackoutInput, ZoneUpdateInput } from "./types";

export const OFFICIAL_DEFAULT_ZONES: RestaurantZone[] = [
  {
    id: "salon-principal",
    name: "Salón Principal",
    short_name: "S. Principal",
    description: "El corazón de Las Flores. Vista a los retablos andinos en pan de oro.",
    image_url: "/imagenes-reales/Salones/Salonprincipal.webp",
    color: "#5F8575",
    color_light: "#B0CBBD",
    max_capacity_persons: 13,
    max_tables_count: 8,
    is_active: true,
    sort_order: 1,
  },
  {
    id: "salon-ventana",
    name: "Salón Ventana",
    short_name: "S. Ventana",
    description: "Luz natural y vistas a las casonas coloniales de Huamanga.",
    image_url: "/imagenes-reales/Salones/Ventana.webp",
    color: "#5A8C8C",
    color_light: "#B8D4D4",
    max_capacity_persons: 10,
    max_tables_count: 6,
    is_active: true,
    sort_order: 2,
  },
  {
    id: "estrado",
    name: "Estrado Principal",
    short_name: "Estrado",
    description: "Ambiente elevado en el escenario tradicional del restaurante.",
    image_url: "/imagenes-reales/Salones/Estrado.webp",
    color: "#B8735A",
    color_light: "#DDBB9E",
    max_capacity_persons: 6,
    max_tables_count: 6,
    is_active: true,
    sort_order: 3,
  },
  {
    id: "salon-entrada",
    name: "Salón Entrada",
    short_name: "S. Entrada",
    description: "Cálida bienvenida rodeada de carpintería y artesanía ayacuchana.",
    image_url: "/imagenes-reales/Salones/entrada.webp",
    color: "#C8966A",
    color_light: "#EDD9C0",
    max_capacity_persons: 6,
    max_tables_count: 7,
    is_active: true,
    sort_order: 4,
  },
  {
    id: "terraza",
    name: "Terraza Colonial",
    short_name: "Terraza",
    description: "Vista abierta al cielo andino de Ayacucho y aire puro.",
    image_url: "/imagenes-reales/Salones/Terraza.webp",
    color: "#6B8E55",
    color_light: "#C5DBB9",
    max_capacity_persons: 6,
    max_tables_count: 5,
    is_active: true,
    sort_order: 5,
  },
  {
    id: "pasillo",
    name: "Pasillo Central",
    short_name: "Pasillo",
    description: "Espacio acogedor y reservado a lo largo del corredor de madera.",
    image_url: "/imagenes-reales/Salones/pasillo.webp",
    color: "#8A7355",
    color_light: "#D6C8B4",
    max_capacity_persons: 4,
    max_tables_count: 4,
    is_active: true,
    sort_order: 6,
  },
  {
    id: "jardin",
    name: "Jardín Andino",
    short_name: "Jardín",
    description: "Rodeado de flores autóctonas y serenidad andina.",
    image_url: "/imagenes-reales/Salones/jardin.webp",
    color: "#4E7C59",
    color_light: "#B5D1BC",
    max_capacity_persons: 4,
    max_tables_count: 5,
    is_active: true,
    sort_order: 7,
  },
];

export async function listRestaurantZones(): Promise<RestaurantZone[]> {
  try {
    const { data, error } = await supabase
      .from("restaurant_zones")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return OFFICIAL_DEFAULT_ZONES;
    }

    const existingIds = new Set(data.map((z) => z.id));
    const missingOfficialZones = OFFICIAL_DEFAULT_ZONES.filter((oz) => !existingIds.has(oz.id));

    if (missingOfficialZones.length > 0) {
      const combined = [...data, ...missingOfficialZones].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      );
      return combined;
    }

    return data;
  } catch (err) {
    console.warn("Using default official zones fallback:", err);
    return OFFICIAL_DEFAULT_ZONES;
  }
}

export async function updateRestaurantZone(
  id: string,
  input: ZoneUpdateInput
): Promise<RestaurantZone> {
  const { data: existing } = await supabase
    .from("restaurant_zones")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    const defaultZone = OFFICIAL_DEFAULT_ZONES.find((z) => z.id === id);
    const newZone = {
      id,
      name: defaultZone?.name || id,
      short_name: defaultZone?.short_name || id,
      description: defaultZone?.description || "",
      image_url: defaultZone?.image_url || "",
      color: defaultZone?.color || "#5F8575",
      color_light: defaultZone?.color_light || "#B0CBBD",
      max_capacity_persons: defaultZone?.max_capacity_persons || 10,
      max_tables_count: defaultZone?.max_tables_count || 6,
      sort_order: defaultZone?.sort_order || 1,
      ...input,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from("restaurant_zones")
      .upsert([newZone])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("restaurant_zones")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listZoneBlackouts(): Promise<ZoneBlackout[]> {
  const { data, error } = await supabase
    .from("zone_blackouts")
    .select("*, restaurant_zones(id, name, short_name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createZoneBlackout(
  input: ZoneBlackoutInput
): Promise<ZoneBlackout> {
  const { data, error } = await supabase
    .from("zone_blackouts")
    .insert([{ ...input, is_active: input.is_active ?? true }])
    .select("*, restaurant_zones(id, name, short_name)")
    .single();

  if (error) throw error;
  return data;
}

export async function toggleBlackoutStatus(
  id: string,
  is_active: boolean
): Promise<ZoneBlackout> {
  const { data, error } = await supabase
    .from("zone_blackouts")
    .update({ is_active })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBlockedZonesForReservation(
  date: string,
  time?: string
): Promise<{ isRestaurantBlocked: boolean; blockedZoneIds: string[]; reasons: Record<string, string> }> {
  try {
    const { data: blackouts, error } = await supabase
      .from("zone_blackouts")
      .select("*")
      .eq("is_active", true)
      .lte("start_date", date)
      .or(`end_date.is.null,end_date.gte.${date}`);

    if (error || !blackouts) {
      return { isRestaurantBlocked: false, blockedZoneIds: [], reasons: {} };
    }

    let isRestaurantBlocked = false;
    const blockedZoneIds: string[] = [];
    const reasons: Record<string, string> = {};

    for (const b of blackouts) {
      let appliesToTime = true;
      if (b.blackout_type === "time_slot" && time && b.start_time && b.end_time) {
        const slotTime = time.length === 5 ? `${time}:00` : time;
        const startTime = b.start_time.length === 5 ? `${b.start_time}:00` : b.start_time;
        const endTime = b.end_time.length === 5 ? `${b.end_time}:00` : b.end_time;
        if (slotTime < startTime || slotTime > endTime) {
          appliesToTime = false;
        }
      }

      if (appliesToTime) {
        if (!b.zone_id) {
          isRestaurantBlocked = true;
          reasons["global"] = b.reason;
        } else {
          blockedZoneIds.push(b.zone_id);
          reasons[b.zone_id] = b.reason;
        }
      }
    }

    return { isRestaurantBlocked, blockedZoneIds, reasons };
  } catch (err) {
    console.error("Error checking blocked zones:", err);
    return { isRestaurantBlocked: false, blockedZoneIds: [], reasons: {} };
  }
}
