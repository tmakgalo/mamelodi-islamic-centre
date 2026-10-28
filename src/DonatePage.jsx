import React, { useMemo, useState } from "react";
import { masjid } from "./lib/masjid";
import {
  DONATION_CAUSES,
  DONATION_FREQUENCIES,
  MAX_DONATION,
  MIN_DONATION,
  PRESET_AMOUNTS,
} from "./lib/donationOptions";
import { formatRand, startPayFastCheckout } from "./lib/donate";

function DonateHeader() {
  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
        <a href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-900/20">
            MIC
          </span>
          <span className="text-lg font-bold text-slate-950">{masjid.name}</span>
        </a>
        <a href="/" className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800">
          Back to website
        </a>
      </div>
    </header>
  );
}

function DonateFooter() {
  return (
    <footer className="bg-slate-950 px-4 py-8 text-center text-sm text-slate-300">
      <p>
        {masjid.name} | {masjid.address}
      </p>
      <p className="mt-1">
        Questions about a donation? Call{" "}
        <a href={`tel:${masjid.phone}`} className="text-emerald-300 hover:underline">
          {masjid.phone}
        </a>{" "}
        or email{" "}
        <a href={`mailto:${masjid.email}`} className="text-emerald-300 hover:underline">
          {masjid.email}
        </a>
        .
      </p>
    </footer>
  );
}

function BankDetails() {
  const [copied, setCopied] = useState(false);
  const { banking } = masjid;
  const rows = [
    ["Account name", banking.accountName],
    ["Bank", banking.bank],
    ["Account number", banking.accountNumber],
    ["Branch code", banking.branchCode],
    ["Reference", banking.reference],
  ];

  async function copy() {
    const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-7 shadow-lg shadow-emerald-900/5">
      <h2 className="text-xl font-bold text-slate-950">Prefer a bank transfer?</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">You can also donate directly into the masjid account.</p>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-2">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-semibold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
      <button
        onClick={copy}
        className="mt-5 w-full rounded-2xl border border-emerald-700 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
      >
        {copied ? "Copied" : "Copy banking details"}
      </button>
    </div>
  );
}

function DonationForm() {
  const [frequency, setFrequency] = useState("once");
  const [preset, setPreset] = useState(100);
  const [custom, setCustom] = useState("");
  const [cause, setCause] = useState(DONATION_CAUSES[0].id);
  const [donor, setDonor] = useState({ firstName: "", lastName: "", email: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amount = useMemo(() => (custom !== "" ? Number(custom) : preset), [custom, preset]);
  const amountValid = Number.isFinite(amount) && amount >= MIN_DONATION && amount <= MAX_DONATION;
  const monthly = frequency === "monthly";

  const inputClass =
    "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-600";

  function choosePreset(value) {
    setPreset(value);
    setCustom("");
  }

  function updateDonor(field) {
    return (e) => setDonor((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!amountValid) {
      setError(`Please choose an amount between ${formatRand(MIN_DONATION)} and ${formatRand(MAX_DONATION)}.`);
      return;
    }

    setSubmitting(true);
    try {
      await startPayFastCheckout({ amount, frequency, cause, ...donor });
      // The browser is now navigating to PayFast; keep the button disabled.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-7 shadow-xl shadow-emerald-900/5 md:p-9">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          1. How often?
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {DONATION_FREQUENCIES.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={frequency === option.id}
              onClick={() => setFrequency(option.id)}
              className={`rounded-2xl border px-4 py-3 font-semibold transition ${
                frequency === option.id
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-slate-200 text-slate-700 hover:border-emerald-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {monthly && (
          <p className="mt-3 text-sm text-slate-600">
            Your card is charged this amount every month until you cancel through PayFast.
          </p>
        )}
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          2. How much?
        </legend>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {PRESET_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={custom === "" && preset === value}
              onClick={() => choosePreset(value)}
              className={`rounded-2xl border px-3 py-3 font-semibold transition ${
                custom === "" && preset === value
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-slate-200 text-slate-700 hover:border-emerald-600"
              }`}
            >
              {formatRand(value)}
            </button>
          ))}
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm text-slate-600">Or enter your own amount (ZAR)</span>
          <div className="flex items-center rounded-2xl border border-slate-200 focus-within:border-emerald-600">
            <span className="pl-4 font-semibold text-slate-500">R</span>
            <input
              type="number"
              inputMode="decimal"
              min={MIN_DONATION}
              max={MAX_DONATION}
              step="0.01"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={`${MIN_DONATION} or more`}
              className="w-full rounded-2xl bg-transparent px-3 py-3 outline-none"
            />
          </div>
        </label>
      </fieldset>

      <div className="mt-8">
        <label htmlFor="cause" className="mb-3 block text-sm font-semibold uppercase tracking-wide text-slate-500">
          3. What is it for?
        </label>
        <select id="cause" value={cause} onChange={(e) => setCause(e.target.value)} className={inputClass}>
          {DONATION_CAUSES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="mt-8">
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          4. Your details
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="First name"
            autoComplete="given-name"
            value={donor.firstName}
            onChange={updateDonor("firstName")}
            required
          />
          <input
            className={inputClass}
            placeholder="Last name"
            autoComplete="family-name"
            value={donor.lastName}
            onChange={updateDonor("lastName")}
          />
        </div>
        <input
          type="email"
          className={`mt-4 ${inputClass}`}
          placeholder="Email address (for your payment receipt)"
          autoComplete="email"
          value={donor.email}
          onChange={updateDonor("email")}
          required
        />
      </fieldset>

      {error && (
        <p role="alert" className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !amountValid}
        className="mt-8 w-full rounded-2xl bg-emerald-700 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Taking you to PayFast..."
          : amountValid
          ? `Donate ${formatRand(amount)}${monthly ? " monthly" : ""} with PayFast`
          : "Choose an amount to continue"}
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-slate-500">
        You will complete your payment on PayFast&apos;s secure site. We never see or store your card details.
      </p>
    </form>
  );
}

function Notice({ tone, title, children }) {
  const colour = tone === "success" ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900";
  return (
    <div className={`mx-auto max-w-2xl rounded-3xl p-10 text-center ${colour}`}>
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-4 space-y-3 leading-7">{children}</div>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a href="/" className="rounded-2xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800">
          Back to website
        </a>
        {tone !== "success" && (
          <a href="/donate" className="rounded-2xl border border-emerald-700 px-6 py-3 font-semibold text-emerald-800 hover:bg-white">
            Try again
          </a>
        )}
      </div>
    </div>
  );
}

export default function DonatePage() {
  const path = window.location.pathname.replace(/\/+$/, "");

  let body;
  if (path === "/donate/success") {
    body = (
      <Notice tone="success" title="JazakAllah khair">
        <p>Thank you for your donation to {masjid.name}. May Allah accept it from you and reward you abundantly.</p>
        <p>PayFast will email you a payment receipt. If you do not see it, please check your spam folder.</p>
      </Notice>
    );
  } else if (path === "/donate/cancel") {
    body = (
      <Notice tone="cancel" title="Donation not completed">
        <p>Your payment was cancelled and you have not been charged.</p>
        <p>If you ran into a problem, you are welcome to try again or use the bank transfer details instead.</p>
      </Notice>
    );
  } else {
    body = (
      <>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Donate now</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">Support the house of Allah</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Your giving helps maintain the masjid and supports education, welfare, outreach and community programmes.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
          <DonationForm />
          <BankDetails />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 font-sans text-slate-900">
      <DonateHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">{body}</main>
      <DonateFooter />
    </div>
  );
}
