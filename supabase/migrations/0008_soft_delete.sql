-- ============================================================================
-- Roséa — Arşivleme (K2)
-- ============================================================================
-- SORUN: Randevusu olan bir hizmet veya uzman veritabanı tarafından
-- silinemiyor:
--
--     appointments.service_id    → services(id)     on delete restrict
--     appointments.specialist_id → team_members(id) on delete restrict
--
-- Bu doğru bir koruma — geçmiş randevunun hangi hizmet olduğu kaybolmamalı.
-- Ama sonucu şu: panelde duran "Sil" düğmesi, salonun bir süredir çalışan
-- kayıtları için kalıcı olarak işe yaramaz hale geliyor. Artık verilmeyen
-- bir hizmeti listeden çıkarmanın yolu kalmıyor.
--
-- ÇÖZÜM: Silmek yerine arşivlemek. is_active = false olan kayıtlar:
--   * sitede görünmez,
--   * randevu ekranında seçilemez,
--   * panelde "arşiv" bölümünde durur ve geri alınabilir.
--
-- Gerçek silme yalnızca hiç kullanılmamış kayıtlar için anlamlı kalıyor.
--
-- DİKKAT — bu migration tek başına yetmez: kullanıcı tarafındaki site
-- (beauty/src/lib/queries/*.js) sorgularına `.eq("is_active", true)`
-- eklenmediği sürece arşivlenen kayıtlar sitede görünmeye devam eder.
-- Dosyanın sonundaki listeye bakın.
-- ============================================================================

alter table public.services
  add column if not exists is_active boolean not null default true;

alter table public.team_members
  add column if not exists is_active boolean not null default true;

comment on column public.services.is_active is
  'false ise hizmet sitede ve randevu ekranında görünmez; panelde arşivde durur. '
  'Geçmiş randevular korunduğu için silme yerine bu kullanılır.';

comment on column public.team_members.is_active is
  'false ise kişi Hakkımızda ekibinde ve randevu uzmanları arasında görünmez. '
  'Mevcut randevuları etkilenmez.';

-- Listeler neredeyse her zaman aktif kayıtlarla filtreleniyor; kısmi indeks
-- tam tablo indeksinden küçük ve bu sorgular için yeterli.
create index if not exists services_active_order_idx
  on public.services (display_order)
  where is_active;

create index if not exists team_members_active_order_idx
  on public.team_members (display_order)
  where is_active;

-- ============================================================================
-- KULLANICI TARAFINDA YAPILMASI GEREKENLER
-- ============================================================================
-- Aşağıdaki sorgulara `.eq("is_active", true)` eklenmeli. Aksi halde
-- arşivlenen hizmet/uzman sitede görünmeye ve randevu alınmaya devam eder.
--
--   beauty/src/lib/queries/services.js
--     getServices()          — hizmetler sayfası
--     getFeaturedServices()  — ana sayfa öne çıkanlar
--     getServiceBySlug()     — detay sayfası (arşivliyse 404 vermeli)
--
--   beauty/src/lib/queries/about.js
--     ekip listesi sorgusu
--
--   beauty/src/lib/queries/booking.js
--     getSpecialistsForService() — arşivli uzman randevu için seçilememeli
--
-- Yönetim paneli bu kolonu zaten kullanıyor: arşivlenen kayıtlar listede
-- ayrı bir bölümde görünüyor ve geri alınabiliyor.
-- ============================================================================
