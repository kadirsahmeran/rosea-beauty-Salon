import { createAdminClient } from "./supabaseAdmin.ts";

// Bu klasördeki diğer fonksiyonlar müşteriye açık (randevu ödemesi).
// Aşağıdakiler ise yalnızca yöneticiye açık olmalı — ve "giriş yapmış olmak"
// yetmez, admins tablosunda kayıtlı olmak gerekir (bkz. 0007).
//
// Çağıran tarafın oturum belirteci Authorization başlığında gelir;
// supabase-js'in functions.invoke çağrısı bunu kendiliğinden ekler.
export async function requireAdmin(req: Request) {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { ok: false as const, error: "Oturum bulunamadı.", status: 401 };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { ok: false as const, error: "Oturum geçersiz.", status: 401 };
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id, email, role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!admin) {
    return {
      ok: false as const,
      error: "Bu işlem için yetkiniz yok.",
      status: 403,
    };
  }

  return { ok: true as const, supabase, user: data.user, admin };
}

// Yalnızca tam yetkili yönetici. Para iadesi ve yeni yönetici ekleme gibi
// geri alınamaz işlemler bunu ister — RLS bu fonksiyonları koruyamaz,
// çünkü servis anahtarıyla çalışıyorlar ve RLS'i baypas ediyorlar.
export async function requireOwner(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth;

  if (auth.admin.role !== "owner") {
    return {
      ok: false as const,
      error: "Bu işlem için tam yetki gerekiyor.",
      status: 403,
    };
  }

  return auth;
}
