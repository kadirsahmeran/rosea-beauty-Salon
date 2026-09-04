import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { isDateBookable } from "../../lib/bookingLogic";
import { SectionLoading } from "../SectionState";
import { MONTHS, WEEKDAYS } from "./constants";
import { formatDateShort, formatTime } from "./format";
import StepBackButton from "./StepBackButton";

export default function DateTimeStep({
  specialistName,
  scheduleLoading,
  calendarMonth,
  calendarDays,
  availability,
  timeOff,
  selectedDate,
  selectedSlot,
  availableSlots,
  slotsLoading,
  onBack,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onSelectSlot,
  onContinue,
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <StepBackButton onClick={onBack}>Uzmana dön</StepBackButton>
        <p className="text-sm text-ink/60">
          <span className="font-medium text-ink">{specialistName}</span>
        </p>
      </div>

      <h3 className="mt-6 text-center font-display text-2xl font-semibold text-ink">
        Tarih & Saat Seçin
      </h3>
      <p className="mt-2 text-center text-sm text-ink/60">
        Uzmanın müsait olduğu bir gün ve saat seçin.
      </p>

      {scheduleLoading ? (
        <SectionLoading className="py-16" />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-blush-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onPrevMonth}
                className="rounded-full p-2 text-ink/60 transition hover:bg-blush-50 hover:text-blush-600"
                aria-label="Önceki ay"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="font-display text-lg font-semibold text-ink">
                {MONTHS[calendarMonth.month]} {calendarMonth.year}
              </p>
              <button
                type="button"
                onClick={onNextMonth}
                className="rounded-full p-2 text-ink/60 transition hover:bg-blush-50 hover:text-blush-600"
                aria-label="Sonraki ay"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-1 text-xs font-medium text-ink/40">
                  {day}
                </div>
              ))}
              {calendarDays.map((dateString, index) => {
                if (!dateString) {
                  return <div key={`empty-${index}`} />;
                }

                const bookable = isDateBookable(dateString, availability, timeOff);
                const isSelected = selectedDate === dateString;

                return (
                  <button
                    key={dateString}
                    type="button"
                    disabled={!bookable}
                    onClick={() => onSelectDate(dateString)}
                    className={`aspect-square rounded-xl text-sm font-medium transition ${
                      isSelected
                        ? "bg-blush-600 text-cream-50"
                        : bookable
                          ? "text-ink hover:bg-blush-50"
                          : "cursor-not-allowed text-ink/20"
                    }`}
                  >
                    {parseInt(dateString.slice(8), 10)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-blush-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-ink">
              <CalendarDays className="h-4 w-4 text-blush-500" />
              {selectedDate ? formatDateShort(selectedDate) : "Önce bir tarih seçin"}
            </div>

            {!selectedDate && (
              <p className="mt-6 text-sm text-ink/50">
                Takvimden müsait bir gün seçtiğinizde saatler burada görünecek.
              </p>
            )}

            {selectedDate && slotsLoading && (
              <div className="mt-6 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blush-400" />
              </div>
            )}

            {selectedDate && !slotsLoading && availableSlots.length === 0 && (
              <p className="mt-6 text-sm text-ink/50">
                Bu tarihte müsait saat bulunmuyor. Başka bir gün seçin.
              </p>
            )}

            {selectedDate && !slotsLoading && availableSlots.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                      selectedSlot?.start === slot.start
                        ? "border-blush-500 bg-blush-600 text-cream-50"
                        : "border-blush-100 text-ink hover:border-blush-300 hover:bg-blush-50"
                    }`}
                  >
                    {formatTime(slot.start)}
                  </button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <button
                type="button"
                onClick={onContinue}
                className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream-50 transition hover:bg-blush-600"
              >
                Devam Et
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
