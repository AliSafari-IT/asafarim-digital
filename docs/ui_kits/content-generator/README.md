# ASafariM Content Generator — UI Kit

Recreation of the Content Generator app: an AI workspace for prompt → output flows. Three-pane layout (sidebar / chat composer / generated output) with mockable streaming, history, and a settings drawer.

## Files
- `index.html` — main demo with click-thru: pick template → write prompt → generate → see streamed output
- `Sidebar.jsx` — workspace switcher + conversation list
- `Composer.jsx` — prompt input area with template selector
- `OutputPanel.jsx` — streamed output with copy/regenerate
- `TopBar.jsx` — workspace header, model picker, sign-in avatar
- `app.jsx` — wires it together with mock streaming
