import { jsonResponse, optionsResponse } from "../_shared/cors.ts";
import { requireOwner } from "../_shared/requireAdmin.ts";
import { getStripe, toStripeAmount } from "../_shared/stripe.ts";

// Panelden iade (yol haritası 4.3 / K4 kararı).
//
// Şemada "refunded" ve "partially_paid" değerleri baştan beri vardı ama
// hiçbir kod onları yazmıyordu; iade Stripe panelinden elle yapılıp
// buraya elle işaretleniyordu. Bu fonksiyon ikisini tek işleme indiriyor:
// Stripe'ta iadeyi başlatır ve randevunun ödeme durumunu günceller.
//
// İade GERİ ALINAMAZ. Panel bu yüzden onay penceresi gösteriyor.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") {
    return jsonResponse({ error: "Yalnızca POST." }, 405);
  }

  const auth = await requireOwner(req);
  if (!auth.ok) return jsonResponse({ error: auth.error }, auth.status);

  try {
    const body = await req.json().catch(() => ({}));
    const appointmentId = String(body.appointmentId ?? "").trim();
    // Kısmi iade için tutar; verilmezse tamamı iade edilir.
    const requestedAmount =
      body.amount === undefined || body.amount === null || body.amount === ""
        ? null
        : Number(body.amount);

    if (!appointmentId) {
      return jsonResponse({ error: "Randevu numarası gerekli." }, 400);
    }

    if (requestedAmount !== null && !Number.isFinite(requestedAmount)) {
      return jsonResponse({ error: "İade tutarı sayı olmalı." }, 400);
    }

    const { supabase } = auth;

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select("id, price_amount, payment_status, stripe_payment_intent_id")
      .eq("id", appointmentId)
      .maybeSingle();

    if (error) throw error;
    if (!appointment) {
      return jsonResponse({ error: "Randevu bulunamadı." }, 404);
    }

    if (!["paid", "partially_paid"].includes(appointment.payment_status)) {
      return jsonResponse(
        {
          error:
            "Bu randevu ödenmiş görünmüyor, iade edilemez. Ödeme durumunu kontrol edin.",
        },
        400,
      );
    }

    if (!appointment.stripe_payment_intent_id) {
      return jsonResponse(
        {
          error:
            "Bu randevunun Stripe ödemesi yok — salonda nakit/kart ile alınmış olabilir. " +
            "İadeyi elden yapıp ödeme durumunu panelden işaretleyin.",
        },
        400,
      );
    }

    const total = Number(appointment.price_amount);
    const amount = requestedAmount ?? total;

    if (amount <= 0 || amount > total) {
      return jsonResponse(
        { error: `İade tutarı 0 ile ${total} arasında olmalı.` },
        400,
      );
    }

    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: appointment.stripe_payment_intent_id,
      amount: toStripeAmount(amount),
    });

    const isFull = amount >= total;

    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        payment_status: isFull ? "refunded" : "partially_paid",
        // Tamamı iade edildiyse randevu da düşer; kısmi iadede randevu durur.
        ...(isFull ? { status: "cancelled" } : {}),
      })
      .eq("id", appointmentId);

    if (updateError) throw updateError;

    return jsonResponse({
      refundId: refund.id,
      amount,
      full: isFull,
      paymentStatus: isFull ? "refunded" : "partially_paid",
    });
  } catch (error) {
    console.error("payments-refund", error);
    return jsonResponse(
      { error: (error as Error).message ?? "İade tamamlanamadı." },
      500,
    );
  }
});
