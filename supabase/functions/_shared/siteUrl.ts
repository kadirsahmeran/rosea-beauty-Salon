function normalizeOrigin(value: string) {
  return value.trim().replace(/\/$/, "");
}

function configuredOrigins() {
  return [Deno.env.get("SITE_URL"), Deno.env.get("ALLOWED_ORIGINS")]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map(normalizeOrigin)
    .filter(Boolean);
}

function isAllowedOrigin(origin: string) {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (host.endsWith(".netlify.app")) return true;

  const allowed = configuredOrigins();
  if (allowed.includes(normalizeOrigin(origin))) return true;

  return allowed.some((item) => {
    try {
      return new URL(item).hostname.toLowerCase() === host;
    } catch {
      return false;
    }
  });
}

export function resolveCheckoutSiteUrl(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && isAllowedOrigin(origin)) {
    return normalizeOrigin(origin);
  }

  const fallback = normalizeOrigin(
    Deno.env.get("SITE_URL") ?? "http://localhost:5173",
  );
  const fallbackIsLocal = /localhost|127\.0\.0\.1/.test(fallback);

  if (origin && fallbackIsLocal) {
    try {
      const parsed = new URL(origin);
      if (parsed.protocol === "https:") {
        return normalizeOrigin(origin);
      }
    } catch {
      // ignore invalid Origin
    }
  }

  return fallback;
}
