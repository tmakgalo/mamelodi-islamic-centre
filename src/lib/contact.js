/** South Africa: 073… → 2773… for wa.me links */
export function toWhatsAppNumber(localNumber) {
  const digits = localNumber.replace(/\D/g, "");
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppMessageUrl(phone, { name, email, subject, message }) {
  const text = [
    "Assalamu Alaikum,",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    subject ? `Subject: ${subject}` : "",
    "",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  const number = toWhatsAppNumber(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export async function sendContactEmail({ name, email, subject, message }) {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return { ok: false, reason: "missing_key" };
  }

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: accessKey,
      from_name: name,
      email,
      subject: subject || `Website enquiry — ${name}`,
      message,
    }),
  });

  const data = await response.json();
  return { ok: Boolean(data.success), reason: data.success ? null : "api_error" };
}
