"use client";

import { useEffect, useMemo, useState } from "react";

/* -----------------------------------------
   Types
------------------------------------------*/
type LightboxImage = { src: string; caption?: string; long?: string };

/* -----------------------------------------
   Polished captions (Gallery FRONT)
------------------------------------------*/
const CAPTIONS: Record<string, string> = {
  "bedroom-view.jpg": "Morning light from a bedroom",
  "capri-view.jpg": "Capri across the bay",
  "classic-painting.jpg": "An early view of the villa",
  "family-history.jpg": "Giorgio’s grandmother in Capri",
  "family-history2.jpeg": "“Il Piviere”, the family sailing boat",
  "far-shot-of-the-house.jpg": "The villa among olive groves above the sea",
  "night-view-villa.jpeg": "Evening view from the terrace",
  "old-skool-view-of-the-house.jpg": "The house as it once was",
  "capri-thunderstorm.jpg": "A storm passing over Capri",
  "giorgio-nicola-capri.jpg": "Choosing the next cove — Capri",
  "simba-mascot.jpg": "Simba, the house guardian",
  "capri-from-footpath.jpg": "Capri at dusk from the footpath",
  "sunset-view.jpg": "Soft light over the Sorrento coast",
};

/* -----------------------------------------
   Longer archive descriptions (BACK only)
------------------------------------------*/
const ARCHIVE_LONG: Record<string, string> = {
  "classic-painting.jpg":
    "An early painting of the property held in a private collection. The view captures the original terraces and the quiet slope above the sea.",
  "family-history.jpg":
    "A summer portrait of Giorgio’s grandmother in Capri—the island has always been part of the family’s daily horizon.",
  "family-history2.jpeg":
    "“Il Piviere”, the family’s historic sailing boat, was used for slow crossings and afternoon swims when the gulf breeze rose gently.",
  "old-skool-view-of-the-house.jpg":
    "A historic view of the villa—stone, olives, and the same line of sea—showing how little the essentials have changed.",
  "natalia-gabriele-calvino.jpg":
    "Pictured: Italo Calvino with Natalia Ginzburg and Gabriele Baldini during summer visits—writers who found quiet here to talk and read.",
  "natalia-gabriele-calvino.png":
    "Pictured: Italo Calvino with Natalia Ginzburg and Gabriele Baldini during summer visits—writers who found quiet here to talk and read.",
};

/* ---------- helpers ---------- */
const getCaption = (file: string) =>
  CAPTIONS[file] ?? CAPTIONS[file.toLowerCase()] ?? pretty(file);

/* Sentence-case helper for nicer fallbacks */
function sentenceCase(s: string) {
  const t = s.trim();
  if (!t) return "";
  return t[0].toUpperCase() + t.slice(1);
}

/* Concise fallback for archive captions (no preface phrase) */
function getArchiveLong(file: string): string {
  const direct = ARCHIVE_LONG[file] ?? ARCHIVE_LONG[file.toLowerCase()];
  if (direct) return direct;

  const lc = file.toLowerCase();
  const base =
    lc
      .replace(/^archive[-_ ]*/i, "")
      .replace(/\.(jpe?g|png|webp)$/i, "")
      .replace(/[-_]+/g, " ")
      .trim() || "Family moment";

  const hints: string[] = [];
  if (/capri/.test(lc)) hints.push("near Capri");
  if (/(amalfi|positano)/.test(lc)) hints.push("along the Amalfi coast");
  if (/(boat|sail|deck|mast|piviere)/.test(lc))
    hints.push("on the family boat");
  if (/(beach|cove|rock|cliff|shore)/.test(lc)) hints.push("by the water");
  if (/(harbour|harbor|port|marina|pier)/.test(lc))
    hints.push("in the small harbour");

  const title = sentenceCase(base);
  const where = hints.length ? " — " + hints.join(", ") : "";
  return `${title}${where}.`;
}

