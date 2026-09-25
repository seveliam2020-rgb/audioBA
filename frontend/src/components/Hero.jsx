import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, Pause, Play } from "lucide-react";
import WaveVisualizer from "./WaveVisualizer";
import { BOOKS, HERO_PNG } from "../data/books";
import { scrollToSection } from "../lib/scroll";

export default function Hero() {
  const ref = useRef(null);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const stackY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

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
    <section ref={ref} className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-ember/15 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[380px] w-[560px] rounded-full bg-gold/10 blur-[150px]" />

      <motion.div
        style={{ y: stackY, opacity: fade }}
        className="relative flex flex-1 flex-col items-center justify-center px-6 pb-6 pt-28"
      >
        <div className="relative flex items-center justify-center">
          <span className="glass absolute -top-5 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1.5 font-tech text-[10px] uppercase tracking-[0.3em] text-amber-500 md:block">
            Audiobook distribution
          </span>
          <h1
            data-testid="hero-wordmark"
            className="relative z-0 select-none text-center font-display text-[clamp(4.5rem,16vw,13.5rem)] font-extrabold leading-none tracking-[-0.03em]"
          >
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: "112%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="block bg-gradient-to-b from-[#3a3a44] via-[#232329] to-[#101014] bg-clip-text text-transparent"
              >
                BOOKLAB
              </motion.span>
            </span>
            <span className="sr-only">Booklab Audio — audiobooks from authors worldwide</span>
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.3, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <img
              src={HERO_PNG}
              alt="Featured headphones of the Booklab Audio catalog"
              data-testid="hero-headset"
              draggable={false}
              className="animate-float-slow w-[min(58vw,330px)] drop-shadow-[0_50px_90px_rgba(255,90,31,0.22)] md:w-[min(38vw,430px)]"
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.15 }}
        className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-end gap-8 px-6 pb-16 md:grid-cols-3"
      >
        <div className="max-w-sm">
          <p className="text-sm leading-relaxed text-neutral-400">
            Audiobooks from authors around the world — masterfully narrated, in high-fidelity
            sound.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              data-testid="hero-waitlist-cta"
              onClick={() => scrollToSection("#waitlist")}
              className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-ember to-gold px-6 py-3 font-display text-sm font-bold text-ink glow-ember transition-transform duration-300 hover:scale-[1.03]"
            >
              Claim 3 months for $1.99
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              data-testid="hero-sample-audio-btn"
              onClick={toggleTeaser}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-neutral-200 transition-colors hover:border-ember/50 hover:text-white"
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? "Playing" : "Preview"}
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
          </div>
        </div>

        <div className="hidden md:block">
          <p className="text-center font-serif-accent text-lg italic text-neutral-300">
            Precision narration. Global distribution.
          </p>
          <p className="mt-2 text-center font-tech text-[10px] uppercase tracking-[0.3em] text-neutral-600">
            $1.99 / month — first 3 months
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <p className="font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-400">
            1 book / month
          </p>
          <p className="font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-400">
            + extra books $8.99
          </p>
          <button
            data-testid="hero-browse-link"
            onClick={() => scrollToSection("#catalog")}
            className="mt-1 inline-flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.25em] text-amber-500/90 transition-colors hover:text-ember"
          >
            Browse the catalog <ArrowDown size={13} />
          </button>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-50">
        <WaveVisualizer playing={playing} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      </div>
    </section>
  );
}
