import type { Dictionaries } from "@asafarim/shared-i18n";

/**
 * Vionto-specific translation overrides. Keys shadow the base dictionary
 * from `@asafarim/shared-i18n`. Add app-only keys under `vionto.*`.
 */
export const viontoDictionaries: Dictionaries = {
  en: {
    // Upload
    "vionto.upload.eyebrow": "Uploads",
    "vionto.upload.title": "Upload a memory set",
    "vionto.upload.subtitle": "Add photos, a zip archive, or a future cloud-drive import.",
    "vionto.upload.dropzoneLabel": "Drop images or zip here",
    "vionto.upload.dropzoneHint": "JPG, PNG, HEIC, WEBP, or ZIP up to the account limit.",
    "vionto.upload.exifReading": "Reading EXIF metadata…",

    // Script / Story
    "vionto.script.title": "Generated story",
    "vionto.script.placeholder": "Story text will appear here after generation.",
    "vionto.script.edit": "Edit script",
    "vionto.script.save": "Save version",
    "vionto.script.regenerate": "Regenerate",
    "vionto.script.generating": "Generating story…",
    "vionto.script.empty": "No script yet — upload images and generate a story.",

    // Audio
    "vionto.audio.title": "Audio",
    "vionto.audio.voiceSelect": "Select voice",
    "vionto.audio.defaultVoice": "Default voice",
    "vionto.audio.preview": "Preview voice",
    "vionto.audio.previewing": "Previewing...",
    "vionto.audio.noVoices": "No voices are available for this locale.",
    "vionto.audio.render": "Render narration",

    // Render
    "vionto.render.title": "Render queue",
    "vionto.render.start": "Render MP4",
    "vionto.render.queued": "Queued",
    "vionto.render.rendering": "Rendering…",
    "vionto.render.running": "Rendering…",
    "vionto.render.completed": "Completed",
    "vionto.render.failed": "Failed",
    "vionto.render.download": "Get download link",
    "vionto.render.downloading": "Download link ready",
    "vionto.render.save": "Download MP4",
    "vionto.render.retry": "Retry render",

    // Export
    "vionto.export.title": "Export",
    "vionto.export.downloadMp4": "Download MP4",
    "vionto.export.downloadSrt": "Download SRT",
    "vionto.export.burnSubtitles": "Burn subtitles",

    // Modes
    "vionto.mode.cinematic": "Cinematic",
    "vionto.mode.slideshow": "Slideshow",
    "vionto.mode.social": "Social",

    // Billing
    "vionto.billing.creditsRemaining": "Credits remaining",
    "vionto.billing.upgradeCta": "Upgrade plan",

    // Errors
    "vionto.error.unauthorized": "Please sign in to continue.",
    "vionto.error.uploadTooLarge": "File exceeds the maximum allowed size.",
    "vionto.error.generationFailed": "Story generation failed. Please try again.",
    "vionto.error.noImages": "Upload at least one image before generating a story.",

    // Pipeline
    "vionto.pipeline.ingest": "Ingest",
    "vionto.pipeline.ingestDetail": "Images, zip uploads, folder batches, thumbnails, and EXIF capture.",
    "vionto.pipeline.write": "Write",
    "vionto.pipeline.writeDetail": "Warm narrative generation from captions, timestamps, places, and mood.",
    "vionto.pipeline.narrate": "Narrate",
    "vionto.pipeline.narrateDetail": "Voice selection, TTS rendering, optional background MP3, and ducking.",
    "vionto.pipeline.render": "Render",
    "vionto.pipeline.renderDetail": "Pan/zoom motion, transitions, subtitle overlay, and MP4 export.",

    // Nav
    "vionto.nav.create": "Create",
    "vionto.nav.uploads": "Uploads",
    "vionto.nav.script": "Script",
    "vionto.nav.audio": "Audio",
    "vionto.nav.export": "Export",
  },
  nl: {
    "vionto.upload.eyebrow": "Uploads",
    "vionto.upload.title": "Upload een herinneringenset",
    "vionto.upload.subtitle": "Voeg foto's, een zip-archief of een toekomstige clouddrive-import toe.",
    "vionto.upload.dropzoneLabel": "Sleep afbeeldingen of zip hier",
    "vionto.upload.dropzoneHint": "JPG, PNG, HEIC, WEBP of ZIP tot de accountlimiet.",
    "vionto.upload.exifReading": "EXIF-metadata wordt gelezen…",

    "vionto.script.title": "Gegenereerd verhaal",
    "vionto.script.placeholder": "Verhaaltekst verschijnt hier na het genereren.",
    "vionto.script.edit": "Script bewerken",
    "vionto.script.save": "Versie opslaan",
    "vionto.script.regenerate": "Opnieuw genereren",
    "vionto.script.generating": "Verhaal wordt gegenereerd…",
    "vionto.script.empty": "Nog geen script — upload afbeeldingen en genereer een verhaal.",

    "vionto.audio.title": "Audio",
    "vionto.audio.voiceSelect": "Selecteer stem",
    "vionto.audio.defaultVoice": "Standaardstem",
    "vionto.audio.preview": "Stem preview",
    "vionto.audio.previewing": "Preview wordt geladen...",
    "vionto.audio.noVoices": "Geen stemmen beschikbaar voor deze taal.",
    "vionto.audio.render": "Stem genereren",

    "vionto.render.title": "Renderwachtrij",
    "vionto.render.start": "MP4 renderen",
    "vionto.render.queued": "In wachtrij",
    "vionto.render.rendering": "Bezig met renderen…",
    "vionto.render.running": "Bezig met renderen…",
    "vionto.render.completed": "Voltooid",
    "vionto.render.failed": "Mislukt",
    "vionto.render.download": "Downloadlink ophalen",
    "vionto.render.downloading": "Downloadlink klaar",
    "vionto.render.save": "MP4 downloaden",
    "vionto.render.retry": "Render opnieuw proberen",

    "vionto.export.title": "Exporteren",
    "vionto.export.downloadMp4": "MP4 downloaden",
    "vionto.export.downloadSrt": "SRT downloaden",
    "vionto.export.burnSubtitles": "Ondertiteling branden",

    "vionto.mode.cinematic": "Filmisch",
    "vionto.mode.slideshow": "Diavoorstelling",
    "vionto.mode.social": "Social",

    "vionto.billing.creditsRemaining": "Resterende credits",
    "vionto.billing.upgradeCta": "Plan upgraden",

    "vionto.error.unauthorized": "Log in om verder te gaan.",
    "vionto.error.uploadTooLarge": "Bestand overschrijdt de maximale grootte.",
    "vionto.error.generationFailed": "Verhaalgeneratie mislukt. Probeer opnieuw.",
    "vionto.error.noImages": "Upload minstens één afbeelding voordat je een verhaal genereert.",

    "vionto.pipeline.ingest": "Inlezen",
    "vionto.pipeline.ingestDetail": "Afbeeldingen, zip-uploads, mapbatches, miniaturen en EXIF-capture.",
    "vionto.pipeline.write": "Schrijven",
    "vionto.pipeline.writeDetail": "Warme verhaalgeneratie uit bijschriften, tijdstempels, plaatsen en sfeer.",
    "vionto.pipeline.narrate": "Vertellen",
    "vionto.pipeline.narrateDetail": "Stemselectie, TTS-rendering, optionele achtergrondmuziek en ducking.",
    "vionto.pipeline.render": "Renderen",
    "vionto.pipeline.renderDetail": "Pan/zoom-beweging, overgangen, ondertiteling-overlay en MP4-export.",

    "vionto.nav.create": "Maken",
    "vionto.nav.uploads": "Uploads",
    "vionto.nav.script": "Script",
    "vionto.nav.audio": "Audio",
    "vionto.nav.export": "Exporteren",
  },
  fr: {
    "vionto.upload.eyebrow": "Uploads",
    "vionto.upload.title": "Uploader un ensemble de souvenirs",
    "vionto.upload.subtitle": "Ajoutez des photos, une archive zip ou une future importation depuis le cloud.",
    "vionto.upload.dropzoneLabel": "Déposez images ou zip ici",
    "vionto.upload.dropzoneHint": "JPG, PNG, HEIC, WEBP ou ZIP jusqu'à la limite du compte.",
    "vionto.upload.exifReading": "Lecture des métadonnées EXIF…",

    "vionto.script.title": "Histoire générée",
    "vionto.script.placeholder": "Le texte de l'histoire apparaîtra ici après la génération.",
    "vionto.script.edit": "Modifier le script",
    "vionto.script.save": "Sauvegarder la version",
    "vionto.script.regenerate": "Régénérer",
    "vionto.script.generating": "Génération de l'histoire…",
    "vionto.script.empty": "Pas encore de script — uploadez des images et générez une histoire.",

    "vionto.audio.title": "Audio",
    "vionto.audio.voiceSelect": "Choisir la voix",
    "vionto.audio.defaultVoice": "Voix par defaut",
    "vionto.audio.preview": "Aperçu voix",
    "vionto.audio.previewing": "Apercu en cours...",
    "vionto.audio.noVoices": "Aucune voix disponible pour cette langue.",
    "vionto.audio.render": "Générer narration",

    "vionto.render.title": "File de rendu",
    "vionto.render.start": "Rendre MP4",
    "vionto.render.queued": "En file",
    "vionto.render.rendering": "Rendu en cours…",
    "vionto.render.running": "Rendu en cours…",
    "vionto.render.completed": "Terminé",
    "vionto.render.failed": "Échoué",
    "vionto.render.download": "Obtenir le lien",
    "vionto.render.downloading": "Lien prêt",
    "vionto.render.save": "Télécharger MP4",
    "vionto.render.retry": "Réessayer le rendu",

    "vionto.export.title": "Exporter",
    "vionto.export.downloadMp4": "Télécharger MP4",
    "vionto.export.downloadSrt": "Télécharger SRT",
    "vionto.export.burnSubtitles": "Graver sous-titres",

    "vionto.mode.cinematic": "Cinématique",
    "vionto.mode.slideshow": "Diaporama",
    "vionto.mode.social": "Social",

    "vionto.billing.creditsRemaining": "Crédits restants",
    "vionto.billing.upgradeCta": "Améliorer le plan",

    "vionto.error.unauthorized": "Veuillez vous connecter pour continuer.",
    "vionto.error.uploadTooLarge": "Le fichier dépasse la taille maximale autorisée.",
    "vionto.error.generationFailed": "La génération de l'histoire a échoué. Veuillez réessayer.",
    "vionto.error.noImages": "Uploadez au moins une image avant de générer une histoire.",

    "vionto.pipeline.ingest": "Ingestion",
    "vionto.pipeline.ingestDetail": "Images, uploads zip, lots de dossiers, vignettes et capture EXIF.",
    "vionto.pipeline.write": "Écriture",
    "vionto.pipeline.writeDetail": "Génération narrative chaleureuse à partir de légendes, horodatages, lieux et ambiance.",
    "vionto.pipeline.narrate": "Narration",
    "vionto.pipeline.narrateDetail": "Sélection voix, rendu TTS, MP3 de fond optionnel et ducking.",
    "vionto.pipeline.render": "Rendu",
    "vionto.pipeline.renderDetail": "Mouvement panoramique/zoom, transitions, overlay sous-titres et export MP4.",

    "vionto.nav.create": "Créer",
    "vionto.nav.uploads": "Uploads",
    "vionto.nav.script": "Script",
    "vionto.nav.audio": "Audio",
    "vionto.nav.export": "Exporter",
  },
  de: {
    "vionto.upload.eyebrow": "Uploads",
    "vionto.upload.title": "Erinnerungsset hochladen",
    "vionto.upload.subtitle": "Fügen Sie Fotos, ein Zip-Archiv oder einen zukünftigen Cloud-Drive-Import hinzu.",
    "vionto.upload.dropzoneLabel": "Bilder oder Zip hier ablegen",
    "vionto.upload.dropzoneHint": "JPG, PNG, HEIC, WEBP oder ZIP bis zur Kontolimite.",
    "vionto.upload.exifReading": "EXIF-Metadaten werden gelesen…",

    "vionto.script.title": "Generierte Geschichte",
    "vionto.script.placeholder": "Der Geschichtentext erscheint hier nach der Generierung.",
    "vionto.script.edit": "Skript bearbeiten",
    "vionto.script.save": "Version speichern",
    "vionto.script.regenerate": "Neu generieren",
    "vionto.script.generating": "Geschichte wird generiert…",
    "vionto.script.empty": "Noch kein Skript — laden Sie Bilder hoch und generieren Sie eine Geschichte.",

    "vionto.audio.title": "Audio",
    "vionto.audio.voiceSelect": "Stimme auswählen",
    "vionto.audio.defaultVoice": "Standardstimme",
    "vionto.audio.preview": "Stimmen-Vorschau",
    "vionto.audio.previewing": "Vorschau laedt...",
    "vionto.audio.noVoices": "Fuer diese Sprache sind keine Stimmen verfuegbar.",
    "vionto.audio.render": "Stimme rendern",

    "vionto.render.title": "Render-Warteschlange",
    "vionto.render.start": "MP4 rendern",
    "vionto.render.queued": "In Warteschlange",
    "vionto.render.rendering": "Wird gerendert…",
    "vionto.render.running": "Wird gerendert…",
    "vionto.render.completed": "Abgeschlossen",
    "vionto.render.failed": "Fehlgeschlagen",
    "vionto.render.download": "Download-Link abrufen",
    "vionto.render.downloading": "Download-Link bereit",
    "vionto.render.save": "MP4 herunterladen",
    "vionto.render.retry": "Render erneut versuchen",

    "vionto.export.title": "Exportieren",
    "vionto.export.downloadMp4": "MP4 herunterladen",
    "vionto.export.downloadSrt": "SRT herunterladen",
    "vionto.export.burnSubtitles": "Untertitel einbrennen",

    "vionto.mode.cinematic": "Filmisch",
    "vionto.mode.slideshow": "Diashow",
    "vionto.mode.social": "Social",

    "vionto.billing.creditsRemaining": "Verbleibende Credits",
    "vionto.billing.upgradeCta": "Plan upgraden",

    "vionto.error.unauthorized": "Bitte melden Sie sich an, um fortzufahren.",
    "vionto.error.uploadTooLarge": "Datei überschreitet die maximal zulässige Größe.",
    "vionto.error.generationFailed": "Geschichtengenerierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    "vionto.error.noImages": "Laden Sie mindestens ein Bild hoch, bevor Sie eine Geschichte generieren.",

    "vionto.pipeline.ingest": "Ingest",
    "vionto.pipeline.ingestDetail": "Bilder, Zip-Uploads, Ordner-Batches, Thumbnails und EXIF-Capture.",
    "vionto.pipeline.write": "Schreiben",
    "vionto.pipeline.writeDetail": "Warme Narrativ-Generierung aus Bildunterschriften, Zeitstempeln, Orten und Stimmung.",
    "vionto.pipeline.narrate": "Erzählen",
    "vionto.pipeline.narrateDetail": "Stimmenauswahl, TTS-Rendering, optionaler Hintergrund-MP3 und Ducking.",
    "vionto.pipeline.render": "Render",
    "vionto.pipeline.renderDetail": "Pan/Zoom-Bewegung, Übergänge, Untertitel-Overlay und MP4-Export.",

    "vionto.nav.create": "Erstellen",
    "vionto.nav.uploads": "Uploads",
    "vionto.nav.script": "Skript",
    "vionto.nav.audio": "Audio",
    "vionto.nav.export": "Exportieren",
  },
};
