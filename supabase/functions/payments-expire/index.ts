import { jsonResponse, optionsResponse } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/requireAdmin.ts";

// Ödemesi yarım kalmış randevuları temizler (yol haritası 4.3).
//
// expire_stale_pending_payments fonksiyonu 0006'da yazılmıştı ama yalnızca
// service_role çağırabiliyor — panelin anon anahtarıyla erişilemez. Bu
// fonksiyon aradaki köprü: yöneticiyi doğrular, sonra servis anahtarıyla
// çağırır.
//
// İleride pg_cron ile otomatikleştirilebilir; şimdilik panelden elle.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") {
    return jsonResponse({ error: "Yalnızca POST." }, 405);
  }

  const auth = await requireAdmin(req);
  if (!auth.ok) return jsonResponse({ error: auth.error }, auth.status);

  try {
    const body = await req.json().catch(() => ({}));
    const minutes = Number(body.minutes ?? 45);

    if (!Number.isFinite(minutes) || minutes < 5) {
      return jsonResponse(
        { error: "Süre en az 5 dakika olmalı." },
        400,
      );
    }

    const { data, error } = await auth.supabase.rpc(
      "expire_stale_pending_payments",
      { max_age: `${Math.round(minutes)} minutes` },
    );

    if (error) throw error;

    return jsonResponse({ cancelled: data ?? 0, minutes: Math.round(minutes) });
  } catch (error) {
    console.error("payments-expire", error);
    return jsonResponse(
      { error: (error as Error).message ?? "Temizlik yapılamadı." },
      500,
    );
  }
});
