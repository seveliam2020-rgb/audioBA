import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { scrollToSection } from "../lib/scroll";

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Catalog", hash: "#catalog", id: "nav-catalog-link" },
    { label: "Spotlight", hash: "#spotlight", id: "nav-spotlight-link" },
    { label: "Membership", hash: "#pricing", id: "nav-pricing-link" },
    { label: "App", hash: "#app", id: "nav-app-link" },
    { label: "Waitlist", hash: "#waitlist", id: "nav-waitlist-link" },
  ];

  const go = (hash) => {
    setOpen(false);
    scrollToSection(hash);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-white/10 bg-ink/80 backdrop-blur-2xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-10">
        <button
          data-testid="nav-brand-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center"
          aria-label="Booklab Audio home"
        >
          <Logo />
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <button
              key={l.hash}
              data-testid={l.id}
              onClick={() => go(l.hash)}
              className="font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-400 transition-colors hover:text-white"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  data-testid="nav-admin-link"
                  to="/admin"
                  className="font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-400 transition-colors hover:text-white"
                >
                  Admin
                </Link>
              )}
              <button
                data-testid="nav-my-shelf-btn"
                onClick={() => navigate("/shelf")}
                className="rounded-full bg-gradient-to-r from-ember to-gold px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-ink transition-transform duration-300 hover:scale-105"
              >
                My Shelf
              </button>
            </>
          ) : (
            <>
              <Link
                data-testid="nav-signin-btn"
                to="/auth"
                className="font-tech text-[11px] uppercase tracking-[0.25em] text-neutral-300 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <button
                data-testid="nav-start-cta"
                onClick={() => go("#waitlist")}
                className="rounded-full bg-gradient-to-r from-ember to-gold px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-ink transition-transform duration-300 hover:scale-105"
              >
                Start for $1.99
              </button>
            </>
          )}
        </div>

        <button
          data-testid="nav-mobile-toggle"
          className="rounded-lg p-2 text-neutral-300 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-white/10 bg-ink/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((l) => (
                <button
                  key={l.hash}
                  data-testid={`${l.id}-mobile`}
                  onClick={() => go(l.hash)}
                  className="rounded-lg px-3 py-3 text-left font-tech text-xs uppercase tracking-[0.25em] text-neutral-300 hover:bg-white/5"
                >
                  {l.label}
                </button>
              ))}
              <div className="mt-3 flex gap-3 border-t border-white/10 pt-4">
                {user ? (
                  <button
                    data-testid="nav-my-shelf-btn-mobile"
                    onClick={() => navigate("/shelf")}
                    className="flex-1 rounded-full bg-gradient-to-r from-ember to-gold px-5 py-3 font-display text-xs font-bold uppercase tracking-wide text-ink"
                  >
                    My Shelf
                  </button>
                ) : (
                  <>
                    <Link
                      data-testid="nav-signin-btn-mobile"
                      to="/auth"
                      className="flex-1 rounded-full border border-white/15 px-5 py-3 text-center font-tech text-xs uppercase tracking-[0.25em] text-neutral-200"
                    >
                      Sign in
                    </Link>
                    <button
                      data-testid="nav-start-cta-mobile"
                      onClick={() => go("#waitlist")}
                      className="flex-1 rounded-full bg-gradient-to-r from-ember to-gold px-5 py-3 font-display text-xs font-bold uppercase tracking-wide text-ink"
                    >
                      Start for $1.99
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