/* Fallback caption prettifier */
function pretty(fileOrBase: string) {
  const base = fileOrBase.replace(/\.[a-z0-9]+$/i, "");
  return base.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

/* -----------------------------------------
   Exclusions (keep these out of Gallery)
------------------------------------------*/
const EXCLUDE_EXACT_LC = new Set([
  "villa-hero.jpg", // hero / hosts visual
  "old-skool-view-of-the-house.jpg", // hero background
  "hosts.jpg",
]);

function shouldExclude(name: string) {
  const lc = name.toLowerCase();
  if (EXCLUDE_EXACT_LC.has(lc)) return true;
  if (/^activity-/.test(lc)) return true;
  if (/\bdon\s*alfonso\b/.test(lc.replace(/[-_]/g, " "))) return true;
  if (/\bhosts\b/.test(lc)) return true;
  return false;
}

/* -----------------------------------------
   Archive classification (case-insensitive)
------------------------------------------*/
const HISTORICAL_SET_LC = new Set(
  [
    "classic-painting.jpg",
    "family-history.jpg",
    "family-history2.jpeg",
    "natalia-gabriele-calvino.jpg",
    "natalia-gabriele-calvino.png",
    "old-skool-view-of-the-house.jpg",
  ].map((s) => s.toLowerCase())
);

function isHistorical(name: string) {
  const lc = name.toLowerCase();
  const base = lc.replace(/\.(jpe?g|png|webp)$/i, "");
  if (base.startsWith("archive")) return true;
  if (HISTORICAL_SET_LC.has(lc)) return true;
  if (/classic[\s\-_]?painting/.test(base)) return true; // tolerate variants
  return false;
}

/* -----------------------------------------
   Activities
------------------------------------------*/
type Activity = {
  img: string;
  title: string;
  lead: string;
  details: string;
  wide?: boolean;
};

const ACTIVITIES: Activity[] = [
  {
    img: "/images/activity-boat.jpg",
    title: "Private Boat Trip to Positano, Capri & Amalfi",
    lead: "Tap or hover to read more",
    details:
      "A day at sea with a private skipper: swim in quiet coves, circle Capri’s grottoes and pause for lunch at a trattoria on the water. Time ashore to wander piazzas — towels and masks provided.",
  },
  {
    img: "/images/activity-don-alfonso.jpg",
    title: "Dinner at Don Alfonso 1890",
    lead: "Tap or hover to read more",
    details:
      "A Michelin-starred evening rooted in Campanian tradition: seasonal produce from the estate gardens, a storied cellar and warm, attentive service. We arrange timings and transfers.",
  },
  {
    img: "/images/activity-limoncello.jpg",
    title: "Limoncello of the Villa",
    lead: "Tap or hover to read more",
    details:
      "Pick Sorrento lemons and learn the family method — fine zesting, patient maceration, a gentle blend. We prepare a small batch together; you keep the recipe.",
  },
  {
    img: "/images/activity-pizza.jpg",
    title: "Neapolitan Pizza Making",
    lead: "Tap or hover to read more",
    details:
      "Dough from scratch with a local pizzaiolo; San Marzano, fior di latte, basil. Bake in a wood-fired oven and enjoy on the terrace at sunset. Suitable for all ages.",
  },
  {
    img: "/images/activity-giardino.jpg",
    title: "Giardino Romantico Beach Day",
    lead: "Tap or hover to read more",
    details:
      "A quiet garden by the sea: sunbeds, pine shade and clear water. Towels and a light lunch arranged, with time to stroll the coast path if you wish.",
    wide: true,
  },
];

/* -----------------------------------------
   Simple Lightbox
------------------------------------------*/
function Lightbox({
  items,
  index,
  onClose,
  setIndex,
}: {
  items: LightboxImage[];
  index: number;
  onClose: () => void;
  setIndex: (i: number) => void;
}) {
  if (index < 0) return null;
  const item = items[index];
  const prev = () => setIndex((index - 1 + items.length) % items.length);
  const next = () => setIndex((index + 1) % items.length);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.src}
          alt={item.caption ?? "Image"}
          className="w-full h-auto rounded-xl shadow-lg"
        />
        {item.caption && (
          <div className="mt-3 text-center text-white/90 text-sm title-serif">
            {item.caption}
          </div>
        )}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 px-4 py-2 text-white/90 hover:text-white"
          aria-label="Previous"
        >
          ◀
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 px-4 py-2 text-white/90 hover:text-white"
          aria-label="Next"
        >
          ▶
        </button>
        <button
          onClick={onClose}
          className="absolute right-2 -top-12 md:-top-10 px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white"
          aria-label="Close"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* -----------------------------------------
   Activity flip card (hover desktop, tap mobile)
------------------------------------------*/
function ActivityCard({ img, title, lead, details, wide = false }: Activity) {
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      (e.currentTarget as HTMLElement).classList.toggle("flipped");
    }
  };
  return (
    <div
      className={`flip-card h-[360px] md:h-[420px] ${
        wide ? "md:col-span-2" : ""
      }`}
      onClick={onClick}
    >
      <div className="flip-inner">
        {/* FRONT */}
        <div className="flip-face flip-front">
          <img src={img} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="title-serif text-[22px] md:text-[24px] mb-1">
              {title}
            </h3>
            <p className="text-sm/6 opacity-90">{lead}</p>
          </div>
        </div>
        {/* BACK (warm neutral, readable) */}
        <div className="flip-face flip-back">
          <div className="max-w-lg text-center px-4">
            <h3 className="title-serif text-[22px] md:text-[24px] mb-3">
              {title}
            </h3>
            <p className="text-[14.5px] leading-7">{details}</p>
            <p className="mt-4 text-xs text-slate-600">Tap again to return</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------
   FlipFigure (Gallery & Archives)
   - Gallery: caption bottom-left on FRONT
   - Archive: NO front text; FULL text on BACK
------------------------------------------*/
function FlipFigure({
  item,
  variant,
  onOpen,
}: {
  item: LightboxImage;
  variant: "gallery" | "archive";
  onOpen: () => void;
}) {
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      (e.currentTarget as HTMLElement).classList.toggle("flipped");
    }
  };

  const short = item.caption ?? "";
  const long = item.long ?? item.caption ?? "";

  return (
    <div className="rounded-xl shadow bg-white overflow-hidden">
      <div className="flip-card aspect-[4/3] w-full" onClick={onClick}>
        <div className="flip-inner">
          {/* FRONT */}
          <div className="flip-face flip-front">
            <img
              src={item.src}
              alt={short || "Photo"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
            {variant === "gallery" && (
              <div className="absolute bottom-0 left-0 p-3 text-white">
                <p className="title-serif text-[13px] md:text-[14px]">
                  {short}
                </p>
              </div>
            )}
            {/* variant === "archive": no text on front */}
          </div>
          {/* BACK */}
          <div className="flip-face flip-back">
            <div className="max-w-md text-center px-4">
              <p className="figcaption-elegant">
                {variant === "archive" ? long : short}
              </p>
              <button
                className="mt-4 inline-block rounded-2xl bg-slate-900 text-white px-4 py-2 hover:bg-black"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
              >
                View full size
              </button>
              <p className="mt-3 text-[11px] text-slate-600">
                Tap again to return
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN
===========================================================================*/
export default function VillaExperience() {
  const [files, setFiles] = useState<string[]>([]);
  const [lightboxItems, setLightboxItems] = useState<LightboxImage[]>([]);
  const [lbIndex, setLbIndex] = useState(-1);

  /* NEW: mobile menu state */
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => Array.isArray(data.images) && setFiles(data.images))
      .catch(() => setFiles([]));
  }, []);

  /* Build Gallery & Archives (case-insensitive rules) */
  const { galleryItems, archiveItems } = useMemo(() => {
    const imgFiles = files
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .filter((f) => !shouldExclude(f))
      .sort();

    const gallery: LightboxImage[] = [];
    const archive: LightboxImage[] = [];

    for (const f of imgFiles) {
      const short = getCaption(f);
      const item: LightboxImage = { src: `/images/${f}`, caption: short };
      if (isHistorical(f)) {
        item.long = getArchiveLong(f);
        archive.push(item);
      } else {
        gallery.push(item);
      }
    }
    return { galleryItems: gallery, archiveItems: archive };
  }, [files]);

  const openLightbox = (items: LightboxImage[], at: number) => {
    setLightboxItems(items);
    setLbIndex(at);
  };
  const closeLightbox = () => setLbIndex(-1);

  const hostsImg: LightboxImage = {
    src: "/images/villa-hero.jpg",
    caption: "Your hosts: Giorgio & Nicola",
  };

  return (
    <div className="text-slate-800">
      {/* ============================== HERO ============================== */}
      <header
        id="home"
        className="relative h-[78vh] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/old-skool-view-of-the-house.jpg')",
        }}
      >
        <div className="absolute top-0 inset-x-0 z-20 bg-white/70 backdrop-blur border-b">
          <nav className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="#home" className="title-serif text-lg">
              Villa Ceradini
            </a>

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center gap-6 text-sm">
              <li>
                <a className="hover:opacity-70" href="#villa">
                  The Villa
                </a>
              </li>
              <li>
                <a className="hover:opacity-70" href="#history">
                  History
                </a>
              </li>
              <li>
                <a className="hover:opacity-70" href="#activities">
                  Activities
                </a>
              </li>
              <li>
                <a className="hover:opacity-70" href="#gallery">
                  Gallery
                </a>
              </li>
              <li>
                <a className="hover:opacity-70" href="#archives">
                  Historical Archives
                </a>
              </li>
              <li>
                <a className="hover:opacity-70" href="#hosts">
                  Hosts
                </a>
              </li>
              <li>
                <a className="hover:opacity-70" href="#contact">
                  Contact
                </a>
              </li>
            </ul>

            {/* Desktop CTA */}
            <a
              href="#contact"
              className="hidden md:inline-block rounded-2xl bg-slate-900 text-white px-4 py-2 hover:bg-black"
            >
              Request a Quote
            </a>

            {/* Burger (mobile only) */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-800 hover:bg-slate-100"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                /* close icon */
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                /* burger icon */
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path
                    d="M3 6h18M3 12h18M3 18h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </nav>

          {/* Mobile menu panel */}
          <div
            className={`md:hidden border-t bg-white/95 backdrop-blur transition-all duration-200 ${
              menuOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <ul className="px-6 py-4 space-y-3 text-slate-800">
              <li>
                <a onClick={closeMenu} className="block py-2" href="#villa">
                  The Villa
                </a>
              </li>
              <li>
                <a onClick={closeMenu} className="block py-2" href="#history">
                  History
                </a>
              </li>
              <li>
                <a
                  onClick={closeMenu}
                  className="block py-2"
                  href="#activities"
                >
                  Activities
                </a>
              </li>
              <li>
                <a onClick={closeMenu} className="block py-2" href="#gallery">
                  Gallery
                </a>
              </li>
              <li>
                <a onClick={closeMenu} className="block py-2" href="#archives">
                  Historical Archives
                </a>
              </li>
              <li>
                <a onClick={closeMenu} className="block py-2" href="#hosts">
                  Hosts
                </a>
              </li>
              <li>
                <a onClick={closeMenu} className="block py-2" href="#contact">
                  Contact / Request a Quote
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div className="max-w-3xl">
            <h1 className="title-serif text-white text-5xl md:text-6xl mb-4 drop-shadow">
              Villa Ceradini
            </h1>
            <p className="text-white/95 text-lg md:text-xl">
              More than a villa — a calm base to explore the Amalfi &amp;
              Sorrento coast.
            </p>
          </div>
        </div>
      </header>

      {/* ============================== ABOUT ============================== */}
      <section id="villa" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl font-semibold mb-6">
          About the Villa
        </h2>

        <div className="max-w-3xl space-y-5 leading-relaxed">
          <p>
            The villa is both a home and a gathering place. With{" "}
            <strong>7 bedrooms</strong>, it welcomes up to{" "}
            <strong>12 guests</strong> in comfort—plenty of room for families or
            friends. A swimming pool offers a sunny pause and there’s fast Wi-Fi
            if needed.
          </p>
          <p>
            The estate spreads across roughly <strong>seven hectares</strong> of
            terraced gardens, olive groves and citrus. Depending on where you
            sleep, you wake to views of <strong>Capri</strong>,{" "}
            <strong>Ischia</strong>, <strong>Procida</strong> or the wide{" "}
            <strong>Gulf of Naples</strong>. There are quiet corners for
            reading, big tables for long lunches, and shaded terraces for the
            evening light.
          </p>
          <p>
            If you like to cook, the kitchen is generous and the{" "}
            <strong>vegetable garden</strong> supplies seasonal produce. We can
            point you to our favourite fishermen and market stalls, and there’s
            a wood oven on the terrace for simple pizza nights.
          </p>
          <p>
            Arrivals are easy: we <strong>personally meet you in Naples</strong>
            —airport, station, or port—and bring you to the villa. At the end of
            your stay we take you back the same way. Days here move at your
            pace: a private boat day, a pizza lesson at sunset, tasting the
            villa’s own limoncello—or simply a book by the pool. The idea is
            unhurried time, well spent.
          </p>
        </div>
      </section>

      {/* ============================== HISTORY ============================== */}
      <section id="history" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl font-semibold mb-6">
          History of the Villa
        </h2>

        <div className="space-y-4 max-w-3xl leading-7">
          <p>
            The villa began as a Saracen watchtower and later became a
            Neapolitan baron&apos;s summer house. For centuries the ground floor
            was used for farming, and the old grain millstone and wine press
            still sit by the kitchen.
          </p>

          <p>
            In the 1700s an ancestor worked a quarry along this stretch of
            coast. He was contracted to cut back a rocky shoreline; the stone
            that broke away was taken down to the water, loaded onto small carts
            and then boats, and shipped to Naples to help build the port. To
            manage the work he needed a base nearby, so he bought this estate
            and made the tower and farm his home.
          </p>

          <p>
            The <strong>Ceradini</strong> family kept it as their summer place.{" "}
            <strong> Cesare Ceradini</strong> founded the Engineering School of
            Rome at San Pietro in Vincoli; his son <strong>Giulio</strong> used
            the house while developing ideas for a link between{" "}
            <strong>Sicily</strong> and <strong>Calabria</strong>. On the{" "}
            <strong>Baldini</strong> side, <strong>Antonio Baldini</strong>
            —writer and journalist—brought friends and conversation; his son{" "}
            <strong>Gabriele Baldini</strong>, a literary critic who later
            married <strong>Natalia Ginzburg</strong>, did the same. The house
            often welcomed friends and writers — among them{" "}
            <strong>Italo Calvino</strong>, who visited Giorgio’s
            great-grandmother during summer.
          </p>

          <p>
            It remains a lived-in, straightforward house: stone, terraces and
            sea views, now shared with guests who like the same unhurried
            rhythm.
          </p>
        </div>
      </section>

      {/* ============================== ACTIVITIES ============================== */}
      <section id="activities" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="title-serif text-3xl font-semibold mb-10">
          Curated Activities
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {ACTIVITIES.map((a, i) => (
            <ActivityCard key={i} {...a} />
          ))}
        </div>
      </section>

      {/* ============================== GALLERY ============================== */}
      <section id="gallery" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="title-serif text-3xl font-semibold mb-6">Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {galleryItems.map((item, idx) => (
            <FlipFigure
              key={item.src}
              item={item}
              variant="gallery"
              onOpen={() => openLightbox(galleryItems, idx)}
            />
          ))}
        </div>
      </section>

      {/* ========================== HISTORICAL ARCHIVES ========================== */}
      <section id="archives" className="max-w-6xl mx-auto px-6 pb-12">
        <h2 className="title-serif text-3xl font-semibold mb-6">
          Historical Archives
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {archiveItems.map((item, idx) => (
            <FlipFigure
              key={item.src}
              item={item}
              variant="archive"
              onOpen={() => openLightbox(archiveItems, idx)}
            />
          ))}
        </div>
      </section>

      {/* ============================== HOSTS ============================== */}
      <section id="hosts" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl font-semibold mb-6">
          Meet Your Hosts
        </h2>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Text */}
          <div className="md:col-span-2 space-y-5 leading-relaxed">
            <p>
              Giorgio and Nicola first met at Ca’ Foscari University in Venice
              and later both graduated from the London School of Economics.
              Today Giorgio works in the City of London as an insurance broker
              and Nicola works for the Italian Government in Rome. They’re
              lifelong friends and local enthusiasts for the Amalfi–Sorrento
              coast.
            </p>

            <p>
              They grew up spending summers in and around this house—simple days
              on the water, long dinners on the terrace—and decided to open the
              doors to share that same ease with guests. They still join many of
              the activities themselves to keep every detail smooth and
              unhurried.
            </p>

            <p>
              On the water, <strong>they are the skippers</strong>: whether it’s
              a quiet morning swim off the rocks or a full day at sea around
              Capri, they’ll be with you on board. On land they’re happy to help
              with plans and reservations, keeping the timing easy and the
              experience personal.
            </p>

            <p>
              Arrivals and departures are straightforward: Giorgio and Nicola{" "}
              <strong>personally meet you in Naples</strong>—airport, train
              station or port—and bring you to the villa, then take you back at
              the end of your stay. The hosting style is discreet: they look
              after the practical things so you’re free to enjoy the coast, the
              house, and each other.
            </p>
          </div>

          {/* Photo */}
          <div className="md:col-span-1">
            <img
              src={hostsImg.src}
              alt="Your hosts"
              className="w-full h-auto rounded-xl shadow cursor-zoom-in"
              onClick={() => openLightbox([hostsImg], 0)}
            />
            <div className="text-xs text-slate-500 mt-2 text-center">
              Your hosts: Giorgio &amp; Nicola
            </div>
          </div>
        </div>
      </section>

      {/* ============================== CONTACT ============================== */}
      <section
        id="contact"
        className="bg-slate-900 text-white py-16 px-6 text-center"
      >
        <h2 className="title-serif text-3xl font-semibold mb-6">
          Plan Your Stay
        </h2>

        <p className="mb-4 opacity-90">
          Send us your dates and the activities you’d like to include (or not).
          We’ll reply with options and a clear quote.
        </p>

        <a
          href="mailto:giorgio.sanders@gmail.com?subject=Villa%20Ceradini%20Enquiry"
          className="inline-block rounded-2xl bg-white text-slate-900 px-6 py-3 font-medium hover:bg-slate-100"
        >
          Email us
        </a>

        {/* Address */}
        <address className="not-italic mt-8 text-white/80">
          Riviera di Marcigliano 10, 80061 Massa Lubrense (NA), Italy
          <br />
          <a
            className="underline hover:no-underline"
            href="https://maps.google.com/?q=Riviera%20di%20Marcigliano%2010,%20Massa%20Lubrense%20(NA)"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </address>
      </section>

      {/* LIGHTBOX */}
      <Lightbox
        items={lightboxItems}
        index={lbIndex}
        onClose={closeLightbox}
        setIndex={setLbIndex}
      />
    </div>
  );
}
