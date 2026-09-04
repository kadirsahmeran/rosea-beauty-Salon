import PageHeader from "../components/PageHeader";
import MasonryGallery from "../components/MasonryGallery";
import { SectionLoading, SectionError } from "../components/SectionState";
import { getGalleryImages } from "../lib/queries/gallery";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";

const HEADER_IMAGE =
  "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1600&auto=format&fit=crop";

export default function Gallery() {
  const {
    data: galleryImages,
    loading,
    error,
  } = useSupabaseQuery("gallery-images", getGalleryImages, []);

  return (
    <>
      <title>Galeri | Roséa Güzellik Merkezi</title>
      <meta
        name="description"
        content="Roséa Güzellik Merkezi'nin salon içi, hizmet ve uygulama fotoğraflarından oluşan galerisini keşfedin."
      />

      <PageHeader
        title="Galeri"
        subtitle="Salonumuzdan ve uygulamalarımızdan kareler. Bir görsele tıklayarak büyütebilirsiniz."
        breadcrumb={[{ label: "Anasayfa", to: "/" }, { label: "Galeri" }]}
        image={HEADER_IMAGE}
      />

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {loading && <SectionLoading />}
          {error && <SectionError />}
          {galleryImages && <MasonryGallery images={galleryImages} />}
        </div>
      </section>
    </>
  );
}
