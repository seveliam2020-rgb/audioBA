import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Logo from "../components/Logo";
import Reveal from "../components/Reveal";
import { Switch } from "../components/ui/switch";
import { api, getApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState(null);

  useEffect(() => {
    api
      .get("/books")
      .then((r) => setBooks(r.data))
      .catch(() => setBooks([]));
  }, []);

  if (user === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink font-tech text-xs uppercase tracking-[0.3em] text-neutral-500">
        Tuning in…
      </div>
    );
  }
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  const toggle = async (book, value) => {
    setBooks((bs) => bs.map((b) => (b.id === book.id ? { ...b, spotlight: value } : b)));
    try {
      await api.patch(`/admin/books/${book.id}/spotlight`, { spotlight: value });
      toast.success(
        value ? `${book.title} promoted to the spotlight` : `${book.title} pulled from the spotlight`
      );
    } catch (e) {
      setBooks((bs) => bs.map((b) => (b.id === book.id ? { ...b, spotlight: !value } : b)));
      toast.error(getApiError(e));
    }
  };

  const promoted = (books || []).filter((b) => b.spotlight).length;

  return (
    <div className="grain min-h-screen bg-ink text-foreground">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-6">
          <Link to="/" data-testid="admin-brand-logo" aria-label="Back to home">
            <Logo />
          </Link>
          <span className="font-tech text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            {user.email}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-16">
        <Reveal>
          <p className="eyebrow">Team admin</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Spotlight{" "}
            <em className="font-serif-accent text-gradient-fire font-normal italic">picks.</em>
          </h1>
          <p className="mt-4 max-w-lg text-neutral-400">
            Choose which audiobooks are promoted in the Book Spotlight carousel on the home
            page. Changes go live instantly.
          </p>
          <p className="mt-4 font-tech text-[11px] uppercase tracking-[0.25em] text-amber-500/90">
            {promoted} of {books ? books.length : "—"} titles promoted
          </p>
        </Reveal>

        <div className="mt-10 flex flex-col gap-3">
          {books === null && (
            <p className="flex items-center gap-2 py-8 font-tech text-xs uppercase tracking-[0.2em] text-neutral-500">
              <Loader2 size={14} className="animate-spin" /> Loading catalog…
            </p>
          )}
          {books &&
            books.map((b) => (
              <div
                key={b.id}
                data-testid={`admin-book-row-${b.id}`}
                className="flex items-center gap-4 rounded-2xl card-surface p-4 transition-colors hover:border-white/20"
              >
                <img src={b.cover_url} alt="" className="h-14 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-white">{b.title}</p>
                  <p className="truncate font-tech text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                    {b.author} · narr. {b.narrator} · {b.duration}
                  </p>
                </div>
                <span
                  className={`hidden font-tech text-[10px] uppercase tracking-[0.2em] sm:block ${
                    b.spotlight ? "text-gold" : "text-neutral-600"
                  }`}
                >
                  {b.spotlight ? "In spotlight" : "Not promoted"}
                </span>
                <Switch
                  data-testid={`admin-book-toggle-${b.id}`}
                  checked={!!b.spotlight}
                  onCheckedChange={(v) => toggle(b, v)}
                  aria-label={`Toggle spotlight for ${b.title}`}
                />
              </div>
            ))}
        </div>

        <Link
          to="/"
          className="mt-10 inline-block font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-ember"
        >
          ← Back to booklab.audio
        </Link>
      </main>
    </div>
  );
}
