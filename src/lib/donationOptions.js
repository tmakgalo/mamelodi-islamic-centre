/** Shared by the donate page (browser) and the PayFast signing function (server). */

export const DONATION_CAUSES = [
  { id: "lillah", label: "Lillah - masjid operations and maintenance" },
  { id: "sadaqah", label: "Sadaqah - community welfare" },
  { id: "zakaah", label: "Zakaah" },
  { id: "education", label: "ECD, youth and education programmes" },
  { id: "feeding", label: "Feeding scheme and outreach" },
];

export const DONATION_FREQUENCIES = [
  { id: "once", label: "One-off" },
  { id: "monthly", label: "Monthly" },
];

export const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];

/** PayFast's minimum transaction is R5.00. */
export const MIN_DONATION = 5;
export const MAX_DONATION = 100000;
