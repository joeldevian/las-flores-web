import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://twbhugvklizzpjbpdosj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_ma96bleVnsLnK1KHW5uz1Q_rSizdLsP";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanUnsplashUrls() {
  console.log("🔍 Buscando y reemplazando todos los enlaces de Unsplash en Supabase BD...\n");

  const { data: products, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("❌ Error al obtener productos:", error.message);
    return;
  }

  let replacedCount = 0;
  for (const p of products || []) {
    if (p.image_url && p.image_url.includes("unsplash.com")) {
      // Reemplazar por la imagen pública oficial de Supabase Storage o WebP local
      let newUrl = "https://twbhugvklizzpjbpdosj.supabase.co/storage/v1/object/public/products/platos/qapchi.webp";

      const nameLower = p.name.toLowerCase();
      if (nameLower.includes("chicharron") || nameLower.includes("chancho")) {
        newUrl = "https://twbhugvklizzpjbpdosj.supabase.co/storage/v1/object/public/products/platos/chicharron.webp";
      } else if (nameLower.includes("cuy") || nameLower.includes("caldo")) {
        newUrl = "https://twbhugvklizzpjbpdosj.supabase.co/storage/v1/object/public/products/platos/cuy-chactado.webp";
      } else if (nameLower.includes("puca")) {
        newUrl = "https://twbhugvklizzpjbpdosj.supabase.co/storage/v1/object/public/products/platos/puca-picante.webp";
      }

      const { error: updateErr } = await supabase
        .from("products")
        .update({ image_url: newUrl })
        .eq("id", p.id);

      if (!updateErr) {
        replacedCount++;
        console.log(`✅ [${replacedCount}] Actualizado '${p.name}': Unsplash ➔ ${newUrl}`);
      }
    }
  }

  console.log(`\n🎉 Finalizado: ${replacedCount} productos limpiados de Unsplash.`);
}

cleanUnsplashUrls();
