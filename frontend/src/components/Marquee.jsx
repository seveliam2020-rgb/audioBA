const ITEMS = [
  "High-fidelity immersion",
  "Curated narration",
  "1 book every month",
  "Extra books $8.99",
  "Keep them forever",
  "320kbps spatial audio",
];

export default function Marquee() {
  const row = (hidden) => (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="whitespace-nowrap px-8 font-tech text-xs uppercase tracking-[0.3em] text-neutral-400">
            {item}
          </span>
          <span className="h-1.5 w-1.5 rotate-45 bg-ember/70" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-ink-surface py-5">
      <div className="animate-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
