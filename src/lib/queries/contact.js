import { supabase } from "../supabaseClient";
import { getIcon } from "../iconMap";

export async function getContactInfo() {
  const { data, error } = await supabase
    .from("contact_info")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    address: data.address,
    phone: data.phone,
    phoneHref: data.phone_href,
    email: data.email,
    mapEmbedSrc: data.map_embed_src,
  };
}

export async function getBusinessHours() {
  const { data, error } = await supabase
    .from("business_hours")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map((row) => ({ day: row.day_label, time: row.time_label }));
}

export async function getSocialLinks() {
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data.map((row) => ({
    label: row.label,
    href: row.url,
    icon: getIcon(row.icon),
  }));
}
