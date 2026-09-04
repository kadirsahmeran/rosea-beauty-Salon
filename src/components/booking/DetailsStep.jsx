import { Loader2 } from "lucide-react";
import {
  inputClassName,
  validateEmail,
  validateName,
  validateNotes,
  validatePhone,
} from "../../lib/formValidation";
import { formatDateShort, formatPrice, formatTime } from "./format";
import FormField from "./FormField";
import StepBackButton from "./StepBackButton";

export default function DetailsStep({
  service,
  specialist,
  selectedDate,
  selectedSlot,
  register,
  errors,
  isSubmitting,
  submitError,
  onBack,
  onSubmit,
  handleSubmit,
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <StepBackButton onClick={onBack}>Tarihe dön</StepBackButton>
      </div>

      <h3 className="mt-6 text-center font-display text-2xl font-semibold text-ink">
        Bilgilerinizi Girin
      </h3>

      <div className="mx-auto mt-8 max-w-lg">
        <div className="mb-6 rounded-2xl border border-blush-100 bg-blush-50/50 p-5 text-sm">
          <p className="font-semibold text-ink">{service?.title}</p>
          <p className="mt-1 text-ink/70">
            {specialist?.name} · {selectedDate && formatDateShort(selectedDate)}{" "}
            · {selectedSlot && formatTime(selectedSlot.start)}
          </p>
          <p className="mt-2 font-semibold text-blush-700">
            {service && formatPrice(service.priceAmount)}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField
            id="booking-name"
            label="Ad Soyad *"
            error={errors.name?.message}
          >
            <input
              id="booking-name"
              type="text"
              autoComplete="name"
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name", { validate: validateName })}
              className={inputClassName(Boolean(errors.name))}
            />
          </FormField>

          <FormField
            id="booking-phone"
            label="Telefon *"
            error={errors.phone?.message}
          >
            <input
              id="booking-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="05XX XXX XX XX"
              aria-invalid={errors.phone ? "true" : "false"}
              {...register("phone", { validate: validatePhone })}
              className={inputClassName(Boolean(errors.phone))}
            />
          </FormField>

          <FormField
            id="booking-email"
            label="E-posta *"
            error={errors.email?.message}
          >
            <input
              id="booking-email"
              type="email"
              autoComplete="email"
              placeholder="ad@ornek.com"
              aria-invalid={errors.email ? "true" : "false"}
              {...register("email", { validate: validateEmail })}
              className={inputClassName(Boolean(errors.email))}
            />
          </FormField>

          <FormField
            id="booking-notes"
            label="Not (isteğe bağlı)"
            error={errors.notes?.message}
          >
            <textarea
              id="booking-notes"
              rows={3}
              aria-invalid={errors.notes ? "true" : "false"}
              {...register("notes", { validate: validateNotes })}
              className={inputClassName(Boolean(errors.notes), "resize-none")}
            />
          </FormField>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-semibold text-cream-50 transition hover:bg-blush-600 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting
              ? "Ödeme sayfasına yönlendiriliyor..."
              : "Güvenli Ödemeye Geç"}
          </button>

          <p className="text-center text-xs text-ink/40">
            Kart bilgileriniz sitemize gelmez; Stripe’ın güvenli ödeme
            sayfasında işlenir. Ödeme tamamlanınca randevunuz onaylanır.
          </p>
        </form>
      </div>
    </div>
  );
}
