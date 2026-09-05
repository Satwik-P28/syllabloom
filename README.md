# Syllabloom

Let every page find its voice.

Syllabloom is a private, local-first reading workspace for text, Markdown, and text-based PDFs. It extracts documents in the browser, reads them with installed system voices, highlights the current sentence, remembers progress, and exports clean text.

![Syllabloom preview](public/og.png)

## Working today

- Local TXT, Markdown, and text-PDF import
- System text-to-speech with play, pause, and sentence navigation
- Voice and speed selection
- Current-sentence focus highlighting
- Text-size controls and responsive layout
- Browser-local library and reading position
- Plain-text export
- Clear handling for scanned PDFs that require future OCR support

No account is required and imported content is not uploaded. System speech voices may have operating-system-specific behavior.

## Develop

Requires Node.js 22.13 or later.

```bash
npm install
npm run dev
```

Run `npm run check` and `npm audit` before contributing.

## Architecture

React 19, TypeScript, Vinext/Vite, PDF.js, browser Speech Synthesis, local storage, Tailwind CSS, and shadcn components. Pure reading helpers are tested with Vitest.

Syllabloom is independent and is not affiliated with Speechify or any voice provider.

## License

MIT
