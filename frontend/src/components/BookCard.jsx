import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock, Mic2, Pause, Play, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { api, getApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function BookCard({ book, index, inShelf, onShelfChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => () => audioRef.current?.pause(), []);

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
    if (inShelf) {
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
      onShelfChange?.();
    } catch (e) {
      if (e?.response?.status === 409) toast.info("Already on your shelf");
      else toast.error(getApiError(e));
    }
  };

  return (
    <motion.article
      data-testid={`audiobook-card-${book.id}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl card-surface transition-colors duration-300 hover:border-ember/40"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={book.cover_url}
          alt={`${book.title} cover art`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-60" />
        <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 font-tech text-[10px] uppercase tracking-[0.2em] text-neutral-200">
          {book.genre}
        </span>
        {inShelf && (
          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-ember text-ink">
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-lg font-bold leading-snug text-white">{book.title}</h3>
          <p className="mt-0.5 text-sm text-neutral-400">{book.author}</p>
        </div>
        <p className="flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.15em] text-amber-500/80">
          <Mic2 size={12} /> {book.narrator}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Star size={12} className="fill-gold text-gold" />
              {book.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {book.duration}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid={`audiobook-play-preview-btn-${book.id}`}
              onClick={togglePlay}
              aria-label={playing ? "Pause preview" : "Play preview"}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                playing
                  ? "border-ember bg-ember/15 text-ember"
                  : "border-white/15 text-neutral-300 hover:border-ember/60 hover:text-ember"
              }`}
            >
              {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>
            <button
              data-testid={`audiobook-add-shelf-btn-${book.id}`}
              onClick={addToShelf}
              aria-label={inShelf ? "View on shelf" : "Add to shelf"}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                inShelf
                  ? "bg-ember/15 text-ember"
                  : "bg-white/5 text-neutral-300 hover:bg-ember hover:text-ink"
              }`}
            >
              {inShelf ? <Check size={14} /> : <Plus size={14} />}
            </button>
          </div>
        </div>

        {playing && (
          <div className="flex h-3.5 items-end gap-[3px]">
            {[0.2, 0.6, 0.4, 0.9, 0.3].map((d, i) => (
              <span
                key={i}
                className="eq-bar h-full w-[3px] rounded-full bg-gradient-to-t from-ember to-gold"
                style={{ animationDelay: `${d}s` }}
              />
            ))}
            <span className="ml-2 font-tech text-[10px] uppercase tracking-[0.2em] text-ember">
              Previewing
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );
}
