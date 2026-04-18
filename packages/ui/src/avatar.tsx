"use client";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ src, alt, name, email, size = 28, className = "" }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className={`relative shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt ?? name ?? "User"}
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-success)] text-[11px] font-bold text-white"
          style={{ width: size, height: size }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
