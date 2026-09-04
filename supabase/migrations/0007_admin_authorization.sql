-- ============================================================================
-- Roséa — Yönetici yetkilendirmesi (K1)
-- ============================================================================
-- SORUN: 0001, 0002 ve 0003'te oluşturulan yazma politikaları yetkiyi
-- "authenticated" rolünün tamamına veriyordu:
--
--     create policy "..._authenticated_write" on public.<tablo>
--       for all to authenticated using (true) with check (true);
--
-- Supabase projesinde kayıt (signup) açık olduğu sürece, herkese açık anon
-- anahtarla e-postasını yazıp kaydolan HERHANGİ biri "authenticated" olur ve
-- bu politikalar gereği tüm içeriği değiştirebilir, silebilir; üstelik
-- appointments tablosundaki müşteri adı, telefonu ve e-postasını okuyabilirdi.
--
-- ÇÖZÜM: Yetki artık "giriş yapmış olmak" değil, "admins tablosunda kayıtlı
-- olmak". Bütün yazma politikaları public.is_admin() fonksiyonuna bağlandı.
--
-- DEĞİŞMEYENLER:
--   * Herkese açık okuma (services, blog, galeri vb.) aynen duruyor —
--     site ziyaretçisi içeriği görmeye devam eder.
--   * appointments'a anon INSERT aynen duruyor — müşteri online randevu
--     alabilmeli. Sadece okuma/güncelleme/silme yöneticiye kilitlendi.
--   * booked_slots görünümü herkese açık kalıyor; kişisel veri içermiyor,
--     randevu ekranı boş saatleri oradan hesaplıyor.
--
-- ÖNEMLİ: Bu dosyayı çalıştırdıktan sonra en az bir yönetici eklemezseniz
-- panelden hiçbir şey kaydedilemez. En alttaki "İLK YÖNETİCİ" adımını
-- atlamayın. (SQL Editor postgres rolüyle çalıştığı için RLS'i baypas eder;
-- Dashboard üzerinden içerik düzenlemeye her hâlükârda devam edebilirsiniz.)
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Yönetici listesi
-- ----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- auth.users tablosunu anon/authenticated rolleri sorgulayamadığı için
  -- e-posta ve adı burada da tutuyoruz; panelin "Yöneticiler" ekranı bu
  -- tabloyu okuyacak. Kullanıcı e-postasını değiştirirse burası güncellenmez.
  email text not null,
  full_name text,

  -- Rol ayrımı henüz POLİTİKALARDA UYGULANMIYOR: şu an 'owner' da 'staff' de
  -- aynı yetkiye sahip. Kolon, yol haritasındaki 4.2 (resepsiyon için sınırlı
  -- yetki) geldiğinde şema değişikliği gerekmesin diye şimdiden duruyor.
  role text not null default 'owner' check (role in ('owner', 'staff')),

  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Yönetim paneline erişebilen kullanıcılar. Bir satır silmek, o kullanıcının '
  'panel yetkisini kaldırır ama auth.users kaydını silmez.';


-- ----------------------------------------------------------------------------
-- 2. Yetki kontrolü
-- ----------------------------------------------------------------------------
-- security definer: fonksiyon sahibinin (postgres) yetkisiyle çalışır, böylece
-- admins tablosunun kendi RLS politikası ile fonksiyon arasında sonsuz döngü
-- oluşmaz. search_path sabitlenmezse security definer fonksiyonlar arama yolu
-- manipülasyonuna açık olur — bu yüzden açıkça public'e sabitlendi.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

comment on function public.is_admin() is
  'Oturumdaki kullanıcı admins tablosunda kayıtlı mı? Giriş yapılmamışsa false.';

-- Panel, girişten sonra bu fonksiyonu rpc ile çağırıp yetkiyi doğrular.
-- anon çağırırsa auth.uid() null olur ve false döner — hata değil.
grant execute on function public.is_admin() to anon, authenticated;


-- ----------------------------------------------------------------------------
-- 3. admins tablosunun kendi politikaları
-- ----------------------------------------------------------------------------
alter table public.admins enable row level security;

drop policy if exists "admins_self_read" on public.admins;
drop policy if exists "admins_admin_read" on public.admins;
drop policy if exists "admins_admin_write" on public.admins;

