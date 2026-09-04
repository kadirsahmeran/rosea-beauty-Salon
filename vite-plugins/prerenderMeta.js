import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// Derleme sırasında her sayfa için ayrı bir index.html üretir ve içine o
// sayfanın başlık/açıklama/paylaşım görselini gömer.
//
// NEDEN GEREKLİ
// Site tek sayfa uygulaması. useSeoMeta.js meta etiketlerini tarayıcıda
// yazıyor; Google sayfayı çalıştırdığı için bunu görüyor. Ama WhatsApp,
// Facebook ve X paylaşım önizlemeleri HTML'i çalıştırmadan okuyor ve
// hepsinde aynı ana sayfa başlığını görüyorlar. Bir blog yazısı
// paylaşıldığında kartta yazının başlığı çıksın istiyorsak, o başlığın
// HTML'in içinde hazır olması gerekiyor.
//
// NASIL ÇALIŞIYOR
// dist/index.html üretildikten sonra kopyalanıp her adres için ayrı bir
// dosya yazılır:
//
//   dist/index.html                         → /
//   dist/hizmetler/index.html               → /hizmetler
//   dist/blog/kis-cilt-bakimi/index.html    → /blog/kis-cilt-bakimi
//
// Hepsi aynı JS paketini yükler; yalnızca <head> farklıdır. Kullanıcı için
// hiçbir şey değişmez, tarayıcıya inen uygulama aynıdır.
//
// BARINDIRMA KOŞULU
// Sunucu, /hizmetler isteğinde dist/hizmetler/index.html dosyasını
// döndürebilmeli. Netlify, Vercel ve Cloudflare Pages bunu varsayılan
// olarak yapar. Bilinmeyen adresler için SPA geri düşüşü (index.html)
// yine gerekli — randevu sonuç sayfası gibi dinamik adresler var.

const STATIC_ROUTES = [
  "/",
  "/hizmetler",
  "/hakkimizda",
  "/galeri",
  "/blog",
  "/iletisim",
  "/randevu",
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHead({ title, description, image, url }) {
  const tags = [
    `<meta property="og:type" content="website" />`,
    title && `<meta property="og:title" content="${escapeHtml(title)}" />`,
    description &&
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
    image && `<meta property="og:image" content="${escapeHtml(image)}" />`,
    url && `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    title && `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    description &&
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    image && `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ].filter(Boolean);

  return tags.map((tag) => `    ${tag}`).join("\n");
}

function applyMeta(template, page) {
  let html = template;

  if (page.title) {
    html = html.replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escapeHtml(page.title)}</title>`,
    );
  }

  if (page.description) {
    // index.html'de zaten bir description var; sayfaya özel olanla değiştir.
    html = html.replace(
      /<meta\s+name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${escapeHtml(page.description)}" />`,
    );
  }

  return html.replace("</head>", `${buildHead(page)}\n  </head>`);
}

async function collectPages(supabase, siteUrl) {
  const [meta, services, posts] = await Promise.all([
    supabase.from("seo_meta").select("path, title, description, og_image_url"),
    supabase
      .from("services")
      .select("slug, title, description, image_url")
      .eq("is_active", true),
    supabase
      .from("blog_posts")
      .select("slug, title, excerpt, cover_image_url"),
  ]);

  const metaByPath = new Map(
    (meta.data ?? []).map((row) => [row.path, row]),
  );

  const pages = STATIC_ROUTES.map((route) => {
    const row = metaByPath.get(route);
    return {
      route,
      title: row?.title,
      description: row?.description,
      image: row?.og_image_url,
      url: `${siteUrl}${route === "/" ? "" : route}`,
    };
  });

  // Detay sayfalarının başlığı kendi tablosundan gelir; asıl paylaşılan
  // adresler bunlar.
  for (const service of services.data ?? []) {
    pages.push({
      route: `/hizmetler/${service.slug}`,
      title: `${service.title} | Roséa Güzellik Merkezi`,
      description: service.description,
      image: service.image_url,
      url: `${siteUrl}/hizmetler/${service.slug}`,
    });
  }

  for (const post of posts.data ?? []) {
    pages.push({
      route: `/blog/${post.slug}`,
      title: `${post.title} | Roséa Güzellik Merkezi`,
      description: post.excerpt,
      image: post.cover_image_url,
      url: `${siteUrl}/blog/${post.slug}`,
    });
  }

  return pages;
}

export function prerenderMeta() {
  let outDir = "dist";
  let env = {};

  return {
    name: "rosea-prerender-meta",
    apply: "build",

    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      env = config.env ?? {};
    },

    async closeBundle() {
      const url = env.VITE_SUPABASE_URL;
      const key = env.VITE_SUPABASE_ANON_KEY;

      if (!url || !key) {
        this.warn(
          "prerenderMeta: Supabase ortam değişkenleri yok, sayfa meta'ları üretilmedi.",
        );
        return;
      }

      const siteUrl = (env.VITE_SITE_URL ?? "https://roseaguzellik.com").replace(
        /\/$/,
        "",
      );

      try {
        const supabase = createClient(url, key);
        const template = await fs.readFile(
          path.join(outDir, "index.html"),
          "utf8",
        );

        const pages = await collectPages(supabase, siteUrl);

        for (const page of pages) {
          const html = applyMeta(template, page);

          if (page.route === "/") {
            await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
            continue;
          }

          const dir = path.join(outDir, page.route);
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(path.join(dir, "index.html"), html, "utf8");
        }

        console.log(
          `\nprerenderMeta: ${pages.length} sayfa için meta gömüldü.`,
        );
      } catch (error) {
        // Derlemeyi düşürmüyoruz: meta gömülemese de site çalışır, yalnızca
        // paylaşım önizlemeleri genel başlığı gösterir.
        this.warn(`prerenderMeta: ${error.message}`);
      }
    },
  };
}
