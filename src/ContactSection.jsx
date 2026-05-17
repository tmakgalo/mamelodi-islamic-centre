import React, { useState } from "react";
import { buildWhatsAppMessageUrl, sendContactEmail } from "./lib/contact";

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-7 text-slate-600">{text}</p>}
    </div>
  );
}

export default function ContactSection({ masjid }) {
  const emptyForm = { name: "", email: "", subject: "", message: "" };
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const inputClass =
    "rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-600 w-full";
  const whatsappHref = buildWhatsAppMessageUrl(masjid.whatsapp, form);

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setStatusMessage("Please fill in your name, email, and message.");
      return;
    }

    setStatus("sending");
    setStatusMessage("");

    const result = await sendContactEmail(form);

    if (result.ok) {
      setStatus("success");
      setStatusMessage("Your message was sent to the masjid email. JazakAllah khair.");
      setForm(emptyForm);
      return;
    }

    if (result.reason === "missing_key") {
      window.open(buildWhatsAppMessageUrl(masjid.whatsapp, form), "_blank", "noopener,noreferrer");
      setStatus("success");
      setStatusMessage("Email is not configured yet - WhatsApp opened with your message. Tap Send to deliver it.");
      return;
    }

    setStatus("error");
    setStatusMessage("Could not send by email. Please use WhatsApp below.");
  }

  function openWhatsApp(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setStatus("error");
      setStatusMessage("Please enter at least your name and message for WhatsApp.");
      return;
    }
    window.open(whatsappHref, "_blank", "noopener,noreferrer");
  }

  return (
    <section id="contact" className="bg-emerald-50 px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Contact Us"
          title="Get in touch with the masjid"
          text="Send a message below - it goes to our email automatically. You can also reach us on WhatsApp."
        />
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-white p-8 shadow-lg shadow-emerald-900/5">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</p>
                <p className="mt-1">{masjid.address}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                <a href={`tel:${masjid.phone}`} className="mt-1 block text-emerald-800 hover:underline">
                  {masjid.phone}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                <a href={`mailto:${masjid.email}`} className="mt-1 block text-emerald-800 hover:underline">
                  {masjid.email}
                </a>
              </div>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={openWhatsApp}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 font-semibold text-white transition hover:bg-[#1da851]"
            >
              Message us on WhatsApp
            </a>
          </div>

          <form
            className="rounded-3xl bg-white p-8 shadow-lg shadow-emerald-900/5"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Full name"
                value={form.name}
                onChange={updateField("name")}
                required
              />
              <input
                type="email"
                className={inputClass}
                placeholder="Email address"
                value={form.email}
                onChange={updateField("email")}
                required
              />
            </div>
            <input
              className={`mt-4 ${inputClass}`}
              placeholder="Subject"
              value={form.subject}
              onChange={updateField("subject")}
            />
            <textarea
              className={`mt-4 min-h-32 ${inputClass}`}
              placeholder="Message"
              value={form.message}
              onChange={updateField("message")}
              required
            />
            {statusMessage && (
              <p
                className={`mt-4 text-sm ${status === "error" ? "text-red-600" : "text-emerald-800"}`}
                role="status"
              >
                {statusMessage}
              </p>
            )}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={status === "sending"}
                className="flex-1 rounded-2xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {status === "sending" ? "Sending..." : "Send to email"}
              </button>
              <button
                type="button"
                onClick={openWhatsApp}
                className="flex-1 rounded-2xl border border-[#25D366] px-6 py-3 font-semibold text-[#128C7E] transition hover:bg-green-50"
              >
                Send via WhatsApp
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
