import dns from "node:dns/promises";
import { getConfig, payfastUrls, signPairs, buildParamString } from "./_payfast.js";

const PAYFAST_HOSTS = ["www.payfast.co.za", "sandbox.payfast.co.za", "w1w.payfast.co.za", "w2w.payfast.co.za"];

async function isFromPayFast(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = forwarded || req.socket?.remoteAddress || "";
  if (!ip) return false;
  const lookups = await Promise.allSettled(PAYFAST_HOSTS.map((host) => dns.resolve4(host)));
  const allowed = new Set(lookups.flatMap((r) => (r.status === "fulfilled" ? r.value : [])));
  return allowed.has(ip.replace(/^::ffff:/, ""));
}

function receivedPairs(body) {
  if (typeof body === "string") return [...new URLSearchParams(body).entries()];
  return Object.entries(body || {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]);
}

async function confirmWithPayFast(paramString) {
  const response = await fetch(payfastUrls().validate, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: paramString,
  });
  return (await response.text()).trim() === "VALID";
}

/**
 * PayFast Instant Transaction Notification (ITN) receiver.
 * Verifies the signature, the sender, and the payment with PayFast before logging it.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const config = getConfig();
  if (!config) return res.status(503).end();

  const pairs = receivedPairs(req.body);
  const data = Object.fromEntries(pairs);
  const withoutSignature = pairs.filter(([key]) => key !== "signature");

  if (!data.signature || signPairs(withoutSignature, config.passphrase) !== data.signature) {
    console.warn("PayFast ITN rejected: bad signature", data.m_payment_id);
    return res.status(400).end();
  }
  if (data.merchant_id !== config.merchantId) {
    console.warn("PayFast ITN rejected: merchant mismatch", data.m_payment_id);
    return res.status(400).end();
  }
  if (!(await isFromPayFast(req))) {
    console.warn("PayFast ITN rejected: unexpected sender", data.m_payment_id);
    return res.status(400).end();
  }
  if (!(await confirmWithPayFast(buildParamString(withoutSignature)))) {
    console.warn("PayFast ITN rejected: PayFast did not confirm", data.m_payment_id);
    return res.status(400).end();
  }

  // Verified. Donor email is deliberately left out of the logs.
  console.log(
    JSON.stringify({
      event: "donation",
      id: data.m_payment_id,
      pfId: data.pf_payment_id,
      status: data.payment_status,
      gross: data.amount_gross,
      fee: data.amount_fee,
      net: data.amount_net,
      cause: data.custom_str1,
      frequency: data.custom_str2,
      donor: `${data.name_first || ""} ${data.name_last || ""}`.trim(),
    })
  );

  return res.status(200).end();
}
