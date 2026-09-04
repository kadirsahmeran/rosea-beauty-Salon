import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageFallback from "./components/PageFallback";
import FirstLoadGate from "./components/FirstLoadGate";
import { useSeoMeta } from "./lib/useSeoMeta";

const Home = lazy(() => import("./pages/Home"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const About = lazy(() => import("./pages/About"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Booking = lazy(() => import("./pages/Booking"));
const BookingResult = lazy(() => import("./pages/BookingResult"));
const NotFound = lazy(() => import("./pages/NotFound"));

const MIN_SPLASH_MS = 900;

function hideBootSplash() {
  const splash = document.getElementById("boot-splash");
  if (!splash || splash.classList.contains("is-hidden")) return;

  splash.classList.add("is-hidden");
  const remove = () => splash.remove();
  splash.addEventListener("transitionend", remove, { once: true });
  window.setTimeout(remove, 700);
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();

  // Sayfa başlığı ve açıklaması panelden yönetiliyor (seo_meta).
  useSeoMeta(pathname);

  const isBookingResult = pathname.startsWith("/randevu/sonuc");
  const bootStartedAt = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const [routeReady, setRouteReady] = useState(false);
  const [booting, setBooting] = useState(true);

  const handleRouteReady = useCallback(() => {
    setRouteReady(true);
  }, []);

  useEffect(() => {
    if (!routeReady) return undefined;

    const wait = Math.max(0, MIN_SPLASH_MS - (performance.now() - bootStartedAt.current));
    const timer = window.setTimeout(() => {
      hideBootSplash();
      setBooting(false);
    }, wait);

    return () => window.clearTimeout(timer);
  }, [routeReady]);

  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main>
        <Suspense fallback={booting ? null : <PageFallback />}>
          <FirstLoadGate onReady={handleRouteReady}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hizmetler" element={<Services />} />
              <Route path="/hizmetler/:id" element={<ServiceDetail />} />
              <Route path="/hakkimizda" element={<About />} />
              <Route path="/galeri" element={<Gallery />} />
              <Route path="/iletisim" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/randevu" element={<Booking />} />
              <Route path="/randevu/sonuc" element={<BookingResult />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </FirstLoadGate>
        </Suspense>
      </main>
      {!isBookingResult && <Footer />}
    </div>
  );
}