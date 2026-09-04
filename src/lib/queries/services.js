import { supabase } from "../supabaseClient";

// Supabase satırını (snake_case) bileşenlerin beklediği şekle çevirir.
// Not: "id" kasıtlı olarak slug'a eşitlenir — route'lar (/hizmetler/:id)
// zaten slug string'ini kullanıyor, böylece bileşenlerde değişiklik gerekmez.
function normalizeService(row) {
  return {
    id: row.slug,
    dbId: row.id,
    category: row.category_id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    longDescription: row.long_description,
    highlights: row.highlights ?? [],
    duration: row.duration,
    durationMinutes: row.duration_minutes,
    startingPrice: row.starting_price,
    priceAmount: row.price_amount,
    image: row.image_url,
    featured: row.featured,
  };
}

export async function getServiceCategories() {
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map((row) => ({ id: row.id, name: row.name }));
}

export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    // Arşivlenmiş hizmetler sitede görünmez (bkz. 0008_soft_delete.sql).
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map(normalizeService);
}

export async function getFeaturedServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("featured", true)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map(normalizeService);
}

export async function getServiceBySlug(slug) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    // Arşivlenmiş bir hizmetin adresi açılırsa "bulunamadı" gösterilir.
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeService(data) : null;
}
