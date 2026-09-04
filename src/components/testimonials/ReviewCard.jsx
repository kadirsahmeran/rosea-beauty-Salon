import { Quote } from "lucide-react";
import Avatar from "./Avatar";
import StarRow from "./StarRow";

export default function ReviewCard({ testimonial, index }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-colors duration-300 hover:border-blush-300/30">
      <StarRow count={testimonial.rating} />
      <Quote
        className="mt-3 h-8 w-8 text-blush-300/25"
        fill="currentColor"
        strokeWidth={0}
        aria-hidden="true"
      />
      <p className="mt-2 flex-1 text-sm font-light italic leading-relaxed text-cream-100/70">
        "{testimonial.text}"
      </p>
      <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
        <Avatar
          testimonial={testimonial}
          index={index}
          size="h-9 w-9 text-[11px]"
        />
        <div>
          <p className="text-sm font-medium tracking-wide text-cream-50">
            {testimonial.name}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-cream-100/45">
            {testimonial.location} · {testimonial.service}
          </p>
        </div>
      </div>
    </div>
  );
}
