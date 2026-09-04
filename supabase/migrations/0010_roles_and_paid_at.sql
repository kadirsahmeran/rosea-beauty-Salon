-- ============================================================================
-- Roséa — Rol ayrımı ve ödeme tarihi
-- ============================================================================
-- İki açık kapanıyor:
--
--   1. admins.role kolonu 0007'den beri var ama politikalarda uygulanmıyordu;
--      "staff" de "owner" ile aynı yetkiye sahipti.
--   2. Tahsilat rakamları randevu tarihine göre hesaplanıyordu, çünkü
--      ödemenin ne zaman alındığını tutan bir alan yoktu.
-- ============================================================================


-- ============================================================================
-- 1. ROL AYRIMI
-- ============================================================================
-- owner : her şey — içerik, hizmetler, ekip, SEO, panel kullanıcıları, iade
-- staff : salonun günlük işi — randevular, çalışma saatleri, izinler
--
-- Ayrımın mantığı: resepsiyondaki kişi randevu alıp iptal edebilmeli ama
-- hizmet fiyatını değiştirememeli, bir uzmanı silememeli, yeni yönetici
-- ekleyememeli ve para iade edememeli.

create or replace function public.admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.admins where user_id = auth.uid();
$$;

comment on function public.admin_role() is
  'Oturumdaki kullanıcının panel rolü: owner | staff | null.';

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid() and role = 'owner'
  );
$$;

comment on function public.is_owner() is
  'Tam yetkili yönetici mi? İçerik ve ayar değişiklikleri buna bağlı.';

grant execute on function public.admin_role() to anon, authenticated;
grant execute on function public.is_owner() to anon, authenticated;


-- ----------------------------------------------------------------------------
-- İçerik tabloları: yazma yalnızca owner
-- ----------------------------------------------------------------------------
-- Okuma politikalarına dokunulmuyor — site içeriği herkese açık kalmalı ve
-- staff da panelde bu kayıtları görebilmeli (randevu ekranı hizmet ve uzman
-- listesine ihtiyaç duyuyor).
do $$
declare
  t text;
begin
  foreach t in array array[
    'service_categories', 'services',
    'about_story', 'team_members', 'about_values', 'site_stats',
    'gallery_images',
    'blog_categories', 'blog_posts',
    'testimonials',
    'contact_info', 'business_hours', 'social_links',
    'home_about_features', 'home_about_slides',
    -- Hangi uzmanın hangi hizmeti verdiği de içerik kararı.
    'specialist_services',
    'seo_meta'
  ]
  loop
    execute format('drop policy if exists "%1$s_admin_write" on public.%1$s;', t);
    execute format('drop policy if exists "%1$s_owner_write" on public.%1$s;', t);

    execute format(
      'create policy "%1$s_owner_write" on public.%1$s for all to authenticated '
      'using (public.is_owner()) with check (public.is_owner());',
      t
    );
  end loop;
end $$;


-- ----------------------------------------------------------------------------
-- Operasyonel tablolar: yazma her yöneticiye açık
-- ----------------------------------------------------------------------------
-- Çalışma saatleri ve izinler resepsiyonun günlük işi; bunları
-- değiştiremeyen bir kişi randevu da yönetemez.
do $$
declare
  t text;
begin
  foreach t in array array['specialist_availability', 'specialist_time_off']
  loop
    execute format('drop policy if exists "%1$s_admin_write" on public.%1$s;', t);
    execute format(
      'create policy "%1$s_admin_write" on public.%1$s for all to authenticated '
      'using (public.is_admin()) with check (public.is_admin());',
      t
    );
  end loop;
end $$;


-- ----------------------------------------------------------------------------
-- Randevular: okuma ve güncelleme her yöneticide, KALICI SİLME owner'da
-- ----------------------------------------------------------------------------
-- İptal etmek bir durum değişikliği (staff yapabilir); silmek kaydı
-- raporlardan da düşürür ve geri alınamaz (yalnızca owner).
drop policy if exists "appointments_admin_delete" on public.appointments;
drop policy if exists "appointments_owner_delete" on public.appointments;

