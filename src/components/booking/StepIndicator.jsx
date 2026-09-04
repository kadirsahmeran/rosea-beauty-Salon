import { Check } from "lucide-react";
import { STEPS } from "./constants";

export default function StepIndicator({ currentStep }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-0">
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;

        return (
          <li key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                isActive
                  ? "bg-blush-600 text-cream-50"
                  : isDone
                    ? "bg-blush-100 text-blush-700"
                    : "bg-blush-50 text-ink/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  isActive
                    ? "bg-cream-50 text-blush-600"
                    : isDone
                      ? "bg-blush-600 text-cream-50"
                      : "bg-blush-200/60 text-ink/40"
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-1 hidden h-px w-6 sm:block sm:w-10 ${
                  index < currentStep ? "bg-blush-400" : "bg-blush-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
