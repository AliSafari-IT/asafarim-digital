import {
  ArrowRight,
  Captions,
  Clapperboard,
  CloudUpload,
  Download,
  FileAudio,
  ImagePlus,
  ListChecks,
  Mic2,
  Sparkles,
  Wand2,
} from "lucide-react";

const pipelineSteps = [
  {
    icon: ImagePlus,
    title: "Ingest",
    detail: "Images, zip uploads, folder batches, thumbnails, and EXIF capture.",
  },
  {
    icon: Sparkles,
    title: "Write",
    detail: "Warm narrative generation from captions, timestamps, places, and mood.",
  },
  {
    icon: Mic2,
    title: "Narrate",
    detail: "Voice selection, TTS rendering, optional background MP3, and ducking.",
  },
  {
    icon: Clapperboard,
    title: "Render",
    detail: "Pan/zoom motion, transitions, subtitle overlay, and MP4 export.",
  },
];

const modes = ["Cinematic", "Slideshow", "Social"];

const queueItems = [
  ["Captioning", "12 images processed"],
  ["Script", "Narrative draft ready"],
  ["Voice", "Warm alto selected"],
  ["Render", "Preview MP4 queued"],
];

export default function ViontoPage() {
  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--text)]">
      <section className="workspace-shell">
        <aside className="sidebar" aria-label="Vionto workspace navigation">
          <div className="brand-lockup">
            <div className="brand-mark">Vi</div>
            <div>
              <p className="brand-name">Vionto</p>
              <p className="brand-subtitle">Vision + Canto</p>
            </div>
          </div>

          <nav className="nav-list" aria-label="Primary">
            <a className="nav-item active" href="#create">
              <Wand2 size={18} /> Create
            </a>
            <a className="nav-item" href="#uploads">
              <CloudUpload size={18} /> Uploads
            </a>
            <a className="nav-item" href="#script">
              <Captions size={18} /> Script
            </a>
            <a className="nav-item" href="#audio">
              <FileAudio size={18} /> Audio
            </a>
            <a className="nav-item" href="#export">
              <Download size={18} /> Export
            </a>
          </nav>

          <div className="sidebar-panel">
            <p className="panel-label">MVP target</p>
            <strong>First MP4 in 10 minutes</strong>
            <span>For 30-60 images with a narrated story and subtitles.</span>
          </div>
        </aside>

        <section className="main-panel">
          <header className="topbar">
            <div>
              <p className="eyebrow">Photo-to-story video MVP</p>
              <h1>Turn memories into poetic motion.</h1>
            </div>
            <a className="portal-link" href={process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000"}>
              ASafariM Portal <ArrowRight size={16} />
            </a>
          </header>

          <div className="creator-grid" id="create">
            <section className="upload-panel" id="uploads" aria-labelledby="upload-title">
              <div>
                <p className="eyebrow">Start</p>
                <h2 id="upload-title">Upload a memory set</h2>
                <p>
                  Add photos, a zip archive, or a future cloud-drive import. Vionto prepares thumbnails,
                  reads EXIF metadata, and starts the story pipeline.
                </p>
              </div>

              <div className="dropzone">
                <CloudUpload size={34} />
                <strong>Drop images or zip here</strong>
                <span>JPG, PNG, HEIC, WEBP, or ZIP up to the MVP account limit.</span>
              </div>

              <div className="mode-row" aria-label="Video mode presets">
                {modes.map((mode) => (
                  <button key={mode} className={mode === "Cinematic" ? "mode active" : "mode"} type="button">
                    {mode}
                  </button>
                ))}
              </div>
            </section>

            <section className="preview-panel" aria-labelledby="preview-title">
              <div className="preview-frame">
                <div className="film-strip">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="video-stage">
                  <div className="sun" />
                  <div className="horizon" />
                  <p>Summer evening, narrated with warmth.</p>
                </div>
              </div>
              <div className="preview-copy">
                <p className="eyebrow">Preview</p>
                <h2 id="preview-title">Cinematic draft</h2>
                <p>16:9 MP4, H.264 video, AAC audio, subtitles burned in or exported as SRT.</p>
              </div>
            </section>
          </div>

          <section className="pipeline" aria-label="Vionto production pipeline">
            {pipelineSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article className="pipeline-step" key={step.title}>
                  <Icon size={20} />
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </article>
              );
            })}
          </section>

          <section className="status-grid">
            <div className="script-editor" id="script">
              <div className="section-heading">
                <Captions size={20} />
                <h2>Generated story</h2>
              </div>
              <p>
                These photographs remember a quiet path through the city: morning light, familiar faces,
                small pauses, and the feeling of arriving somewhere that already knew your name.
              </p>
              <div className="subtitle-line">00:00:14,000 --&gt; 00:00:20,000</div>
            </div>

            <div className="job-card" id="export">
              <div className="section-heading">
                <ListChecks size={20} />
                <h2>Render queue</h2>
              </div>
              <ul>
                {queueItems.map(([label, detail]) => (
                  <li key={label}>
                    <span>{label}</span>
                    <strong>{detail}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
