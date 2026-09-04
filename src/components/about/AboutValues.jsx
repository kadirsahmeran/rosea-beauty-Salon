export default function AboutValues({ values }) {
  return (
    <section className="relative bg-cream-50/50 py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blush-300/50 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-blush-700 shadow-sm">
            <span className="text-blush-500">✦</span>
            <span>Prensiplerimiz</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Bizi <span className="italic text-blush-600">Farklı Kılan</span>{" "}
            Değerlerimiz
          </h2>
          <p className="mt-4 text-base text-ink/75 sm:text-lg">
            Her misafirimizde aynı tutku ve özenle uyguladığımız vazgeçilmez
            standartlarımız.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-blush-100/80 bg-white p-8 shadow-xl shadow-blush-900/5 transition-all duration-500 hover:-translate-y-2 hover:border-blush-300 hover:shadow-2xl hover:shadow-blush-900/10"
            >
              <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blush-100/50 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-blush-200/60" />

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blush-200/60 bg-blush-50 text-blush-600 shadow-sm transition-colors duration-500 group-hover:border-blush-600 group-hover:bg-blush-600 group-hover:text-white">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <span className="font-display text-2xl font-light text-blush-300/70 transition-colors group-hover:text-blush-500">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold text-ink transition-colors group-hover:text-blush-600">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-ink/70">
                  {value.desc}
                </p>
              </div>

              <div className="mt-8 h-1 w-12 rounded-full bg-blush-200 transition-all duration-500 group-hover:w-full group-hover:bg-blush-600" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
