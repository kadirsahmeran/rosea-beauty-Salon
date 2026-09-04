import { User } from "lucide-react";
import { SectionError, SectionLoading } from "../SectionState";
import StepBackButton from "./StepBackButton";

export default function SpecialistStep({
  serviceTitle,
  specialists,
  selectedSpecialist,
  loading,
  error,
  onBack,
  onSelect,
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <StepBackButton onClick={onBack}>Hizmete dön</StepBackButton>
        <p className="text-sm text-ink/60">
          <span className="font-medium text-ink">{serviceTitle}</span>
        </p>
      </div>

      <h3 className="mt-6 text-center font-display text-2xl font-semibold text-ink">
        Uzman Seçin
      </h3>
      <p className="mt-2 text-center text-sm text-ink/60">
        Bu hizmeti sunan uzmanlarımızdan birini seçin.
      </p>

      {loading && <SectionLoading className="py-16" />}
      {error && <SectionError message="Uzmanlar yüklenemedi." className="py-16" />}

      {!loading && !error && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {specialists.length === 0 ? (
            <p className="col-span-full text-center text-sm text-ink/50">
              Bu hizmet için şu an müsait uzman bulunmuyor.
            </p>
          ) : (
            specialists.map((specialist) => (
              <button
                key={specialist.id}
                type="button"
                onClick={() => onSelect(specialist)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  selectedSpecialist?.id === specialist.id
                    ? "border-blush-500 ring-2 ring-blush-300"
                    : "border-blush-100 bg-white hover:border-blush-300"
                }`}
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-blush-100">
                  {specialist.image ? (
                    <img
                      src={specialist.image}
                      alt={specialist.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-blush-400">
                      <User className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-ink">
                    {specialist.name}
                  </p>
                  <p className="text-sm text-ink/60">{specialist.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
