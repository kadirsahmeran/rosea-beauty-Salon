import { jsonResponse, optionsResponse } from "../_shared/cors.ts";
import { requireOwner } from "../_shared/requireAdmin.ts";

// Panel kullanıcısı davet etme (yol haritası 4.2).
//
// Neden edge function: yeni bir auth kullanıcısı oluşturmak servis anahtarı
// ister; tarayıcıdaki anon anahtarla yapılamaz. Yetki verme/alma işlemi
// (admins tablosu) RLS ile zaten panelden yapılabiliyor, o yüzden burada
// yalnızca davet var.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") {
    return jsonResponse({ error: "Yalnızca POST." }, 405);
  }

  const auth = await requireOwner(req);
  if (!auth.ok) return jsonResponse({ error: auth.error }, auth.status);

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim() || null;
    const role = body.role === "staff" ? "staff" : "owner";

    if (!email || !email.includes("@")) {
      return jsonResponse({ error: "Geçerli bir e-posta girin." }, 400);
    }

    const { supabase } = auth;

    // Davet e-postası gönder. Kullanıcı zaten varsa Supabase hata döndürür;
    // o durumda yalnızca yetki veriyoruz.
    let userId: string | null = null;
    let invited = false;

    const invite = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: String(body.redirectTo ?? ""),
    });

    if (invite.data?.user) {
      userId = invite.data.user.id;
      invited = true;
    } else {
      // Zaten kayıtlı kullanıcıyı bul.
      const { data: list, error: listError } =
        await supabase.auth.admin.listUsers({ perPage: 200 });

      if (listError) throw listError;

      const existing = list.users.find(
        (user) => user.email?.toLowerCase() === email,
      );

      if (!existing) {
        return jsonResponse(
          {
            error:
              invite.error?.message ??
              "Kullanıcı davet edilemedi ve mevcut kullanıcılar arasında bulunamadı.",
          },
          400,
        );
      }

      userId = existing.id;
    }

    const { error: insertError } = await supabase
      .from("admins")
      .upsert(
        { user_id: userId, email, full_name: fullName, role },
        { onConflict: "user_id" },
      );

    if (insertError) throw insertError;

    return jsonResponse({
      userId,
      email,
      invited,
      message: invited
        ? "Davet e-postası gönderildi ve yönetici yetkisi verildi."
        : "Kullanıcı zaten kayıtlıydı; yönetici yetkisi verildi.",
    });
  } catch (error) {
    console.error("admin-users", error);
    return jsonResponse(
      { error: (error as Error).message ?? "İşlem tamamlanamadı." },
      500,
    );
  }
});
