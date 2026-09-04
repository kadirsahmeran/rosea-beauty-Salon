import { Link } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Clock,
  Home,
  Hourglass,
  Phone,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { APPOINTMENT_STATUS, PAYMENT_STATUS } from "./constants";
import {
  formatDateDisplay,
  formatPrice,
  formatTime,
  shortRef,
} from "./format";
import DetailCard from "./DetailCard";
import StatusCard from "./StatusCard";

export default function BookingConfirmation({
  confirmed,
  service,
  specialist,
  customerName,
  customerPhone,
  appointmentStatus = "pending",
  paymentStatus = "unpaid",
  onNewBooking,
}) {
  const paid = paymentStatus === "paid";
  const appointmentMeta =
    APPOINTMENT_STATUS[appointmentStatus] ?? APPOINTMENT_STATUS.pending;
  const paymentMeta = PAYMENT_STATUS[paymentStatus] ?? PAYMENT_STATUS.unpaid;

  const nextSteps = paid
    ? [
        "Ödemeniz alındı ve randevunuz onaylandı.",
        "Gerekirse ekibimiz sizinle telefon veya SMS ile iletişime geçecek.",
        "Randevu gününüzde 10 dakika erken gelmenizi rica ederiz.",
      ]
    : [
        "Randevunuz şu an beklemede; ödeme alınana kadar bu statüde kalır.",
        "Ekibimiz sizinle iletişime geçerek ödemeyi ve onayı tamamlayacak.",
        "Randevu gününüzde 10 dakika erken gelmenizi rica ederiz.",
      ];

  return (
    <div className="relative mx-auto max-w-2xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-6 -top-10 -bottom-6 -z-10 rounded-[3rem] bg-gradient-to-b from-blush-100/60 via-blush-50/30 to-transparent blur-2xl"
      />

      <div className="overflow-hidden rounded-[2rem] border border-blush-100/90 bg-white shadow-2xl shadow-blush-900/10">
        <div className="relative overflow-hidden bg-gradient-to-br from-ink via-ink to-blush-900 px-8 py-12 text-center sm:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blush-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-blush-300/10 blur-2xl"
          />

          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-blush-400/20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blush-300 to-blush-600 text-cream-50 shadow-lg shadow-blush-900/30">
                {paid ? (
                  <Check className="h-7 w-7 stroke-[2.5]" />
                ) : (
                  <Hourglass className="h-7 w-7 stroke-[2.5]" />
                )}
              </div>
            </div>
          </div>

          <div className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-blush-200 uppercase backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {paid ? "Rezervasyon Onaylandı" : "Rezervasyon Alındı"}
          </div>

          <h2 className="relative mt-5 font-display text-3xl font-semibold text-cream-50 sm:text-4xl">
            Randevunuz{" "}
            <span className="italic text-blush-300">
              {paid ? "Onaylandı" : "Oluşturuldu"}
            </span>
          </h2>

          <p className="relative mt-3 text-sm leading-relaxed text-cream-100/75 sm:text-base">
            Teşekkürler{customerName ? `, ${customerName.split(" ")[0]}` : ""}!
            {paid
              ? " Güzellik ritüeliniz için sizi ağırlamaktan mutluluk duyacağız."
              : " Ödeme tamamlanana kadar randevunuz beklemede kalacaktır."}
          </p>
        </div>

        <div className="relative px-6 py-2 sm:px-10">
          <div
            aria-hidden="true"
            className="absolute inset-x-8 top-0 flex -translate-y-1/2 justify-between sm:inset-x-12"
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="h-4 w-4 rounded-full bg-cream-50 shadow-[inset_0_0_0_1px_rgba(238,171,192,0.35)]"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6 px-6 pb-8 pt-4 sm:px-10 sm:pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-blush-200 bg-blush-50/40 px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-ink/40 uppercase">
                Rezervasyon No
              </p>
              <p className="mt-1 font-display text-xl font-semibold tracking-wide text-ink">
                #{shortRef(confirmed.id)}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatusCard
              icon={Hourglass}
              label="Randevu Durumu"
              value={appointmentMeta.label}
              detail={appointmentMeta.detail}
              className={appointmentMeta.className}
            />
            <StatusCard
              icon={Wallet}
              label="Ödeme Durumu"
              value={paymentMeta.label}
              detail={paymentMeta.detail}
              className={paymentMeta.className}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailCard
              icon={Sparkles}
              label="Hizmet"
              value={service.title}
              sub={service.subtitle}
            />
            <DetailCard
              icon={User}
              label="Uzmanınız"
              value={specialist.name}
              sub={specialist.role}
              image={specialist.image}
            />
            <DetailCard
              icon={CalendarDays}
              label="Tarih"
              value={formatDateDisplay(confirmed.date)}
            />
            <DetailCard
              icon={Clock}
              label="Saat"
              value={`${formatTime(confirmed.startTime)} – ${formatTime(confirmed.endTime)}`}
              sub={service.duration}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-blush-100 bg-gradient-to-r from-white to-blush-50/60 px-5 py-4">
            <span className="text-sm text-ink/60">
              {paid ? "Ödenen Tutar" : "Ödenecek Tutar"}
            </span>
            <span className="font-display text-2xl font-semibold text-blush-700">
              {formatPrice(service.priceAmount)}
            </span>
          </div>

          <div className="rounded-2xl border border-blush-100/80 bg-cream-50/80 p-5">
            <p className="text-xs font-semibold tracking-widest text-blush-600 uppercase">
              Sırada Ne Var?
            </p>
            <ul className="mt-4 space-y-3">
              {nextSteps.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink/70">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blush-100 text-[10px] font-bold text-blush-600">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {customerPhone && (
            <div className="flex items-center gap-3 rounded-2xl border border-blush-100 px-5 py-4 text-sm text-ink/70">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-100 text-blush-600">
                <Phone className="h-4 w-4" />
              </span>
              <p>
                İletişim numaranız{" "}
                <span className="font-medium text-ink">{customerPhone}</span>{" "}
                olarak kaydedildi.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              to="/"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/10 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-blush-300 hover:text-blush-600"
            >
              <Home className="h-4 w-4" />
              Anasayfaya Dön
            </Link>
            {onNewBooking ? (
              <button
                type="button"
                onClick={onNewBooking}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-cream-50 shadow-lg shadow-ink/10 transition hover:bg-blush-600 hover:shadow-blush-600/20"
              >
                <Sparkles className="h-4 w-4" />
                Yeni Randevu Al
              </button>
            ) : (
              <Link
                to="/randevu"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-cream-50 shadow-lg shadow-ink/10 transition hover:bg-blush-600 hover:shadow-blush-600/20"
              >
                <Sparkles className="h-4 w-4" />
                Yeni Randevu Al
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
