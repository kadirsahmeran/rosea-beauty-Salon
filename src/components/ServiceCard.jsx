import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";

export default function ServiceCard({ service }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-blush-100/80 bg-white shadow-xl shadow-blush-900/5 transition-all duration-500 hover:-translate-y-1.5 hover:border-blush-300 hover:shadow-2xl hover:shadow-blush-900/10">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink/5">
        <img
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

        {service.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blush-700 backdrop-blur-md shadow-sm">
            Popüler Seçim
          </span>
        )}

        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1 text-xs text-cream-50 backdrop-blur-md">
          <Clock className="h-3.5 w-3.5 text-blush-300" />
          <span>{service.duration}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
        <div>
          <span className="text-xs font-semibold text-blush-600 tracking-wide uppercase">
            {service.subtitle}
          </span>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink transition-colors group-hover:text-blush-600">
            {service.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink/70 line-clamp-2">
            {service.description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-blush-100/60 pt-4">
          <div>
            <span className="block text-[11px] text-ink/50 uppercase font-medium">
              Başlangıç
            </span>
            <span className="text-lg font-bold text-ink">
              {service.startingPrice}
            </span>
          </div>

          <Link
            to={`/hizmetler/${service.id}`}
            className="group/btn inline-flex items-center gap-1.5 text-xs font-semibold text-blush-600 transition-colors hover:text-blush-700"
          >
            <span>İncele</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
