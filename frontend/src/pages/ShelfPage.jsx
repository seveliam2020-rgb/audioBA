import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Pause, Play, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import Logo from "../components/Logo";
import Reveal from "../components/Reveal";
import { useAuth } from "../context/AuthContext";
import { api, getApiError } from "../lib/api";

const SPEEDS = [0.8, 1, 1.2, 1.6, 2];

export default function ShelfPage() {
  const { user, credits, setCredits, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("listening");
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const load = useCallback(() => {
    api
      .get("/shelf")
      .then((r) => {
        setItems(r.data.items);
        setCredits(r.data.credits);
      })
      .catch(() => {});
  }, [setCredits]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", () => setPlaying(false));
      audioRef.current.addEventListener("timeupdate", () => {
        const a = audioRef.current;
        if (a.duration) setProgress(a.currentTime / a.duration);
      });
    }
    if (current) {
      audioRef.current.src = current.sample_audio;
      audioRef.current.playbackRate = SPEEDS[speedIdx];
      setProgress(0);
      if (playing) audioRef.current.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a || !current) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.playbackRate = SPEEDS[speedIdx];
      a.play().then(() => setPlaying(true)).catch(() => toast.error("Sample stream unavailable"));
    }
  };

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };

  const remove = async (bookId) => {
    try {
      await api.delete(`/shelf/${bookId}`);
      toast.info("Removed from your shelf");
      if (current?.id === bookId) {
        setCurrent(null);
        setPlaying(false);
      }
      load();
    } catch (e) {
      toast.error(getApiError(e));
    }
  };

  const claimNext = () => {
    navigate("/");
    setTimeout(() => {
      const el = document.querySelector("#catalog");
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 });
      else el?.scrollIntoView({ behavior: "smooth" });
    }, 500);
  };

  return (
    <div className="grain min-h-screen bg-ink text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-10">
          <button onClick={() => navigate("/")} data-testid="shelf-brand-logo" aria-label="Back to home">
            <Logo />
          </button>
          <div className="flex items-center gap-4">
            <span className="hidden font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-500 sm:block">
              {user?.email}
            </span>
            <button
              data-testid="nav-signout-btn"
              onClick={async () => {
                await logout();
                navigate("/");
              }}
              className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-tech text-[11px] uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-ember/50 hover:text-white"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-10">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Member area</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              My Shelf,{" "}
              <em className="font-serif-accent text-gradient-fire font-normal italic">on repeat.</em>
            </h1>
          </div>
          <div
            data-testid="shelf-credit-balance"
            className="inline-flex items-center gap-3 self-start rounded-full border border-gold/30 bg-gold/10 px-5 py-2.5 font-tech text-[11px] uppercase tracking-[0.2em] text-gold"
          >
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-gold" />
            {credits} free credit{credits === 1 ? "" : "s"} this month
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-tech text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          <span>{items.length} on shelf</span>
          <span className="h-1 w-1 rotate-45 bg-ember/60" />
          <span>1 credit / month</span>
          <span className="h-1 w-1 rotate-45 bg-ember/60" />
          <span>next book $8.99</span>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-1 sm:max-w-sm rounded-full border border-white/10 bg-ink-surface p-1 sm:grid-cols-2">
          {[
            { id: "my-shelf-tab-listening", label: "Listening", value: "listening" },
            { id: "my-shelf-tab-saved", label: "Saved", value: "saved" },
          ].map((t) => (
            <button
              key={t.value}
              data-testid={t.id}
              onClick={() => setTab(t.value)}
              className={`rounded-full py-2.5 font-tech text-[11px] uppercase tracking-[0.2em] transition-colors ${
                tab === t.value ? "bg-gradient-to-r from-ember to-gold text-ink" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <div data-testid="shelf-empty-state" className="mt-10 rounded-3xl card-surface p-12 text-center">
            <p className="font-display text-xl font-bold text-white">Your shelf is empty.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-400">
              Pick your first audiobook from the catalog — it's free with your monthly credit.
            </p>
            <button
              data-testid="shelf-empty-browse-btn"
              onClick={claimNext}
              className="mt-6 rounded-full bg-gradient-to-r from-ember to-gold px-6 py-3 font-display text-sm font-bold text-ink"
            >
              Browse the catalog
            </button>
          </div>
        ) : (
          <>
            {tab === "listening" && (
              <div className="mt-8 grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <div className="card-surface rounded-3xl p-6 sm:p-8">
                    <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-amber-500/90">
                      Now playing
                    </p>
                    <div className="mt-6 flex items-center gap-5">
                      <img
                        src={(current || items[0])?.cover_url}
                        alt="Cover"
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-lg font-bold text-white">
                          {(current || items[0])?.title}
                        </p>
                        <p className="mt-0.5 text-sm text-neutral-400">
                          Narr. {(current || items[0])?.narrator}
                        </p>
                        {playing && (
                          <div className="mt-2 flex h-4 items-end gap-[3px]">
                            {[0.1, 0.5, 0.9, 0.3, 0.7].map((d, i) => (
                              <span
                                key={i}
                                className="eq-bar h-full w-[3px] rounded-full bg-gradient-to-t from-ember to-gold"
                                style={{ animationDelay: `${d}s` }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="mt-6 h-2 cursor-pointer overflow-hidden rounded-full bg-white/10"
                      onClick={(e) => {
                        const a = audioRef.current;
                        if (!a || !a.duration) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration;
                      }}
                    >
                      <div
                        data-testid="shelf-player-progress"
                        className="h-full rounded-full bg-gradient-to-r from-ember to-gold transition-[width] duration-300"
                        style={{ width: `${Math.min(progress * 100, 100)}%` }}
                      />
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <button
                        data-testid="my-shelf-player-toggle"
                        onClick={togglePlay}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-ember to-gold text-ink transition-transform hover:scale-105"
                        aria-label={playing ? "Pause" : "Play"}
                      >
                        {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                      </button>
                      <button
                        data-testid="my-shelf-speed-btn"
                        onClick={cycleSpeed}
                        className="rounded-full border border-white/15 px-4 py-2 font-tech text-[11px] uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-ember/50 hover:text-white"
                      >
                        {SPEEDS[speedIdx]}× speed
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-3">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      data-testid={`shelf-item-${item.id}`}
                      onClick={() => setCurrent(item)}
                      className={`flex items-center gap-4 rounded-2xl border p-3 text-left transition-colors ${
                        (current || items[0])?.id === item.id
                          ? "border-ember/50 bg-ember/10"
                          : "card-surface hover:border-white/25"
                      }`}
                    >
                      <img src={item.cover_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                        <span className="block font-tech text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                          {item.used_credit ? "Monthly credit" : `$${item.price}`}
                        </span>
                      </span>
                      {item.used_credit ? (
                        <span className="rounded-full bg-gold/15 px-2.5 py-1 font-tech text-[9px] uppercase tracking-[0.15em] text-gold">
                          Free
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/5 px-2.5 py-1 font-tech text-[9px] uppercase tracking-[0.15em] text-neutral-400">
                          $8.99
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === "saved" && (
              <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    data-testid={`shelf-saved-card-${item.id}`}
                    className="group relative overflow-hidden rounded-2xl card-surface"
                  >
                    <button
                      data-testid={`shelf-remove-btn-${item.id}`}
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.title}`}
                      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-neutral-300 opacity-0 backdrop-blur transition-opacity hover:text-red-400 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                    <img src={item.cover_url} alt={`${item.title} cover`} className="aspect-[3/4] w-full object-cover" />
                    <div className="p-3">
                      <p className="truncate font-display text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-0.5 font-tech text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                        {item.used_credit ? "Claimed free" : "$8.99"}
                      </p>
                    </div>
                  </div>
                ))}

                <button
                  data-testid="shelf-claim-next-btn"
                  onClick={claimNext}
                  className="flex aspect-auto min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 p-6 text-center transition-colors hover:border-ember/60"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ember/15 text-ember">
                    <Plus size={20} />
                  </span>
                  <span className="font-display text-sm font-bold text-white">Claim next book</span>
                  <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    $8.99 flat member rate
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        <button
          onClick={() => navigate("/")}
          className="mt-12 inline-flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-ember"
        >
          <ArrowLeft size={14} /> Back to booklab.audio
        </button>
      </main>
    </div>
  );
}
