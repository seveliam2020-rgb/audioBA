import { useEffect, useRef, useState } from "react";
import { Pause, Play, Quote } from "lucide-react";
import Reveal from "./Reveal";
import { AUTHORS, BOOKS } from "../data/books";

const bookFor = (author) => BOOKS.find((b) => b.id === author.bookId);

function AuthorBookRow({ book, compact = false }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(book.sample_audio);
      audioRef.current.volume = 0.6;
      audioRef.current.addEventListener("ended", () => setPlaying(false));
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  return (
    <div
      className={`flex items-center gap-3 ${
        compact ? "mt-2 border-t border-white/10 pt-3" : "glass rounded-2xl p-3 pr-4"
      }`}
    >
      <img
        src={book.cover_url}
        alt={`${book.title} cover`}
        className={compact ? "h-10 w-10 rounded-lg object-cover" : "h-14 w-14 rounded-xl object-cover"}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold text-white">{book.title}</p>
        <p className="truncate font-tech text-[10px] uppercase tracking-[0.15em] text-neutral-500">
          In audio · {book.duration}
        </p>
      </div>
      <button
        data-testid={`author-play-btn-${book.id}`}
        onClick={toggle}
        aria-label={playing ? "Pause preview" : "Play preview"}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
          playing
            ? "border-ember bg-ember/15 text-ember"
            : "border-white/15 text-neutral-300 hover:border-ember/60 hover:text-ember"
        }`}
      >
        {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
    </div>
  );
}

export default function AuthorSpotlight() {
  const featured = AUTHORS.find((a) => a.featured);
  const others = AUTHORS.filter((a) => !a.featured);

  return (
    <section id="authors" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute right-1/4 top-0 h-[400px] w-[600px] rounded-full bg-gold/8 blur-[150px]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">02 — Author spotlight</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Great authors,{" "}
              <em className="font-serif-accent text-gradient-fire font-normal italic">in audio.</em>
            </h2>
          </div>
          <p className="max-w-sm text-neutral-400 sm:text-lg">
            Every title on Booklab Audio is a book its author brought to sound — the story as
            it was meant to be heard, performed to studio standard.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <article
              data-testid={`author-spotlight-card-${featured.id}`}
              className="group relative h-full min-h-[540px] overflow-hidden rounded-3xl card-surface lg:min-h-0"
            >
              <img
                src={featured.portrait}
                alt={`${featured.name} portrait`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
                <span className="glass inline-block rounded-full px-3 py-1 font-tech text-[10px] uppercase tracking-[0.25em] text-amber-500">
                  {featured.role}
                </span>
                <p className="mt-5 flex items-start gap-3 font-serif-accent text-2xl italic leading-snug text-white sm:text-3xl">
                  <Quote size={22} className="mt-1.5 shrink-0 text-ember" />
                  {featured.quote}
                </p>
                <div className="mt-7 flex flex-wrap items-end justify-between gap-5">
                  <div className="max-w-xs">
                    <p className="font-display text-2xl font-extrabold text-white">{featured.name}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{featured.bio}</p>
                  </div>
                  <AuthorBookRow book={bookFor(featured)} />
                </div>
              </div>
            </article>
          </Reveal>

          <div className="flex flex-col gap-5 lg:col-span-5">
            {others.map((a, i) => (
              <Reveal key={a.id} delay={0.1 + i * 0.08} className="flex-1">
                <article
                  data-testid={`author-spotlight-card-${a.id}`}
                  className="group flex h-full items-stretch overflow-hidden rounded-3xl card-surface transition-colors duration-300 hover:border-ember/40"
                >
                  <div className="relative w-36 shrink-0 overflow-hidden sm:w-48">
                    <img
                      src={a.portrait}
                      alt={`${a.name} portrait`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-6 sm:p-7">
                    <span className="font-tech text-[10px] uppercase tracking-[0.25em] text-amber-500/90">
                      {a.role}
                    </span>
                    <p className="mt-2 font-display text-xl font-bold text-white">{a.name}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{a.bio}</p>
                    <AuthorBookRow book={bookFor(a)} compact />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
