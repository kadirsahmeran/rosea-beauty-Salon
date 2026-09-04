import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import BookingWizard from "../components/booking/BookingWizard";

const HEADER_IMAGE =
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=1600&auto=format&fit=crop";

export default function Booking() {
  const [searchParams] = useSearchParams();
  const initialServiceSlug = searchParams.get("hizmet");

  return (
    <>
      <title>Online Randevu | Roséa Güzellik Merkezi</title>
      <meta
        name="description"
        content="Roséa Güzellik Merkezi'nde online randevu alın. Hizmet, uzman, tarih ve saati seçerek kolayca rezervasyon oluşturun."
      />

      <PageHeader
        title="Online Randevu"
        subtitle="Hizmetinizi seçin, uzmanınızı belirleyin ve size uygun bir tarihte randevunuzu oluşturun."
        breadcrumb={[
          { label: "Anasayfa", to: "/" },
          { label: "Randevu Al" },
        ]}
        image={HEADER_IMAGE}
      />

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <BookingWizard initialServiceSlug={initialServiceSlug} />
        </div>
      </section>
    </>
  );
}
