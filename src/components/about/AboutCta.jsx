import { Link } from "react-router-dom";

export default function AboutCta() {
  return (
    <section className="py-16 text-center lg:py-20">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          Roséa Ayrıcalığını Yaşamaya Hazır Mısınız?
        </h2>
        <p className="mt-4 text-base text-ink/75 sm:text-lg">
          Hizmetlerimizi keşfedin veya hemen randevunuzu oluşturun.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/hizmetler"
            className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-cream-50 shadow-lg shadow-ink/10 transition hover:bg-blush-600"
          >
            Hizmetlerimizi Keşfedin
          </Link>
          <Link
            to="/randevu"
            className="rounded-full border border-ink/15 px-8 py-3.5 text-sm font-semibold text-ink transition hover:border-blush-300 hover:text-blush-600"
          >
            Randevu Al
          </Link>
        </div>
      </div>
    </section>
  );
}
