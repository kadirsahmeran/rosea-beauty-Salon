import { ArrowUpRight } from "lucide-react";

export default function AboutTeam({ team }) {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blush-300/50 bg-blush-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-blush-700 backdrop-blur-sm">
            <span className="text-blush-500">✦</span>
            <span>Sanatçılarımız</span>
          </div>
          <h2 className="mt-6 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Uzman <span className="italic text-blush-600">Kadromuzla</span>{" "}
            Tanışın
          </h2>
          <p className="mt-4 text-base text-ink/75 sm:text-lg">
            Alanında uluslararası sertifikalara sahip, işine tutkuyla bağlı
            estetisyenlerimiz.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div
              key={member.name}
              className="group relative overflow-hidden rounded-3xl border border-blush-100 bg-white shadow-xl shadow-blush-900/5 transition-all duration-500 hover:-translate-y-2 hover:border-blush-300 hover:shadow-2xl hover:shadow-blush-900/10"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink/5">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

                <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-cream-50 transition-transform duration-300">
                  <span className="inline-block rounded-full bg-blush-500/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                    {member.role}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-white">
                    {member.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
