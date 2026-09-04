import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { getFeaturedServices } from "../lib/queries/services";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";
import ServiceCard from "./ServiceCard";
import { SectionLoading, SectionError } from "./SectionState";

export default function ServicesPreview() {
  const {
    data: featuredServices,
    loading,
    error,
  } = useSupabaseQuery("featured-services", getFeaturedServices, []);

  return (
    <section className="relative py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-125 w-full max-w-7xl -translate-x-1/2 rounded-full bg-blush-100/30 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blush-300/50 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-blush-700 backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blush-500" />
            <span>Ritüellerimiz & Bakımlarımız</span>
          </div>

          <h2 className="mt-6 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Sizin İçin Özenle Hazırlanan <br />
            <span className="italic text-blush-600">Özel Hizmetlerimiz</span>
          </h2>

          <p className="mt-4 text-base text-ink/75 sm:text-lg">
            Roséa'da her bakım, cildinizin ve ruhunuzun ihtiyaçlarına özel
            olarak en kaliteli ürünler ve uzman dokunuşlarla uygulanır.
          </p>
        </div>

        {loading && <SectionLoading />}
        {error && <SectionError />}

        {featuredServices && (
          <>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                to="/hizmetler"
                className="inline-flex items-center gap-3 rounded-full bg-ink px-9 py-4 text-sm font-semibold text-cream-50 shadow-lg shadow-ink/10 transition-all duration-300 hover:bg-blush-600 hover:shadow-xl hover:shadow-blush-600/20"
              >
                <span>Tüm Hizmetlerimizi ve Fiyatları İnceleyin</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
