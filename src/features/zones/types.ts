export interface RestaurantZone {
  id: string;
  name: string;
  short_name: string;
  description: string;
  image_url: string;
  color: string;
  color_light: string;
  max_capacity_persons: number;
  max_tables_count: number;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export type BlackoutType = "full_day" | "time_slot" | "indefinite";

export interface ZoneBlackout {
  id: string;
  zone_id: string | null; // null = todo el restaurante
  blackout_type: BlackoutType;
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  reason: string;
  is_active: boolean;
  created_at?: string;
  restaurant_zones?: Partial<RestaurantZone> | null;
}

export interface ZoneBlackoutInput {
  zone_id: string | null; // null = todo el restaurante
  blackout_type: BlackoutType;
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  reason: string;
  is_active?: boolean;
}

export interface ZoneUpdateInput {
  name?: string;
  short_name?: string;
  description?: string;
  image_url?: string;
  max_capacity_persons?: number;
  max_tables_count?: number;
  is_active?: boolean;
}
