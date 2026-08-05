import { describe, it, expect, vi } from "vitest";
import { getBlockedZonesForReservation } from "../features/zones/api";
import { supabase } from "../lib/supabase";

vi.mock("../lib/supabase", () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

function setupSupabaseMock(mockData: any[]) {
  const mockQueryResult = Promise.resolve({ data: mockData, error: null });
  const mockOr = vi.fn().mockReturnValue(mockQueryResult);
  const mockLte = vi.fn().mockReturnValue({ or: mockOr });
  const mockEq = vi.fn().mockReturnValue({ lte: mockLte });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

  vi.mocked(supabase.from).mockReturnValue({
    select: mockSelect,
  } as any);
}

describe("Blackout & Zone Availability Logic", () => {
  it("returns no blocked zones when database has no active blackouts", async () => {
    setupSupabaseMock([]);

    const result = await getBlockedZonesForReservation("2026-08-15", "14:00");
    expect(result.isRestaurantBlocked).toBe(false);
    expect(result.blockedZoneIds).toEqual([]);
  });

  it("identifies a specific blocked zone for a full day blackout", async () => {
    setupSupabaseMock([
      {
        id: "b1",
        zone_id: "terraza",
        blackout_type: "full_day",
        start_date: "2026-08-15",
        end_date: "2026-08-15",
        reason: "Reserva telefónica exclusiva",
        is_active: true,
      },
    ]);

    const result = await getBlockedZonesForReservation("2026-08-15", "14:00");
    expect(result.isRestaurantBlocked).toBe(false);
    expect(result.blockedZoneIds).toContain("terraza");
    expect(result.reasons["terraza"]).toBe("Reserva telefónica exclusiva");
  });

  it("identifies global restaurant blackout when zone_id is null", async () => {
    setupSupabaseMock([
      {
        id: "b2",
        zone_id: null,
        blackout_type: "full_day",
        start_date: "2026-08-15",
        end_date: null,
        reason: "Cierre por evento privado general",
        is_active: true,
      },
    ]);

    const result = await getBlockedZonesForReservation("2026-08-15", "14:00");
    expect(result.isRestaurantBlocked).toBe(true);
    expect(result.reasons["global"]).toBe("Cierre por evento privado general");
  });

  it("respects time slot constraints for time_slot blackouts", async () => {
    setupSupabaseMock([
      {
        id: "b3",
        zone_id: "estrado",
        blackout_type: "time_slot",
        start_date: "2026-08-15",
        end_date: "2026-08-15",
        start_time: "13:00",
        end_time: "16:00",
        reason: "Almuerzo de empresa",
        is_active: true,
      },
    ]);

    // Inside time slot (14:00) -> Blocked
    const resultInside = await getBlockedZonesForReservation("2026-08-15", "14:00");
    expect(resultInside.blockedZoneIds).toContain("estrado");

    // Outside time slot (19:00) -> Not blocked
    const resultOutside = await getBlockedZonesForReservation("2026-08-15", "19:00");
    expect(resultOutside.blockedZoneIds).not.toContain("estrado");
  });
});
