import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://twbhugvklizzpjbpdosj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_ma96bleVnsLnK1KHW5uz1Q_rSizdLsP";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnose() {
  console.log("🔍 Consultando la última reserva registrada en Supabase BD...\n");

  const { data: latest, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("❌ Error al consultar:", error.message);
    return;
  }

  console.log("📋 ÚLTIMAS RESERVAS REGISTRADAS:");
  latest?.forEach((r, idx) => {
    console.log(`[${idx + 1}] ID: ${r.id} | Cliente: ${r.client_name} | Fecha: ${r.reservation_date} | Estado: '${r.status}' | Creado: ${r.created_at}`);
  });
}

diagnose();
