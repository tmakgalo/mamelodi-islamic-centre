import React, { useMemo, useState } from "react";
import { getDailyPrayers, PRAYER_CONFIG } from "./lib/prayerTimes";
import { usePrayerTimes } from "./hooks/usePrayerTimes";
import ContactSection from "./ContactSection";

function LogoMark({ className = "" }) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 ${className}`}
    >
      MIC
    </span>
  );
}

const masjid = {
  name: "Mamelodi Islamic Centre",
  tagline: "A welcoming place of worship, learning, and service.",
  location: "Mamelodi, South Africa",
  phone: "0735963375",
  whatsapp: "0735963375",
  email: "tmakgalo@gmail.com",
  address: "18878 Sibande Street Mamelodi East, Pretoria, 0122",
  banking: {
    bank: "Absa",
    accountName: "Mamelodi Islamic Centre",
    accountNumber: "4061224152",
    branchCode: "632005",
    reference: "Donation / Sadaqah / Lillah",
  },
};

const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About the Masjid" },
  { id: "salah", label: "Salah Times & ECD" },
  { id: "events", label: "Events" },
  { id: "donations", label: "Donations" },
  { id: "contact", label: "Contact Us" },
  { id: "gallery", label: "Gallery" },
];

const ecdPrograms = [
  "Qur'an reading foundation",
  "Islamic manners and duas",
  "Arabic alphabet introduction",
  "Story time and creative activities",
];

const events = [
  {
    title: "Weekly Tafseer Class",
    date: "Every Wednesday",
    time: "After Esha",
    description: "A family-friendly weekly lesson covering selected verses and practical reminders.",
  },
  {
    title: "Youth Programme",
    date: "Every Saturday",
    time: "10:00 - 12:00",
    description: "Activities, reminders, mentorship, and community-building for young people.",
  },
  {
    title: "Community Feeding Drive",
    date: "Monthly",
    time: "To be announced",
    description: "Support local families through food parcels and volunteer service.",
  },
];

const aboutCards = [
  {
    title: "Daily Worship",
    text: "Open for the five daily prayers, Jumu'ah, Ramadan programmes, and special gatherings.",
  },
  {
    title: "Islamic Education",
    text: "Classes for children, youth, adults, and new learners in a welcoming environment.",
  },
  {
    title: "Community Care",
    text: "Charity, outreach, counselling, and support for families in need.",
  },
];

const galleryItems = [
  { title: "Main prayer hall", image: "/main-prayer-hall.jpg" },
  { title: "Community iftar", image: "/community-iftar.jpg" },
  { title: "Youth class", image: "/youth-class.jpg" },
  { title: "ECD learning area", image: "/ecd-learning-area.jpg" },
  { title: "Charity drive", image: "/charity-drive.jpg" },
  { title: "Masjid exterior", image: "/masjid-exterior.jpg" },
];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionHeader({ eyebrow, title, text, dark = false }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">{eyebrow}</p>
      <h2 className={`text-3xl font-bold tracking-tight md:text-4xl ${dark ? "text-white" : "text-slate-950"}`}>{title}</h2>
      {text && <p className={`mt-4 text-base leading-7 ${dark ? "text-slate-300" : "text-slate-600"}`}>{text}</p>}
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/30 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <button onClick={() => scrollToSection("home")} className="flex items-center gap-3 text-left">
          <LogoMark />
          <span>
            <span className="block text-lg font-bold text-slate-950">{masjid.name}</span>
            <span className="block text-xs text-slate-500">Faith | Unity | Service</span>
          </span>
        </button>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 lg:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setOpen(false);
                scrollToSection(item.id);
              }}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function SalahStatus({ loading, error, children }) {
  if (loading) return <p className="py-4 text-center text-sm text-slate-500">Loading today&apos;s prayer times...</p>;
  if (error) return <p className="py-4 text-center text-sm text-red-600">{error}</p>;
  return children;
}

function Hero({ prayer }) {
  const daily = getDailyPrayers(prayer.times);

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 pt-28 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-white" />
        <div className="absolute bottom-10 right-8 h-96 w-96 rounded-full bg-lime-200" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/20">
            Assalamu Alaikum wa Rahmatullah
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">{masjid.name}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50 md:text-xl">
            {masjid.tagline} Join us for daily salah, Islamic education, community programmes, charity, and family
            events.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => scrollToSection("salah")}
              className="rounded-2xl bg-white px-6 py-3 font-semibold text-emerald-900 shadow-xl shadow-black/10 transition hover:-translate-y-0.5"
            >
              View Salah Times
            </button>
            <button
              onClick={() => scrollToSection("donations")}
              className="rounded-2xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Support the Masjid
            </button>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white/10 p-5 shadow-2xl ring-1 ring-white/20 backdrop-blur">
          <div className="rounded-[1.5rem] bg-white p-6 text-slate-950">
            <h3 className="text-xl font-bold">Today&apos;s Salah Times</h3>
            {prayer.dateLabel && <p className="mt-1 mb-4 text-xs text-slate-500">{prayer.dateLabel}</p>}
            <SalahStatus loading={prayer.loading} error={prayer.error}>
              <div className="space-y-3">
                {daily.map((time) => (
                  <div
                    key={time.name}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <span className="font-semibold">{time.name}</span>
                    <span className="text-sm text-slate-600">
                      Adhan {time.adhan} | Iqamah {time.iqamah}
                    </span>
                  </div>
                ))}
              </div>
            </SalahStatus>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="bg-white px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="About the Masjid"
          title="A home for worship, learning, and community service"
          text="Our masjid serves the community through daily prayers, Jumu'ah, Islamic education, youth development, welfare projects, and family programmes."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {aboutCards.map((card) => (
            <div key={card.title} className="rounded-3xl border border-slate-100 bg-slate-50 p-7 shadow-sm">
              <h3 className="mb-3 text-xl font-bold text-slate-950">{card.title}</h3>
              <p className="leading-7 text-slate-600">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SalahAndEcd({ prayer }) {
  return (
    <section id="salah" className="bg-emerald-50 px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Salah Times & ECD"
          title="Prayer times and early childhood development"
          text={`Adhan times for ${PRAYER_CONFIG.city} (Muslim World League), updated daily. Iqamah follows masjid schedule.`}
        />
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-emerald-900/5">
            <div className="grid grid-cols-3 bg-emerald-800 px-5 py-4 text-sm font-semibold text-white">
              <span>Salah</span>
              <span>Adhan</span>
              <span>Iqamah</span>
            </div>
            <SalahStatus loading={prayer.loading} error={prayer.error}>
              {prayer.times.map((time, index) => (
                <div
                  key={time.name}
                  className={`grid grid-cols-3 px-5 py-4 ${index % 2 ? "bg-slate-50" : "bg-white"}`}
                >
                  <span className="font-semibold text-slate-950">{time.name}</span>
                  <span className="text-slate-700">{time.adhan}</span>
                  <span className="text-slate-700">{time.iqamah}</span>
                </div>
              ))}
            </SalahStatus>
          </div>
          <div className="rounded-3xl bg-white p-7 shadow-xl shadow-emerald-900/5">
            <h3 className="mb-5 text-2xl font-bold text-slate-950">ECD Programme</h3>
            <p className="mb-5 leading-7 text-slate-600">
              Our ECD programme introduces young children to Islamic values, basic learning skills, creativity, and
              social development.
            </p>
            <ul className="space-y-3">
              {ecdPrograms.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-slate-700">
                  <span className="mt-0.5 shrink-0 font-bold text-emerald-700">-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Events() {
  return (
    <section id="events" className="bg-white px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Events"
          title="Upcoming programmes and community gatherings"
          text="Keep the community informed with weekly classes, youth events, Ramadan programmes, fundraisers, and welfare initiatives."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.title}
              className="rounded-3xl border border-slate-100 bg-white p-7 shadow-lg shadow-slate-900/5"
            >
              <h3 className="mb-2 text-xl font-bold text-slate-950">{event.title}</h3>
              <p className="mb-4 font-medium text-emerald-800">
                {event.date} | {event.time}
              </p>
              <p className="leading-7 text-slate-600">{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Donations() {
  const [copied, setCopied] = useState(false);
  const bankText = useMemo(
    () =>
      `${masjid.banking.accountName}\n${masjid.banking.bank}\nAccount: ${masjid.banking.accountNumber}\nBranch: ${masjid.banking.branchCode}\nReference: ${masjid.banking.reference}`,
    []
  );
  const copyBankDetails = async () => {
    try {
      await navigator.clipboard.writeText(bankText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="donations" className="bg-slate-950 px-4 py-20 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          dark
          eyebrow="Donations"
          title="Support the house of Allah"
          text="Your donations help maintain the masjid, support education, welfare, outreach, feeding schemes, and community programmes."
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-white/10 p-8 ring-1 ring-white/10">
            <h3 className="mb-4 text-2xl font-bold">Ways to Donate</h3>
            <div className="space-y-3 text-slate-200">
              <p>- Lillah for masjid operations and maintenance</p>
              <p>- Sadaqah for community welfare</p>
              <p>- Zakaah collection and distribution, where applicable</p>
              <p>- Sponsor ECD, youth, and education programmes</p>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-8 text-slate-950 shadow-2xl">
            <h3 className="mb-5 text-2xl font-bold">Banking Details</h3>
            <dl className="space-y-4">
              {Object.entries({
                "Account Name": masjid.banking.accountName,
                Bank: masjid.banking.bank,
                "Account Number": masjid.banking.accountNumber,
                "Branch Code": masjid.banking.branchCode,
                Reference: masjid.banking.reference,
              }).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="font-medium text-slate-500">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <button
              onClick={copyBankDetails}
              className="mt-6 w-full rounded-2xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
            >
              {copied ? "Copied" : "Copy Banking Details"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function GalleryCard({ item, index }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = item.image && !imageFailed;
  const fileName = item.image?.replace(/^\//, "");

  return (
    <div className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-50 shadow-lg shadow-slate-900/5">
      {showPhoto ? (
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-emerald-100 opacity-60" />
          <div className="relative px-4 text-center">
            <p className="font-bold text-slate-800">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">
              {fileName ? "Add this file to the public folder:" : `Photo ${index + 1}`}
            </p>
            {fileName && (
              <p className="mt-2 rounded-lg bg-white/80 px-3 py-1 font-mono text-xs text-emerald-800">{fileName}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Gallery() {
  return (
    <section id="gallery" className="bg-white px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Gallery" title="Moments from our community" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item, index) => (
            <GalleryCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 px-4 py-10 text-slate-300 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold text-white">{masjid.name}</p>
          <p className="mt-1 text-sm">{masjid.location}</p>
        </div>
        <p className="text-sm">
          Copyright {new Date().getFullYear()} {masjid.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  const prayer = usePrayerTimes();
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      <Hero prayer={prayer} />
      <About />
      <SalahAndEcd prayer={prayer} />
      <Events />
      <Donations />
      <ContactSection masjid={masjid} />
      <Gallery />
      <Footer />
    </div>
  );
}
