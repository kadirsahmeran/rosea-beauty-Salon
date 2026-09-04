import Stripe from "npm:stripe@17.7.0";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export function getStripe() {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY tanımlı değil.");

  return new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function toStripeAmount(amount: number | string) {
  return Math.round(Number(amount) * 100);
}

function paymentIntentId(session: Stripe.Checkout.Session) {
  const intent = session.payment_intent;
  if (typeof intent === "string") return intent;
  return intent?.id ?? null;
}

export async function markAppointmentPaid(
  supabase: SupabaseClient,
  appointmentId: string,
  session: Stripe.Checkout.Session,
) {
  const { error } = await supabase
    .from("appointments")
    .update({
      payment_status: "paid",
      status: "confirmed",
      payment_provider: "stripe",
      payment_reference: session.id,
      stripe_payment_intent_id: paymentIntentId(session),
      stripe_checkout_session_id: session.id,
    })
    .eq("id", appointmentId)
    .in("payment_status", ["pending", "unpaid"]);

  if (error) throw error;
}

export async function markAppointmentFailed(
  supabase: SupabaseClient,
  appointmentId: string,
) {
  const { error } = await supabase
    .from("appointments")
    .update({
      payment_status: "failed",
      status: "cancelled",
    })
    .eq("id", appointmentId)
    .eq("payment_status", "pending");

  if (error) throw error;
}

export async function syncCheckoutSession(
  supabase: SupabaseClient,
  appointment: {
    id: string;
    payment_status: string;
    stripe_checkout_session_id: string | null;
  },
  options: { cancel?: boolean } = {},
) {
  if (appointment.payment_status === "paid") return "paid";
  if (appointment.payment_status !== "pending") return appointment.payment_status;
  if (!appointment.stripe_checkout_session_id) return appointment.payment_status;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(
    appointment.stripe_checkout_session_id,
  );

  if (session.payment_status === "paid") {
    await markAppointmentPaid(supabase, appointment.id, session);
    return "paid";
  }

  if (session.status === "expired") {
    await markAppointmentFailed(supabase, appointment.id);
    return "failed";
  }

  if (options.cancel && session.status === "open") {
    await stripe.checkout.sessions.expire(session.id);
    await markAppointmentFailed(supabase, appointment.id);
    return "failed";
  }

  return appointment.payment_status;
}
