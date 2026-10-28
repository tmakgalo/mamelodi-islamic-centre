import {
  getConfig,
  getSiteUrl,
  newPaymentId,
  payfastUrls,
  signCheckoutFields,
  validateDonation,
} from "./_payfast.js";

/**
 * Validates a donation request and returns signed PayFast checkout fields.
 * The merchant key and passphrase never leave the server.
 */
export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const config = getConfig();
  if (!config) {
    return res.status(503).json({
      error: "Online donations are not set up yet. Please use the bank transfer details for now.",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid request." });
    }
  }

  const result = validateDonation(body);
  if (result.error) return res.status(400).json({ error: result.error });

  const { amount, frequency, cause, firstName, lastName, email } = result.value;
  const siteUrl = getSiteUrl(req);
  const monthly = frequency === "monthly";
  const amountText = amount.toFixed(2);

  const fields = signCheckoutFields(
    {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: `${siteUrl}/donate/success`,
      cancel_url: `${siteUrl}/donate/cancel`,
      notify_url: `${siteUrl}/api/payfast-itn`,
      name_first: firstName,
      name_last: lastName,
      email_address: email,
      m_payment_id: newPaymentId(),
      amount: amountText,
      item_name: `${monthly ? "Monthly donation" : "Donation"} - ${cause.label}`.slice(0, 100),
      item_description: "Mamelodi Islamic Centre",
      custom_str1: cause.id,
      custom_str2: frequency,
      email_confirmation: "1",
      confirmation_address: process.env.DONATION_NOTIFY_EMAIL,
      // Monthly: type 1 = subscription, frequency 3 = monthly, cycles 0 = until cancelled.
      subscription_type: monthly ? "1" : undefined,
      recurring_amount: monthly ? amountText : undefined,
      frequency: monthly ? "3" : undefined,
      cycles: monthly ? "0" : undefined,
    },
    config.passphrase
  );

  return res.status(200).json({ action: payfastUrls().process, fields });
}
