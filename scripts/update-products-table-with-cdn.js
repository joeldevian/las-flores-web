import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://twbhugvklizzpjbpdosj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_ma96bleVnsLnK1KHW5uz1Q_rSizdLsP";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const IMAGE_MAPPINGS = [
  { namePattern: "chicharron", cdnPath: "platos/chicharron.webp" },
  { namePattern: "cuy", cdnPath: "platos/cuy-chactado.webp" },
  { namePattern: "puca", cdnPath: "platos/puca-picante.webp" },
  { namePattern: "qapchi", cdnPath: "platos/qapchi.webp" },
];

async function linkProductsToStorageCDN() {
  console.log("🚀 Vinculando URLs de Supabase Storage CDN en la tabla 'products'...\n");

  const { data: products, error } = await supabase.from("products").select("id, name, image_url");
  if (error) {
    console.error("❌ Error leyendo productos de Supabase:", error.message);
    return;
  }

  if (!products || products.length === 0) {
    console.log("ℹ️ No hay productos registrados aún en la tabla 'products'. Se crearán cuando agregues tu primer plato desde el Admin.");
    return;
  }

  let updatedCount = 0;
  for (const prod of products) {
    const match = IMAGE_MAPPINGS.find((m) =>
      prod.name.toLowerCase().includes(m.namePattern)
    );

    if (match) {
      const publicUrl = `https://twbhugvklizzpjbpdosj.supabase.co/storage/v1/object/public/products/${match.cdnPath}`;
      const { error: updateError } = await supabase
        .from("products")
        .update({ image_url: publicUrl })
        .eq("id", prod.id);

      if (!updateError) {
        updatedCount++;
        console.log(`✅ [${updatedCount}] Actualizado '${prod.name}' ➔ ${publicUrl}`);
      }
    }
  }

  console.log(`\n🎉 Finalizado: ${updatedCount} productos vinculados a Supabase Storage CDN.`);
}

linkProductsToStorageCDN();
