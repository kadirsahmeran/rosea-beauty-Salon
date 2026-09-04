export const STEPS = [
  { id: "service", label: "Hizmet" },
  { id: "specialist", label: "Uzman" },
  { id: "datetime", label: "Tarih & Saat" },
  { id: "details", label: "Bilgileriniz" },
];

export const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export const APPOINTMENT_STATUS = {
  pending: {
    label: "Beklemede",
    detail: "Salon onayı bekleniyor",
    className: "bg-amber-50 text-amber-800",
  },
  confirmed: {
    label: "Onaylandı",
    detail: "Randevunuz kesinleşti",
    className: "bg-emerald-50 text-emerald-800",
  },
  cancelled: {
    label: "İptal",
    detail: "Bu randevu iptal edildi",
    className: "bg-red-50 text-red-700",
  },
  completed: {
    label: "Tamamlandı",
    detail: "Hizmet gerçekleşti",
    className: "bg-ink/5 text-ink",
  },
};

export const PAYMENT_STATUS = {
  unpaid: {
    label: "Ödeme Bekleniyor",
    detail: "Ödeme alınana kadar randevu beklemede kalır",
    className: "bg-amber-50 text-amber-800",
  },
  pending: {
    label: "Ödeme Bekleniyor",
    detail: "Ödeme alınana kadar randevu beklemede kalır",
    className: "bg-amber-50 text-amber-800",
  },
  paid: {
    label: "Ödendi",
    detail: "Ödemeniz alındı",
    className: "bg-emerald-50 text-emerald-800",
  },
  refunded: {
    label: "İade Edildi",
    detail: "Ödeme iade edildi",
    className: "bg-ink/5 text-ink",
  },
  failed: {
    label: "Ödeme Alınamadı",
    detail: "Ödeme tamamlanmadı",
    className: "bg-red-50 text-red-700",
  },
  partially_paid: {
    label: "Kısmi Ödeme",
    detail: "Ödemenin bir kısmı alındı",
    className: "bg-amber-50 text-amber-800",
  },
};
