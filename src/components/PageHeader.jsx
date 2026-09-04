import { Link } from "react-router-dom";

export default function PageHeader({ title, subtitle, breadcrumb, image }) {
  const crumbs = (breadcrumb ?? []).filter(
    (item) => item.label !== "Anasayfa" && item.to !== "/",
  );

  return (
    <section className="relative isolate flex min-h-[45vh] items-end overflow-hidden pb-14 pt-32 sm:min-h-[50vh]">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/60 to-ink/30"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8">
        {crumbs.some((item) => item.to) && (
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-cream-100/70">
            {crumbs.map((item, index) => (
              <span key={item.label} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                {item.to ? (
                  <Link
                    to={item.to}
                    className="cursor-pointer transition hover:text-cream-50"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-cream-50">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <h1 className="font-display text-4xl font-semibold text-cream-50 sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-base text-cream-100/80 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
