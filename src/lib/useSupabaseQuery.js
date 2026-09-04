import { useEffect, useState } from "react";

// Oturum boyunca yaşayan basit bir bellek-içi önbellek. Aynı "key" ile
// yapılan sorgular (ör. sayfalar arası geçişte aynı bölüm yeniden mount
// olduğunda, ya da aynı veriyi kullanan iki farklı bileşen aynı anda
// mount olduğunda) tekrar backend'e istek atmaz, önbellekteki veriyi
// anında kullanır. Sayfa tamamen yenilendiğinde (F5) önbellek sıfırlanır.
const cache = new Map();
const inFlight = new Map();

// key: bu sorguyu benzersiz tanımlayan string (ör. "featured-services",
// `service:${slug}`). Aynı key'i kullanan tüm çağrılar veriyi paylaşır.
export function useSupabaseQuery(key, queryFn, deps = []) {
  const [data, setData] = useState(() => cache.get(key) ?? null);
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache.has(key)) {
      setData(cache.get(key));
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    let promise = inFlight.get(key);
    if (!promise) {
      promise = queryFn().finally(() => inFlight.delete(key));
      inFlight.set(key, promise);
    }

    promise
      .then((result) => {
        cache.set(key, result);
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...deps]);

  return { data, loading, error };
}
