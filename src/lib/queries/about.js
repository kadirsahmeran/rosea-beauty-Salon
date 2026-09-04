import { supabase } from "../supabaseClient";
import { getIcon } from "../iconMap";

export async function getAboutStory() {
  const { data, error } = await supabase
    .from("about_story")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { image: data.image_url, paragraphs: data.paragraphs ?? [] };
}

export async function getTeamMembers() {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    // Arşivlenmiş kişiler ekipte görünmez (bkz. 0008_soft_delete.sql).
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map((row) => ({
    name: row.name,
    role: row.role,
    image: row.image_url,
  }));
}

export async function getAboutValues() {
  const { data, error } = await supabase
    .from("about_values")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map((row) => ({
    icon: getIcon(row.icon),
    title: row.title,
    desc: row.description,
  }));
}

// context: 'about' | 'testimonials'
export async function getSiteStats(context) {
  const { data, error } = await supabase
    .from("site_stats")
    .select("*")
    .eq("context", context)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map((row) => {
    const value = Number(row.value);
    return {
      icon: getIcon(row.icon),
      end: value,
      decimals: Number.isInteger(value) ? 0 : 1,
      suffix: row.suffix,
      label: row.label,
    };
  });
}

export async function getHomeAboutFeatures() {
  const { data, error } = await supabase
    .from("home_about_features")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map((row) => ({ title: row.title, desc: row.description }));
}

export async function getHomeAboutSlides() {
  const { data, error } = await supabase
    .from("home_about_slides")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map((row) => ({
    image: row.image_url,
    title: row.title,
    tag: row.tag,
  }));
}
