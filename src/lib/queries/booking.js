import { supabase } from "../supabaseClient";

// Bir hizmeti veren uzmanları getirir. serviceId, services tablosundaki
// gerçek uuid'dir (services.dbId — normalize edilmiş service objesinde
// bulunur, slug DEĞİL).
export async function getSpecialistsForService(serviceId) {
  const { data, error } = await supabase
    .from("specialist_services")
    .select("team_members(id, name, role, image_url, is_active)")
    .eq("service_id", serviceId);

  if (error) throw error;
  return data
    // Arşivlenmiş uzmana yeni randevu verilemez; mevcut randevuları durur.
    .filter((row) => row.team_members?.is_active)
    .map((row) => ({
      id: row.team_members.id,
      name: row.team_members.name,
      role: row.team_members.role,
      image: row.team_members.image_url,
    }));
}

// Bir uzmanın haftalık düzenli müsaitlik pencerelerini getirir.
export async function getSpecialistAvailability(specialistId) {
  const { data, error } = await supabase
    .from("specialist_availability")
    .select("day_of_week, start_time, end_time")
    .eq("specialist_id", specialistId)
    .eq("is_active", true);

  if (error) throw error;
  return data;
}

// Bugünden itibaren geçerli izin/tatil aralıklarını getirir.
export async function getSpecialistTimeOff(specialistId) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("specialist_time_off")
    .select("start_date, end_date, reason")
    .eq("specialist_id", specialistId)
    .gte("end_date", today);

  if (error) throw error;
  return data;
}

// Belirli bir tarihte uzmanın dolu olduğu saat aralıklarını getirir
// (müşteri bilgisi içermeyen, herkese açık "booked_slots" görünümünden).
export async function getBookedSlotsForDate(specialistId, dateString) {
  const { data, error } = await supabase
    .from("booked_slots")
    .select("appointment_date, start_time, end_time")
    .eq("specialist_id", specialistId)
    .eq("appointment_date", dateString);

  if (error) throw error;
  return data;
}

// Yeni bir randevu oluşturur. RLS gereği anon kullanıcılar appointments
// tablosunu SELECT edemez (müşteri bilgisi içerdiği için), bu yüzden id'yi
// istemci tarafında üretip ekliyoruz — insert sonrası ayrıca bir okuma
// yapmaya gerek kalmıyor.
export async function createAppointment({
  serviceId,
  specialistId,
  date,
  startTime,
  endTime,
  customerName,
  customerPhone,
  customerEmail,
  notes,
  priceAmount,
}) {
  const id = crypto.randomUUID();

  const { error } = await supabase.from("appointments").insert({
    id,
    service_id: serviceId,
    specialist_id: specialistId,
    appointment_date: date,
    start_time: startTime,
    end_time: endTime,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail ?? null,
    notes: notes ?? null,
    price_amount: priceAmount,
    status: "pending",
    payment_status: "unpaid",
  });

  if (error) throw error;
  return {
    id,
    date,
    startTime,
    endTime,
    status: "pending",
    paymentStatus: "unpaid",
  };
}
