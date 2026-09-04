import { useState } from "react";
import PageHeader from "../components/PageHeader";
import ServiceCard from "../components/ServiceCard";
import { SectionLoading, SectionError } from "../components/SectionState";
import { getServiceCategories, getServices } from "../lib/queries/services";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";

const HEADER_IMAGE =
  "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1600&auto=format&fit=crop";

const ALL_TAB = { id: "hepsi", name: "Tüm Hizmetler" };

export default function Services() {
  const [activeTab, setActiveTab] = useState("hepsi");

  const { data: dbCategories, loading: categoriesLoading } = useSupabaseQuery(
    "service-categories",
    getServiceCategories,
    [],
  );
  const {
    data: services,
    loading: servicesLoading,
    error,
  } = useSupabaseQuery("services", getServices, []);

  const categories = dbCategories ? [ALL_TAB, ...dbCategories] : [ALL_TAB];
  const filteredServices =
    !services || activeTab === "hepsi"
      ? services
      : services.filter((service) => service.category === activeTab);

  const loading = categoriesLoading || servicesLoading;

  return (
    <>
      <title>Hizmetlerimiz | Roséa Güzellik Merkezi</title>
      <meta
        name="description"
        content="Roséa Güzellik Merkezi'nin cilt bakımı, saç tasarımı, kalıcı makyaj ve spa & masaj hizmetlerinin tamamını keşfedin, süre ve fiyat bilgisine ulaşın."
      />

      <PageHeader
        title="Hizmetlerimiz"
        subtitle="Cildinize, saçınıza ve ruhunuza özel hazırlanan tüm ritüellerimizi keşfedin."
        breadcrumb={[{ label: "Anasayfa", to: "/" }, { label: "Hizmetler" }]}
        image={HEADER_IMAGE}
      />

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`cursor-pointer rounded-full px-5 py-2.5 text-xs font-medium transition-all duration-300 sm:text-sm ${
                  activeTab === category.id
                    ? "scale-105 bg-ink text-cream-50 shadow-lg shadow-ink/10"
                    : "border border-blush-100 bg-white/80 text-ink/70 hover:bg-blush-100/60 hover:text-ink"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {loading && <SectionLoading />}
          {error && <SectionError />}

          {filteredServices && (
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
