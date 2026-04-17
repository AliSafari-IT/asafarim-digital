import { SVGProps } from "react";

export function OpsHubMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="ohMarkGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>

      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke="url(#ohMarkGrad)"
        strokeWidth="1.5"
        strokeDasharray="2 4"
        opacity="0.55"
      />
      <circle
        cx="32"
        cy="32"
        r="17"
        fill="none"
        stroke="url(#ohMarkGrad)"
        strokeWidth="1.5"
        opacity="0.75"
      />

      <g stroke="url(#ohMarkGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.9">
        <line x1="32" y1="14" x2="32" y2="23" />
        <line x1="50" y1="32" x2="41" y2="32" />
        <line x1="32" y1="50" x2="32" y2="41" />
        <line x1="14" y1="32" x2="23" y2="32" />
      </g>

      <g fill="url(#ohMarkGrad)">
        <circle cx="32" cy="8" r="3.2" />
        <circle cx="56" cy="32" r="3.2" />
        <circle cx="32" cy="56" r="3.2" />
        <circle cx="8" cy="32" r="3.2" />
      </g>

      <circle cx="32" cy="32" r="8.5" fill="url(#ohMarkGrad)" />
      <circle cx="32" cy="32" r="3.2" fill="#0B1020" />
    </svg>
  );
}

export function OpsHubLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <OpsHubMark className="h-8 w-8 drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]" />
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-semibold text-[var(--color-text)]">Ops Hub</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
            SaaS Operations
          </p>
        </div>
      )}
    </div>
  );
}
