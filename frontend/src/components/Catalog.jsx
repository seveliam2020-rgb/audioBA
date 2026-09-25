import { useCallback, useEffect, useState } from "react";
import Reveal from "./Reveal";
import BookCard from "./BookCard";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { BOOKS } from "../data/books";

export default function Catalog() {
  const { user } = useAuth();
  const [shelfIds, setShelfIds] = useState([]);

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

  return (
    <section id="catalog" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute left-0 top-1/3 h-[420px] w-[420px] rounded-full bg-ember/8 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">01 — The catalog</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              This month's <em className="font-serif-accent text-gradient-fire font-normal italic">pressings.</em>
            </h2>
          </div>
          <p className="max-w-sm text-neutral-400 sm:text-lg">
            Every title is remastered in 320kbps spatial audio and performed by a narrator
            we'd follow into any story. Preview any of them, free.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-6 flex items-center gap-3 font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          <span>08 titles</span>
          <span className="h-1 w-1 rotate-45 bg-ember/60" />
          <span>08 genres</span>
          <span className="h-1 w-1 rotate-45 bg-ember/60" />
          <span>Tap play to preview</span>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BOOKS.map((book, i) => (
            <BookCard
              key={book.id}
              book={book}
              index={i}
              inShelf={shelfIds.includes(book.id)}
              onShelfChange={fetchShelf}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
