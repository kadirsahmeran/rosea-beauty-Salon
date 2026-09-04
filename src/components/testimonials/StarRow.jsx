import { Star } from "lucide-react";

export default function StarRow({ count, className = "" }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-blush-300 text-blush-300" />
      ))}
    </div>
  );
}
