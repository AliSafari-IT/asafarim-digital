/**
 * TTS provider abstraction for Vionto.
 *
 * Supports multiple backends (OpenAI TTS, ElevenLabs, etc.) with a unified
 * voice catalog and metadata tracking.
 */

export type TTSProvider = "openai" | "elevenlabs" | "custom";

export type VoiceEntry = {
  id: string;
  name: string;
  provider: TTSProvider;
  locale: string; // e.g. "en-US", "nl-NL"
  gender: "male" | "female" | "neutral";
  previewUrl?: string;
  tags: string[]; // "warm", "calm", "dramatic", "news"
};

export type TTSSuccess = {
  ok: true;
  audioBuffer: Buffer;
  provider: TTSProvider;
  voiceId: string;
  model?: string;
  durationSeconds?: number;
  latencyMs: number;
};

export type TTSFailure = {
  ok: false;
  error: string;
  provider: TTSProvider;
  isRetryable: boolean;
};

export type TTSResult = TTSSuccess | TTSFailure;

/** Built-in voice catalog — extendable at runtime via DB or env. */
export const VOICE_CATALOG: VoiceEntry[] = [
  { id: "alloy", name: "Alloy", provider: "openai", locale: "en-US", gender: "neutral", tags: ["calm", "modern"] },
  { id: "echo", name: "Echo", provider: "openai", locale: "en-US", gender: "male", tags: ["warm"] },
  { id: "fable", name: "Fable", provider: "openai", locale: "en-GB", gender: "male", tags: ["storytelling"] },
  { id: "onyx", name: "Onyx", provider: "openai", locale: "en-US", gender: "male", tags: ["dramatic"] },
  { id: "nova", name: "Nova", provider: "openai", locale: "en-US", gender: "female", tags: ["warm", "calm"] },
  { id: "shimmer", name: "Shimmer", provider: "openai", locale: "en-US", gender: "female", tags: ["bright"] },
  { id: "coral", name: "Coral", provider: "openai", locale: "en-US", gender: "female", tags: ["conversational"] },
];

export function getVoiceById(id: string): VoiceEntry | undefined {
  return VOICE_CATALOG.find((v) => v.id === id);
}

export function listVoicesForLocale(locale: string): VoiceEntry[] {
  const base = locale.split("-")[0] ?? locale;
  return VOICE_CATALOG.filter((v) => v.locale === locale || v.locale.startsWith(`${base}-`));
}

export function listVoicesByTag(tag: string): VoiceEntry[] {
  return VOICE_CATALOG.filter((v) => v.tags.includes(tag));
}

/** Generate TTS audio via OpenAI. */
export async function ttsOpenAI(
  text: string,
  voiceId: string,
  model = "tts-1-hd"
): Promise<TTSResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "OPENAI_API_KEY not configured", provider: "openai", isRetryable: false };
  }
  const startedAt = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, voice: voiceId, input: text, response_format: "mp3" }),
    });
    if (!res.ok) {
      const body = await res.text();
      return {
        ok: false,
        error: `OpenAI TTS HTTP ${res.status}: ${body.slice(0, 200)}`,
        provider: "openai",
        isRetryable: res.status >= 500 || res.status === 429,
      };
    }
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    return {
      ok: true,
      audioBuffer,
      provider: "openai",
      voiceId,
      model,
      latencyMs: Date.now() - startedAt,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      provider: "openai",
      isRetryable: true,
    };
  }
}

/** Generate TTS audio via ElevenLabs. */
export async function ttsElevenLabs(
  text: string,
  voiceId: string,
  model = "eleven_multilingual_v2"
): Promise<TTSResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "ELEVENLABS_API_KEY not configured", provider: "elevenlabs", isRetryable: false };
  }
  const startedAt = Date.now();
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return {
        ok: false,
        error: `ElevenLabs TTS HTTP ${res.status}: ${body.slice(0, 200)}`,
        provider: "elevenlabs",
        isRetryable: res.status >= 500 || res.status === 429,
      };
    }
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    return {
      ok: true,
      audioBuffer,
      provider: "elevenlabs",
      voiceId,
      model,
      latencyMs: Date.now() - startedAt,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      provider: "elevenlabs",
      isRetryable: true,
    };
  }
}

/** Try each configured provider in order of preference. */
export async function synthesizeSpeech(
  text: string,
  voiceId: string,
  preferredProviders: TTSProvider[] = ["openai", "elevenlabs"]
): Promise<TTSResult> {
  const voice = getVoiceById(voiceId);
  if (!voice) {
    return { ok: false, error: `Voice '${voiceId}' not found in catalog`, provider: "custom", isRetryable: false };
  }

  // If the requested voice belongs to a specific provider, try that first.
  const ordered = voice.provider === "custom"
    ? preferredProviders
    : [voice.provider, ...preferredProviders.filter((p) => p !== voice.provider)];

  const errors: string[] = [];
  for (const provider of ordered) {
    let result: TTSResult;
    if (provider === "openai") {
      result = await ttsOpenAI(text, voiceId);
    } else if (provider === "elevenlabs") {
      result = await ttsElevenLabs(text, voiceId);
    } else {
      continue;
    }
    if (result.ok) return result;
    errors.push(`${provider}: ${result.error}`);
    if (!result.isRetryable) break;
  }

  return {
    ok: false,
    error: errors.join(" | ") || "No TTS provider available",
    provider: voice.provider,
    isRetryable: true,
  };
}
