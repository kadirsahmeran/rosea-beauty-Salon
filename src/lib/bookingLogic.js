// Randevu takvim/saat hesaplamaları — Supabase'e bağımlı değil, saf
// fonksiyonlar. Bu sayede tarayıcı olmadan da (ör. bir test script'iyle)
// doğruluğu kontrol edilebilir.

const DEFAULT_SLOT_INTERVAL_MINUTES = 30;

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function todayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// "2026-09-10" -> 0 (Pazar) .. 6 (Cumartesi). new Date("YYYY-MM-DD") UTC
// olarak yorumlanır ve saat dilimine göre gün kayabilir; bu yüzden tarihi
// elle parse edip yerel saatle Date oluşturuyoruz.
export function getDayOfWeek(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

// Bir tarihin, uzmanın haftalık müsaitlik günlerinden biri olup olmadığını
// ve o tarihin izin/tatil aralığına denk gelip gelmediğini kontrol eder.
// availability: [{ day_of_week, start_time, end_time }]
// timeOff: [{ start_date, end_date }]
export function isDateBookable(dateString, availability, timeOff) {
  if (dateString < todayDateString()) return false;

  const dayOfWeek = getDayOfWeek(dateString);
  const hasWeeklyAvailability = availability.some(
    (a) => a.day_of_week === dayOfWeek,
  );
  if (!hasWeeklyAvailability) return false;

  const isOnTimeOff = timeOff.some(
    (t) => dateString >= t.start_date && dateString <= t.end_date,
  );
  return !isOnTimeOff;
}

// Belirli bir tarih için, uzmanın o günkü müsaitlik penceresi(leri) içinde,
// mevcut randevularla çakışmayan ve hizmet süresine uyan başlangıç
// saatlerini döndürür.
// bookedSlots: [{ appointment_date, start_time, end_time }]
export function computeAvailableTimeSlots({
  dateString,
  availability,
  timeOff,
  bookedSlots,
  durationMinutes,
  slotIntervalMinutes = DEFAULT_SLOT_INTERVAL_MINUTES,
}) {
  if (!isDateBookable(dateString, availability, timeOff)) return [];

  const dayOfWeek = getDayOfWeek(dateString);
  const windows = availability.filter((a) => a.day_of_week === dayOfWeek);

  const booked = bookedSlots
    .filter((b) => b.appointment_date === dateString)
    .map((b) => ({
      start: timeToMinutes(b.start_time),
      end: timeToMinutes(b.end_time),
    }));

  const isToday = dateString === todayDateString();
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = [];

  for (const window of windows) {
    const windowStart = timeToMinutes(window.start_time);
    const windowEnd = timeToMinutes(window.end_time);

    for (
      let slotStart = windowStart;
      slotStart + durationMinutes <= windowEnd;
      slotStart += slotIntervalMinutes
    ) {
      if (isToday && slotStart <= nowMinutes) continue;

      const slotEnd = slotStart + durationMinutes;
      const overlapsExisting = booked.some(
        (b) => slotStart < b.end && slotEnd > b.start,
      );
      if (overlapsExisting) continue;

      slots.push({
        start: minutesToTime(slotStart),
        end: minutesToTime(slotEnd),
      });
    }
  }

  return slots;
}
