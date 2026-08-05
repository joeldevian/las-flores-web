import { supabase } from "../../lib/supabase";
import type { RestaurantZone, ZoneBlackout, ZoneBlackoutInput, ZoneUpdateInput } from "./types";

export async function listRestaurantZones(): Promise<RestaurantZone[]> {
  const { data, error } = await supabase
    .from("restaurant_zones")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateRestaurantZone(
  id: string,
  input: ZoneUpdateInput
): Promise<RestaurantZone> {
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
  isActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from("zone_blackouts")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw error;
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

    if (error) throw error;

    let isRestaurantBlocked = false;
    const blockedZoneIds: string[] = [];
    const reasons: Record<string, string> = {};

    (blackouts || []).forEach((b) => {
      // Check time constraint if specified
      if (b.blackout_type === "time_slot" && time && b.start_time && b.end_time) {
        if (time < b.start_time || time > b.end_time) {
          return; // Skip outside hours
        }
      }

      if (!b.zone_id) {
        isRestaurantBlocked = true;
        reasons["global"] = b.reason;
      } else {
        blockedZoneIds.push(b.zone_id);
        reasons[b.zone_id] = b.reason;
      }
    });

    return { isRestaurantBlocked, blockedZoneIds, reasons };
  } catch (err) {
    console.error("Error checking blocked zones:", err);
    return { isRestaurantBlocked: false, blockedZoneIds: [], reasons: {} };
  }
}
