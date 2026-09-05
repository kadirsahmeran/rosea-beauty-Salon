import { Link } from "react-router-dom";

const HERO_VIDEO = "https://assets.mixkit.co/videos/52159/52159-720.mp4";
const HERO_POSTER =
  "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1600&auto=format&fit=crop";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden">
      <video
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/70 via-transparent to-ink/10"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-32 lg:px-8">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-cream-50 backdrop-blur">
            <span aria-hidden="true">✦</span>
            İstanbul'un Güvenilir Güzellik Adresi
          </div>

          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.1] text-cream-50 sm:text-6xl">
            Güzelliğiniz İçin{" "}
            <span className="italic text-blush-300">Uzman Dokunuşu</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-cream-100/85">
            Roséa Güzellik Merkezi'nde saç bakımından cilt bakımına,
            makyajdan spa ritüellerine kadar geniş hizmet yelpazemizle
            kendinize hak ettiğiniz özeni gösterin.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/randevu"
              className="inline-flex items-center gap-2 rounded-full bg-cream-50 px-8 py-3.5 text-sm font-medium text-ink shadow-lg shadow-ink/20 transition hover:bg-blush-100"
            >
              Randevu Al
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M4 10h12m0 0l-5-5m5 5l-5 5"
                />
              </svg>
            </Link>
            <Link
              to="/hizmetler"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-3.5 text-sm font-medium text-cream-50 backdrop-blur transition hover:border-blush-300 hover:text-blush-300"
            >
              Hizmetleri Keşfedin
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 hidden justify-center sm:flex">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6 animate-bounce text-cream-50/70"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </section>
  );
}
