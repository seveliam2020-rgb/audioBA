import { toast } from "sonner";
import { scrollToSection } from "../lib/scroll";

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.675-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.1zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.702" />
    </svg>
  );
}

function PlayStoreIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#00E5FF" d="M3.9 1.7c-.4.2-.7.7-.7 1.3v18c0 .6.3 1.1.7 1.3L14 12 3.9 1.7z" />
      <path fill="#FFB800" d="M17.6 8.6L14 12l3.6 3.4 3.6-2c.9-.5.9-2.3 0-2.8l-3.6-2z" />
      <path fill="#FF5A1F" d="M14 12L3.9 22.3c.3.2.8.2 1.3-.1l12.4-6.8L14 12z" />
      <path fill="#4ADE80" d="M3.9 1.7c-.4-.2-.9-.2-1.2 0L14 12l3.6-3.4L5.2 1.8c-.5-.3-1-.3-1.3-.1z" />
    </svg>
  );
}

function BadgeButton({ testid, icon, top, bottom, onClick }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-ink-surface px-4 py-2 text-white transition-colors hover:border-ember/60"
    >
      {icon}
      <span className="text-left leading-tight">
        <span className="block text-[9px] uppercase tracking-[0.15em] text-neutral-400">{top}</span>
        <span className="block font-display text-sm font-bold">{bottom}</span>
      </span>
    </button>
  );
}

export default function StoreBadges({ className = "" }) {
  const go = (store) => {
    toast.info(`${store} listing goes live at launch — join the waitlist for early access`);
    scrollToSection("#waitlist");
  };
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <BadgeButton
        testid="app-store-badge"
        icon={<AppleIcon />}
        top="Download on the"
        bottom="App Store"
        onClick={() => go("The App Store")}
      />
      <BadgeButton
        testid="play-store-badge"
        icon={<PlayStoreIcon />}
        top="Get it on"
        bottom="Google Play"
        onClick={() => go("Google Play")}
      />
    </div>
  );
}
