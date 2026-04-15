"use client";

import { useSession, signIn, signOut } from "next-auth/react";

interface UserMenuProps {
  /** URL to redirect to portal sign-in (for non-portal apps) */
  signInUrl?: string;
}

/**
 * Shared user menu component for the nav bar.
 * Shows sign-in button when unauthenticated, avatar + dropdown when authenticated.
 */
export function UserMenu({ signInUrl }: UserMenuProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "var(--color-border, #262626)",
          animation: "pulse 2s infinite",
        }}
      />
    );
  }

  if (!session?.user) {
    return (
      <button
        onClick={() =>
          signInUrl ? (window.location.href = signInUrl) : signIn()
        }
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "1px solid var(--color-border, #262626)",
          background: "transparent",
          color: "var(--color-text, #fafafa)",
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Sign in
      </button>
    );
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session.user.email?.[0]?.toUpperCase() || "?";

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <details style={{ position: "relative" }}>
        <summary
          style={{
            listStyle: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              style={{ borderRadius: "50%" }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--color-accent, #3b82f6)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {initials}
            </div>
          )}
        </summary>

        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.5rem)",
            background: "var(--color-surface-elevated, #141414)",
            border: "1px solid var(--color-border, #262626)",
            borderRadius: "8px",
            padding: "0.5rem",
            minWidth: "200px",
            zIndex: 50,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              padding: "0.5rem 0.75rem",
              borderBottom: "1px solid var(--color-border, #262626)",
              marginBottom: "0.25rem",
            }}
          >
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text, #fafafa)",
              }}
            >
              {session.user.name || "User"}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-secondary, #a1a1a1)",
              }}
            >
              {session.user.email}
            </div>
            {session.user.roles && session.user.roles.length > 0 && (
              <div
                style={{
                  fontSize: "0.625rem",
                  color: "var(--color-accent, #3b82f6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginTop: "0.25rem",
                }}
              >
                {session.user.roles.join(", ")}
              </div>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "none",
              background: "transparent",
              color: "#f87171",
              fontSize: "0.875rem",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Sign out
          </button>
        </div>
      </details>
    </div>
  );
}
