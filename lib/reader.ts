export type ReadingDocument = {
  id: string;
  title: string;
  text: string;
  source: string;
  addedAt: string;
  position: number;
};

export function segmentText(text: string) {
  return (
    text
      .replace(/\s+/g, ' ')
      .trim()
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map((part) => part.trim())
      .filter(Boolean) ?? []
  );
}

export function readingMinutes(text: string, wordsPerMinute = 180) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function safeTitle(filename: string) {
  return (
    filename
      .replace(/\.[^.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Untitled reading'
  );
}

export function progressPercent(position: number, sentenceCount: number) {
  if (!sentenceCount) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round(((position + 1) / sentenceCount) * 100)),
  );
}
