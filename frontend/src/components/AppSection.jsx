import { Download, Headphones, RefreshCw } from "lucide-react";
import Reveal from "./Reveal";
import StoreBadges from "./StoreBadges";
import { APP_MOCKUP } from "../data/books";

const FEATURES = [
  {
    icon: Download,
    title: "Offline listening",
    desc: "Pin any book on your shelf and play it without a signal.",
  },
  {
    icon: RefreshCw,
    title: "Synced to the second",
    desc: "Pause on the phone, resume on the web at the exact second.",
  },
  {
    icon: Headphones,
    title: "One-tap previews",
    desc: "Audition any cover in the catalog straight from your pocket.",
  },
];

export default function AppSection() {
  return (
    <section id="app" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute right-1/4 top-10 h-[420px] w-[620px] rounded-full bg-ember/10 blur-[150px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
        <Reveal className="relative order-2 lg:order-1">
          <div className="absolute -inset-8 bg-gradient-to-br from-ember/20 via-transparent to-gold/15 opacity-50 blur-3xl" />
          <img
            src={APP_MOCKUP}
            alt="Booklab Audio app on a phone"
            data-testid="app-mockup"
            className="relative mx-auto max-h-[560px] w-auto [mask-image:radial-gradient(120%_120%_at_50%_50%,black_60%,transparent_88%)]"
          />
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="eyebrow">04 — The app</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Your shelf,{" "}
              <em className="font-serif-accent text-gradient-fire font-normal italic">in your pocket.</em>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-400 sm:text-lg">
              Booklab Audio lives on the Apple App Store and Google Play — the full catalog,
              your shelf and your monthly credits, synced to the second.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 flex flex-col gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-ember">
                  <f.icon size={17} />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-white">{f.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.15} className="mt-9">
            <StoreBadges />
            <p className="mt-4 font-tech text-[10px] uppercase tracking-[0.3em] text-neutral-600">
              Free download · membership required to listen
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
