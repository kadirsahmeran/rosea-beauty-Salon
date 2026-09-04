import { jsonResponse, optionsResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { getStripe, toStripeAmount } from "../_shared/stripe.ts";
import { resolveCheckoutSiteUrl } from "../_shared/siteUrl.ts";

type BookingPayload = {
  serviceId?: string;
  specialistId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const payload = (await req.json()) as BookingPayload;
    const serviceId = payload.serviceId?.trim();
    const specialistId = payload.specialistId?.trim();
    const date = payload.date?.trim();
    const startTime = payload.startTime?.trim();
    const endTime = payload.endTime?.trim();
    const customerName = payload.customerName?.trim();
    const customerPhone = payload.customerPhone?.trim();
    const customerEmail = payload.customerEmail?.trim();
    const notes = payload.notes?.trim() || null;

    if (
      !serviceId ||
      !specialistId ||
      !date ||
      !startTime ||
      !endTime ||
      !customerName ||
      !customerPhone ||
      !customerEmail
    ) {
      return jsonResponse({ error: "Eksik randevu bilgisi." }, 400);
    }

    const supabase = createAdminClient();
    await supabase.rpc("expire_stale_pending_payments");

    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id, title, slug, price_amount, duration")
      .eq("id", serviceId)
      .maybeSingle();

    if (serviceError || !service) {
      return jsonResponse({ error: "Hizmet bulunamadı." }, 404);
    }

    const { data: mapping, error: mappingError } = await supabase
      .from("specialist_services")
      .select("id")
      .eq("service_id", serviceId)
      .eq("specialist_id", specialistId)
      .maybeSingle();

    if (mappingError || !mapping) {
      return jsonResponse(
        { error: "Seçilen uzman bu hizmeti vermiyor." },
        400,
      );
    }

    const appointmentId = crypto.randomUUID();
    const { error: insertError } = await supabase.from("appointments").insert({
      id: appointmentId,
      service_id: serviceId,
      specialist_id: specialistId,
      appointment_date: date,
      start_time: startTime,
      end_time: endTime,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      notes,
      price_amount: service.price_amount,
      payment_status: "pending",
      payment_provider: "stripe",
      status: "pending",
    });

    if (insertError) {
      const overlap = insertError.message?.includes("appointments_no_overlap");
      return jsonResponse(
        {
          error: overlap
            ? "Seçtiğiniz saat az önce dolmuş. Lütfen başka bir saat seçin."
            : "Randevu oluşturulamadı. Lütfen tekrar deneyin.",
        },
        overlap ? 409 : 400,
      );
    }

    const siteUrl = resolveCheckoutSiteUrl(req);
    const currency = "try";
    const stripe = getStripe();

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        locale: "tr",
        customer_email: customerEmail,
        client_reference_id: appointmentId,
        success_url: `${siteUrl}/randevu/sonuc?id=${appointmentId}&durum=basarili`,
        cancel_url: `${siteUrl}/randevu/sonuc?id=${appointmentId}&durum=basarisiz`,
        expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
        metadata: {
          appointment_id: appointmentId,
          customer_phone: customerPhone,
          customer_name: customerName,
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: toStripeAmount(service.price_amount),
              product_data: {
                name: service.title,
                description: service.duration
                  ? `Süre: ${service.duration}`
                  : undefined,
                metadata: {
                  service_id: service.id,
                  service_slug: service.slug ?? "",
                },
              },
            },
          },
        ],
      });

      if (!session.url) {
        throw new Error("Stripe ödeme sayfası alınamadı.");
      }

      await supabase
        .from("appointments")
        .update({ stripe_checkout_session_id: session.id })
        .eq("id", appointmentId);

      return jsonResponse({
        appointmentId,
        sessionId: session.id,
        paymentPageUrl: session.url,
      });
    } catch (stripeError) {
      await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          payment_status: "failed",
        })
        .eq("id", appointmentId);

      const message =
        stripeError instanceof Error
          ? stripeError.message
          : "Ödeme oturumu başlatılamadı. Lütfen tekrar deneyin.";

      return jsonResponse({ error: message }, 400);
    }
  } catch (error) {
    console.error("stripe-initialize", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("STRIPE_SECRET_KEY")) {
      return jsonResponse(
        {
          error:
            "Stripe secret key is not configured. Set STRIPE_SECRET_KEY in Supabase Edge Function secrets.",
        },
        500,
      );
    }
    return jsonResponse(
      { error: "Ödeme başlatılırken bir hata oluştu." },
      500,
    );
  }
});
