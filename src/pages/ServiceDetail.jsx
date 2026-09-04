import { useParams, Link } from "react-router-dom";
import { Clock, Tag, Check, ArrowLeft } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { SectionLoading } from "../components/SectionState";
import { getServiceBySlug } from "../lib/queries/services";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";

export default function ServiceDetail() {
  const { id } = useParams();
  const {
    data: service,
    loading,
    error,
  } = useSupabaseQuery(`service:${id}`, () => getServiceBySlug(id), [id]);

  if (loading) {
    return (
      <>
        <div className="h-32 w-full bg-ink" aria-hidden="true" />
        <SectionLoading className="py-32" />
      </>
    );
  }

  if (error || !service) {
    return (
      <>
        <div className="h-32 w-full bg-ink" aria-hidden="true" />
        <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
          <p className="font-display text-6xl font-semibold text-blush-500">
            404
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
            Hizmet Bulunamadı
          </h1>
          <p className="mt-3 text-ink/70">
            Aradığınız hizmet kaldırılmış veya adresi değişmiş olabilir.
          </p>
          <Link
            to="/hizmetler"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream-50 transition hover:bg-blush-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Tüm Hizmetlere Dön
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <title>{`${service.title} | Roséa Güzellik Merkezi`}</title>
      <meta name="description" content={service.description} />

      <PageHeader
        title={service.title}
        subtitle={service.subtitle}
        breadcrumb={[
          { label: "Anasayfa", to: "/" },
          { label: "Hizmetler", to: "/hizmetler" },
          { label: service.title },
        ]}
        image={service.image}
      />

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                Hizmet Hakkında
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink/75 sm:text-lg">
                {service.longDescription}
              </p>

              <ul className="mt-8 space-y-3">
                {service.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blush-100 text-blush-600">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-ink/80">{highlight}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/hizmetler"
                className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-blush-600 transition hover:text-blush-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Tüm Hizmetlere Dön
              </Link>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-3xl border border-blush-100/80 bg-white p-7 shadow-xl shadow-blush-900/5">
                <div className="flex items-center justify-between border-b border-blush-100/60 pb-4">
                  <span className="flex items-center gap-2 text-sm text-ink/60">
                    <Clock className="h-4 w-4 text-blush-500" />
                    Süre
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {service.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-blush-100/60 py-4">
                  <span className="flex items-center gap-2 text-sm text-ink/60">
                    <Tag className="h-4 w-4 text-blush-500" />
                    Başlangıç Fiyatı
                  </span>
                  <span className="text-lg font-bold text-ink">
                    {service.startingPrice}
                  </span>
                </div>

                <Link
                  to={`/randevu?hizmet=${service.id}`}
                  className="mt-6 flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream-50 shadow-lg shadow-ink/10 transition hover:bg-blush-600"
                >
                  Randevu Al
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