create policy "appointments_owner_delete"
  on public.appointments for delete
  to authenticated
  using (public.is_owner());


-- ----------------------------------------------------------------------------
-- Yönetici listesi: yalnızca owner değiştirebilir
-- ----------------------------------------------------------------------------
-- Okuma her yöneticide kalıyor: staff kime başvuracağını görebilmeli.
drop policy if exists "admins_admin_write" on public.admins;
drop policy if exists "admins_owner_write" on public.admins;

create policy "admins_owner_write"
  on public.admins for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());


-- ----------------------------------------------------------------------------
-- Görsel deposu: yükleme ve silme owner'da (medya içeriğin parçası)
-- ----------------------------------------------------------------------------
drop policy if exists "media_admin_insert" on storage.objects;
drop policy if exists "media_admin_update" on storage.objects;
drop policy if exists "media_admin_delete" on storage.objects;
drop policy if exists "media_owner_insert" on storage.objects;
drop policy if exists "media_owner_update" on storage.objects;
drop policy if exists "media_owner_delete" on storage.objects;

create policy "media_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_owner());

create policy "media_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_owner())
  with check (bucket_id = 'media' and public.is_owner());

create policy "media_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_owner());


-- ============================================================================
-- 2. ÖDEME TARİHİ
-- ============================================================================
-- Tahsilat raporu şimdiye kadar randevu tarihine bakıyordu: "son 7 günde
-- gerçekleşen ve ödenmiş randevular". Bugün ödenen gelecek haftaki bir
-- randevu bu rakama girmiyordu. Artık ödemenin alındığı an tutuluyor.

alter table public.appointments
  add column if not exists paid_at timestamptz;

comment on column public.appointments.paid_at is
  'Ödemenin tamamlandığı an. payment_status ilk kez "paid" olduğunda '
  'tetikleyici tarafından doldurulur; Stripe webhook''u da panelden elle '
  'işaretleme de aynı yoldan geçer.';

create index if not exists appointments_paid_at_idx
  on public.appointments (paid_at desc)
  where paid_at is not null;

-- Tetikleyici, kolonu hangi yoldan gelirse gelsin dolduruyor: Stripe
-- webhook'u, panelden elle işaretleme ya da doğrudan SQL. Uygulama koduna
-- güvenmek yerine veritabanında tutmak, ileride eklenecek üçüncü bir yolun
-- da unutulmamasını sağlıyor.
create or replace function public.set_paid_at()
returns trigger
language plpgsql
as $$
begin
  if new.payment_status = 'paid' and new.paid_at is null then
    new.paid_at = now();
  end if;

  -- İade edilirse ödeme tarihi anlamını yitirir.
  if new.payment_status in ('refunded', 'failed', 'unpaid') then
    new.paid_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists set_appointments_paid_at on public.appointments;
create trigger set_appointments_paid_at
  before insert or update of payment_status on public.appointments
  for each row execute function public.set_paid_at();

-- Mevcut ödenmiş kayıtlar için yaklaşık değer: bu satırları "paid" yapan
-- son işlem updated_at'i güncellemiş olacağı için makul bir tahmin. Kesin
-- değil; bu migration'dan sonraki ödemeler gerçek zamanı taşır.
update public.appointments
set paid_at = updated_at
where payment_status = 'paid' and paid_at is null;


-- ============================================================================
-- SONRAKİ ADIMLAR
-- ============================================================================
-- * Panel bu migration'dan sonra rolü okuyup arayüzü ona göre kısıtlıyor;
--   asıl koruma yine burada, RLS'te.
-- * "staff" rolüyle bir hesap açıp test etmek için:
--
--     update public.admins set role = 'staff' where email = 'test@ornek.com';
--
-- * Kendi hesabınızı staff'a çevirmeyin — panel kullanıcıları ekranına
--   erişiminizi kaybedersiniz ve geri almak için SQL Editor gerekir.
-- ============================================================================
