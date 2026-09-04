-- ============================================================================
-- Roséa — SEO meta yönetimi (4.1) ve işlem kaydı (4.4)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Sayfa bazlı SEO alanları
-- ----------------------------------------------------------------------------
-- Sabit sayfalar adresleriyle tutulur ('/', '/hizmetler', '/iletisim' …).
-- Hizmet ve blog detay sayfalarının kendi başlıkları zaten kendi
-- tablolarında; burada yalnızca onların kalıbı ("%s | Roséa") saklanır.
--
-- ÖNEMLİ SINIR: site tek sayfa uygulaması (SPA). Buradaki değerler tarayıcıda
-- çalıştıktan sonra <head>'e yazılır. Google bunu çoğunlukla görür; WhatsApp
-- ve sosyal medya paylaşım önizlemeleri ise sayfayı çalıştırmadan okuduğu
-- için göremez. Paylaşım kartlarının doğru çıkması için derleme sırasında
-- prerender gerekir — bu migration onu kapsamıyor.

create table if not exists public.seo_meta (
  -- Adres, "/" ile başlayan ve sondaki eğik çizgisi olmayan biçimde.
  path text primary key,

  title text,
  description text,
  og_image_url text,

  updated_at timestamptz not null default now()
);

comment on table public.seo_meta is
  'Sabit sayfaların başlık, açıklama ve paylaşım görseli bilgileri. '
  'Anahtarı sayfanın adresi.';

drop trigger if exists set_seo_meta_updated_at on public.seo_meta;
create trigger set_seo_meta_updated_at
  before update on public.seo_meta
  for each row execute function public.set_updated_at();

alter table public.seo_meta enable row level security;

drop policy if exists "seo_meta_public_read" on public.seo_meta;
drop policy if exists "seo_meta_admin_write" on public.seo_meta;

-- Site bu değerleri okuyacak, dolayısıyla herkese açık.
create policy "seo_meta_public_read"
  on public.seo_meta for select
  to anon, authenticated
  using (true);

create policy "seo_meta_admin_write"
  on public.seo_meta for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Mevcut sayfaların başlangıç değerleri: index.html'deki başlıktan ve
-- sayfaların içeriğinden türetildi.
insert into public.seo_meta (path, title, description) values
  ('/', 'Roséa Güzellik Merkezi | Uzman Bakım ve Güzellik Hizmetleri',
   'Cilt bakımı, saç tasarımı, kalıcı makyaj ve spa ritüelleri. Sertifikalı uzman kadro, hijyenik ortam, kişiye özel bakım.'),
  ('/hizmetler', 'Hizmetlerimiz | Roséa Güzellik Merkezi',
   'Medikal cilt bakımından kalıcı makyaja, saç bakımından spa masajına kadar tüm hizmetlerimiz.'),
  ('/hakkimizda', 'Hakkımızda | Roséa Güzellik Merkezi',
   '2013''ten bu yana İstanbul''da güzellik ve bakım hizmeti. Ekibimiz, değerlerimiz ve hikayemiz.'),
  ('/galeri', 'Galeri | Roséa Güzellik Merkezi',
   'Salonumuzdan ve uygulamalarımızdan kareler.'),
  ('/blog', 'Blog | Roséa Güzellik Merkezi',
   'Cilt bakımı, saç bakımı ve güzellik trendleri üzerine uzman yazıları.'),
  ('/iletisim', 'İletişim | Roséa Güzellik Merkezi',
   'Adres, telefon ve çalışma saatlerimiz. Randevu için bize ulaşın.'),
  ('/randevu', 'Randevu Al | Roséa Güzellik Merkezi',
   'Hizmet ve uzman seçip size uygun saatte online randevu oluşturun.')
on conflict (path) do nothing;


