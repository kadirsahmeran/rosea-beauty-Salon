import { lazy, Suspense } from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import ServicesPreview from "../components/ServicesPreview";
import { SectionLoading } from "../components/SectionState";

const GalleryPreview = lazy(() => import("../components/GalleryPreview"));
const BlogPreview = lazy(() => import("../components/BlogPreview"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const Contact = lazy(() => import("../components/Contact"));

export default function Home() {
  return (
    <>
      <title>Roséa Güzellik Merkezi | Uzman Bakım ve Güzellik Hizmetleri</title>
      <meta
        name="description"
        content="Roséa Güzellik Merkezi; saç bakımı, cilt bakımı, makyaj ve spa hizmetlerinde uzman ellerin dokunuşunu sunar. Hemen online randevu alın."
      />
      <Hero />
      <About />
      <ServicesPreview />
      <Suspense fallback={<SectionLoading className="py-24" />}>
        <GalleryPreview />
        <BlogPreview />
        <Testimonials />
        <Contact />
      </Suspense>
    </>
  );
}
