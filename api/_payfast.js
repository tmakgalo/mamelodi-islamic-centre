import crypto from "node:crypto";
import {
  DONATION_CAUSES,
  DONATION_FREQUENCIES,
  MIN_DONATION,
  MAX_DONATION,
} from "../src/lib/donationOptions.js";

/**
 * Order in which PayFast expects checkout fields to be signed and posted.
 * The signature is an MD5 of the non-empty fields in exactly this order.
 */
export const FIELD_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "notify_method",
  "name_first",
  "name_last",
  "email_address",
  "cell_number",
  "m_payment_id",
  "amount",
  "item_name",
  "item_description",
  "custom_int1",
  "custom_int2",
  "custom_int3",
  "custom_int4",
  "custom_int5",
  "custom_str1",
  "custom_str2",
  "custom_str3",
  "custom_str4",
  "custom_str5",
  "email_confirmation",
  "confirmation_address",
  "currency",
  "payment_method",
  "subscription_type",
  "billing_date",
  "recurring_amount",
  "frequency",
  "cycles",
  "subscription_notify_email",
  "subscription_notify_webhook",
  "subscription_notify_buyer",
];

export function isSandbox() {
  return String(process.env.PAYFAST_SANDBOX || "").toLowerCase() === "true";
}

export function payfastUrls() {
  const host = isSandbox() ? "sandbox.payfast.co.za" : "www.payfast.co.za";
  return {
    process: `https://${host}/eng/process`,
    validate: `https://${host}/eng/query/validate`,
  };
}

export function getConfig() {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  if (!merchantId || !merchantKey) {
    return null;
  }
  return { merchantId, merchantKey, passphrase };
}

export function getSiteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

/** PHP-style urlencode, which is what PayFast signs against. */
export function pfEncode(value) {
  return encodeURIComponent(String(value).trim())
    .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, "+");
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

/** Build `a=1&b=2` from ordered [key, value] pairs, skipping blanks. */
export function buildParamString(pairs) {
  return pairs
    .filter(([, value]) => !isBlank(value))
    .map(([key, value]) => `${key}=${pfEncode(value)}`)
    .join("&");
}

export function md5(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

export function signPairs(pairs, passphrase) {
  let paramString = buildParamString(pairs);
  if (passphrase) paramString += `&passphrase=${pfEncode(passphrase)}`;
  return md5(paramString);
}

/** Orders a field object and appends the signature. Returns [{ name, value }]. */
export function signCheckoutFields(fields, passphrase) {
  const pairs = FIELD_ORDER.filter((key) => !isBlank(fields[key])).map((key) => [key, String(fields[key]).trim()]);
  const signature = signPairs(pairs, passphrase);
  return [...pairs.map(([name, value]) => ({ name, value })), { name: "signature", value: signature }];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, max) {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, max);
}

/** Validates a donation request from the browser. Returns { value } or { error }. */
export function validateDonation(input) {
  const amountNumber = Number(input?.amount);
  if (!Number.isFinite(amountNumber)) return { error: "Please enter a valid donation amount." };
  const amount = Math.round(amountNumber * 100) / 100;
  if (amount < MIN_DONATION) return { error: `The minimum donation is R${MIN_DONATION}.` };
  if (amount > MAX_DONATION) return { error: "For gifts of this size, please contact the masjid directly." };

  const frequency = DONATION_FREQUENCIES.find((f) => f.id === input?.frequency);
  if (!frequency) return { error: "Please choose one-off or monthly." };

  const cause = DONATION_CAUSES.find((c) => c.id === input?.cause);
  if (!cause) return { error: "Please choose what your donation is for." };

  const firstName = clean(input?.firstName, 100);
  const lastName = clean(input?.lastName, 100);
  const email = clean(input?.email, 100);
  if (!firstName) return { error: "Please enter your first name." };
  if (!EMAIL_PATTERN.test(email)) return { error: "Please enter a valid email address." };

  return { value: { amount, frequency: frequency.id, cause, firstName, lastName, email } };
}

export function newPaymentId() {
  return `MIC-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`.toUpperCase();
}
