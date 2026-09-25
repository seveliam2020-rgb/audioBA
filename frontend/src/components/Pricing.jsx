import { AudioLines, BookOpen, Download, KeyRound, Library, Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import { scrollToSection } from "../lib/scroll";

const PERKS = [
  {
    icon: AudioLines,
    title: "320kbps spatial streaming",
    desc: "Lossless audio with dynamic spatial mixing, tuned per title.",
  },
  {
    icon: Download,
    title: "Offline downloads",
    desc: "Load your shelf onto any device and listen without a signal.",
  },
  {
    icon: KeyRound,
    title: "Keep them forever",
    desc: "Every audiobook you claim stays yours, even if you cancel.",
  },
  {
    icon: Sparkles,
    title: "Short-form originals",
    desc: "Unlimited access to Booklab Acoustic Originals between full reads.",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[520px] rounded-full bg-gold/8 blur-[150px]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">03 — Membership</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              One membership.{" "}
              <em className="font-serif-accent text-gradient-fire font-normal italic">Every story.</em>
            </h2>
          </div>
          <p className="max-w-sm text-neutral-400 sm:text-lg">
            Start at $1.99 a month for your first three months, then $8.99 a month.
            Cancel anytime — your books stay yours forever.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="relative h-full overflow-hidden rounded-3xl border border-ember/30 bg-gradient-to-br from-[#1c1210] via-ink-surface to-ink-surface p-8 sm:p-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ember/20 blur-[100px]" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-ember/40 bg-ember/10 px-3 py-1 font-tech text-[10px] uppercase tracking-[0.25em] text-ember">
                    Intro offer
                  </span>
                  <span className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                    New members only
                  </span>
                </div>
                <div className="mt-8 flex flex-wrap items-end gap-4">
                  <span className="text-gradient-fire font-display text-7xl font-extrabold tracking-tight sm:text-8xl">
                    $1.99
                  </span>
                  <span className="pb-3 text-neutral-400">/month · your first 3 months</span>
                </div>
                <p className="mt-3 text-neutral-300">
                  Then <span className="font-semibold text-white">$8.99/month</span> after your
                  intro ends. Cancel anytime, keep everything.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <button
                    data-testid="pricing-subscribe-btn"
                    onClick={() => scrollToSection("#waitlist")}
                    className="rounded-full bg-gradient-to-r from-ember to-gold px-7 py-3 font-display text-sm font-bold text-ink transition-transform duration-300 hover:scale-[1.03]"
                  >
                    Claim the intro rate
                  </button>
                  <span className="font-tech text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                    $1.99 × 3 months → $8.99 × forever
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card-surface flex h-full flex-col rounded-3xl p-8">
              <BookOpen className="text-gold" size={26} />
              <p className="mt-6 font-display text-5xl font-extrabold tracking-tight text-white">
                1 <span className="text-lg font-semibold text-neutral-400">credit / month</span>
              </p>
              <p className="mt-3 text-neutral-400">
                Pick any audiobook in the catalog — one is on the house every month.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="card-surface flex h-full flex-col rounded-3xl p-8">
              <Library className="text-gold" size={26} />
              <p className="mt-6 font-display text-5xl font-extrabold tracking-tight text-white">
                +$8.99 <span className="text-lg font-semibold text-neutral-400">/ extra book</span>
              </p>
              <p className="mt-3 text-neutral-400">
                Can't wait for next month? Add more audiobooks any time at a flat member rate.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="card-surface h-full rounded-3xl p-8 sm:p-10">
              <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-amber-500/90">
                Included with every plan
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {PERKS.map((p) => (
                  <div key={p.title} className="flex gap-4">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-ember">
                      <p.icon size={17} />
                    </span>
                    <div>
                      <p className="font-display text-sm font-bold text-white">{p.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-400">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
