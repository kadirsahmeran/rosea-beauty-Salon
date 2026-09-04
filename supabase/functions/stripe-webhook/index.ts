import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import {
  getStripe,
  markAppointmentFailed,
  markAppointmentPaid,
} from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET tanımlı değil.");
    return new Response("Webhook secret missing", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const stripe = getStripe();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
    );

    const supabase = createAdminClient();

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;
      const appointmentId =
        session.metadata?.appointment_id ?? session.client_reference_id;

      if (appointmentId && session.payment_status === "paid") {
        await markAppointmentPaid(supabase, appointmentId, session);
      }
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object;
      const appointmentId =
        session.metadata?.appointment_id ?? session.client_reference_id;

      if (appointmentId) {
        await markAppointmentFailed(supabase, appointmentId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("stripe-webhook", error);
    return new Response("Webhook error", { status: 400 });
  }
});
