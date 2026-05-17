import { useEffect, useState } from "react";
import { fetchPrayerTimes } from "../lib/prayerTimes";

export function usePrayerTimes() {
  const [times, setTimes] = useState([]);
  const [dateLabel, setDateLabel] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const result = await fetchPrayerTimes();
        if (cancelled) return;
        setTimes(result.times);
        setDateLabel(result.dateLabel);
        setMethod(result.method);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load prayer times");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const hourly = setInterval(load, 60 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(hourly);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return { times, dateLabel, method, loading, error };
}
