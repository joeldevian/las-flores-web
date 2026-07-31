import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://twbhugvklizzpjbpdosj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_ma96bleVnsLnK1KHW5uz1Q_rSizdLsP";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setAllReservationsToPending() {
  console.log("🔍 Cambiando TODAS las reservas en la base de datos a estado 'pending'...\n");

  const { data: reservations, error } = await supabase.from("reservations").select("*");
  if (error) {
    console.error("❌ Error al consultar reservas:", error.message);
    return;
  }

  let count = 0;
  for (const r of reservations || []) {
    if (r.status !== "pending") {
      const { error: updateErr } = await supabase
        .from("reservations")
        .update({ status: "pending" })
        .eq("id", r.id);

      if (!updateErr) {
        count++;
        console.log(`✅ [${count}] Reserva de '${r.client_name}' (${r.reservation_date}) actualizada a 'pending'.`);
      }
    }
  }

  console.log(`\n🎉 Operación completa: ${count} reservas ahora están en estado 'pending'.`);
}

setAllReservationsToPending();
