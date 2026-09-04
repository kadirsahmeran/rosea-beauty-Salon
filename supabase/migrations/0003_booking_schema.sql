-- ============================================================================
-- Roséa Güzellik Merkezi — Randevu (Rezervasyon) Şeması
-- ============================================================================
-- Akış: Hizmet seç → o hizmeti veren uzmanlardan birini seç → uzmanın
-- müsait olduğu bir tarihi seç (müsait olmadığı günler takvimde seçilemez)
-- → o tarihteki boş bir saati seç → randevu oluştur.
--
-- Uzmanlar için ayrı bir tablo açmadım — mevcut "team_members" tablosu
-- (Hakkımızda ekibi) aynı zamanda randevu alınabilen uzmanlar. Böylece
-- fotoğraf/isim/unvan tek yerden yönetiliyor.
--
-- Ödeme entegrasyonu için "appointments" tablosuna hazır alanlar eklendi
-- (price_amount, payment_status, payment_provider, payment_reference).
-- Gerçek ödeme sağlayıcısı (iyzico/Stripe/PayTR vb.) entegre edildiğinde
-- bu alanlar bir Edge Function/webhook ile güncellenecek.
-- ============================================================================

-- Çakışan randevuları veritabanı seviyesinde engellemek için gerekli.
create extension if not exists btree_gist;

-- ----------------------------------------------------------------------------
-- Hizmetlere randevu hesaplaması için makine-okunur süre/fiyat alanları
-- (mevcut "60-90 Dk" / "₺1.200" gibi metin alanları görüntüleme için kalıyor)
-- ----------------------------------------------------------------------------
alter table public.services
  add column duration_minutes integer,
  add column price_amount numeric;

update public.services set duration_minutes = 90,  price_amount = 1200 where slug = 'medikal-cilt-bakimi';
update public.services set duration_minutes = 45,  price_amount = 1800 where slug = 'hydrafacial-terapi';
update public.services set duration_minutes = 120, price_amount = 2500 where slug = 'keratin-bakim-botoks';
update public.services set duration_minutes = 120, price_amount = 3200 where slug = 'microblading-kaş';
update public.services set duration_minutes = 60,  price_amount = 1500 where slug = 'aroma-terapi-masaji';
update public.services set duration_minutes = 90,  price_amount = 2800 where slug = 'profesyonel-gelin-makyaji';

alter table public.services
  alter column duration_minutes set not null,
  alter column price_amount set not null;

