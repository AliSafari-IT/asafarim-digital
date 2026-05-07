import { describe, expect, it } from "vitest";
import { pickMotionPreset, pickTransitionPreset, buildRenderCommand, buildConcatListContent } from "../ffmpeg";
import type { RenderManifest } from "../render-manifest";

const BASE_MANIFEST: RenderManifest = {
  projectId: "p1",
  userId: "u1",
  jobId: "j1",
  mode: "cinematic",
  resolution: "1080p",
  aspectRatio: "16:9",
  frameRate: 30,
  assets: [
    { storageKey: "img1.jpg", durationSeconds: 5 },
    { storageKey: "img2.jpg", durationSeconds: 5 },
  ],
  audioTracks: [],
  burnSubtitles: false,
  subtitleStyle: { fontName: "Arial", fontSize: 24, color: "white", outlineColor: "black", outlineWidth: 2, position: "bottom", marginV: 40 },
  outputFormat: "mp4",
  videoCodec: "libx264",
  audioCodec: "aac",
  videoBitrate: "5000k",
  audioBitrate: "192k",
  maxRetries: 3,
  workerTimeoutSeconds: 600,
};

describe("pickMotionPreset", () => {
  it("cycles through cinematic motions", () => {
    const p0 = pickMotionPreset(0, "cinematic");
    const p1 = pickMotionPreset(1, "cinematic");
    expect(p0.name).toBe("ken_burns");
    expect(p1.name).toBe("pan_left");
  });

  it("returns static for slideshow mode", () => {
    const p = pickMotionPreset(0, "slideshow");
    expect(p.name).toBe("static");
  });

  it("returns zoom presets for social mode", () => {
    const p0 = pickMotionPreset(0, "social");
    expect(p0.name).toBe("zoom_in");
  });
});

describe("pickTransitionPreset", () => {
  it("cycles cinematic transitions", () => {
    const t0 = pickTransitionPreset(0, "cinematic");
    expect(t0.name).toBe("fade");
  });

  it("uses shorter duration for social mode", () => {
    const t = pickTransitionPreset(0, "social");
    expect(t.name).toBe("slide_left");
    expect(t.durationSeconds).toBe(0.3);
  });
});

describe("buildRenderCommand", () => {
  it("returns steps for each asset plus final encode", () => {
    const { steps, concatListPath } = buildRenderCommand(BASE_MANIFEST, "/tmp/work", {
      outputPath: "/tmp/work/out.mp4",
    });
    expect(steps.length).toBe(BASE_MANIFEST.assets.length + 1);
    expect(concatListPath).toBeDefined();
  });

  it("includes subtitle burn-in when requested", () => {
    const manifest = { ...BASE_MANIFEST, burnSubtitles: true };
    const { steps } = buildRenderCommand(manifest, "/tmp/work", {
      outputPath: "/tmp/work/out.mp4",
      srtPath: "/tmp/work/sub.srt",
    });
    const final = steps[steps.length - 1];
    expect(final.some((a) => a.includes("subtitles="))).toBe(true);
  });

  it("uses the correct video codec and bitrate", () => {
    const { steps } = buildRenderCommand(BASE_MANIFEST, "/tmp/work", {
      outputPath: "/tmp/work/out.mp4",
    });
    const final = steps[steps.length - 1];
    expect(final).toContain("-c:v");
    expect(final).toContain("libx264");
    expect(final).toContain("-b:v");
    expect(final).toContain("5000k");
  });
});

describe("buildConcatListContent", () => {
  it("formats paths with single-quoting", () => {
    const content = buildConcatListContent(["/tmp/seg_0000.mp4", "/tmp/seg_0001.mp4"]);
    expect(content).toContain("file '/tmp/seg_0000.mp4'");
    expect(content).toContain("file '/tmp/seg_0001.mp4'");
  });
});
