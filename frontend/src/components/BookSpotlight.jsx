import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Clock, Pause, Play, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import Reveal from "./Reveal";
import { BOOKS } from "../data/books";
import { api, getApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function BookSpotlight() {
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const startPosRef = useRef(0);
  const startClientXRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const movedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const velRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const audioRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [wide, setWide] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [shelfIds, setShelfIds] = useState([]);
  const [promo, setPromo] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const list = promo.length ? promo : BOOKS;
  const N = list.length;
  const book = list[((index % N) + N) % N];
  const cardW = wide ? 240 : 176;
  const cardH = Math.round(cardW * 1.5);
  const spacing = wide ? 200 : 132;
  const depth = wide ? 170 : 110;

  const fetchShelf = useCallback(() => {
    if (!user) {
      setShelfIds([]);
      return;
    }
    api
      .get("/shelf")
      .then((r) => setShelfIds(r.data.items.map((i) => i.id)))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchShelf();
  }, [fetchShelf]);

  useEffect(() => {
    const compute = () => setWide((stageRef.current?.offsetWidth || 900) >= 640);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    api
      .get("/spotlight")
      .then((r) => {
        if (r.data.items && r.data.items.length) setPromo(r.data.items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!hoveredRef.current && !draggingRef.current && !document.hidden) setIndex((i) => i + 1);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (audioRef.current && playing) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [index]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const applyPositions = (pos, immediate = false) => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const off = ((((i - pos) % N) + N + 4) % N) - 4;
      const visible = Math.abs(off) < 4;
      const rot = off === 0 ? 0 : off > 0 ? -38 : 38;
      el.style.transition = immediate
        ? "none"
        : "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease";
      el.style.transform = `translateX(${off * spacing}px) translateZ(${-Math.abs(off) * depth}px) rotateY(${rot}deg)`;
      el.style.opacity = visible ? "1" : "0";
      el.style.pointerEvents = visible ? "auto" : "none";
      el.style.zIndex = String(50 - Math.abs(off));
    });
  };

  useEffect(() => {
    applyPositions(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, wide]);

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    draggingRef.current = true;
    suppressClickRef.current = false;
    movedRef.current = false;
    startPosRef.current = index;
    startClientXRef.current = e.clientX;
    dragOffsetRef.current = 0;
    velRef.current = 0;
    lastXRef.current = e.clientX;
    lastTRef.current = e.timeStamp;
    stageRef.current.setPointerCapture?.(e.pointerId);
    applyPositions(index, true);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const totalDx = e.clientX - startClientXRef.current;
    if (Math.abs(totalDx) > 6) {
      movedRef.current = true;
      suppressClickRef.current = true;
    }
    const dt = Math.max(1, e.timeStamp - lastTRef.current);
    velRef.current = 0.8 * velRef.current + 0.2 * ((e.clientX - lastXRef.current) / dt);
    lastXRef.current = e.clientX;
    lastTRef.current = e.timeStamp;
    dragOffsetRef.current = -totalDx / spacing;
    applyPositions(startPosRef.current + dragOffsetRef.current, true);
  };

  const settle = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const raw = startPosRef.current + dragOffsetRef.current;
    let target = Math.round(raw);
    if (Math.abs(velRef.current) > 0.4) {
      target = velRef.current < 0 ? Math.ceil(raw) : Math.floor(raw);
      if (target === startPosRef.current) {
        target = startPosRef.current + (velRef.current < 0 ? 1 : -1);
      }
    }
    target = Math.min(Math.max(target, startPosRef.current - 2), startPosRef.current + 2);
    setIndex(target);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIndex(index - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setIndex(index + 1);
    }
  };

  const togglePlay = () => {
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
        .catch(() => toast.error("Preview unavailable right now"));
    }
  };

  const addToShelf = async () => {
    if (!user) {
      toast.info("Create a free account to build your shelf");
      navigate("/auth");
      return;
    }
    if (shelfIds.includes(book.id)) {
      navigate("/shelf");
      return;
    }
    try {
      const { data } = await api.post("/shelf", { book_id: book.id });
      toast.success(
        data.used_credit
          ? `Added with your monthly credit — ${data.credits} left this month`
          : "Added to your shelf — $8.99"
      );
      fetchShelf();
    } catch (e) {
      if (e?.response?.status === 409) toast.info("Already on your shelf");
      else toast.error(getApiError(e));
    }
  };

  const inShelf = shelfIds.includes(book.id);

  return (
    <section id="spotlight" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute left-1/4 top-10 h-[420px] w-[620px] rounded-full bg-ember/10 blur-[150px]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="flex flex-col gap-6 text-center md:items-center">
          <p className="eyebrow">02 — Book spotlight</p>
          <h2 className="max-w-2xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            The shelf we're{" "}
            <em className="font-serif-accent text-gradient-fire font-normal italic">shouting about.</em>
          </h2>
          <p className="max-w-xl text-neutral-400 sm:text-lg">
            Hand-picked promotions from our audiobook catalog. Flip through the covers, click one
            to bring it front, preview it on the spot.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div
            ref={stageRef}
            data-testid="spotlight-stage"
            role="region"
            aria-label="Book spotlight carousel — use left and right arrow keys to flip"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerEnter={() => (hoveredRef.current = true)}
            onPointerLeave={() => (hoveredRef.current = false)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={settle}
            onPointerCancel={settle}
            className="relative mx-auto mt-6 w-full cursor-grab select-none focus-visible:outline-none active:cursor-grabbing"
            style={{ height: cardH + 140, perspective: "1600px", touchAction: "pan-y" }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-0 w-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              {list.map((b, i) => {
                const off = ((((i - index) % N) + N + 4) % N) - 4;
                const visible = Math.abs(off) < 4;
                const rot = off === 0 ? 0 : off > 0 ? -38 : 38;
                return (
                  <div
                    key={b.id}
                    ref={(el) => (cardRefs.current[i] = el)}
                    data-testid={`spotlight-card-${b.id}`}
                    onClick={() => {
                      if (!suppressClickRef.current) setIndex(index + off);
                    }}
                    className="absolute cursor-pointer"
                    style={{
                      width: cardW,
                      height: cardH,
                      left: 0,
                      top: 0,
                      marginLeft: -cardW / 2,
                      marginTop: -cardH / 2,
                      transform: `translateX(${off * spacing}px) translateZ(${-Math.abs(off) * depth}px) rotateY(${rot}deg)`,
                      transformStyle: "preserve-3d",
                      opacity: visible ? 1 : 0,
                      pointerEvents: visible ? "auto" : "none",
                      zIndex: 50 - Math.abs(off),
                      transition:
                        "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease",
                      willChange: "transform",
                    }}
                  >
                    <div className="group h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-transform duration-300 [transform:translateZ(0)] hover:border-ember/50 hover:[transform:translateZ(40px)]">
                      <img
                        src={b.cover_url}
                        alt={`${b.title} cover`}
                        loading="lazy"
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                      <span className="glass absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 font-tech text-[9px] uppercase tracking-[0.2em] text-neutral-200">
                        {b.genre}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pointer-events-none absolute bottom-2 left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[100%] bg-ember/15 blur-3xl" />

            <button
              data-testid="spotlight-prev-btn"
              onClick={() => setIndex(index - 1)}
              aria-label="Previous book"
              className="absolute left-0 top-1/2 z-[60] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-neutral-200 backdrop-blur transition-colors hover:border-ember/60 hover:text-ember sm:left-6"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              data-testid="spotlight-next-btn"
              onClick={() => setIndex(index + 1)}
              aria-label="Next book"
              className="absolute right-0 top-1/2 z-[60] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-neutral-200 backdrop-blur transition-colors hover:border-ember/60 hover:text-ember sm:right-6"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.2} className="relative z-10 mx-auto -mt-2 max-w-3xl">
          <div className="glass flex flex-col items-center gap-5 rounded-3xl p-6 sm:flex-row sm:gap-6 sm:p-7">
            <img
              src={book.cover_url}
              alt={`${book.title} cover`}
              className="h-24 w-16 rounded-xl object-cover shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
            />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-amber-500/90">
                Front of the shelf
              </p>
              <h3 data-testid="spotlight-front-title" className="mt-1.5 font-display text-xl font-extrabold text-white">
                {book.title}
              </h3>
              <p className="mt-0.5 text-sm text-neutral-400">{book.author}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 font-tech text-[10px] uppercase tracking-[0.15em] text-neutral-500 sm:justify-start">
                <span className="flex items-center gap-1">
                  <Star size={11} className="fill-gold text-gold" />
                  {book.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {book.duration}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                data-testid="spotlight-front-play-btn"
                onClick={togglePlay}
                aria-label={playing ? "Pause preview" : "Play preview"}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                  playing
                    ? "border-ember bg-ember/15 text-ember"
                    : "border-white/15 text-neutral-200 hover:border-ember/60 hover:text-ember"
                }`}
              >
                {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>
              <button
                data-testid="spotlight-front-add-btn"
                onClick={addToShelf}
                className={`flex h-11 items-center gap-2 rounded-full px-5 font-display text-xs font-bold uppercase tracking-wide transition-all ${
                  inShelf
                    ? "bg-ember/15 text-ember"
                    : "bg-gradient-to-r from-ember to-gold text-ink hover:scale-105"
                }`}
              >
                {inShelf ? <Check size={14} /> : <Plus size={14} />}
                {inShelf ? "On shelf" : "Add to shelf"}
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
