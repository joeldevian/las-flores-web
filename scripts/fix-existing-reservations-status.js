import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://twbhugvklizzpjbpdosj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_ma96bleVnsLnK1KHW5uz1Q_rSizdLsP";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixReservationsStatus() {
  console.log("🔍 Verificando estado por defecto de reservas en la base de datos Supabase...\n");

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("*");

  if (error) {
    console.error("❌ Error al consultar reservas:", error.message);
    return;
  }

  console.log(`📋 Total de reservas encontradas: ${reservations ? reservations.length : 0}`);

  let updatedCount = 0;
  for (const res of reservations || []) {
    if (res.status === "confirmed" || res.status === "confirmada") {
      const { error: updateErr } = await supabase
        .from("reservations")
        .update({ status: "pending" })
        .eq("id", res.id);

      if (!updateErr) {
        updatedCount++;
        console.log(`✅ Reserva ${res.id} (${res.client_name} - ${res.reservation_date}): Cambiado 'confirmed' ➔ 'pending'`);
      }
    }
  }

  console.log(`\n🎉 Finalizado: ${updatedCount} reservas pasadas a 'pending' (Pendiente de confirmación).`);
}

fixReservationsStatus();
