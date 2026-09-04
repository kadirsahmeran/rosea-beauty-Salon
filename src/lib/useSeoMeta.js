import { useEffect } from "react";
import { supabase } from "./supabaseClient";

// Panelden girilen sayfa başlığı/açıklamasını <head>'e yazar (seo_meta).
//
// SINIR: burası tarayıcıda çalışır. Google sayfayı çalıştırdığı için bu
// değerleri görür; WhatsApp, Facebook ve X gibi paylaşım önizlemeleri ise
// HTML'i çalıştırmadan okur ve göremez. Paylaşım kartlarının doğru çıkması
// için derleme sırasında prerender gerekir.

function setMeta(selector, attribute, value) {
  let tag = document.head.querySelector(selector);

  if (!value) {
    tag?.remove();
    return;
  }

  if (!tag) {
    tag = document.createElement("meta");
    const [key, name] = attribute;
    tag.setAttribute(key, name);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", value);
}

// "/hizmetler/" → "/hizmetler", "/" → "/"
function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function useSeoMeta(pathname) {
  useEffect(() => {
    let cancelled = false;
    const path = normalizePath(pathname);

    supabase
      .from("seo_meta")
      .select("title, description, og_image_url")
      .eq("path", path)
      .maybeSingle()
      .then(({ data }) => {
        // Kayıt yoksa index.html'deki varsayılanlara dokunmuyoruz.
        if (cancelled || !data) return;

        if (data.title) document.title = data.title;

        setMeta('meta[name="description"]', ["name", "description"], data.description);
        setMeta('meta[property="og:title"]', ["property", "og:title"], data.title);
        setMeta(
          'meta[property="og:description"]',
          ["property", "og:description"],
          data.description,
        );
        setMeta('meta[property="og:image"]', ["property", "og:image"], data.og_image_url);
        setMeta(
          'meta[property="og:url"]',
          ["property", "og:url"],
          window.location.href,
        );
        setMeta(
          'meta[name="twitter:card"]',
          ["name", "twitter:card"],
          data.og_image_url ? "summary_large_image" : "summary",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);
}
