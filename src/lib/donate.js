/**
 * Asks the server to validate and sign the donation, then sends the donor to PayFast
 * by submitting the signed fields as a form. Throws an Error with a donor-friendly message.
 */
export async function startPayFastCheckout(donation) {
  let response;
  try {
    response = await fetch("/api/payfast-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(donation),
    });
  } catch {
    throw new Error("Could not reach the payment service. Please check your connection and try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Online payments are not available right now. Please use the bank transfer details below.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong starting your donation. Please try again.");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = data.action;
  for (const { name, value } of data.fields) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

/** "R1 234.50": non-breaking space for thousands, dot for cents, same on every device. */
export function formatRand(amount) {
  const value = Math.round((Number(amount) || 0) * 100) / 100;
  const [whole, cents] = value.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `R${grouped}${cents === "00" ? "" : `.${cents}`}`;
}
