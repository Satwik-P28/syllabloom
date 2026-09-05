'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  BookOpenText,
  Download,
  FileText,
  Gauge,
  Github,
  Highlighter,
  Library,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Upload,
  Volume2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  segmentText,
  readingMinutes,
  safeTitle,
  progressPercent,
  type ReadingDocument,
} from '@/lib/reader';

const SAMPLE_TEXT = `Reading should meet you where you are. A good reader does not hurry the page or hide it behind a voice. It lets your eyes and ears travel together, sentence by sentence. When attention drifts, the words remain close enough to find again. When a document matters, it should stay yours: available without an account, readable without a connection, and portable when you leave.`;
const SAMPLE: ReadingDocument = {
  id: 'welcome',
  title: 'A gentler way through long pages',
  text: SAMPLE_TEXT,
  source: 'Built-in sample',
  addedAt: '2026-09-05T00:00:00.000Z',
  position: 0,
};

function loadLibrary() {
  if (typeof window === 'undefined') return [SAMPLE];
  try {
    const saved = JSON.parse(
      localStorage.getItem('syllabloom-library-v1') ?? 'null',
    );
    return Array.isArray(saved) && saved.length
      ? (saved as ReadingDocument[])
      : [SAMPLE];
  } catch {
    return [SAMPLE];
  }
}

