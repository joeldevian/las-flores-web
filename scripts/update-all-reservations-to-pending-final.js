import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://twbhugvklizzpjbpdosj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_ma96bleVnsLnK1KHW5uz1Q_rSizdLsP";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanAllReservations() {
  console.log("🧹 Ejecutando limpieza final de todas las reservas en Supabase BD...\n");

  const { data: reservations, error } = await supabase.from("reservations").select("*");
  if (error) {
    console.error("❌ Error al consultar:", error.message);
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
        console.log(`✅ [${count}] Reserva ${r.id} ('${r.client_name}' - ${r.reservation_date}): '${r.status}' ➔ 'pending'`);
      }
    }
  }

  console.log(`\n🎉 Finalizado: Se actualizaron ${count} reservas a estado 'pending'.`);
}

cleanAllReservations();