-- ============================================================================
-- Hangi uzman hangi hizmeti veriyor (çoka-çok ilişki)
-- ============================================================================
create table public.specialist_services (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.team_members(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  unique (specialist_id, service_id)
);

create index specialist_services_specialist_idx on public.specialist_services (specialist_id);
create index specialist_services_service_idx on public.specialist_services (service_id);

-- ============================================================================
-- Uzmanların haftalık düzenli müsaitlik saatleri
-- day_of_week: 0=Pazar, 1=Pazartesi, ... 6=Cumartesi
-- (JS'in Date.prototype.getDay() ve Postgres'in EXTRACT(DOW) ile birebir
-- aynı kural — frontend'de dönüştürme gerekmiyor.)
-- ============================================================================
create table public.specialist_availability (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.team_members(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  check (end_time > start_time)
);

create index specialist_availability_specialist_idx on public.specialist_availability (specialist_id);

-- ============================================================================
-- İstisna günler: izin, tatil, eğitim vb. — o tarih aralığında uzman
-- normalde müsait olsa bile randevu alınamaz.
-- ============================================================================
create table public.specialist_time_off (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.team_members(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  check (end_date >= start_date)
);

create index specialist_time_off_specialist_idx on public.specialist_time_off (specialist_id);

-- ============================================================================
-- Randevular
-- ============================================================================
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete restrict,
  specialist_id uuid not null references public.team_members(id) on delete restrict,

  appointment_date date not null,
  start_time time not null,
  end_time time not null,

  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  notes text,

  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),

  -- Ödeme entegrasyonu için hazır alanlar
  price_amount numeric not null,
  price_currency text not null default 'TRY',
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded', 'partially_paid')),
  payment_provider text,
  payment_reference text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_specialist_date_idx on public.appointments (specialist_id, appointment_date);
create index appointments_status_idx on public.appointments (status);

create trigger set_appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- Aynı uzman için aynı gün çakışan (iptal edilmemiş) randevuları veritabanı
-- seviyesinde engeller — iki kişi aynı anda aynı uzmandan randevu kapmasın.
alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    specialist_id with =,
    appointment_date with =,
    tsrange(
      (appointment_date + start_time)::timestamp,
      (appointment_date + end_time)::timestamp
    ) with &&
  )
  where (status <> 'cancelled');

-- ----------------------------------------------------------------------------
-- Herkese açık, kişisel veri içermeyen "dolu saatler" görünümü.
-- Booking ekranı hangi saatlerin boş olduğunu bulmak için bu görünümü
-- okur — appointments tablosundaki müşteri adı/telefon/e-posta gibi
-- bilgilere anon kullanıcılar asla erişemez.
-- ----------------------------------------------------------------------------
create view public.booked_slots as
  select specialist_id, appointment_date, start_time, end_time
  from public.appointments
  where status <> 'cancelled';

grant select on public.booked_slots to anon, authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.specialist_services enable row level security;
alter table public.specialist_availability enable row level security;
alter table public.specialist_time_off enable row level security;
alter table public.appointments enable row level security;

-- Uzman/hizmet eşleşmesi, müsaitlik saatleri ve izin günleri herkese açık
-- okunur (booking ekranı bunlara ihtiyaç duyar), yazma sadece admin panel
-- üzerinden giriş yapmış kullanıcılara açık.
do $$
declare
  t text;
begin
  foreach t in array array[
    'specialist_services', 'specialist_availability', 'specialist_time_off'
  ]
  loop
    execute format(
      'create policy "%1$s_public_read" on public.%1$s for select to anon, authenticated using (true);',
      t
    );
    execute format(
      'create policy "%1$s_authenticated_write" on public.%1$s for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- appointments farklı: müşteri bilgisi içerdiği için anon SADECE randevu
-- oluşturabilir (insert), okuma/güncelleme/silme sadece admin (authenticated).
create policy "appointments_public_insert"
  on public.appointments for insert
  to anon, authenticated
  with check (true);

create policy "appointments_authenticated_read"
  on public.appointments for select
  to authenticated
  using (true);

create policy "appointments_authenticated_update"
  on public.appointments for update
  to authenticated
  using (true) with check (true);

create policy "appointments_authenticated_delete"
  on public.appointments for delete
  to authenticated
  using (true);

-- ============================================================================
-- SEED VERİSİ
-- ============================================================================

-- Hangi uzman hangi hizmeti veriyor
insert into public.specialist_services (specialist_id, service_id)
select tm.id, s.id
from (values
  ('Elif Yıldız', 'medikal-cilt-bakimi'),
  ('Elif Yıldız', 'hydrafacial-terapi'),
  ('Elif Yıldız', 'aroma-terapi-masaji'),
  ('Zeynep Aydın', 'medikal-cilt-bakimi'),
  ('Zeynep Aydın', 'hydrafacial-terapi'),
  ('Ayşe Kara', 'keratin-bakim-botoks'),
  ('Meltem Su', 'microblading-kaş'),
  ('Meltem Su', 'profesyonel-gelin-makyaji')
) as mapping(specialist_name, service_slug)
join public.team_members tm on tm.name = mapping.specialist_name
join public.services s on s.slug = mapping.service_slug;

-- Haftalık müsaitlik (0=Pazar .. 6=Cumartesi)
-- Not: Ayşe Kara'nın Salı(2)/Perşembe(4)/Pazar(0) günleri yok — bu tam
-- olarak "o uzmanın boş günü olmayan bir tarih seçilemesin" senaryosu.
insert into public.specialist_availability (specialist_id, day_of_week, start_time, end_time)
select tm.id, v.day_of_week, v.start_time::time, v.end_time::time
from (values
  ('Elif Yıldız', 1, '09:00', '17:00'),
  ('Elif Yıldız', 2, '09:00', '17:00'),
  ('Elif Yıldız', 3, '09:00', '17:00'),
  ('Elif Yıldız', 4, '09:00', '17:00'),
  ('Elif Yıldız', 5, '09:00', '17:00'),

  ('Zeynep Aydın', 2, '10:00', '19:00'),
  ('Zeynep Aydın', 3, '10:00', '19:00'),
  ('Zeynep Aydın', 4, '10:00', '19:00'),
  ('Zeynep Aydın', 5, '10:00', '19:00'),
  ('Zeynep Aydın', 6, '10:00', '19:00'),

  ('Ayşe Kara', 1, '09:00', '18:00'),
  ('Ayşe Kara', 3, '09:00', '18:00'),
  ('Ayşe Kara', 5, '09:00', '18:00'),
  ('Ayşe Kara', 6, '09:00', '18:00'),

  ('Meltem Su', 2, '11:00', '20:00'),
  ('Meltem Su', 3, '11:00', '20:00'),
  ('Meltem Su', 4, '11:00', '20:00'),
  ('Meltem Su', 5, '11:00', '20:00'),
  ('Meltem Su', 6, '11:00', '20:00')
) as v(specialist_name, day_of_week, start_time, end_time)
join public.team_members tm on tm.name = v.specialist_name;

-- Örnek bir izin günü (normalde müsait olduğu bir gün, o tarihe özel kapalı)
insert into public.specialist_time_off (specialist_id, start_date, end_date, reason)
select tm.id, v.start_date::date, v.end_date::date, v.reason
from (values
  ('Zeynep Aydın', '2026-09-10', '2026-09-10', 'Kişisel izin')
) as v(specialist_name, start_date, end_date, reason)
join public.team_members tm on tm.name = v.specialist_name;
