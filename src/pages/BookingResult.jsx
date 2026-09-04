import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, CircleX } from "lucide-react";
import BookingConfirmation from "../components/booking/BookingConfirmation";
import { getPaymentStatus } from "../lib/queries/payment";
import { SectionError, SectionLoading } from "../components/SectionState";

export default function BookingResult() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("id");
  const durum = searchParams.get("durum");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(Boolean(appointmentId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!appointmentId) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function load(retryPending) {
      try {
        const data = await getPaymentStatus(appointmentId, {
          cancel: durum === "basarisiz",
        });
        if (cancelled) return;

        if (retryPending && data.paymentStatus === "pending") {
          window.setTimeout(() => {
            if (!cancelled) load(false);
          }, 2000);
          return;
        }

        setBooking(mapStatusToBooking(data));
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Randevu sonucu alınamadı.");
        setLoading(false);
      }
    }

    load(true);
    return () => {
      cancelled = true;
    };
  }, [appointmentId, durum]);

  const failed = booking
    ? booking.paymentStatus === "failed" ||
      booking.appointmentStatus === "cancelled"
    : durum === "basarisiz";

  return (
    <>
      <title>Randevu Sonucu | Roséa Güzellik Merkezi</title>
      <meta
        name="description"
        content="Roséa Güzellik Merkezi randevu sonucunuz."
      />

      <section className="min-h-[calc(100vh-5.5rem)] bg-cream-100 py-12 lg:py-16">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          {loading ? (
            <SectionLoading />
          ) : error ? (
            <SectionError message={error} />
          ) : failed ? (
            <PaymentFailed />
          ) : booking ? (
            <BookingConfirmation
              confirmed={booking.confirmed}
              service={booking.service}
              specialist={booking.specialist}
              customerName={booking.customerName}
              customerPhone={booking.customerPhone}
              appointmentStatus={booking.appointmentStatus}
              paymentStatus={booking.paymentStatus}
            />
          ) : (
            <EmptyResult />
          )}
        </div>
      </section>
    </>
  );
}

function mapStatusToBooking(data) {
  return {
    confirmed: {
      id: data.id,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
    },
    service: {
      title: data.service?.title ?? "Hizmet",
      subtitle: data.service?.subtitle,
      duration: data.service?.duration,
      priceAmount: data.priceAmount ?? data.service?.priceAmount,
    },
    specialist: {
      name: data.specialist?.name ?? "Uzman",
      role: data.specialist?.role,
      image: data.specialist?.image,
    },
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    appointmentStatus: data.status ?? "pending",
    paymentStatus: data.paymentStatus ?? "pending",
  };
}

function PaymentFailed() {
  return (
    <div className="rounded-[2rem] border border-blush-100 bg-white px-8 py-14 text-center shadow-xl shadow-blush-900/5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <CircleX className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
        Ödeme tamamlanamadı
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">
        Kart işlemi onaylanmadı veya iptal edildi. Randevunuz oluşturulmadı;
        seçtiğiniz saat yeniden açıldı. İsterseniz tekrar deneyebilirsiniz.
      </p>
      <Link
        to="/randevu"
        className="mt-8 inline-flex rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-cream-50 transition hover:bg-blush-600"
      >
        Tekrar Dene
      </Link>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="rounded-[2rem] border border-blush-100 bg-white px-8 py-14 text-center shadow-xl shadow-blush-900/5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blush-50 text-blush-600">
        <CalendarDays className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
        Randevu bilgisi bulunamadı
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">
        Bu sayfa ödeme işleminden sonra açılır. Yeni bir rezervasyon
        başlatabilirsiniz.
      </p>
      <Link
        to="/randevu"
        className="mt-8 inline-flex rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-cream-50 transition hover:bg-blush-600"
      >
        Randevu Al
      </Link>
    </div>
  );
}
