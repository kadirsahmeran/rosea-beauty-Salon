import { jsonResponse, optionsResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { syncCheckoutSession } from "../_shared/stripe.ts";

const APPOINTMENT_SELECT = `
  id,
  appointment_date,
  start_time,
  end_time,
  customer_name,
  customer_phone,
  status,
  payment_status,
  price_amount,
  stripe_checkout_session_id,
  services ( title, subtitle, duration, price_amount, image_url ),
  team_members ( name, role, image_url )
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();

  try {
    const url = new URL(req.url);
    let appointmentId = url.searchParams.get("id") ?? "";
    let cancel = url.searchParams.get("cancel") === "1";

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      appointmentId = String(body.id ?? body.appointmentId ?? appointmentId);
      cancel = Boolean(body.cancel) || cancel;
    }

    if (!appointmentId) {
      return jsonResponse({ error: "Randevu numarası gerekli." }, 400);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("appointments")
      .select(APPOINTMENT_SELECT)
      .eq("id", appointmentId)
      .maybeSingle();

    if (error || !data) {
      return jsonResponse({ error: "Randevu bulunamadı." }, 404);
    }

    await syncCheckoutSession(
      supabase,
      {
        id: data.id,
        payment_status: data.payment_status,
        stripe_checkout_session_id: data.stripe_checkout_session_id,
      },
      { cancel },
    );

    const { data: refreshed, error: refreshError } = await supabase
      .from("appointments")
      .select(APPOINTMENT_SELECT)
      .eq("id", appointmentId)
      .maybeSingle();

    const row = refreshed ?? data;
    if (refreshError && !row) {
      return jsonResponse({ error: "Randevu durumu alınamadı." }, 500);
    }

    const service = Array.isArray(row.services)
      ? row.services[0]
      : row.services;
    const specialist = Array.isArray(row.team_members)
      ? row.team_members[0]
      : row.team_members;

    return jsonResponse({
      id: row.id,
      date: row.appointment_date,
      startTime: row.start_time,
      endTime: row.end_time,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      status: row.status,
      paymentStatus: row.payment_status,
      priceAmount: row.price_amount,
      service: service
        ? {
            title: service.title,
            subtitle: service.subtitle,
            duration: service.duration,
            priceAmount: service.price_amount,
            image: service.image_url,
          }
        : null,
      specialist: specialist
        ? {
            name: specialist.name,
            role: specialist.role,
            image: specialist.image_url,
          }
        : null,
    });
  } catch (error) {
    console.error("stripe-status", error);
    return jsonResponse({ error: "Randevu durumu alınamadı." }, 500);
  }
});
