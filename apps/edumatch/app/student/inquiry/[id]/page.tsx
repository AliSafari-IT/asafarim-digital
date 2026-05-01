"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Attachment = {
  url: string;
  mime: string;
  filename: string;
  sizeBytes: number;
};

type AiResponse = {
  id: string;
  explanation: string;
  modelUsed: string;
  createdAt: string;
};

type Inquiry = {
  id: string;
  subject: string;
  gradeLevel: string;
  description: string;
  attachments: Attachment[];
  status: string;
  aiSummary: string | null;
  createdAt: string;
  updatedAt: string;
  aiResponses: AiResponse[];
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  NEW: { label: "New", cls: "bg-gray-100 text-gray-700" },
  AI_RESPONDED: { label: "AI Responded", cls: "bg-blue-100 text-blue-700" },
  TUTOR_REQUESTED: { label: "Tutor Requested", cls: "bg-yellow-100 text-yellow-700" },
  BOOKED: { label: "Booked", cls: "bg-green-100 text-green-700" },
  CLOSED: { label: "Closed", cls: "bg-gray-100 text-gray-500" },
};

export default function InquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI streaming state
  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [streamDone, setStreamDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const streamBoxRef = useRef<HTMLDivElement>(null);

  // Quote request state
  const [requestingQuotes, setRequestingQuotes] = useState(false);
  const [quoteRequestId, setQuoteRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/inquiries/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json() as Promise<Inquiry>;
      })
      .then((data) => {
        setInquiry(data);
        if (data.aiResponses?.length > 0) {
          setStreamedText(data.aiResponses[0].explanation);
          setStreamDone(true);
        }
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (streamBoxRef.current) {
      streamBoxRef.current.scrollTop = streamBoxRef.current.scrollHeight;
    }
  }, [streamedText]);

  async function startAiStream() {
    if (!inquiry) return;
    setStreaming(true);
    setStreamedText("");
    setStreamDone(false);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch(`/api/inquiries/${id}/ai?stream=1`, {
        signal: abort.signal,
      });

      if (!res.ok || !res.body) {
        setError("AI service unavailable.");
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const payload = JSON.parse(line.slice(6)) as { token?: string; done?: boolean; error?: string };
              if (payload.error) {
                setError(payload.error);
                setStreaming(false);
                return;
              }
              if (payload.token) {
                setStreamedText((prev) => prev + payload.token);
              }
              if (payload.done) {
                setStreamDone(true);
                setStreaming(false);
                setInquiry((prev) =>
                  prev ? { ...prev, status: "AI_RESPONDED" } : prev,
                );
              }
            } catch {
              // ignore malformed SSE lines
            }
          }
          if (line.startsWith("event: done")) {
            setStreamDone(true);
            setStreaming(false);
            setInquiry((prev) =>
              prev ? { ...prev, status: "AI_RESPONDED" } : prev,
            );
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError("Stream interrupted.");
      }
      setStreaming(false);
    }
  }

  async function requestTutorQuotes() {
    if (!inquiry) return;
    setRequestingQuotes(true);
    try {
      const res = await fetch(`/api/inquiries/${id}/quote-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferOnline: true }),
      });
      const data = await res.json() as { quoteRequest?: { id: string }; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to request quotes.");
        return;
      }
      const qrId = data.quoteRequest?.id;
      setQuoteRequestId(qrId ?? null);
      setInquiry((prev) => prev ? { ...prev, status: "TUTOR_REQUESTED" } : prev);
      if (qrId) {
        router.push(`/student/inquiry/${id}/quotes?qr=${qrId}`);
      }
    } catch {
      setError("Failed to request tutor quotes.");
    } finally {
      setRequestingQuotes(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  if (error && !inquiry) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/student" className="text-[var(--color-primary)] hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!inquiry) return null;

  const statusInfo = STATUS_LABELS[inquiry.status] ?? STATUS_LABELS.NEW;
  const canAskAI = ["NEW", "AI_RESPONDED"].includes(inquiry.status);
  const canRequestTutors = inquiry.status === "AI_RESPONDED" && streamDone;
  const hasAiResponse = streamedText.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/student" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
          ← Dashboard
        </Link>
        <span className="text-[var(--color-text-muted)]">/</span>
        <span className="text-sm text-[var(--color-text)]">{inquiry.subject}</span>
      </div>

      {/* Inquiry card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">{inquiry.subject}</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{inquiry.gradeLevel} · {new Date(inquiry.createdAt).toLocaleDateString()}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
        </div>
        <p className="text-[var(--color-text)] whitespace-pre-wrap leading-relaxed">
          {inquiry.description}
        </p>

        {/* Attachments */}
        {inquiry.attachments?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {inquiry.attachments.map((att, i) => (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] transition"
              >
                <AttachmentIcon mime={att.mime} />
                {att.filename}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* AI Response section */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">AI Explanation</h2>
          {canAskAI && (
            <button
              onClick={startAiStream}
              disabled={streaming}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {streaming ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Thinking…
                </>
              ) : streamDone ? "Ask Again" : "Ask AI"}
            </button>
          )}
        </div>

        {hasAiResponse ? (
          <div
            ref={streamBoxRef}
            className="max-h-[480px] overflow-y-auto rounded-lg bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text)] whitespace-pre-wrap leading-relaxed font-mono"
          >
            {streamedText}
            {streaming && (
              <span className="ml-1 inline-block h-3.5 w-0.5 animate-pulse bg-[var(--color-primary)]" />
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)]">
            {streaming ? "Generating AI response…" : 'Click "Ask AI" to get an explanation from EduMatch AI.'}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {canRequestTutors && (
          <button
            onClick={requestTutorQuotes}
            disabled={requestingQuotes}
            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {requestingQuotes ? "Requesting…" : "Request Tutor Quotes"}
          </button>
        )}
        {(inquiry.status === "TUTOR_REQUESTED" || quoteRequestId) && (
          <Link
            href={`/student/inquiry/${id}/quotes`}
            className="rounded-lg border border-[var(--color-border-strong)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] transition"
          >
            View Quotes
          </Link>
        )}
      </div>
    </div>
  );
}

function AttachmentIcon({ mime }: { mime: string }) {
  if (mime.startsWith("image/")) return <span>🖼</span>;
  if (mime.startsWith("audio/")) return <span>🎤</span>;
  if (mime.startsWith("video/")) return <span>🎬</span>;
  if (mime === "application/pdf") return <span>📄</span>;
  return <span>📎</span>;
}
