-- ============================================================================
-- Roséa Güzellik Merkezi — Ek Şema: Ana Sayfa "Hakkımızda" Bölümü
-- ============================================================================
-- 0001_init_schema.sql çalıştırıldıktan sonra bu dosyayı da SQL Editor'da
-- çalıştırın. Ana sayfadaki Hakkımızda bölümünün özellik kartlarını ve
-- görsel slider'ını (0001'de yer almayan iki küçük liste) kapsar.
-- ============================================================================

-- Ana sayfa Hakkımızda: "Sertifikalı Uzman Kadro" vb. özellik kartları
create table public.home_about_features (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  display_order int not null default 0
);

-- Ana sayfa Hakkımızda: sağ taraftaki görsel kart slider'ı
create table public.home_about_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text not null,
  tag text not null,
  display_order int not null default 0
);

alter table public.home_about_features enable row level security;
alter table public.home_about_slides enable row level security;

create policy "home_about_features_public_read"
  on public.home_about_features for select to anon, authenticated using (true);
create policy "home_about_features_authenticated_write"
  on public.home_about_features for all to authenticated using (true) with check (true);

create policy "home_about_slides_public_read"
  on public.home_about_slides for select to anon, authenticated using (true);
create policy "home_about_slides_authenticated_write"
  on public.home_about_slides for all to authenticated using (true) with check (true);

insert into public.home_about_features (title, description, display_order) values
  ('Sertifikalı Uzman Kadro', 'Alanında uluslararası eğitim almış profesyonel estetisyenler.', 1),
  ('Hijyenik ve Modern Salon', 'En yüksek sterilizasyon standartları ile izole bakım alanları.', 2),
  ('Kişiye Özel Danışmanlık', 'Cilt ve vücut tipinize özel hazırlanan kişisel bakım rutinleri.', 3);

insert into public.home_about_slides (image_url, title, tag, display_order) values
  ('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop', 'Huzurlu ve Şık Atmosfer', 'Salon İçi', 1),
  ('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop', 'Kişiye Özel Cilt Bakımı', 'Uzman Deneyimi', 2),
  ('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop', 'Premium Bakım Ürünleri', $$%100 Orijinal$$, 3),
  ('https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop', 'Maksimum Hijyen Standardı', 'Güvenilir Hizmet', 4);
