import ReactCountUp from "react-countup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { getTestimonials } from "../lib/queries/testimonials";
import { getSiteStats } from "../lib/queries/about";
import { useSupabaseQuery } from "../lib/useSupabaseQuery";
import { SectionLoading, SectionError } from "./SectionState";
import FeaturedCard from "./testimonials/FeaturedCard";
import ReviewCard from "./testimonials/ReviewCard";

const CountUp =
  typeof ReactCountUp === "function" ? ReactCountUp : ReactCountUp.default;

export default function Testimonials() {
  const {
    data: testimonials,
    loading: testimonialsLoading,
    error: testimonialsError,
  } = useSupabaseQuery("testimonials", getTestimonials, []);
  const { data: stats, loading: statsLoading } = useSupabaseQuery(
    "site-stats:testimonials",
    () => getSiteStats("testimonials"),
    [],
  );

  const loading = testimonialsLoading || statsLoading;
  const featured = testimonials
    ? (testimonials.find((t) => t.featured) ?? testimonials[0])
    : null;
  const others = testimonials
    ? testimonials.filter((t) => t !== featured)
    : [];

  return (
    <section
      id="yorumlar"
      className="relative overflow-hidden bg-ink py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/3 rounded-full bg-blush-600/20 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-blush-300">
            Müşterilerimiz Ne Diyor
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-cream-50 sm:text-5xl">
            Sizden Gelen{" "}
            <span className="font-normal italic text-blush-300">
              Işıltılı Yorumlar
            </span>
          </h2>
        </div>

        {loading && <SectionLoading />}
        {testimonialsError && <SectionError />}

        {stats && (
          <div className="mt-12 grid grid-cols-2 divide-x divide-y divide-white/10 border border-white/10 lg:grid-cols-4 lg:divide-y-0">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-6 text-center">
                <p className="font-display text-3xl font-semibold leading-none text-blush-300">
                  <CountUp
                    end={stat.end}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    duration={2.5}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                </p>
                <p className="mt-2 text-[9px] font-light uppercase tracking-[0.22em] text-cream-100/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {testimonials && featured && (
          <>
            <div className="mt-12 hidden space-y-4 lg:block">
              <FeaturedCard testimonial={featured} index={0} />
              <div className="grid grid-cols-2 gap-4">
                {others.slice(0, 2).map((testimonial, i) => (
                  <ReviewCard
                    key={testimonial.name}
                    testimonial={testimonial}
                    index={i + 1}
                  />
                ))}
              </div>
            </div>

            <div className="mt-12 lg:hidden">
              <Swiper
                modules={[Autoplay, Pagination]}
                slidesPerView={1}
                spaceBetween={16}
                autoplay={{ delay: 4500, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                breakpoints={{ 640: { slidesPerView: 2 } }}
                className="testimonials-swiper !pb-12"
              >
                {testimonials.map((testimonial, index) => (
                  <SwiperSlide key={testimonial.name} className="h-auto pb-1">
                    {testimonial.featured ? (
                      <FeaturedCard testimonial={testimonial} index={index} />
                    ) : (
                      <ReviewCard testimonial={testimonial} index={index} />
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
