import { Sparkles } from "lucide-react"; // Veya kendi logo SVG'niz

export function SectionLoading({ className = "py-20" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Arka planda hafif büyüyen halka */}
        <div className="absolute h-10 w-10 animate-ping rounded-full bg-blush-200/50" />

        {/* Merkez ikon */}
        <div className="relative rounded-full bg-blush-50 p-3 text-blush-400 shadow-sm animate-pulse">
          <Sparkles className="h-6 w-6" />
        </div>
      </div>
      <span className="text-xs tracking-widest uppercase text-blush-400 font-medium animate-pulse">
        Rosea
      </span>
    </div>
  );
}

export function SectionError({
  message = "İçerik yüklenirken bir sorun oluştu.",
  className = "py-20",
}) {
  return (
    <div
      className={`flex items-center justify-center text-center ${className}`}
    >
      <p className="text-sm text-ink/50">{message}</p>
    </div>
  );
}
