import { ChevronLeft } from "lucide-react";

export default function StepBackButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm text-ink/60 transition hover:text-blush-600"
    >
      <ChevronLeft className="h-4 w-4" />
      {children}
    </button>
  );
}
