import { Quote } from "lucide-react";
import Avatar from "./Avatar";
import StarRow from "./StarRow";

export default function FeaturedCard({ testimonial, index }) {
  const [lead, ...rest] = testimonial.text.split(". ");
  const leadSentence = lead.endsWith(".") ? lead : `${lead}.`;
  const bodyText = rest.join(". ").trim();

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
      <div className="h-px bg-gradient-to-r from-transparent via-blush-400/60 to-transparent" />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="relative flex flex-row items-center justify-between gap-6 border-b border-white/10 bg-white/[0.03] px-6 py-5 lg:flex-col lg:items-stretch lg:border-b-0 lg:border-r lg:px-7 lg:py-8">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-blush-300">
            <span className="h-1 w-1 rounded-full bg-blush-400" />
            Öne Çıkan
          </span>

          <div className="flex items-center gap-4 lg:mt-auto lg:flex-col lg:items-center lg:pt-8">
            <div className="border border-blush-300/25 bg-ink/40 px-4 py-3 text-center lg:w-full lg:py-4">
              <p className="font-display text-2xl font-semibold leading-none text-blush-300">
                {testimonial.rating}.0
              </p>
              <StarRow count={testimonial.rating} className="mt-2 justify-center" />
              <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-cream-100/50">
                Müşteri Puanı
              </p>
            </div>
          </div>

          <span
            className="absolute left-3 top-3 hidden h-3 w-3 border-l border-t border-blush-300/40 lg:block"
            aria-hidden="true"
          />
          <span
            className="absolute bottom-3 right-3 hidden h-3 w-3 border-b border-r border-blush-300/40 lg:block"
            aria-hidden="true"
          />
        </aside>

        <div className="relative px-6 py-7 lg:px-10 lg:py-10">
          <Quote
            className="absolute right-6 top-6 h-14 w-14 text-blush-300/10 lg:right-8 lg:top-8"
            fill="currentColor"
            strokeWidth={0}
            aria-hidden="true"
          />

          <blockquote className="relative max-w-2xl">
            <p className="font-display text-lg italic leading-relaxed text-blush-100 sm:text-xl">
              {leadSentence}
            </p>
            {bodyText && (
              <p className="mt-3 text-sm font-light leading-relaxed text-cream-100/65">
                {bodyText}
                {!bodyText.endsWith(".") && "."}
              </p>
            )}
          </blockquote>

          <footer className="relative mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3">
              <Avatar testimonial={testimonial} index={index} />
              <div>
                <cite className="text-sm font-medium not-italic tracking-wide text-cream-50">
                  {testimonial.name}
                </cite>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-cream-100/50">
                  {testimonial.location} · {testimonial.service}
                </p>
              </div>
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-cream-100/40">
              Doğrulanmış Müşteri
            </p>
          </footer>
        </div>
      </div>
    </article>
  );
}
