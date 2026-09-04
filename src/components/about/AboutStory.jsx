export default function AboutStory({ story }) {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -left-5 -top-5 h-full w-full rounded-3xl bg-blush-200/70"
          />
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl shadow-2xl shadow-blush-900/10">
            <img
              src={story.image}
              alt="Roséa Güzellik Merkezi'nin şık salon içi"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blush-300/50 bg-blush-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-blush-700 backdrop-blur-sm">
            <span className="text-blush-500">✦</span>
            <span>Hikayemiz</span>
          </div>
          <h2 className="mt-6 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            2013'ten Bu Yana Güzelliğe Adanmış Bir Yolculuk
          </h2>
          {story.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 20)}
              className="mt-5 text-base leading-relaxed text-ink/75 sm:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
