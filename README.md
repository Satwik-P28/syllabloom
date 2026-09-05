# Syllabloom

[![Live demo](https://img.shields.io/badge/live%20demo-try%20now-2ea44f?style=for-the-badge)](https://syllabloom.nex3sss.chatgpt.site)
[![GitHub stars](https://img.shields.io/github/stars/Satwik-P28/syllabloom?style=for-the-badge&logo=github)](https://github.com/Satwik-P28/syllabloom/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/Satwik-P28/syllabloom/ci.yml?branch=main&style=for-the-badge)](https://github.com/Satwik-P28/syllabloom/actions)

**Let every page find its voice.**

Syllabloom is a **free, private, local-first reading workspace** for text, Markdown, and text-based PDFs — an open-source alternative to paid listen-to-this-page tools such as Speechify. It extracts documents in the browser, reads them with **installed system voices**, highlights the current sentence, remembers progress, and exports clean text.

[**Try the public demo**](https://syllabloom.nex3sss.chatgpt.site) · [**Star this repo**](https://github.com/Satwik-P28/syllabloom) · [**Run with Docker**](#docker)

No account is required and imported content is not uploaded.

![Syllabloom preview](public/og.png)

## Why this exists

Listening to a PDF should not require an account, a credit card, or sending the document to a narration vendor. Syllabloom is an **accessible local TTS reader**: your files stay on the device, playback uses voices already installed on the operating system, and the current sentence stays on screen.

| | Paid read-aloud apps | **Syllabloom** |
| --- | --- | --- |
| Price | Subscription | Free, MIT, self-host |
| Documents | Uploaded / synced | Stay in this browser |
| Voices | Vendor neural voices | Installed system voices |
| Position | Cloud progress | Local library + sentence highlight |
| Scanned PDFs | Often OCR upsell | Honest “needs OCR later” handling |

System speech voices may have operating-system-specific behavior.

## Working today

- Local TXT, Markdown, and **text-PDF** import
- System text-to-speech with play, pause, and sentence navigation
- Voice and speed selection
- Current-sentence **focus highlighting**
- Text-size controls and responsive layout
- Browser-local library and reading position
- Plain-text export
- Clear handling for scanned PDFs that require future OCR support

## Quick start

Requires [Node.js](https://nodejs.org/) 22.13 or later.

```bash
git clone https://github.com/Satwik-P28/syllabloom.git
cd syllabloom
npm ci
npm run dev
```

Open `http://localhost:3000`. Use the built-in sample, or add a `.txt`, `.md`, or text-based PDF.

## Docker

```bash
docker pull ghcr.io/satwik-p28/syllabloom:latest
docker run --rm -p 3000:3000 ghcr.io/satwik-p28/syllabloom:latest
```

Or build locally:

```bash
docker compose up --build
```

## Architecture

React 19, TypeScript, Vinext/Vite, PDF.js, browser Speech Synthesis, local storage, Tailwind CSS, and shadcn components. Pure reading helpers are tested with Vitest.

## Quality checks

```bash
npm run check
npm audit
```

## Contributing

If Syllabloom read a document you did not want to upload — **[star the repo](https://github.com/Satwik-P28/syllabloom)** so other readers can find a private TTS workspace.

See [CONTRIBUTING.md](CONTRIBUTING.md).

### Blurb for awesome-lists

> **[Syllabloom](https://github.com/Satwik-P28/syllabloom)** — Private local-first TTS reader for text, Markdown, and text PDFs with sentence highlighting. `MIT` `Docker` `Nodejs` `Accessibility`

Syllabloom is independent and is not affiliated with Speechify or any voice provider.

## License

[MIT](LICENSE)
