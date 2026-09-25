import { Link } from "react-router-dom";
import Logo from "./Logo";
import { scrollToSection } from "../lib/scroll";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-surface">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-400">
              Audiobooks from authors around the world, distributed to listeners everywhere —
              curated narration in high-fidelity sound, by Booklab Authority.
            </p>
            <p className="mt-6 font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-600">
              $1.99/mo first 3 months · then $8.99/mo · 1 book monthly · extras $8.99
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-500">Explore</p>
            <ul className="mt-5 space-y-3">
              <li>
                <button onClick={() => scrollToSection("#catalog")} className="text-sm text-neutral-300 transition-colors hover:text-ember">
                  The Catalog
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#pricing")} className="text-sm text-neutral-300 transition-colors hover:text-ember">
                  Membership
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#waitlist")} className="text-sm text-neutral-300 transition-colors hover:text-ember">
                  VIP Waitlist
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-500">Account</p>
            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/auth" className="text-sm text-neutral-300 transition-colors hover:text-ember">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/shelf" className="text-sm text-neutral-300 transition-colors hover:text-ember">
                  My Shelf
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-500">Company</p>
            <p className="mt-5 text-sm leading-relaxed text-neutral-400">
              Booklab Audio is the audiobook service of Booklab Authority.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-600">
            © 2026 Booklab Authority — Booklab Audio
          </p>
          <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-neutral-600">
            Crafted for listeners
          </p>
        </div>
      </div>
    </footer>
  );
}
