import { describe, expect, it } from 'vitest';
import {
  progressPercent,
  readingMinutes,
  safeTitle,
  segmentText,
} from './reader';

describe('reader helpers', () => {
  it('segments readable sentences', () =>
    expect(segmentText('First thought. Second one!')).toEqual([
      'First thought.',
      'Second one!',
    ]));
  it('estimates duration', () =>
    expect(readingMinutes(Array(360).fill('word').join(' '))).toBe(2));
  it('cleans filenames', () =>
    expect(safeTitle('chapter_one-draft.pdf')).toBe('chapter one draft'));
  it('bounds progress', () => expect(progressPercent(1, 4)).toBe(50));
});
