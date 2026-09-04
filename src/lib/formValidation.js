const NAME_PATTERN = /^[\p{L}][\p{L}\s'-]*$/u;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateName(value) {
  const name = value.trim();
  if (!name) return "Ad soyad zorunludur.";
  if (name.length < 3) return "Ad soyad en az 3 karakter olmalıdır.";
  if (!NAME_PATTERN.test(name)) {
    return "Ad soyad yalnızca harf içermelidir.";
  }

  const parts = name.split(/\s+/);
  if (parts.length < 2) return "Lütfen ad ve soyadınızı birlikte girin.";
  if (parts.some((part) => part.length < 2)) {
    return "Ad ve soyad en az 2 karakter olmalıdır.";
  }

  return true;
}

export function validatePhone(value) {
  const raw = value.trim();
  if (!raw) return "Telefon numarası zorunludur.";

  const digits = raw.replace(/\D/g, "");
  let national = digits;
  if (national.startsWith("90")) national = national.slice(2);
  if (national.startsWith("0")) national = national.slice(1);

  if (national.length !== 10) {
    return "Telefon numarası 10 haneli olmalıdır (ör. 05XX XXX XX XX).";
  }
  if (!national.startsWith("5")) {
    return "Cep telefonu 5 ile başlamalıdır.";
  }
  if (!/^5\d{9}$/.test(national)) {
    return "Geçerli bir Türkiye cep telefonu girin.";
  }

  return true;
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return "E-posta adresi zorunludur.";
  if (/\s/.test(email)) return "E-posta adresinde boşluk olamaz.";
  if (!email.includes("@")) {
    return "Geçerli bir e-posta adresi girin (ör. ad@ornek.com).";
  }

  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return "Geçerli bir e-posta adresi girin (ör. ad@ornek.com).";
  }
  if (
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..") ||
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.includes("..")
  ) {
    return "E-posta adresi geçersiz karakter dizisi içeriyor.";
  }
  if (!domain.includes(".")) {
    return "E-posta adresinde geçerli bir alan adı olmalı (ör. ornek.com).";
  }
  if (!EMAIL_PATTERN.test(email)) {
    return "Geçerli bir e-posta adresi girin (ör. ad@ornek.com).";
  }

  return true;
}

export function validateNotes(value) {
  if (!value) return true;
  if (value.trim().length > 500) {
    return "Not en fazla 500 karakter olabilir.";
  }
  return true;
}

export function inputClassName(hasError, extra = "") {
  return [
    "mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink outline-none transition",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : "border-blush-100 focus:border-blush-400 focus:ring-2 focus:ring-blush-200",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}
