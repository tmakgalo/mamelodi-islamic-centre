/** Muslim World League (method 3), Centurion/Pretoria area — matches common local apps. */
export const PRAYER_CONFIG = {
  city: "Centurion",
  country: "South Africa",
  method: 3,
  /** Maghrib +4 min, Isha +1 min — aligns with local manual adjustments. */
  tune: "0,0,0,0,0,4,0,1,0",
  iqamahMinutes: {
    Fajr: 15,
    Dhuhr: 20,
    Asr: 10,
    Maghrib: 5,
    Isha: 15,
  },
  jumuahIqamah: "13:00",
};

const PRAYER_ROWS = [
  { name: "Fajr", apiKey: "Fajr", showIqamah: true },
  { name: "Sunrise", apiKey: "Sunrise", showIqamah: false },
  { name: "Dhuhr", apiKey: "Dhuhr", showIqamah: true },
  { name: "Asr", apiKey: "Asr", showIqamah: true },
  { name: "Maghrib", apiKey: "Maghrib", showIqamah: true },
  { name: "Esha", apiKey: "Isha", showIqamah: true },
  { name: "Jumu'ah", apiKey: "Dhuhr", showIqamah: true, isJumuah: true },
];

function parseTime24(timeStr) {
  const [hours, minutes] = timeStr.slice(0, 5).split(":").map(Number);
  return { hours, minutes };
}

export function addMinutesToTime(timeStr, minutes) {
  const { hours, minutes: mins } = parseTime24(timeStr);
  const total = (hours * 60 + mins + minutes + 24 * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatTime12(time24) {
  const { hours, minutes } = parseTime24(time24);
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function buildRows(timings) {
  const { iqamahMinutes, jumuahIqamah } = PRAYER_CONFIG;

  return PRAYER_ROWS.map((row) => {
    const adhan24 = timings[row.apiKey];
    const adhan = formatTime12(adhan24);

    if (!row.showIqamah) {
      return { name: row.name, adhan, iqamah: "—" };
    }

    if (row.isJumuah) {
      return {
        name: row.name,
        adhan,
        iqamah: formatTime12(jumuahIqamah),
        note: "Friday",
      };
    }

    const offset = iqamahMinutes[row.name] ?? iqamahMinutes[row.apiKey] ?? 10;
    const iqamah24 = addMinutesToTime(adhan24, offset);
    return { name: row.name, adhan, iqamah: formatTime12(iqamah24) };
  });
}

export async function fetchPrayerTimes(date = new Date()) {
  const { city, country, method, tune } = PRAYER_CONFIG;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const dateParam = `${day}-${month}-${year}`;

  const url = new URL("https://api.aladhan.com/v1/timingsByCity");
  url.searchParams.set("city", city);
  url.searchParams.set("country", country);
  url.searchParams.set("method", String(method));
  url.searchParams.set("tune", tune);
  url.searchParams.set("date", dateParam);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not load prayer times");
  }

  const json = await response.json();
  if (json.code !== 200 || !json.data?.timings) {
    throw new Error("Prayer times unavailable");
  }

  const readable = json.data.date?.readable ?? date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    times: buildRows(json.data.timings),
    dateLabel: readable,
    method: json.data.meta?.method?.name ?? "Muslim World League",
  };
}

export function getDailyPrayers(times) {
  return times.filter((t) => ["Fajr", "Dhuhr", "Asr", "Maghrib", "Esha"].includes(t.name));
}
