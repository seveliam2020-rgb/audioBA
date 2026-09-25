import { Check } from "lucide-react";
import Reveal from "./Reveal";
import { scrollToSection } from "../lib/scroll";

const TIMELINE = [
  {
    label: "Months 1–3",
    amount: "$1.99",
    per: "/month",
    desc: "Intro rate for new members. Three full months, no strings.",
  },
  {
    label: "Month 4 onward",
    amount: "$8.99",
    per: "/month",
    desc: "The standard rate. Cancel anytime — no exit fees.",
  },
  {
    label: "Every month",
    amount: "1 book",
    per: "included",
    desc: "Your monthly credit claims any audiobook in the catalog, free.",
  },
  {
    label: "Want more, sooner?",
    amount: "+$8.99",
    per: "/extra book",
    desc: "Add extra audiobooks any time at a flat member rate.",
  },
];

const INCLUDED = [
  "1 audiobook credit every month",
  "320kbps high-fidelity streaming",
  "Offline downloads on all your devices",
  "Keep every book forever — even if you cancel",
  "Cancel anytime, no exit fees",
];

const FAQ = [
  {
    q: "When am I charged?",
    a: "Monthly, at the start of each billing month. Your first three charges are $1.99 each — from month four, $8.99.",
  },
  {
    q: "What does my credit cover?",
    a: "One audiobook of your choice, every month. Claim extra titles any time for a flat $8.99.",
  },
  {
    q: "What happens if I cancel?",
    a: "You keep every audiobook you've claimed — forever. No exit fees, no fine print.",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[520px] rounded-full bg-gold/8 blur-[150px]" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">03 — Membership</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            One plan.{" "}
            <em className="font-serif-accent text-gradient-fire font-normal italic">Zero surprises.</em>
          </h2>
          <p className="mt-5 text-neutral-400 sm:text-lg">
            There's exactly one membership — here is every dollar, every month, in plain sight.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-ink-surface">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-ember/15 blur-[100px]" />
            <div className="relative grid lg:grid-cols-2">
              <div className="p-8 sm:p-10 lg:border-r lg:border-white/10" data-testid="pricing-timeline">
                <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-amber-500/90">
                  How billing works
                </p>
                <div className="mt-8 flex flex-col gap-7">
                  {TIMELINE.map((t, i) => (
                    <div key={t.label} className="relative flex gap-5">
                      <div className="flex flex-col items-center">
                        <span
                          className={`mt-1 h-2.5 w-2.5 rounded-full ${
                            i === 0 ? "glow-ember bg-gradient-to-r from-ember to-gold" : "bg-white/25"
                          }`}
                        />
                        {i < TIMELINE.length - 1 && <span className="mt-2 w-px flex-1 bg-white/10" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <p className="font-display text-2xl font-extrabold text-white">
                            {t.amount}{" "}
                            <span className="text-sm font-semibold text-neutral-400">{t.per}</span>
                          </p>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-tech text-[9px] uppercase tracking-[0.2em] text-neutral-400">
                            {t.label}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative border-t border-white/10 bg-[#15151b] p-8 sm:p-10 lg:border-t-0" data-testid="pricing-included">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-[100px]" />
                <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-amber-500/90">
                  Always included
                </p>
                <ul className="relative mt-8 flex flex-col gap-4">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-neutral-200">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ember/15 text-ember">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div
                  data-testid="pricing-summary"
                  className="relative mt-9 rounded-2xl border border-white/10 bg-ink/60 p-5"
                >
                  <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                    The whole story
                  </p>
                  <p className="mt-2 font-display text-sm font-bold leading-relaxed text-white">
                    $1.99/mo for 3 months → $8.99/mo after. 1 audiobook monthly, extras $8.99.
                  </p>
                </div>
                <button
                  data-testid="pricing-subscribe-btn"
                  onClick={() => scrollToSection("#waitlist")}
                  className="relative mt-6 w-full rounded-full bg-gradient-to-r from-ember to-gold px-7 py-3.5 font-display text-sm font-bold text-ink transition-transform duration-300 hover:scale-[1.02]"
                >
                  Claim the intro rate
                </button>
                <p className="relative mt-3 text-center font-tech text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                  Cancel anytime · keep your books
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={0.05 * i}>
              <div data-testid={`pricing-faq-${i}`} className="h-full rounded-2xl card-surface p-6">
                <p className="font-display text-sm font-bold text-white">{f.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
