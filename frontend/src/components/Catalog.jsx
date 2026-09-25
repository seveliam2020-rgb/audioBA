import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "./Reveal";
import BookCard from "./BookCard";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { BOOKS } from "../data/books";

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const GENRES = ["All", ...Array.from(new Set(BOOKS.map((b) => b.genre)))];
const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Top rated" },
  { value: "reviews", label: "Most reviewed" },
];

export default function Catalog() {
  const { user } = useAuth();
  const [shelfIds, setShelfIds] = useState([]);
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("featured");
  const [wishlistIds, setWishlistIds] = useState([]);

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

  const fetchWishlist = useCallback(() => {
    if (!user) {
      setWishlistIds([]);
      return;
    }
    api
      .get("/wishlist")
      .then((r) => setWishlistIds(r.data.items.map((i) => i.id)))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const visible = useMemo(() => {
    let list = BOOKS.filter((b) => genre === "All" || b.genre === genre);
    if (sort === "rating")
      list = [...list].sort((a, b) => b.rating - a.rating || b.reviews_count - a.reviews_count);
    if (sort === "reviews") list = [...list].sort((a, b) => b.reviews_count - a.reviews_count);
    return list;
  }, [genre, sort]);

  return (
    <section id="catalog" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute left-0 top-1/3 h-[420px] w-[420px] rounded-full bg-ember/8 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">01 — The catalog</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              This month's <em className="font-serif-accent text-gradient-fire font-normal italic">highlights.</em>
            </h2>
          </div>
          <p className="max-w-sm text-neutral-400 sm:text-lg">
            Every title comes from an author who brought their book to audio — narrated with
            care, in high fidelity. Preview any of them, free.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-6 flex items-center gap-3 font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          <span>{String(visible.length).padStart(2, "0")} titles</span>
          <span className="h-1 w-1 rotate-45 bg-ember/60" />
          <span>{genre === "All" ? `${GENRES.length - 1} genres` : genre.toLowerCase()}</span>
          <span className="h-1 w-1 rotate-45 bg-ember/60" />
          <span>Tap play to preview</span>
        </Reveal>

        <Reveal delay={0.15} className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                data-testid={`genre-filter-chip-${slugify(g)}`}
                onClick={() => setGenre(g)}
                className={`rounded-full border px-4 py-2 font-tech text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  genre === g
                    ? "border-transparent bg-gradient-to-r from-ember to-gold text-ink"
                    : "border-white/15 text-neutral-400 hover:border-ember/50 hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="relative self-start md:self-auto">
            <select
              data-testid="catalog-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort catalog"
              className="appearance-none rounded-full border border-white/15 bg-ink-surface py-2 pl-4 pr-10 font-tech text-[10px] uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-ember/50"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((book, i) => (
            <BookCard
              key={`${genre}-${sort}-${book.id}`}
              book={book}
              index={i}
              inShelf={shelfIds.includes(book.id)}
              onShelfChange={fetchShelf}
              inWishlist={wishlistIds.includes(book.id)}
              onWishlistChange={fetchWishlist}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
