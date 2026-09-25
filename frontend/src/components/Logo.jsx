export const LogoMark = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect width="64" height="64" rx="14" fill="#0A0A0C" />
    <rect
      x="0.75"
      y="0.75"
      width="62.5"
      height="62.5"
      rx="13.25"
      stroke="rgba(255,255,255,0.18)"
      strokeWidth="1.5"
      fill="none"
    />
    <g strokeLinecap="round" strokeWidth="5">
      <path d="M17 40V24" stroke="#FF5A1F" />
      <path d="M27 49V15" stroke="#FFB800" />
      <path d="M37 45V19" stroke="#FF5A1F" />
      <path d="M47 37V27" stroke="#FFB800" />
    </g>
  </svg>
);

export default function Logo({ compact = false }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark />
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-white">
          Booklab <span className="text-gradient-fire">Audio</span>
        </span>
      )}
    </span>
  );
}
