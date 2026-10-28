import { getConfig } from "./_payfast.js";

/**
 * Tells the donate page whether online (PayFast) payments are switched on.
 * Returns only a yes/no; no credentials or configuration details.
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ enabled: Boolean(getConfig()) });
}