-- Yönetici, diğer yöneticileri görebilir (4.2'deki "Panel kullanıcıları" ekranı).
create policy "admins_admin_read"
  on public.admins for select
  to authenticated
  using (public.is_admin());

-- Yönetici ekleme/çıkarma yetkisi de yöneticilerde. İlk kaydı SQL Editor
-- üzerinden siz atacaksınız (postgres rolü RLS'i baypas eder).
create policy "admins_admin_write"
  on public.admins for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ----------------------------------------------------------------------------
-- 4. İçerik tablolarında yazma yetkisini daralt
-- ----------------------------------------------------------------------------
-- Eski "..._authenticated_write" politikaları düşürülüp yerlerine is_admin()
-- kontrolü yapan "..._admin_write" politikaları kuruluyor. "..._public_read"
-- politikalarına dokunulmuyor — site içeriği herkese açık kalmalı.
do $$
declare
  t text;
begin
  foreach t in array array[
    -- 0001
    'service_categories', 'services',
    'about_story', 'team_members', 'about_values', 'site_stats',
    'gallery_images',
    'blog_categories', 'blog_posts',
    'testimonials',
    'contact_info', 'business_hours', 'social_links',
    -- 0002
    'home_about_features', 'home_about_slides',
    -- 0003
    'specialist_services', 'specialist_availability', 'specialist_time_off'
  ]
  loop
    execute format('drop policy if exists "%1$s_authenticated_write" on public.%1$s;', t);
    execute format('drop policy if exists "%1$s_admin_write" on public.%1$s;', t);

    execute format(
      'create policy "%1$s_admin_write" on public.%1$s for all to authenticated '
      'using (public.is_admin()) with check (public.is_admin());',
      t
    );
  end loop;
end $$;


-- ----------------------------------------------------------------------------
-- 5. Randevular — müşteri verisi burada, en sıkı tablo
-- ----------------------------------------------------------------------------
-- Okuma, güncelleme ve silme yalnızca yöneticide. INSERT herkese açık kalıyor:
-- online randevu akışı anon anahtarla kayıt oluşturuyor ve RLS gereği kendi
-- yazdığı satırı geri okuyamıyor (bu yüzden booking.js id'yi istemcide üretip
-- insert'e kendisi veriyor) — o davranış bozulmadan korunuyor.
drop policy if exists "appointments_authenticated_read" on public.appointments;
drop policy if exists "appointments_authenticated_update" on public.appointments;
drop policy if exists "appointments_authenticated_delete" on public.appointments;
drop policy if exists "appointments_admin_read" on public.appointments;
drop policy if exists "appointments_admin_update" on public.appointments;
drop policy if exists "appointments_admin_delete" on public.appointments;

create policy "appointments_admin_read"
  on public.appointments for select
  to authenticated
  using (public.is_admin());

create policy "appointments_admin_update"
  on public.appointments for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "appointments_admin_delete"
  on public.appointments for delete
  to authenticated
  using (public.is_admin());


-- ----------------------------------------------------------------------------
-- 6. Görsel deposu
-- ----------------------------------------------------------------------------
-- 0005_gallery.sql yükleme/silme yetkisini yine tüm authenticated rolüne
-- vermişti; aynı şekilde daraltılıyor. Okuma herkese açık kalmalı — site
-- görselleri bu bucket'tan geliyor.
drop policy if exists "media_authenticated_insert" on storage.objects;
drop policy if exists "media_authenticated_update" on storage.objects;
drop policy if exists "media_authenticated_delete" on storage.objects;
drop policy if exists "media_admin_insert" on storage.objects;
drop policy if exists "media_admin_update" on storage.objects;
drop policy if exists "media_admin_delete" on storage.objects;

create policy "media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());


-- ============================================================================
-- İLK YÖNETİCİ — bu adım atlanırsa panel hiçbir şey kaydedemez
-- ============================================================================
-- 1) Supabase Dashboard → Authentication → Users → "Add user" ile kendinize
--    bir kullanıcı oluşturun (e-posta + şifre, "Auto Confirm User" işaretli).
--
-- 2) Aşağıdaki sorguyu kendi e-postanızla doldurup SQL Editor'da çalıştırın:
--
--    insert into public.admins (user_id, email, full_name, role)
--    select id, email, 'Ad Soyad', 'owner'
--    from auth.users
--    where email = 'sizin@eposta.com'
--    on conflict (user_id) do nothing;
--
-- 3) Doğrulama — 1 satır dönmeli:
--
--    select a.email, a.role, a.created_at from public.admins a;
--
-- Bundan sonraki yöneticileri panelin "Ayarlar → Panel kullanıcıları"
-- ekranından ekleyebilirsiniz (yol haritası 4.2).
--
-- Dashboard → Authentication → Providers altından e-posta ile kaydı (signup)
-- kapatmanız da ayrıca önerilir: bu migration yetkiyi zaten kapatıyor, ama
-- kayıt açık kalırsa veritabanınızda sürekli işe yaramaz kullanıcı birikir.
-- ============================================================================
