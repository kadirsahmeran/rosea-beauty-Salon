-- ============================================================================
-- Roséa Güzellik Merkezi — Supabase Şeması
-- ============================================================================
-- Bu dosyayı Supabase projenizde SQL Editor > New Query üzerinden çalıştırın
-- (veya Supabase CLI kullanıyorsanız: supabase db push).
--
-- İçerik: Hizmetler, Hakkımızda (ekip, değerler, istatistikler, hikaye),
-- Galeri, Blog, Müşteri Yorumları ve İletişim bilgileri için tablolar,
-- RLS (Row Level Security) politikaları ve mevcut statik içeriğin seed verisi.
--
-- Yetkilendirme mantığı: Herkes (anon) sadece OKUYABİLİR. Ekleme/düzenleme/
-- silme yalnızca giriş yapmış (authenticated) kullanıcılara açıktır — ileride
-- kuracağınız admin panelinde Supabase Auth ile giriş yapan kullanıcılar bu
-- tabloları yönetebilecek.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Ortak: updated_at otomatik güncelleme fonksiyonu
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- HİZMETLER
-- ============================================================================
create table public.service_categories (
  id text primary key,
  name text not null,
  display_order int not null default 0
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id text not null references public.service_categories(id) on delete restrict,
  title text not null,
  subtitle text,
  description text,
  long_description text,
  highlights text[] not null default '{}',
  duration text,
  starting_price text,
  image_url text,
  featured boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_category_id_idx on public.services (category_id);
create index services_featured_idx on public.services (featured);

create trigger set_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ============================================================================
-- HAKKIMIZDA
-- ============================================================================
create table public.about_story (
  id int primary key default 1,
  image_url text not null,
  paragraphs text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint about_story_singleton check (id = 1)
);

create trigger set_about_story_updated_at
  before update on public.about_story
  for each row execute function public.set_updated_at();

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  image_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_team_members_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

-- "Bizi Farklı Kılan Değerlerimiz" kartları (Hakkımızda sayfası)
create table public.about_values (
  id uuid primary key default gen_random_uuid(),
  icon text not null, -- lucide-react ikon adı, örn. 'shield-check'
  title text not null,
  description text not null,
  display_order int not null default 0
);

-- İstatistik şeritleri: 'about' (Hakkımızda/AboutStats) ve 'testimonials'
-- (Müşteri Yorumları) bölümlerinde ayrı ayrı kullanılıyor, context ile ayrılır.
create table public.site_stats (
  id uuid primary key default gen_random_uuid(),
  context text not null check (context in ('about', 'testimonials')),
  icon text not null,
  value numeric not null,
  suffix text not null default '',
  label text not null,
  display_order int not null default 0
);

create index site_stats_context_idx on public.site_stats (context);

-- ============================================================================
-- GALERİ
-- ============================================================================
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  image_url text not null,
  alt_text text,
  featured boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gallery_images_featured_idx on public.gallery_images (featured);

create trigger set_gallery_images_updated_at
  before update on public.gallery_images
  for each row execute function public.set_updated_at();

-- ============================================================================
-- BLOG
-- ============================================================================
create table public.blog_categories (
  id text primary key,
  name text not null,
  display_order int not null default 0
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id text not null references public.blog_categories(id) on delete restrict,
  title text not null,
  excerpt text,
  cover_image_url text,
  author text,
  read_time text,
  featured boolean not null default false,
  intro text,
  -- sections: [{ "heading": "...", "paragraphs": ["...", "..."] }, ...]
  sections jsonb not null default '[]',
  published_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_category_id_idx on public.blog_posts (category_id);
create index blog_posts_featured_idx on public.blog_posts (featured);
create index blog_posts_published_at_idx on public.blog_posts (published_at desc);

create trigger set_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- MÜŞTERİ YORUMLARI
-- ============================================================================
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  service text,
  initials text,
  rating int not null default 5 check (rating between 1 and 5),
  featured boolean not null default false,
  quote text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- ============================================================================
-- İLETİŞİM
-- ============================================================================
create table public.contact_info (
  id int primary key default 1,
  address text not null,
  phone text not null,
  phone_href text not null,
  email text not null,
  map_embed_src text,
  updated_at timestamptz not null default now(),
  constraint contact_info_singleton check (id = 1)
);

create trigger set_contact_info_updated_at
  before update on public.contact_info
  for each row execute function public.set_updated_at();

create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  day_label text not null,
  time_label text not null,
  display_order int not null default 0
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon text not null, -- 'instagram' | 'facebook' | 'whatsapp'
  display_order int not null default 0
);

-- ============================================================================
-- ROW LEVEL SECURITY — herkes okur, sadece giriş yapmış kullanıcılar yazar
-- ============================================================================
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.about_story enable row level security;
alter table public.team_members enable row level security;
alter table public.about_values enable row level security;
alter table public.site_stats enable row level security;
alter table public.gallery_images enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.testimonials enable row level security;
alter table public.contact_info enable row level security;
alter table public.business_hours enable row level security;
alter table public.social_links enable row level security;

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
    'contact_info', 'business_hours', 'social_links'
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

-- ============================================================================
-- SEED VERİSİ — mevcut statik içeriğin (src/data/*.js) birebir taşınmış hali
-- ============================================================================

-- Hizmet kategorileri
insert into public.service_categories (id, name, display_order) values
  ('cilt', 'Cilt Bakımı', 1),
  ('sac', 'Saç Tasarım & Bakım', 2),
  ('makyaj', 'Kalıcı Makyaj', 3),
  ('spa', 'Spa & Masaj', 4);

-- Hizmetler
insert into public.services
  (slug, category_id, title, subtitle, description, long_description, highlights, duration, starting_price, image_url, featured, display_order)
values
  (
    'medikal-cilt-bakimi', 'cilt', 'Medikal Cilt Bakımı', 'Derinlemesine Temizlik & Yenilenme',
    $$Cildinizin ihtiyacına özel dermokozmetik ürünlerle gözenek sıkılaştırma ve nem dengesi sağlama ritüeli.$$,
    $$Cilt analizi ile başlayan bu seansta, cildinizin tipine ve o anki ihtiyacına göre seçilen dermokozmetik ürünlerle derinlemesine temizlik, peeling ve yoğun nemlendirme uygulanır. Düzenli tekrarlandığında gözenekleri sıkılaştırır, cilt tonunu eşitler ve ciltteki nem-yağ dengesini kalıcı olarak destekler.$$,
    ARRAY[
      $$Ücretsiz cilt analizi ile başlangıç$$,
      $$Cilt tipine özel ürün seçimi$$,
      $$Gözenek sıkılaştırma ve arındırma$$,
      $$Seans sonrası bakım önerileri$$
    ],
    '60-90 Dk', '₺1.200',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop',
    true, 1
  ),
  (
    'hydrafacial-terapi', 'cilt', 'Hydrafacial Anti-Aging', 'Leke & İnce Çizgi Karşıtı',
    $$Vakum teknolojisi ve hyalüronik asit serumları ile anında daha parlak, taze ve genç bir cilt görünümü.$$,
    $$Vakum bazlı cihaz teknolojisi ölü deriyi nazikçe uzaklaştırırken, aynı anda hyalüronik asit ve antioksidan serumları cildin en derin katmanlarına iletir. Tek seansta bile fark edilir bir parlaklık, sıkılık ve daha genç bir görünüm sağlar; ince çizgiler ve lekelerle mücadelede düzenli kullanımda etkisi katlanarak artar.$$,
    ARRAY[
      $$Ağrısız, iz bırakmayan vakum teknolojisi$$,
      $$Anında görünür parlaklık$$,
      $$İnce çizgi ve leke karşıtı serum desteği$$,
      $$Tüm cilt tiplerine uygun$$
    ],
    '45 Dk', '₺1.800',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop',
    true, 2
  ),
  (
    'keratin-bakim-botoks', 'sac', 'Keratin & Saç Botoksu', 'Pürüzsüz & İpeksi Dokunuş',
    $$Yıpranmış saç tellerinize yoğun protein yüklemesi yaparak parlaklık ve uzun süreli pürüzsüzlük kazandırır.$$,
    $$Isı ve kimyasal işlemlerden yıpranmış saçlar için tasarlanan bu uygulamada, tellere yoğun keratin ve protein yüklemesi yapılır. Saçınız daha ipeksi, dolgun ve parlak bir görünüme kavuşurken, elektriklenme ve kırılma önemli ölçüde azalır. Etkisi ortalama 8-12 hafta sürer.$$,
    ARRAY[
      $$Yoğun keratin & protein yüklemesi$$,
      $$Elektriklenme ve kırılmayı azaltır$$,
      $$8-12 hafta kalıcı etki$$,
      $$Her saç tipine uyarlanabilir formül$$
    ],
    '120 Dk', '₺2.500',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop',
    false, 3
  ),
  (
    'microblading-kaş', 'makyaj', 'Microblading Kaş Tasarımı', 'Doğal Kıl Tekniği',
    $$Yüz simetrinize en uygun formda, doğal kaş kılı görünümünde uzun süre kalıcı mikro pigmentasyon uygulaması.$$,
    $$Yüz hatlarınız ve kaş yapınız incelenerek, size en uygun kaş formu birlikte belirlenir. Kıl tekniğiyle tek tek işlenen mikro pigmentasyon, doğal kaş teli görünümü verirken makyajsız günlerinizde bile kendinize güvenmenizi sağlar. İşlem öncesi topikal anestezi uygulanır.$$,
    ARRAY[
      $$Kişiye özel kaş formu tasarımı$$,
      $$Doğal, tek tek kıl efekti$$,
      $$Topikal anestezi ile konforlu uygulama$$,
      $$12-18 ay kalıcılık$$
    ],
    '120 Dk', '₺3.200',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    true, 4
  ),
  (
    'aroma-terapi-masaji', 'spa', 'Aromaterapi Spa Masajı', 'Zihinsel & Bedensel Arınma',
    $$Bitkisel öz yağlar ve sıcak taş terapisi eşliğinde günün stresini geride bırakacağınız dinlendirici ritüel.$$,
    $$Seçtiğiniz bitkisel esansiyel yağlar ve sıcak taş terapisi eşliğinde uygulanan bu masaj, kas gerginliğini çözerken zihninizi de günün stresinden arındırır. Roséa'nın sakinleştirici spa atmosferinde, tamamen kendinize ayıracağınız bir mola.$$,
    ARRAY[
      $$Kişiye özel esansiyel yağ seçimi$$,
      $$Sıcak taş terapisi eşliğinde uygulama$$,
      $$Kas gerginliğini ve stresi azaltır$$,
      $$Sakin, huzurlu spa ortamı$$
    ],
    '60 Dk', '₺1.500',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
    false, 5
  ),
  (
    'profesyonel-gelin-makyaji', 'makyaj', 'Gelin & Özel Gün Makyajı', 'Kişiye Özel Konsept',
    $$Cilt tipinize ve tarzınıza en uygun, yüksek kalıcılıkta ve fotoğraf çekimlerine özel profesyonel makyaj.$$,
    $$Özel gününüzden önce yapılan deneme seansıyla birlikte, cilt tipinize, kıyafetinize ve tarzınıza en uygun makyaj konsepti belirlenir. Yüksek kalıcılıklı ürünlerle uygulanan makyaj, hem doğal ışıkta hem de fotoğraf/video çekimlerinde kusursuz görünüm sağlar.$$,
    ARRAY[
      $$Ücretsiz deneme seansı$$,
      $$Fotoğrafa özel, yüksek kalıcılıklı ürünler$$,
      $$Kıyafet ve konseple uyumlu tasarım$$,
      $$Gün boyu taze görünüm$$
    ],
    '90 Dk', '₺2.800',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop',
    false, 6
  );

-- Hakkımızda: hikaye
insert into public.about_story (id, image_url, paragraphs) values (
  1,
  'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=1200&auto=format&fit=crop',
  ARRAY[
    $$2013 yılında küçük bir stüdyoda başlayan Roséa Güzellik Merkezi yolculuğu, bugün İstanbul'un en çok tercih edilen güzellik adreslerinden biri haline geldi. Amacımız hep aynı kaldı: her müşterimizin kendini özel, bakımlı ve kendinden emin hissetmesini sağlamak.$$,
    $$Sertifikalı uzman kadromuz, sürekli güncellenen teknolojilerimiz ve titizlikle seçilen ürünlerimizle; saç bakımından cilt bakımına, makyajdan spa ritüellerine kadar geniş bir hizmet yelpazesinde kusursuz sonuçlar sunuyoruz. Her seansı sizin için özel bir ritüele dönüştürmeyi hedefliyoruz.$$
  ]
);

-- Hakkımızda: ekip
insert into public.team_members (name, role, image_url, display_order) values
  ('Elif Yıldız', 'Kurucu & Baş Estetisyen', 'https://images.unsplash.com/photo-1521146764736-56c929d59c83?q=80&w=400&auto=format&fit=crop', 1),
  ('Zeynep Aydın', 'Cilt Bakım Uzmanı', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop', 2),
  ('Ayşe Kara', 'Saç Tasarım Uzmanı', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop', 3),
  ('Meltem Su', 'Makyaj Sanatçısı', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop', 4);

-- Hakkımızda: değerler
insert into public.about_values (icon, title, description, display_order) values
  ('shield-check', 'Güvenilir Hijyen', $$Her seansta uluslararası sterilizasyon ve izolasyon standartları hassasiyetle uygulanır.$$, 1),
  ('sparkles', 'Uzman Dokunuşu', $$Sertifikalı estetisyenlerimiz uluslararası akademilerin sürekli eğitimleriyle kendini günceller.$$, 2),
  ('heart-handshake', 'Kişiye Özel Bakım', $$Cilt ve vücut analizi sonrasında sadece sizin biyolojik ihtiyacınıza özel bir ritüel oluşturulur.$$, 3),
  ('leaf', 'Kaliteli Ürünler', $$Cildin doğal florasına saygılı, orijinal ve yüksek konsantrasyonlu dermokozmetik formüller kullanılır.$$, 4);

-- İstatistikler (Hakkımızda)
insert into public.site_stats (context, icon, value, suffix, label, display_order) values
  ('about', 'clock', 12, '+', 'Yıllık Deneyim', 1),
  ('about', 'users', 3200, '+', 'Mutlu Müşteri', 2),
  ('about', 'award', 18, '+', 'Uzman Kadro', 3),
  ('about', 'heart', 98, '%', 'Memnuniyet Oranı', 4);

-- İstatistikler (Müşteri Yorumları)
insert into public.site_stats (context, icon, value, suffix, label, display_order) values
  ('testimonials', 'heart', 98, '%', 'Memnuniyet Oranı', 1),
  ('testimonials', 'star', 4.9, '', 'Ortalama Puan', 2),
  ('testimonials', 'users', 340, '+', 'Tamamlanan Seans', 3),
  ('testimonials', 'clock', 12, '+', 'Yıllık Deneyim', 4);

-- Galeri
insert into public.gallery_images (slug, image_url, alt_text, featured, display_order) values
  ('salon-ic-mekan', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop', 'Roséa Güzellik Merkezi salon içi', true, 1),
  ('manikur-detay', 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=800&auto=format&fit=crop', 'Özenle uygulanmış manikür', true, 2),
  ('makyaj-dudak', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=800&auto=format&fit=crop', 'Profesyonel makyaj uygulaması', true, 3),
  ('sac-masa', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=800&auto=format&fit=crop', 'Saç şekillendirme uygulaması', true, 4),
  ('spa-masaj', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop', 'Aromaterapi spa masajı', true, 5),
  ('sac-yikama', 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=800&auto=format&fit=crop', 'Salonda saç yıkama hizmeti', true, 6),
  ('makyaj-urunleri', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', 'Premium makyaj ürünleri', false, 7),
  ('sac-fon', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop', 'Saç fönü ve şekillendirme', false, 8),
  ('sac-aksesuar', 'https://images.unsplash.com/photo-1522336284037-91f7da073525?q=80&w=800&auto=format&fit=crop', 'Saç bakım aksesuarları', false, 9),
  ('kas-bakim', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop', 'Kaş ve kirpik bakımı', false, 10),
  ('pembe-sac', 'https://images.unsplash.com/photo-1470259078422-826894b933aa?q=80&w=800&auto=format&fit=crop', 'Yaratıcı saç tasarımı', false, 11),
  ('kivircik-sac', 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=800&auto=format&fit=crop', 'Doğal saç bakımı', false, 12),
  ('makyaj-fircalari', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=800&auto=format&fit=crop', 'Makyaj fırçaları', false, 13),
  ('omuz-masaji', 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?q=80&w=800&auto=format&fit=crop', 'Rahatlatıcı omuz masajı', false, 14),
  ('cicek-kalp', 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop', $$Roséa'dan sevgiyle$$, false, 15),
  ('kis-portre', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop', 'Özel gün makyajı sonrası', false, 16),
  ('uzun-sac', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop', 'Sağlıklı ve parlak saçlar', false, 17),
  ('makyaj-pudra', 'https://images.unsplash.com/photo-1503236823255-94609f598e71?q=80&w=800&auto=format&fit=crop', 'Makyaj pudrası ve fırça', false, 18);

-- Blog kategorileri
insert into public.blog_categories (id, name, display_order) values
  ('cilt-bakimi', 'Cilt Bakımı', 1),
  ('sac-bakimi', 'Saç Bakımı', 2),
  ('makyaj', 'Makyaj', 3),
  ('spa-wellness', 'Spa & Wellness', 4),
  ('trendler', 'Güzellik Trendleri', 5);

-- Blog yazıları
insert into public.blog_posts
  (slug, category_id, title, excerpt, cover_image_url, author, read_time, featured, intro, sections, published_at)
values
  (
    'kis-aylarinda-cilt-bakimi-rehberi', 'cilt-bakimi',
    $$Kış Aylarında Cilt Bakımı: Kuruluğa Karşı Etkili Yöntemler$$,
    $$Soğuk hava ve kapalı mekan ısıtması cildinizin nem dengesini bozabilir. İşte kış aylarında cildinizi korumanın pratik yolları.$$,
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=1200&auto=format&fit=crop',
    'Zeynep Aydın', '6 dk', true,
    $$Kış ayları geldiğinde cildimiz soğuk rüzgar, düşük nem oranı ve kapalı mekan ısıtmasının etkisiyle her zamankinden daha fazla desteğe ihtiyaç duyar. Doğru bakım rutiniyle bu dönemi cildinize zarar vermeden, hatta cildinizi güçlendirerek geçirebilirsiniz.$$,
    $$[
      {"heading": "Neden Cildimiz Kışın Daha Çok Kurur?", "paragraphs": [
        "Düşük hava nemi ve soğuk rüzgar, cildin doğal yağ bariyerini zayıflatarak nem kaybını hızlandırır. Buna bir de kalorifer ve klimaların kuruttuğu iç mekan havası eklenince cilt kendini savunmasız hisseder.",
        "Kızarıklık, gerginlik hissi ve pul pul dökülme bu dönemde sıkça karşılaşılan belirtilerdir. Erken müdahale, cildin bariyer fonksiyonunu korumak için kritik önem taşır."
      ]},
      {"heading": "Rutininize Eklemeniz Gereken 3 Adım", "paragraphs": [
        "Nazik bir temizleyiciyle başlayın; köpüren ve sertleşen ürünler yerine kremsi dokulu temizleyiciler tercih edin. Ardından hyalüronik asit içeren bir serumla cildi nemle doyurun.",
        "Son adım olarak yoğun kıvamlı bir nemlendiriciyle bu nemi cilde kilitleyin. Haftada bir kez uygulanacak nemlendirici bir maske de bariyer onarımını destekler."
      ]},
      {"heading": "Salon Desteği Ne Zaman Gerekir?", "paragraphs": [
        "Ev bakımına rağmen kuruluk ve hassasiyet devam ediyorsa, profesyonel bir cilt analizi ile ihtiyacınıza özel bir ritüel planlanabilir. Roséa'da uyguladığımız medikal cilt bakımı, gözenek sıkılaştırma ve yoğun nemlendirme adımlarıyla kış aylarında cildinizi destekler."
      ]}
    ]$$::jsonb,
    '2026-08-10'
  ),
  (
    'hydrafacial-nedir-kimler-icin-uygun', 'cilt-bakimi',
    $$Hydrafacial Nedir? Kimler İçin Uygundur?$$,
    $$Vakum teknolojisiyle uygulanan Hydrafacial, tek seansta cilde parlaklık kazandıran popüler bir bakım yöntemi. Detayları bu yazıda.$$,
    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop',
    'Zeynep Aydın', '5 dk', false,
    $$Son yıllarda güzellik dünyasının en çok konuşulan uygulamalarından biri olan Hydrafacial, ağrısız ve iz bırakmayan yapısıyla her yaştan ve cilt tipinden kişi tarafından tercih ediliyor.$$,
    $$[
      {"heading": "Hydrafacial Nasıl Uygulanır?", "paragraphs": [
        "Vakum bazlı özel bir cihaz, ölü deri hücrelerini nazikçe temizlerken aynı anda hyalüronik asit ve antioksidan serumları cildin derin katmanlarına iletir.",
        "İşlem üç ana adımdan oluşur: arındırma, peeling ve serum infüzyonu. Tüm süreç yaklaşık 45 dakika sürer ve herhangi bir iyileşme süresi gerektirmez."
      ]},
      {"heading": "Kimler Uygulatabilir?", "paragraphs": [
        "Hassas ciltten yağlı cilde kadar hemen hemen her cilt tipine uygulanabilir. Özellikle donuk görünüm, gözenek tıkanıklığı ve ince çizgilerden şikayetçi olanlar için idealdir.",
        "Aktif cilt enfeksiyonu veya güneş yanığı gibi durumlarda işlem öncesi mutlaka uzman görüşü alınmalıdır."
      ]},
      {"heading": "Ne Sıklıkla Tekrarlanmalı?", "paragraphs": [
        "En iyi sonuçlar için ayda bir kez uygulanması önerilir. Düzenli seanslar cilt tonunu eşitler, kolajen üretimini destekler ve kalıcı bir parlaklık sağlar."
      ]}
    ]$$::jsonb,
    '2026-07-28'
  ),
  (
    'cilt-tipine-gore-nemlendirici-secimi', 'cilt-bakimi',
    $$Cilt Tipinize Göre Doğru Nemlendirici Seçimi$$,
    $$Yanlış nemlendirici, cilt sorunlarını çözmek yerine artırabilir. Cilt tipinize uygun formülü seçmenin ipuçlarını derledik.$$,
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
    'Elif Yıldız', '5 dk', false,
    $$Piyasadaki yüzlerce nemlendirici arasından doğru olanı seçmek kafa karıştırıcı olabilir. Oysa doğru formülü bulmak, cilt tipinizi tanımakla başlar.$$,
    $$[
      {"heading": "Yağlı ve Karma Ciltler", "paragraphs": [
        "Yağlı ciltler genellikle nemlendiriciden kaçınır, ancak nemsiz kalan cilt daha fazla yağ üretimiyle tepki verir. Jel bazlı, yağ içermeyen (oil-free) formüller bu cilt tipi için idealdir."
      ]},
      {"heading": "Kuru ve Hassas Ciltler", "paragraphs": [
        "Kuru ciltler seramid ve skualan içeren, daha yoğun kıvamlı kremlerden fayda görür. Hassas ciltlerde ise parfüm içermeyen, sakinleştirici içerikli (aloe vera, panthenol) ürünler tercih edilmelidir."
      ]},
      {"heading": "Profesyonel Cilt Analizi Farkı", "paragraphs": [
        "Evde yapılan gözlemler bazen yanıltıcı olabilir; mevsimsel değişiklikler ve hormonal dalgalanmalar cilt tipini geçici olarak değiştirebilir. Roséa'daki ücretsiz cilt analizimizle ürün seçiminizi bilimsel verilere dayandırabilirsiniz."
      ]}
    ]$$::jsonb,
    '2026-07-15'
  ),
  (
    'keratin-bakimi-sac-botoksu-farklari', 'sac-bakimi',
    $$Keratin Bakımı ile Saç Botoksu Arasındaki Farklar$$,
    $$İkisi de pürüzsüz saçlar vaat eder, ama aralarında önemli farklar var. Hangisinin size uygun olduğunu birlikte inceleyelim.$$,
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200&auto=format&fit=crop',
    'Ayşe Kara', '6 dk', true,
    $$Salonlarda en sık karıştırılan iki uygulama olan keratin bakımı ve saç botoksu, benzer sonuçlar vaat etse de yapısal olarak birbirinden oldukça farklıdır.$$,
    $$[
      {"heading": "Keratin Bakımı Nasıl Çalışır?", "paragraphs": [
        "Keratin bakımı, saç teline yoğun protein yükleyerek yapıyı güçlendirir ve düzleştirir. Kimyasal içerikli formüller ısıyla aktifleşir ve etkisi 3-5 ay sürebilir.",
        "Yıpranmış, kimyasal işlem görmüş saçlar için özellikle etkilidir; ancak düzenli tekrar gerektirir."
      ]},
      {"heading": "Saç Botoksu Farkı Nedir?", "paragraphs": [
        "Saç botoksu, kimyasal düzleştirme yapmadan saç teline dolgunluk ve nem kazandırır. İçeriğindeki vitamin ve amino asitler sayesinde saçı besler, kırılganlığı azaltır.",
        "Doğal dalgalı yapıyı korumak isteyenler için botoks, keratine göre daha uygun bir seçenektir."
      ]},
      {"heading": "Hangisini Seçmeliyim?", "paragraphs": [
        "Aşırı yıpranmış ve düzleştirme isteyen saçlar için keratin, besleme ve dolgunluk isteyen saçlar için botoks önerilir. Uzmanlarımız saç analizinize göre en uygun seçimi birlikte belirler."
      ]}
    ]$$::jsonb,
    '2026-07-02'
  ),
  (
    'sac-dokulmesine-karsi-cozumler', 'sac-bakimi',
    $$Saç Dökülmesine Karşı Doğal ve Profesyonel Çözümler$$,
    $$Mevsimsel dökülmeden kalıcı saç incelmesine kadar, saç sağlığını korumak için bilmeniz gereken yöntemler.$$,
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=1200&auto=format&fit=crop',
    'Ayşe Kara', '7 dk', false,
    $$Günde 50-100 tel saç kaybı normal kabul edilir, ancak bu sayının belirgin şekilde artması altta yatan bir nedene işaret edebilir.$$,
    $$[
      {"heading": "Dökülmenin Yaygın Nedenleri", "paragraphs": [
        "Stres, beslenme eksiklikleri, hormonal değişimler ve mevsim geçişleri saç dökülmesinin en sık rastlanan nedenleri arasındadır. Demir ve D vitamini eksikliği de saç köklerini zayıflatabilir."
      ]},
      {"heading": "Evde Uygulayabileceğiniz Önlemler", "paragraphs": [
        "Saç derisini nazikçe masaj yapmak kan dolaşımını artırarak kök beslenmesini destekler. Sıkı toplama modellerinden kaçınmak ve ısı aletlerini sınırlamak da dökülmeyi azaltır."
      ]},
      {"heading": "Profesyonel Destek Ne Zaman Şart?", "paragraphs": [
        "Dökülme üç aydan uzun sürüyor veya belirgin bir seyrelme gözlemliyorsanız, saç derisi analiziyle kök nedenini belirlemek en doğru yaklaşımdır. Erken teşhis, tedavi başarısını doğrudan artırır."
      ]}
    ]$$::jsonb,
    '2026-06-20'
  ),
  (
    'boyali-sac-bakimi-renk-canliligi', 'sac-bakimi',
    $$Renkli Saçların Bakımı: Boyalı Saçı Canlı Tutmanın Yolları$$,
    $$Renk açtırma ve boyama işlemleri sonrası saçınızın canlılığını uzun süre korumak için pratik öneriler.$$,
    'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=1200&auto=format&fit=crop',
    'Ayşe Kara', '5 dk', false,
    $$Boyalı saçlar, doğal saça göre daha fazla bakım ister. Doğru ürün ve rutinle rengin solmasını geciktirip saç sağlığını koruyabilirsiniz.$$,
    $$[
      {"heading": "Yıkama Sıklığı ve Su Sıcaklığı", "paragraphs": [
        "Sık yıkama rengin daha hızlı solmasına neden olur. Sülfatsız şampuanlar ve ılık (sıcak değil) su kullanımı, boya moleküllerinin saç telinde daha uzun kalmasını sağlar."
      ]},
      {"heading": "Renk Koruyucu Ürünler", "paragraphs": [
        "Mor şampuanlar sarı tonları nötralize ederken, renk koruyucu maskeler boyanın canlılığını besler. Haftada bir kez uygulanan bakım maskesi rengin solmasını geciktirir."
      ]},
      {"heading": "UV Koruması Unutulmamalı", "paragraphs": [
        "Güneş ışınları boyalı saçlarda solmayı hızlandırır. UV filtreli saç bakım ürünleri veya şapka kullanımı, özellikle yaz aylarında rengin korunmasına yardımcı olur."
      ]}
    ]$$::jsonb,
    '2026-06-05'
  ),
  (
    'microblading-bilmeniz-gerekenler', 'makyaj',
    $$Kalıcı Makyaj (Microblading) Hakkında Bilmeniz Gerekenler$$,
    $$Kaş bölgesinde doğal görünüm arayanlar için microblading süreci, iyileşme dönemi ve dikkat edilmesi gerekenler.$$,
    'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=1200&auto=format&fit=crop',
    'Meltem Su', '6 dk', false,
    $$Microblading, ince kıl darbeleriyle uygulanan mikro pigmentasyon tekniğiyle doğal kaş kılı görünümü sağlayan uzun ömürlü bir uygulamadır.$$,
    $$[
      {"heading": "Uygulama Süreci Nasıl İşler?", "paragraphs": [
        "İşlem öncesinde yüz simetrinize uygun kaş formu birlikte belirlenir. Topikal anestezi uygulandıktan sonra tek tek kıl darbeleriyle pigment cilde işlenir."
      ]},
      {"heading": "İyileşme Sürecinde Nelere Dikkat Edilmeli?", "paragraphs": [
        "İlk hafta bölgeyi suyla temastan korumak ve önerilen bakım kremini düzenli uygulamak önemlidir. Kaşınma ve kabuklanma normaldir; kabukların kendiliğinden dökülmesi beklenmelidir."
      ]},
      {"heading": "Kalıcılık Süresi", "paragraphs": [
        "Cilt tipine bağlı olarak etkisi 12-18 ay sürer. Yıllık tazeleme seanslarıyla kaş formunuzu her zaman taze tutabilirsiniz."
      ]}
    ]$$::jsonb,
    '2026-05-22'
  ),
  (
    'gelin-makyajinda-dikkat-edilmesi-gerekenler', 'makyaj',
    $$Gelin Makyajında Dikkat Edilmesi Gereken 5 Nokta$$,
    $$Özel gününüzde kusursuz görünmek için makyaj planlamasında atlanmaması gereken adımlar.$$,
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
    'Meltem Su', '5 dk', false,
    $$Gelin makyajı, tek seferlik ama tüm gün ve fotoğraflarda kusursuz kalması gereken özel bir uygulamadır. Doğru planlama sürecin en kritik parçasıdır.$$,
    $$[
      {"heading": "Deneme Seansını Atlamayın", "paragraphs": [
        "Düğünden en az bir ay önce yapılan deneme seansı, konsepti netleştirmek ve olası değişiklikleri zamanında yapmak için kritik önem taşır."
      ]},
      {"heading": "Cilt Hazırlığına Erken Başlayın", "paragraphs": [
        "Düğünden 4-6 hafta önce başlanan cilt bakım rutini, makyajın daha pürüzsüz oturmasını sağlar. Ani cilt bakımı denemelerinden kaçının."
      ]},
      {"heading": "Kalıcılık ve Fotoğraf Uyumu", "paragraphs": [
        "Yüksek kalıcılıklı, flaş fotoğrafında parlama yapmayan ürünler tercih edilmelidir. Gözyaşına ve tere dayanıklı formüller gün boyu tazelik sağlar."
      ]}
    ]$$::jsonb,
    '2026-05-10'
  ),
  (
    'aromaterapi-masaji-faydalari', 'spa-wellness',
    $$Aromaterapi Masajının Faydaları ve Stres Yönetimi$$,
    $$Bitkisel esansiyel yağlarla uygulanan aromaterapi masajı, hem bedeni hem zihni nasıl rahatlatır?$$,
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
    'Roséa Ekibi', '5 dk', true,
    $$Yoğun iş temposu ve günlük stres, bedenimizde kas gerginliği olarak birikir. Aromaterapi masajı, dokunuş terapisiyle bitkisel yağların gücünü birleştirerek bu yükü hafifletir.$$,
    $$[
      {"heading": "Esansiyel Yağların Etkisi", "paragraphs": [
        "Lavanta sakinleştirici, nane canlandırıcı, okaliptüs ise ferahlatıcı etkileriyle bilinir. Masaj sırasında seçilen yağ, hem koku alma duyusu hem de cilt yoluyla vücuda etki eder."
      ]},
      {"heading": "Bedensel ve Zihinsel Faydalar", "paragraphs": [
        "Düzenli aromaterapi masajı kas gerginliğini azaltır, kan dolaşımını hızlandırır ve uyku kalitesini artırır. Zihinsel olarak ise kortizol seviyesini düşürerek stresi azalttığı bilinir."
      ]},
      {"heading": "Ne Sıklıkla Yaptırılmalı?", "paragraphs": [
        "Yoğun tempoda çalışanlar için ayda 2 kez, genel bir rahatlama için ayda 1 kez uygulama önerilir. Roséa'daki aromaterapi seanslarımız sıcak taş terapisiyle desteklenerek etkiyi artırır."
      ]}
    ]$$::jsonb,
    '2026-04-25'
  ),
  (
    'spa-gunu-oncesi-sonrasi', 'spa-wellness',
    $$Spa Günü Öncesi ve Sonrası Nelere Dikkat Etmeli?$$,
    $$Spa deneyiminizden en iyi verimi almak için basit ama etkili hazırlık ve bakım önerileri.$$,
    'https://images.unsplash.com/photo-1620733723572-11c53f73a416?q=80&w=1200&auto=format&fit=crop',
    'Roséa Ekibi', '4 dk', false,
    $$Bir spa gününden maksimum fayda sağlamak, sadece seans sırasında değil öncesinde ve sonrasında yapacaklarınızla da ilgilidir.$$,
    $$[
      {"heading": "Seans Öncesi Hazırlık", "paragraphs": [
        "Randevudan en az 2 saat önce ağır yemek yemekten kaçının. Bol su içmek, vücudun toksin atımını destekleyerek masajın etkisini artırır."
      ]},
      {"heading": "Seans Sonrası Bakım", "paragraphs": [
        "Masaj sonrası su tüketimine devam etmek kas gevşemesini destekler. Sıcak duş yerine ılık duş tercih ederek cildin nem dengesini korumak faydalı olur."
      ]},
      {"heading": "Düzenli Aralıklarla Tekrarlayın", "paragraphs": [
        "Spa deneyimini bir alışkanlık haline getirmek, tek seferlik faydadan çok daha kalıcı sonuçlar sağlar. Aylık rutin bir spa günü, hem fiziksel hem zihinsel dengeyi korumanıza yardımcı olur."
      ]}
    ]$$::jsonb,
    '2026-04-08'
  ),
  (
    '2026-guzellik-trendleri', 'trendler',
    $$2026'nın Öne Çıkan Güzellik Trendleri$$,
    $$Bu yılın en çok konuşulan cilt bakımı, saç ve makyaj trendlerini bir araya getirdik.$$,
    'https://images.unsplash.com/photo-1503236823255-94609f598e71?q=80&w=1200&auto=format&fit=crop',
    'Elif Yıldız', '6 dk', false,
    $$Güzellik dünyası her yıl yeni teknikler ve yaklaşımlarla gündeme geliyor. İşte 2026'da salonlarda en çok talep gören trendler.$$,
    $$[
      {"heading": "Cilt Bakımında: Minimalist Rutinler", "paragraphs": [
        "Çok adımlı rutinlerin yerini, az ama etkili ürünlerle yapılan 'skinimalism' yaklaşımı alıyor. Kaliteli birkaç ürünle cilt sağlığını desteklemek ön planda."
      ]},
      {"heading": "Saçta: Doğal Doku ve Bakım Odaklı Renkler", "paragraphs": [
        "Aşırı işlem yerine saç sağlığını koruyan bakım odaklı renklendirme teknikleri popülerleşiyor. Doğal dokuyu ön plana çıkaran kesim ve şekillendirmeler tercih ediliyor."
      ]},
      {"heading": "Makyajda: Işıltılı ve Doğal Bitişler", "paragraphs": [
        "Mat bitişlerin yerini nemli, ışıltılı ('dewy') görünümler alıyor. Az makyajla çok etki yaratan 'clean girl' estetiği bu yılın da gözde trendi olmaya devam ediyor."
      ]}
    ]$$::jsonb,
    '2026-03-20'
  ),
  (
    'manikur-nail-art-trendleri', 'trendler',
    $$Manikür ve Nail Art Trendleri: Sezonun Renkleri$$,
    $$Bu sezon tırnaklarda öne çıkan renkler, desenler ve bakım teknikleri.$$,
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1200&auto=format&fit=crop',
    'Elif Yıldız', '4 dk', false,
    $$Tırnak bakımı artık sadece estetik değil, aynı zamanda kişisel stilin bir yansıması haline geldi. Bu sezonun öne çıkan nail art trendlerine göz atalım.$$,
    $$[
      {"heading": "Sezonun Renk Paleti", "paragraphs": [
        "Toprak tonları, pudra pembesi ve şeffaf 'glazed' bitişler bu sezonun favorileri arasında. Canlı renkler tek bir aksan tırnakla dengelenerek kullanılıyor."
      ]},
      {"heading": "Minimalist Nail Art", "paragraphs": [
        "İnce çizgiler, küçük noktalar ve zarif Fransız manikür varyasyonları, abartılı desenlerin yerini alıyor. Az ama şık detaylar öne çıkıyor."
      ]},
      {"heading": "Tırnak Sağlığını İhmal Etmeyin", "paragraphs": [
        "Trend renkler kadar tırnak sağlığı da önemli. Düzenli kütikül bakımı ve nemlendirme, uzun ömürlü ve sağlıklı bir manikürün temelini oluşturur."
      ]}
    ]$$::jsonb,
    '2026-03-05'
  );

-- Müşteri yorumları
insert into public.testimonials (name, location, service, initials, rating, featured, quote, display_order) values
  ('Selin Arslan', 'İstanbul', 'Medikal Cilt Bakımı', 'SA', 5, true,
    $$Cildim hiç bu kadar canlı görünmemişti. Uzmanların ilgisi ve kullandıkları ürünler gerçekten fark yaratıyor, her seans sonrası aynadan gözümü alamıyorum. Randevu sürecinden seans sonrası bakım önerilerine kadar her detay özenle planlanıyor, kendimi gerçekten değerli hissediyorum.$$,
    1),
  ('Deniz Kaya', 'İstanbul', 'Hydrafacial Anti-Aging', 'DK', 5, false,
    $$Tek seansta bile fark edilir bir parlaklık ve sıkılık hissettim. Roséa'nın samimi ortamı ve profesyonelliği birleşince ideal bir deneyim ortaya çıkıyor.$$,
    2),
  ('Merve Yıldırım', 'İstanbul', 'Keratin & Saç Botoksu', 'MY', 5, false,
    $$Yıllardır yıpranmış saçlarım için denemediğim şey kalmamıştı. Keratin bakımından sonra saçlarım gerçekten ipek gibi oldu, herkese tavsiye ediyorum.$$,
    3),
  ('Aslı Demir', 'İstanbul', 'Microblading Kaş Tasarımı', 'AD', 5, false,
    $$Kaşlarımın formunu birlikte belirledik, sonuç tam istediğim gibi doğal çıktı. Artık makyajsız günlerimde bile kendimden çok daha emin hissediyorum.$$,
    4),
  ('Ece Şahin', 'İstanbul', 'Aromaterapi Spa Masajı', 'EŞ', 5, false,
    $$Haftalar süren yorgunluğumu tek seansta üzerimden attım desem yeridir. Ortamın huzuru ve uzmanın dokunuşu tam bir zihin dinlenmesi sağladı.$$,
    5),
  ('Zehra Koç', 'İstanbul', 'Gelin & Özel Gün Makyajı', 'ZK', 5, false,
    $$Düğünümde makyajım gün boyu hiç bozulmadı, fotoğraflarda muhteşem görünüyorum. Deneme seansında her detayı özenle planladılar, çok teşekkür ederim.$$,
    6);

-- İletişim bilgileri
insert into public.contact_info (id, address, phone, phone_href, email, map_embed_src) values (
  1,
  $$Teşvikiye Mah. Güzellik Sokak No:12, Şişli / İstanbul$$,
  '+90 212 555 01 23',
  'tel:+902125550123',
  'info@roseaguzellik.com',
  'https://www.google.com/maps?q=Te%C5%9Fvikiye+Mahallesi,+%C5%9Ei%C5%9Fli,+%C4%B0stanbul&output=embed'
);

-- Çalışma saatleri
insert into public.business_hours (day_label, time_label, display_order) values
  ('Pazartesi - Cuma', '09:00 - 20:00', 1),
  ('Cumartesi', '10:00 - 19:00', 2),
  ('Pazar', 'Kapalı', 3);

-- Sosyal medya
insert into public.social_links (label, url, icon, display_order) values
  ('Instagram', 'https://instagram.com', 'instagram', 1),
  ('Facebook', 'https://facebook.com', 'facebook', 2),
  ('WhatsApp', 'https://wa.me/902125550123', 'whatsapp', 3);
