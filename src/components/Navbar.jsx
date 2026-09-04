import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Hizmetler", to: "/hizmetler" },
  { label: "Hakkımızda", to: "/hakkimizda" },
  { label: "Galeri", to: "/galeri" },
  { label: "Blog", to: "/blog" },
  { label: "İletişim", to: "/iletisim" },
];

function isNavActive(pathname, to) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function DesktopNavLink({ link, active }) {
  return (
    <Link
      to={link.to}
      aria-current={active ? "page" : undefined}
      className={`relative pb-1 text-sm font-medium transition ${
        active
          ? "text-blush-300"
          : "text-cream-50/80 hover:text-blush-300"
      }`}
    >
      {link.label}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 -bottom-0.5 mx-auto h-px w-5 rounded-full bg-blush-300 transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
    </Link>
  );
}

function MobileNavLink({ link, active, onClick }) {
  return (
    <Link
      to={link.to}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-base font-medium transition ${
        active
          ? "bg-blush-50 text-blush-700"
          : "text-ink/80 hover:bg-blush-50/70 hover:text-blush-600"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-blush-500" : "bg-transparent"
        }`}
      />
      {link.label}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const solid = pathname.startsWith("/randevu/sonuc");
  const bookingActive = pathname.startsWith("/randevu");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={
        solid
          ? "relative z-50 bg-ink"
          : "absolute inset-x-0 top-0 z-50"
      }
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-wide text-cream-50">
            Roséa
          </span>
          <span className="hidden text-[0.65rem] font-medium uppercase tracking-[0.3em] text-blush-300 sm:inline">
            Güzellik Merkezi
          </span>
        </Link>

        <div className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <DesktopNavLink
              key={link.label}
              link={link}
              active={isNavActive(pathname, link.to)}
            />
          ))}
        </div>

        <Link
          to="/randevu"
          aria-current={bookingActive ? "page" : undefined}
          className={`hidden rounded-full px-6 py-2.5 text-sm font-medium transition lg:inline-block ${
            bookingActive
              ? "bg-blush-300 text-ink shadow-sm shadow-blush-900/10"
              : "bg-cream-50 text-ink hover:bg-blush-100"
          }`}
        >
          Randevu Al
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-full p-2 text-cream-50 lg:hidden"
          aria-label="Menüyü aç/kapat"
          aria-expanded={open}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="absolute inset-x-6 top-full z-50 mt-1 rounded-3xl bg-cream-50/95 p-4 shadow-xl backdrop-blur lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <MobileNavLink
                key={link.label}
                link={link}
                active={isNavActive(pathname, link.to)}
                onClick={() => setOpen(false)}
              />
            ))}
            <Link
              to="/randevu"
              onClick={() => setOpen(false)}
              aria-current={bookingActive ? "page" : undefined}
              className={`mt-3 rounded-full px-6 py-3 text-center text-sm font-medium ${
                bookingActive
                  ? "bg-blush-600 text-cream-50"
                  : "bg-ink text-cream-50"
              }`}
            >
              Randevu Al
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
