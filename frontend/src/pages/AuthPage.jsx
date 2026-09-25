import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { getApiError } from "../lib/api";
import { HERO_IMAGE } from "../data/books";

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink font-tech text-xs uppercase tracking-[0.3em] text-neutral-500">
        Tuning in…
      </div>
    );
  }
  if (user) return <Navigate to="/shelf" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      toast.success(mode === "login" ? "Welcome back." : "Account created — your shelf awaits.");
      navigate("/shelf");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grain flex min-h-screen bg-ink text-foreground">
      <div className="relative hidden lg:block lg:w-[46%]">
        <img src={HERO_IMAGE} alt="Studio headphones" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="absolute bottom-14 left-12 right-12">
          <p className="font-serif-accent text-3xl italic leading-snug text-white">
            "The best seat in the house is wherever you press play."
          </p>
          <p className="mt-4 font-tech text-[10px] uppercase tracking-[0.3em] text-amber-500/90">
            Booklab Audio — by Booklab Authority
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link to="/" data-testid="auth-back-home-link" className="inline-flex">
            <Logo />
          </Link>

          <h1 className="mt-10 font-display text-4xl font-extrabold tracking-tight text-white">
            {mode === "login" ? (
              <>Welcome <em className="font-serif-accent text-gradient-fire font-normal italic">back.</em></>
            ) : (
              <>Start <em className="font-serif-accent text-gradient-fire font-normal italic">listening.</em></>
            )}
          </h1>
          <p className="mt-3 text-sm text-neutral-400">
            {mode === "login"
              ? "Sign in to reach your shelf and this month's credit."
              : "Create a free account — first 3 months at $1.99/month."}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-ink-surface p-1">
            {[
              { id: "auth-mode-login-tab", label: "Sign in", value: "login" },
              { id: "auth-mode-register-tab", label: "Create account", value: "register" },
            ].map((t) => (
              <button
                key={t.value}
                data-testid={t.id}
                onClick={() => {
                  setMode(t.value);
                  setError("");
                }}
                className={`rounded-full py-2.5 font-tech text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  mode === t.value ? "bg-gradient-to-r from-ember to-gold text-ink" : "text-neutral-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
            {mode === "register" && (
              <div>
                <label htmlFor="auth-name" className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                  Name
                </label>
                <input
                  id="auth-name"
                  data-testid="auth-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-ink-surface px-4 py-3.5 text-white placeholder-neutral-600 transition-colors focus:border-ember/60"
                />
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                Email
              </label>
              <input
                id="auth-email"
                data-testid="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-surface px-4 py-3.5 text-white placeholder-neutral-600 transition-colors focus:border-ember/60"
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                Password
              </label>
              <input
                id="auth-password"
                data-testid="auth-password-input"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-surface px-4 py-3.5 text-white placeholder-neutral-600 transition-colors focus:border-ember/60"
              />
            </div>

            {error && (
              <p data-testid="auth-error" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              data-testid="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-ember to-gold px-7 py-3.5 font-display text-sm font-bold text-ink transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
            <p className="text-center font-tech text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              $1.99/mo · first 3 months · then $8.99/mo
            </p>
          </form>

          <Link to="/" className="mt-8 inline-block font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-ember">
            ← Back to booklab.audio
          </Link>
        </div>
      </div>
    </div>
  );
}
