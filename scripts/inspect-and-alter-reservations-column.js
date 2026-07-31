import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://twbhugvklizzpjbpdosj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_ma96bleVnsLnK1KHW5uz1Q_rSizdLsP";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectLatestReservation() {
  console.log("🔍 Inspeccionando las últimas reservas insertadas en Supabase...\n");

  const { data: latest, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("❌ Error al consultar últimas reservas:", error.message);
    return;
  }

  console.log("📋 ÚLTIMAS 5 RESERVAS EN SUPABASE BD:");
  latest?.forEach((r, idx) => {
    console.log(`[${idx + 1}] ID: ${r.id} | Cliente: ${r.client_name} | Fecha: ${r.reservation_date} | Estado: '${r.status}' | Creado: ${r.created_at}`);
  });
}

inspectLatestReservation();
