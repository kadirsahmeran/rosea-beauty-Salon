import { MapPin, Phone, Mail, Clock } from "lucide-react";
import {
  getContactInfo,
  getBusinessHours,
  getSocialLinks,
} from "../lib/queries/contact";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";
import { SectionLoading, SectionError } from "./SectionState";

export default function Contact() {
  const {
    data: contactInfo,
    loading: contactLoading,
    error,
  } = useSupabaseQuery("contact-info", getContactInfo, []);
  const { data: workingHours } = useSupabaseQuery(
    "business-hours",
    getBusinessHours,
    [],
  );
  const { data: socialLinks } = useSupabaseQuery(
    "social-links",
    getSocialLinks,
    [],
  );

  const infoItems = contactInfo
    ? [
        { icon: MapPin, label: "Adres", value: contactInfo.address },
        {
          icon: Phone,
          label: "Telefon",
          value: contactInfo.phone,
          href: contactInfo.phoneHref,
        },
        {
          icon: Mail,
          label: "E-posta",
          value: contactInfo.email,
          href: `mailto:${contactInfo.email}`,
        },
      ]
    : [];

  return (
    <section id="iletisim" className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blush-300/50 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-blush-700 backdrop-blur-sm shadow-sm">
            <span className="text-blush-500">✦</span>
            <span>İletişim</span>
          </div>

          <h2 className="mt-6 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Bize <span className="italic text-blush-600">Ulaşın</span>
          </h2>

          <p className="mt-4 text-base text-ink/75 sm:text-lg">
            Sorularınız için bize yazın veya salonumuzu ziyaret edin, sizi
            ağırlamaktan mutluluk duyarız.
          </p>
        </div>

        {contactLoading && <SectionLoading />}
        {error && <SectionError />}

        {contactInfo && (
          <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
            <div className="flex flex-col rounded-3xl border border-blush-100/80 bg-white p-8 shadow-xl shadow-blush-900/5 sm:p-10">
              <div className="space-y-5">
                {infoItems.map((item) => {
                  const Wrapper = item.href ? "a" : "div";
                  return (
                    <Wrapper
                      key={item.label}
                      href={item.href}
                      className="flex items-start gap-4 rounded-2xl p-2 transition-colors hover:bg-blush-50"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-blush-600">
                        <item.icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-xs font-medium uppercase tracking-wide text-ink/50">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-sm font-medium text-ink">
                          {item.value}
                        </span>
                      </span>
                    </Wrapper>
                  );
                })}
              </div>

              <div className="my-7 h-px bg-blush-100" />

              <div>
                <div className="flex items-center gap-4 px-2">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-blush-600">
                    <Clock className="h-5 w-5" />
                  </span>
                  <span className="block text-xs font-medium uppercase tracking-wide text-ink/50">
                    Çalışma Saatleri
                  </span>
                </div>
                <div className="mt-4 space-y-2 px-2">
                  {(workingHours ?? []).map((item) => (
                    <div
                      key={item.day}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-ink/70">{item.day}</span>
                      <span className="font-medium text-ink">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="my-7 h-px bg-blush-100" />

              <div className="flex items-center gap-3 px-2">
                {(socialLinks ?? []).map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-blush-100 text-blush-600 transition-colors hover:bg-ink hover:text-cream-50"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="min-h-[400px] overflow-hidden rounded-3xl border border-blush-100/80 shadow-xl shadow-blush-900/5">
              <iframe
                src={contactInfo.mapEmbedSrc}
                title="Roséa Güzellik Merkezi Konumu"
                className="h-full min-h-[400px] w-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
