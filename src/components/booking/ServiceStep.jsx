import { Clock } from "lucide-react";

export default function ServiceStep({ services, selectedService, onSelect }) {
  return (
    <div>
      <h3 className="text-center font-display text-2xl font-semibold text-ink">
        Hizmet Seçin
      </h3>
      <p className="mt-2 text-center text-sm text-ink/60">
        Randevu almak istediğiniz bakımı seçin.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service)}
            className={`group overflow-hidden rounded-2xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
              selectedService?.id === service.id
                ? "border-blush-500 ring-2 ring-blush-300"
                : "border-blush-100 bg-white hover:border-blush-300"
            }`}
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={service.image}
                alt={service.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blush-600">
                {service.subtitle}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-ink">
                {service.title}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-ink/60">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {service.duration}
                </span>
                <span className="font-semibold text-ink">
                  {service.startingPrice}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
