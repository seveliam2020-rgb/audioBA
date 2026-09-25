import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Pause, Play } from "lucide-react";
import WaveVisualizer from "./WaveVisualizer";
import { BOOKS, HERO_IMAGE } from "../data/books";
import { scrollToSection } from "../lib/scroll";

const lineReveal = {
  hidden: { y: "115%" },
  show: (i) => ({
    y: "0%",
    transition: { duration: 1.1, delay: 0.3 + i * 0.14, ease: [0.16, 1, 0.3, 1] },
  }),
};

const SPECS = ["$1.99 / first 3 months", "1 book / month", "+ extra books $8.99"];

export default function Hero() {
  const ref = useRef(null);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0.2]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const toggleTeaser = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(BOOKS[0].sample_audio);
      audioRef.current.volume = 0.7;
      audioRef.current.addEventListener("ended", () => setPlaying(false));
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pb-24 pt-32 lg:pt-36"
    >
      <div className="pointer-events-none absolute -top-48 left-1/4 h-[480px] w-[720px] rounded-full bg-ember/15 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-[380px] w-[560px] rounded-full bg-gold/10 blur-[150px]" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-12 lg:gap-10 lg:px-10">
        <motion.div style={{ opacity: fade }} className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="eyebrow flex items-center gap-3"
          >
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-ember" />
            Booklab Authority presents
          </motion.p>

          <h1 className="mt-6 font-display text-[clamp(2.6rem,6.5vw,5.75rem)] font-extrabold leading-[0.98] tracking-tight text-white">
            <span className="block overflow-hidden pb-1">
              <motion.span
                custom={0}
                variants={lineReveal}
                initial="hidden"
                animate="show"
                className="block"
              >
                Acoustic perfection
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-3">
              <motion.span
                custom={1}
                variants={lineReveal}
                initial="hidden"
                animate="show"
                className="block"
              >
                meets{" "}
                <em className="font-serif-accent text-gradient-fire font-normal italic">
                  literary greatness.
                </em>
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg"
          >
            Booklab Audio is audiobook distribution engineered like studio hardware —
            masterfully narrated stories in 320kbps spatial sound. One audiobook every
            month, your first three for $1.99.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <button
              data-testid="hero-waitlist-cta"
              onClick={() => scrollToSection("#waitlist")}
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-ember to-gold px-7 py-3.5 font-display text-sm font-bold text-ink glow-ember transition-transform duration-300 hover:scale-[1.03]"
            >
              Claim 3 months for $1.99
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              data-testid="hero-sample-audio-btn"
              onClick={toggleTeaser}
              className="inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-neutral-200 transition-colors hover:border-ember/50 hover:text-white"
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
              {playing ? "Playing teaser" : "Listen to the teaser"}
              {playing && (
                <span className="flex h-4 items-end gap-[2px]">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="eq-bar w-[2px] rounded-full bg-gold"
                      style={{ height: "100%", animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </span>
              )}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3"
          >
            {SPECS.map((s, i) => (
              <span key={s} className="flex items-center gap-4">
                <span className="font-tech text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  {s}
                </span>
                {i < SPECS.length - 1 && <span className="h-1 w-1 rotate-45 bg-ember/60" />}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative lg:col-span-5">
          <motion.div
            style={{ y: imgY }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-[2.2rem] bg-gradient-to-br from-ember/40 via-transparent to-gold/30 opacity-50 blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
              <img
                src={HERO_IMAGE}
                alt="Studio headphones with amber waveform light"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/10 to-transparent" />
            </div>

            <div className="glass animate-float-slow absolute -bottom-6 -left-3 flex items-center gap-4 rounded-2xl px-5 py-4 sm:-left-8">
              <div className="flex h-6 items-end gap-[3px]">
                {[0.9, 0.5, 1.1, 0.7, 0.4].map((d, i) => (
                  <span
                    key={i}
                    className="eq-bar h-full w-[3px] rounded-full bg-gradient-to-t from-ember to-gold"
                    style={{ animationDelay: `${d}s` }}
                  />
                ))}
              </div>
              <div>
                <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-amber-500">
                  Now on the deck
                </p>
                <p className="font-display text-sm font-bold text-white">{BOOKS[0].title}</p>
                <p className="text-xs text-neutral-400">Narr. {BOOKS[0].narrator}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-50">
        <WaveVisualizer playing={playing} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      </div>
    </section>
  );
}
