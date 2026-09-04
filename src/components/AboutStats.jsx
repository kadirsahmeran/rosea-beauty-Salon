import ReactCountUp from "react-countup";

// react-countup'ın CJS derlemesi Vite'ın bağımlılık optimizasyonunda
// default export'u çift sarmalıyor, bu yüzden savunmacı şekilde açıyoruz.
const CountUp =
  typeof ReactCountUp === "function" ? ReactCountUp : ReactCountUp.default;

const DEFAULT_BG =
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1920&auto=format&fit=crop";

export default function AboutStats({ stats, image = DEFAULT_BG }) {
  return (
    <div className="relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-20">
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-ink/80 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-blush-950/60 via-transparent to-blush-950/60" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative flex flex-col items-center text-center rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:border-blush-300/40 hover:bg-white/15 hover:shadow-xl sm:items-start sm:text-left sm:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-500/20 text-blush-300 border border-blush-300/30 transition-transform duration-300 group-hover:scale-110">
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="mt-5 font-display text-3xl font-bold text-cream-50 sm:text-4xl">
                <CountUp
                  end={stat.end}
                  suffix={stat.suffix}
                  duration={2.5}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-cream-100/70 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
