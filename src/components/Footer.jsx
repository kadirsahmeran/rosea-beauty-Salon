import { Link, useLocation } from "react-router-dom";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { getContactInfo, getSocialLinks } from "../lib/queries/contact";
import { getFeaturedServices } from "../lib/queries/services";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";

const quickLinks = [
  { label: "Anasayfa", to: "/" },
  { label: "Hizmetler", to: "/hizmetler" },
  { label: "Hakkımızda", to: "/hakkimizda" },
  { label: "Galeri", to: "/galeri" },
  { label: "Blog", to: "/blog" },
  { label: "İletişim", to: "/iletisim" },
];

export default function Footer() {
  const { pathname } = useLocation();
  const { data: contactInfo } = useSupabaseQuery(
    "contact-info",
    getContactInfo,
    [],
  );
  const { data: socialLinks } = useSupabaseQuery(
    "social-links",
    getSocialLinks,
    [],
  );
  const { data: featuredServices } = useSupabaseQuery(
    "featured-services",
    getFeaturedServices,
    [],
  );

  const footerServices = (featuredServices ?? []).slice(0, 4);

  return (
    <footer className="bg-ink text-cream-100">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:gap-10">
          <div>
            <Link to="/" className="flex items-baseline gap-2">
              <span className="font-display text-2xl tracking-wide text-cream-50">
                Roséa
              </span>
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-blush-300">
                Güzellik Merkezi
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-100/60">
              2013'ten bu yana İstanbul'da saç bakımı, cilt bakımı, makyaj ve
              spa hizmetlerinde uzman ellerin dokunuşunu sunuyoruz.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {(socialLinks ?? []).map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-cream-100/70 transition-colors hover:bg-blush-500 hover:text-white"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cream-50">
              Hızlı Erişim
            </h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => {
                const active =
                  link.to === "/"
                    ? pathname === "/"
                    : pathname === link.to || pathname.startsWith(`${link.to}/`);

                return (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      aria-current={active ? "page" : undefined}
                      className={`text-sm transition-colors ${
                        active
                          ? "font-medium text-blush-300"
                          : "text-cream-100/65 hover:text-blush-300"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cream-50">
              Hizmetlerimiz
            </h3>
            <ul className="mt-5 space-y-3">
              {footerServices.map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/hizmetler/${service.id}`}
                    className="text-sm text-cream-100/65 transition-colors hover:text-blush-300"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/hizmetler"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blush-300 transition-colors hover:text-blush-200"
                >
                  Tümünü Gör
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cream-50">
              İletişim
            </h3>
            {contactInfo && (
              <ul className="mt-5 space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blush-300" />
                  <span className="text-sm text-cream-100/65">
                    {contactInfo.address}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-blush-300" />
                  <a
                    href={contactInfo.phoneHref}
                    className="text-sm text-cream-100/65 transition-colors hover:text-blush-300"
                  >
                    {contactInfo.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-blush-300" />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-sm text-cream-100/65 transition-colors hover:text-blush-300"
                  >
                    {contactInfo.email}
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-cream-100/45">
            © {new Date().getFullYear()} Roséa Güzellik Merkezi. Tüm hakları
            saklıdır.
          </p>
          <p className="text-xs text-cream-100/45">
            Özenle tasarlandı, sevgiyle işletiliyor.
          </p>
        </div>
      </div>
    </footer>
  );
}
