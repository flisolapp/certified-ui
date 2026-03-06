import { describe, expect, it } from 'vitest';
import { HistoryItem } from './history-item';

describe('HistoryItem', () => {
  it('should conform to the HistoryItem interface', () => {
    const searched = new Date('2025-04-27T00:00:00Z');
    const item: HistoryItem = {
      id: '1',
      term: 'angular',
      searched
    } satisfies HistoryItem;

    expect(item.id).toBe('1');
    expect(item.term).toBe('angular');
    expect(item.searched).toBe(searched);
    expect(item.searched.toISOString()).toBe('2025-04-27T00:00:00.000Z');
  });
});
