import { supabase } from "../supabaseClient";

function normalizeGalleryImage(row) {
  return {
    id: row.slug,
    src: row.image_url,
    alt: row.alt_text,
    featured: row.featured,
  };
}

export async function getGalleryImages() {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map(normalizeGalleryImage);
}

export async function getFeaturedGalleryImages() {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("featured", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map(normalizeGalleryImage);
}
