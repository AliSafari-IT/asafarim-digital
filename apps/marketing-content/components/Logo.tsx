import { SVGProps } from "react";

export function MarketingContentMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="mcMarkGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Funnel silhouette */}
      <path
        d="M10 10h44l-14 18v18l-16 8V28L10 10z"
        fill="none"
        stroke="url(#mcMarkGrad)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {/* Inner spark */}
      <g fill="url(#mcMarkGrad)">
        <circle cx="32" cy="22" r="2.4" />
        <circle cx="32" cy="33" r="2" opacity="0.8" />
        <circle cx="32" cy="43" r="1.6" opacity="0.6" />
      </g>
      {/* Growth chevrons top-right */}
      <g stroke="url(#mcMarkGrad)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M46 14l6 4-6 4" />
      </g>
    </svg>
  );
}

export function MarketingContentLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <MarketingContentMark className="h-8 w-8 drop-shadow-[0_0_12px_rgba(244,63,94,0.25)]" />
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-semibold text-[var(--color-text)]">Marketing Content</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
            Growth Engine
          </p>
        </div>
      )}
    </div>
  );
}