-- ----------------------------------------------------------------------------
-- 2. İşlem kaydı
-- ----------------------------------------------------------------------------
-- "Kim, ne zaman, hangi kaydı değiştirdi." Özellikle randevu iptalleri ve
-- elle yapılan ödeme işaretlemeleri için: bunlar para ve müşteri ilişkisi
-- doğuran işlemler ve sonradan sorulabiliyor.

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,

  -- Kullanıcı silinirse kayıt kalsın, sadece bağlantısı kopsun. E-posta
  -- ayrıca metin olarak saklanıyor çünkü panel auth.users'ı okuyamaz.
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,

  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  table_name text not null,
  record_id text,

  -- UPDATE'te yalnızca gerçekten değişen alanlar: { kolon: { eski, yeni } }
  changes jsonb,

  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx
  on public.audit_log (created_at desc);

create index if not exists audit_log_table_record_idx
  on public.audit_log (table_name, record_id);

comment on table public.audit_log is
  'Değişiklik geçmişi. Yalnızca trigger yazar; panelden yazılamaz.';

-- security definer: tetikleyici, tabloya yazma yetkisi olmayan bir kullanıcı
-- adına da kayıt düşebilmeli. search_path sabitleniyor.
create or replace function public.log_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_mail text;
  diff jsonb := '{}'::jsonb;
  key text;
  old_json jsonb;
  new_json jsonb;
begin
  select email into actor_mail from public.admins where user_id = actor;

  if tg_op = 'UPDATE' then
    old_json := to_jsonb(old);
    new_json := to_jsonb(new);

    -- Yalnızca değişen kolonları yaz; tüm satırı iki kez saklamanın anlamı
    -- yok ve kayıt okunmaz hale gelir.
    for key in select jsonb_object_keys(new_json)
    loop
      if old_json -> key is distinct from new_json -> key
         and key <> 'updated_at'
      then
        diff := diff || jsonb_build_object(
          key,
          jsonb_build_object('eski', old_json -> key, 'yeni', new_json -> key)
        );
      end if;
    end loop;

    -- Sadece updated_at değiştiyse kayda değer bir şey olmamıştır.
    if diff = '{}'::jsonb then
      return new;
    end if;
  end if;

  insert into public.audit_log (
    actor_id, actor_email, action, table_name, record_id, changes
  )
  values (
    actor,
    actor_mail,
    tg_op,
    tg_table_name,
    coalesce(
      (to_jsonb(coalesce(new, old)) ->> 'id'),
      null
    ),
    case tg_op
      when 'UPDATE' then diff
      when 'INSERT' then to_jsonb(new)
      else to_jsonb(old)
    end
  );

  return coalesce(new, old);
end;
$$;

-- Kayıt tutulan tablolar. Randevular asıl sebep; hizmet ve ekip
-- değişiklikleri de fiyat/kadro geçmişi için izleniyor.
do $$
declare
  t text;
begin
  foreach t in array array['appointments', 'services', 'team_members']
  loop
    execute format('drop trigger if exists audit_%1$s on public.%1$s;', t);
    execute format(
      'create trigger audit_%1$s after insert or update or delete on public.%1$s '
      'for each row execute function public.log_change();',
      t
    );
  end loop;
end $$;

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_admin_read" on public.audit_log;

-- Yalnızca okuma, yalnızca yönetici. Yazma politikası KASITLI olarak yok:
-- tabloya sadece security definer tetikleyici yazabilir, panel yazamaz.
create policy "audit_log_admin_read"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());


-- ============================================================================
-- KULLANICI TARAFINDA YAPILMASI GEREKENLER
-- ============================================================================
-- seo_meta tablosunun bir işe yaraması için sitenin bu değerleri okuyup
-- <head>'e yazması gerekiyor. Yönetim paneliyle birlikte gelen
-- beauty/src/lib/useSeoMeta.js bunu yapıyor; sayfalara eklenmesi yeterli.
--
-- Paylaşım önizlemeleri (WhatsApp, Facebook, X) sayfayı çalıştırmadan
-- okuduğu için bu yöntemle düzelmez. Onun için derleme sırasında prerender
-- ya da sunucu tarafı render gerekir — ayrı bir iş.
-- ============================================================================
