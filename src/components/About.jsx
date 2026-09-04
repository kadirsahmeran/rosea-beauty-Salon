// Swiper React bileşenleri
import { Swiper, SwiperSlide } from "swiper/react";
// Swiper modülleri
import { EffectCards, Autoplay, Pagination } from "swiper/modules";

// Swiper stilleri (Vite veya Next.js projelerinde gereklidir)
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";

import { Link } from "react-router-dom";
import { getHomeAboutFeatures, getHomeAboutSlides } from "../lib/queries/about";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";
import { SectionLoading, SectionError } from "./SectionState";

function SparkleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414M18.364 18.364l-1.414-1.414M7.05 7.05L5.636 5.636"
      />
    </svg>
  );
}

export default function About() {
  const {
    data: features,
    loading: featuresLoading,
    error,
  } = useSupabaseQuery("home-about-features", getHomeAboutFeatures, []);
  const { data: slides, loading: slidesLoading } = useSupabaseQuery(
    "home-about-slides",
    getHomeAboutSlides,
    [],
  );

  const loading = featuresLoading || slidesLoading;

  return (
    <section
      id="hakkimizda"
      className="relative overflow-hidden py-20 lg:py-24"
    >
      {/* Arka Plan Dekoratif Işık Efektleri (Ambient Glow) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-blush-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/4 -z-10 h-80 w-80 rounded-full bg-blush-100/50 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {loading && <SectionLoading />}
        {error && <SectionError />}

        {features && slides && (
          <div className="grid gap-16 lg:grid-cols-12 lg:items-center lg:gap-12">
            {/* Sol Kolon: Şık Metinler ve Detaylar */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blush-300/50 bg-blush-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-blush-700 backdrop-blur-sm">
                <span className="text-blush-500">✦</span>
                <span>Roséa Ayrıcalığı</span>
              </div>

              <h2 className="mt-6 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:leading-[1.15]">
                Güzelliğinizi Sanata, <br className="hidden sm:block" />
                Bakımınızı{" "}
                <span className="relative inline-block italic text-blush-600">
                  Rituele Dönüştürüyoruz
                  <svg
                    className="absolute -bottom-2 left-0 h-3 w-full text-blush-200"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <path
                      d="M0 15 Q 50 0 100 15"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                  </svg>
                </span>
              </h2>

              <p className="mt-6 text-base text-ink/75 leading-relaxed sm:text-lg">
                2013'ten bu yana Roséa Güzellik Merkezi'nde; yenilikçi
                teknolojiler ve tutkulu uzman kadromuzla cildinize ve
                ruhunuza hak ettiği özeni gösteriyoruz. Her detayda zarafet
                ve konforu hissedeceksiniz.
              </p>

              {/* Özellik Listesi Kartları */}
              <div className="mt-8 space-y-4">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-4 rounded-2xl border border-blush-100/80 bg-white/60 p-4 transition-all duration-300 hover:border-blush-300 hover:bg-white hover:shadow-md hover:shadow-blush-900/5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blush-100 text-blush-600 transition-colors group-hover:bg-blush-600 group-hover:text-white">
                      <SparkleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink text-sm sm:text-base">
                        {feature.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-ink/65 sm:text-sm">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buton Linki */}
              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Link
                  to="/randevu"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream-50 transition-all hover:bg-blush-600 shadow-lg shadow-ink/10"
                >
                  <span>Randevu Oluşturun</span>
                </Link>
                <Link
                  to="/hakkimizda"
                  className="text-sm font-semibold text-blush-600 transition hover:text-blush-700"
                >
                  Hakkımızda Daha Fazlası →
                </Link>
              </div>
            </div>

            {/* Sağ Kolon: Swiper Cards Slider */}
            <div className="relative flex justify-center lg:col-span-6">
              <div className="absolute top-1/2 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blush-300/30 blur-2xl" />

              <div className="w-full max-w-[320px] sm:max-w-95 lg:max-w-[400px]">
                <Swiper
                  effect={"cards"}
                  grabCursor={true}
                  modules={[EffectCards, Autoplay, Pagination]}
                  autoplay={{
                    delay: 3500,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true,
                  }}
                  className="about-cards-swiper h-[460px] w-full rounded-3xl"
                >
                  {slides.map((slide, index) => (
                    <SwiperSlide
                      key={index}
                      className="relative overflow-hidden rounded-3xl border border-white/20 bg-ink shadow-2xl shadow-blush-900/20"
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />

                      <div className="absolute bottom-6 left-6 right-6 text-cream-50">
                        <span className="inline-block rounded-full bg-blush-500/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                          {slide.tag}
                        </span>
                        <h4 className="mt-2 font-display text-xl font-semibold">
                          {slide.title}
                        </h4>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
