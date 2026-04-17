interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ size = 40, className = "", showWordmark = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Content Generator logo"
        className="drop-shadow-[0_4px_18px_rgba(58,123,255,0.45)]"
      >
        <defs>
          <linearGradient id="cg-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d0d0f" />
            <stop offset="100%" stopColor="#1a1f2c" />
          </linearGradient>
          <linearGradient id="cg-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a7bff" />
            <stop offset="100%" stopColor="#4ff2c9" />
          </linearGradient>
          <linearGradient id="cg-spark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <radialGradient id="cg-core" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#4ff2c9" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#3a7bff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#cg-bg)" />
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          fill="none"
          stroke="url(#cg-ring)"
          strokeWidth="1.5"
          opacity="0.55"
        />

        <circle cx="32" cy="32" r="18" fill="url(#cg-core)" opacity="0.85">
          <animate attributeName="r" values="16;20;16" dur="4s" repeatCount="indefinite" />
        </circle>

        <g stroke="url(#cg-ring)" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M14 32 Q32 12 50 32" opacity="0.85">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="3.2s" repeatCount="indefinite" />
          </path>
          <path d="M14 32 Q32 52 50 32" opacity="0.85">
            <animate
              attributeName="opacity"
              values="1;0.4;1"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        <g fill="url(#cg-spark)">
          <circle cx="14" cy="32" r="3">
            <animate attributeName="r" values="2.5;3.5;2.5" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="32" r="3">
            <animate attributeName="r" values="3.5;2.5;3.5" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="32" cy="14" r="2.4" />
          <circle cx="32" cy="50" r="2.4" />
        </g>

        <path
          d="M27 26 L37 26 M25 32 L39 32 M28 38 L36 38"
          stroke="#0d0d0f"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>

      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">
            ASafariM
          </span>
          <span className="text-base font-bold tracking-tight text-[var(--color-text)]">
            Content<span className="text-[var(--color-primary)]">.AI</span>
          </span>
        </div>
      )}
    </div>
  );
}
