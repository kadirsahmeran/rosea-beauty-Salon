import { supabase } from "../supabaseClient";

export async function getTestimonials() {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map((row) => ({
    name: row.name,
    location: row.location,
    service: row.service,
    initials: row.initials,
    rating: row.rating,
    featured: row.featured,
    text: row.quote,
  }));
}
