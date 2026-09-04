import { supabase } from "../supabaseClient";

async function readFunctionError(error, data, fallback) {
  if (data?.error) return data.error;

  const response = error?.context;
  if (response && typeof response.json === "function") {
    try {
      const body = await response.clone().json();
      if (body?.error) return body.error;
      if (typeof body?.message === "string") return body.message;
    } catch {
      // ignore
    }
  }

  const message = error?.message || fallback;
  if (/Failed to send|not found|NOT_FOUND/i.test(message)) {
    return "Ödeme servisi henüz yayınlanmadı. Stripe Edge Function’larını deploy etmeniz gerekiyor.";
  }
  if (/non-2xx/i.test(message)) {
    return "Ödeme başlatılamadı. Stripe gizli anahtarının (STRIPE_SECRET_KEY) Supabase secrets’a eklendiğini kontrol edin.";
  }
  return message;
}

export async function initializeCheckout(payload) {
  const { data, error } = await supabase.functions.invoke("stripe-initialize", {
    body: payload,
  });

  if (error) {
    throw new Error(await readFunctionError(error, data, "Ödeme başlatılamadı."));
  }

  if (data?.error) throw new Error(data.error);
  if (!data?.paymentPageUrl) {
    throw new Error("Stripe ödeme sayfası alınamadı.");
  }

  return data;
}

export async function getPaymentStatus(appointmentId, { cancel = false } = {}) {
  const { data, error } = await supabase.functions.invoke("stripe-status", {
    body: { id: appointmentId, cancel },
  });

  if (error) {
    throw new Error(
      await readFunctionError(error, data, "Randevu durumu alınamadı."),
    );
  }

  if (data?.error) throw new Error(data.error);
  return data;
}
