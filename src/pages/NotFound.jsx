import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <title>Sayfa Bulunamadı | Roséa Güzellik Merkezi</title>
      <meta
        name="description"
        content="Aradığınız sayfa bulunamadı. Roséa Güzellik Merkezi anasayfasına veya hizmetlerimize göz atabilirsiniz."
      />

      <section className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-ink py-16 px-6 sm:px-12">
        {/* --- Arka Plan Atmosferik Işıklar (Soft Radial Gradients) --- */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blush-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-blush-400/10 blur-[150px]" />
        </div>

        {/* --- Orta Alan: Dev Editoryal Tipografi (Kart Yok, Tamamen Özgür Metin) --- */}
        <div className="mx-auto my-auto max-w-4xl text-center py-12">
          {/* Arka Planda Eriyen Dev Numara */}
          <p className="font-display text-[120px] font-extralight leading-none tracking-tighter text-blush-400/20 sm:text-[220px] lg:text-[280px] select-none">
            404
          </p>

          <div className="-mt-16 sm:-mt-28 lg:-mt-36 relative z-10">
            <h1 className="font-display text-3xl font-light text-cream-50 sm:text-5xl lg:text-6xl leading-tight">
              Aradığınız Dokunuş <br />
              <span className="italic font-normal text-blush-300">
                Bu Sayfada Yer Almıyor
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-sm sm:text-base font-light leading-relaxed text-cream-100/60">
              Ulaşmaya çalıştığınız sayfa taşınmış veya henüz hazırlanıyor
              olabilir. Aşağıdaki bağlantılardan güzellik yolculuğunuza devam
              edebilirsiniz.
            </p>

            {/* Şık Tipografik Linkler (Minimalist Çizgili Butonlar) */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
              <Link
                to="/"
                className="group relative inline-flex items-center gap-3 text-sm font-semibold tracking-wider text-cream-50 transition-colors hover:text-blush-300"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-blush-400" />
                <span>ANASAYFAYA DÖN</span>
                {/* Altı Çizili Vurgu Efekti */}
                <span className="absolute -bottom-1 left-0 h-[1px] w-full bg-blush-400/30 transition-all group-hover:bg-blush-300" />
              </Link>

              <span className="hidden sm:inline text-white/20">•</span>

              <Link
                to="/hizmetler"
                className="group relative inline-flex items-center gap-2 text-sm font-semibold tracking-wider text-cream-100/80 transition-colors hover:text-cream-50"
              >
                <span>HİZMETLERİMİZİ KEŞFEDİN</span>
                <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-cream-50 transition-all group-hover:w-full" />
              </Link>
            </div>
          </div>
        </div>

        {/* --- Alt Alt Bilgi (Footer Mantığı) --- */}
        <div className="mx-auto w-full max-w-7xl text-center">
          <p className="text-[11px] font-light tracking-widest uppercase text-cream-100/40">
            Roséa Güzellik & Bakım © {new Date().getFullYear()} — Tüm Hakları
            Saklıdır
          </p>
        </div>
      </section>
    </>
  );
}