function downloadText(title: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [docs, setDocs] = useState<ReadingDocument[]>(loadLibrary);
  const [activeId, setActiveId] = useState(
    () => loadLibrary()[0]?.id ?? 'welcome',
  );
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1.1);
  const [voiceName, setVoiceName] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [fontSize, setFontSize] = useState(20);
  const [focus, setFocus] = useState(true);
  const [notice, setNotice] = useState('Ready to read locally.');
  const fileRef = useRef<HTMLInputElement>(null);
  const active = docs.find((doc) => doc.id === activeId) ?? docs[0];
  const sentences = useMemo(
    () => segmentText(active?.text ?? ''),
    [active?.text],
  );
  const position = Math.min(
    active?.position ?? 0,
    Math.max(0, sentences.length - 1),
  );

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('syllabloom-library-v1', JSON.stringify(docs));
  }, [docs, hydrated]);
  useEffect(() => {
    const refresh = () => setVoices(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.addEventListener('voiceschanged', refresh);
    return () =>
      window.speechSynthesis.removeEventListener('voiceschanged', refresh);
  }, []);
  useEffect(() => () => window.speechSynthesis.cancel(), []);

  function updatePosition(next: number) {
    if (!active) return;
    const bounded = Math.max(0, Math.min(next, sentences.length - 1));
    setDocs((current) =>
      current.map((doc) =>
        doc.id === active.id ? { ...doc, position: bounded } : doc,
      ),
    );
  }
  function speak(index = position) {
    if (!active || !sentences[index]) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentences[index]);
    utterance.rate = rate;
    const voice = voices.find((item) => item.name === voiceName);
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (index < sentences.length - 1) {
        updatePosition(index + 1);
        speak(index + 1);
      } else {
        setPlaying(false);
        setNotice('Reading complete.');
      }
    };
    utterance.onerror = () => {
      setPlaying(false);
      setNotice('The system voice stopped. Try another installed voice.');
    };
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  }
  function pause() {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setNotice('Paused. Your place is saved.');
  }
  async function extractPdf(file: File) {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
    const task = pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
    });
    const pdf = await task.promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(
        content.items.map((item) => ('str' in item ? item.str : '')).join(' '),
      );
    }
    return pages.join('\n\n');
  }
  async function importFile(file?: File) {
    if (!file) return;
    pause();
    setNotice(`Reading ${file.name} locally…`);
    try {
      const isPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');
      const text = isPdf ? await extractPdf(file) : await file.text();
      if (text.trim().length < 20) {
        setNotice(
          isPdf
            ? 'No selectable text was found. Scanned-page OCR is the next milestone.'
            : 'That file does not contain enough readable text.',
        );
        return;
      }
      const doc: ReadingDocument = {
        id: crypto.randomUUID(),
        title: safeTitle(file.name),
        text,
        source: isPdf ? 'Local PDF' : 'Local text file',
        addedAt: new Date().toISOString(),
        position: 0,
      };
      setDocs((current) => [doc, ...current]);
      setActiveId(doc.id);
      setNotice(`${file.name} is ready. Nothing was uploaded.`);
    } catch {
      setNotice(
        'This file could not be read. Try an unencrypted text-based PDF, TXT, or Markdown file.',
      );
    }
  }

  if (!hydrated || !active)
    return (
      <main
        className="min-h-screen bg-background"
        aria-label="Loading Syllabloom"
      />
    );
  const percent = progressPercent(position, sentences.length);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[92rem] items-center gap-3 px-4 sm:px-7">
          <span className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <BookOpenText className="size-4" />
          </span>
          <p className="text-xl font-semibold tracking-[-.045em]">Syllabloom</p>
          <Badge variant="outline" className="ml-auto hidden sm:flex">
            <ShieldCheck data-icon="inline-start" /> Local library
          </Badge>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href="https://github.com/Satwik-P28/syllabloom"
                target="_blank"
                rel="noreferrer"
                aria-label="Star Syllabloom on GitHub"
              />
            }
          >
            <Github data-icon="inline-start" /> Star
          </Button>
          <Input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
            className="hidden"
            onChange={(event) => void importFile(event.target.files?.[0])}
          />
          <Button onClick={() => fileRef.current?.click()}>
            <Upload data-icon="inline-start" /> Add reading
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-[92rem] lg:grid-cols-[17rem_minmax(0,1fr)_19rem]">
        <aside className="border-b bg-sidebar p-4 lg:min-h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r lg:p-5">
          <div className="flex items-center gap-2">
            <Library className="size-4" />
            <h2 className="font-semibold">Your shelf</h2>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto lg:flex-col">
            {docs.map((doc) => (
              <button
                key={doc.id}
                className={`min-w-56 rounded-2xl border p-3 text-left transition lg:min-w-0 ${doc.id === active.id ? 'border-primary bg-card shadow-sm' : 'border-transparent hover:bg-card/60'}`}
                onClick={() => {
                  pause();
                  setActiveId(doc.id);
                }}
              >
                <p className="line-clamp-2 text-sm font-medium">{doc.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {readingMinutes(doc.text)} min ·{' '}
                  {progressPercent(doc.position, segmentText(doc.text).length)}%
                </p>
              </button>
            ))}
          </div>
        </aside>
        <section className="min-w-0 px-4 py-7 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                Now reading
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">
                {active.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {active.source} · {readingMinutes(active.text)} minute read
              </p>
            </div>
            <article
              className="rounded-[2rem] border bg-card px-6 py-9 shadow-sm sm:px-12 sm:py-12"
              style={{ fontSize }}
            >
              <div className="font-[Georgia,serif] leading-[1.9]">
                {sentences.map((sentence, index) => (
                  <button
                    key={`${sentence}-${index}`}
                    onClick={() => {
                      pause();
                      updatePosition(index);
                    }}
                    className={`rounded-md text-left transition ${index === position ? (focus ? 'bg-accent px-1 text-accent-foreground shadow-[0_0_0_4px_var(--accent)]' : 'bg-secondary px-1') : index < position ? 'text-muted-foreground' : ''}`}
                  >
                    {sentence}{' '}
                  </button>
                ))}
              </div>
            </article>
            <div className="sticky bottom-4 mt-5 rounded-[1.5rem] border bg-primary p-4 text-primary-foreground shadow-xl">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-xs">{percent}%</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs">
                  {position + 1}/{sentences.length}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    pause();
                    updatePosition(position - 1);
                  }}
                >
                  <SkipBack />
                </Button>
                <Button
                  size="lg"
                  className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={playing ? pause : () => speak()}
                >
                  {playing ? (
                    <Pause data-icon="inline-start" fill="currentColor" />
                  ) : (
                    <Play data-icon="inline-start" fill="currentColor" />
                  )}
                  {playing ? 'Pause' : 'Listen'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    pause();
                    updatePosition(position + 1);
                  }}
                >
                  <SkipForward />
                </Button>
              </div>
            </div>
          </div>
        </section>
        <aside className="border-t bg-sidebar p-5 lg:border-l lg:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
            Reading comfort
          </p>
          <div className="mt-5 space-y-6">
            <label className="block text-sm font-medium">
              <span className="mb-2 flex items-center gap-2">
                <Gauge className="size-4" /> Voice speed · {rate.toFixed(1)}×
              </span>
              <Slider
                value={[rate]}
                min={0.5}
                max={2.5}
                step={0.1}
                onValueChange={(value) =>
                  setRate(typeof value === 'number' ? value : (value[0] ?? 1))
                }
              />
            </label>
            <label className="block text-sm font-medium">
              <span className="mb-2 flex items-center gap-2">
                <FileText className="size-4" /> Text size · {fontSize}px
              </span>
              <Slider
                value={[fontSize]}
                min={16}
                max={34}
                step={1}
                onValueChange={(value) =>
                  setFontSize(
                    typeof value === 'number' ? value : (value[0] ?? 20),
                  )
                }
              />
            </label>
            <label className="block text-sm font-medium">
              <span className="mb-2 flex items-center gap-2">
                <Volume2 className="size-4" /> System voice
              </span>
              <select
                value={voiceName}
                onChange={(event) => setVoiceName(event.target.value)}
                className="h-10 w-full rounded-xl border bg-card px-3 text-sm"
              >
                <option value="">System default</option>
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant={focus ? 'secondary' : 'outline'}
              className="w-full justify-start"
              onClick={() => setFocus((value) => !value)}
            >
              <Highlighter data-icon="inline-start" /> Focus highlight{' '}
              {focus ? 'on' : 'off'}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => downloadText(active.title, active.text)}
            >
              <Download data-icon="inline-start" /> Export text
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                pause();
                updatePosition(0);
              }}
            >
              <RotateCcw data-icon="inline-start" /> Restart reading
            </Button>
          </div>
          <p
            aria-live="polite"
            className="mt-7 text-xs leading-5 text-muted-foreground"
          >
            {notice}
          </p>
        </aside>
      </div>
    </main>
  );
}
