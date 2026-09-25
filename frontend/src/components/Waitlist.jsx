import { useEffect, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Reveal from "./Reveal";
import { api, getApiError } from "../lib/api";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [preference, setPreference] = useState("Headphones");
  const [total, setTotal] = useState(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/waitlist/count")
      .then((r) => setTotal(r.data.total))
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/waitlist", { email, preference });
      setJoined(true);
      setTotal(data.total);
      toast.success("You're on the list — welcome to the studio.");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[380px] w-[620px] rounded-full bg-ember/10 blur-[150px]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="eyebrow">03 — VIP early access</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Be first{" "}
              <em className="font-serif-accent text-gradient-fire font-normal italic">in the studio.</em>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-400 sm:text-lg">
              Membership opens soon. Join the waitlist to lock the $1.99 intro rate before
              the doors open — and tell us how you listen so we can tune the room.
            </p>
            <div className="mt-8 flex items-center gap-3 font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-500">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-ember" />
              {total === null
                ? "Counting the line…"
                : total === 0
                ? "You'll be first in line"
                : `${total} listener${total === 1 ? "" : "s"} in line`}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-ember/50 via-transparent to-gold/40 opacity-60 blur-[6px]" />
              <div className="glass relative rounded-3xl p-8 sm:p-10">
                {joined ? (
                  <div data-testid="waitlist-success" className="flex flex-col items-center py-6 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-ember to-gold text-ink">
                      <Check size={26} strokeWidth={3} />
                    </span>
                    <p className="mt-6 font-display text-2xl font-bold text-white">You're in line.</p>
                    <p className="mt-2 max-w-xs text-sm text-neutral-400">
                      Position #{total}. We'll write the moment memberships open — your intro
                      rate is locked.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="flex flex-col gap-5">
                    <div>
                      <label htmlFor="wl-email" className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                        Email
                      </label>
                      <input
                        id="wl-email"
                        data-testid="waitlist-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-ink/60 px-4 py-3.5 text-white placeholder-neutral-600 transition-colors focus:border-ember/60"
                      />
                    </div>
                    <div>
                      <label htmlFor="wl-pref" className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                        How do you listen?
                      </label>
                      <div className="relative mt-2">
                        <select
                          id="wl-pref"
                          data-testid="waitlist-preference-select"
                          value={preference}
                          onChange={(e) => setPreference(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-white/10 bg-ink/60 px-4 py-3.5 text-white transition-colors focus:border-ember/60"
                        >
                          <option>Headphones</option>
                          <option>Hi-Fi Speakers</option>
                          <option>Commute</option>
                        </select>
                        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                      </div>
                    </div>
                    <button
                      data-testid="waitlist-submit-btn"
                      type="submit"
                      disabled={loading}
                      className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-ember to-gold px-7 py-3.5 font-display text-sm font-bold text-ink transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
                    >
                      {loading && <Loader2 size={15} className="animate-spin" />}
                      {loading ? "Joining…" : "Claim my spot"}
                    </button>
                    <p className="text-center font-tech text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                      $1.99/mo · first 3 months · then $8.99/mo
                    </p>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
