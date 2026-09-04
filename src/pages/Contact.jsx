import { MapPin, Phone, Mail, Share2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { SectionLoading, SectionError } from "../components/SectionState";
import {
  getContactInfo,
  getBusinessHours,
  getSocialLinks,
} from "../lib/queries/contact";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";

const HEADER_IMAGE =
  "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1600&auto=format&fit=crop";

export default function Contact() {
  const {
    data: contactInfo,
    loading,
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
    <>
      <title>İletişim | Roséa Güzellik Merkezi</title>
      <meta
        name="description"
        content="Roséa Güzellik Merkezi ile iletişime geçin. Adresimiz, telefon numaramız, e-posta adresimiz ve çalışma saatlerimiz için bu sayfayı ziyaret edin."
      />

      <PageHeader
        title="İletişim"
        subtitle="Sorularınız için bize ulaşın veya salonumuzu ziyaret edin, sizi ağırlamaktan mutluluk duyarız."
        breadcrumb={[{ label: "Anasayfa", to: "/" }, { label: "İletişim" }]}
        image={HEADER_IMAGE}
      />

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {loading && <SectionLoading />}
          {error && <SectionError />}

          {contactInfo && (
            <>
              <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
                <div className="flex flex-col gap-6 lg:col-span-2">
                  {infoItems.map((item) => {
                    const Wrapper = item.href ? "a" : "div";
                    return (
                      <Wrapper
                        key={item.label}
                        href={item.href}
                        className="flex items-start gap-4 rounded-2xl border border-blush-100/80 bg-white p-6 shadow-lg shadow-blush-900/5 transition-colors hover:border-blush-300"
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

                  <div className="rounded-2xl border border-blush-100/80 bg-white p-6 shadow-lg shadow-blush-900/5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-blush-600">
                        <Share2 className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-medium uppercase tracking-wide text-ink/50">
                        Bizi Takip Edin
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      {(socialLinks ?? []).map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-blush-100 text-blush-600 transition-colors hover:bg-ink hover:text-cream-50"
                        >
                          <social.icon className="h-5 w-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="min-h-[420px] overflow-hidden rounded-3xl border border-blush-100/80 shadow-xl shadow-blush-900/5 lg:col-span-3">
                  <iframe
                    src={contactInfo.mapEmbedSrc}
                    title="Roséa Güzellik Merkezi Konumu"
                    className="h-full min-h-[420px] w-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="mt-8 grid gap-6 rounded-3xl border border-blush-100/80 bg-white p-8 shadow-lg shadow-blush-900/5 sm:grid-cols-3 sm:p-10">
                {(workingHours ?? []).map((item) => (
                  <div key={item.day} className="text-center sm:text-left">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
                      {item.day}
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold text-ink">
                      {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
