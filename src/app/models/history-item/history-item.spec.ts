import {HistoryItem} from './history-item';

describe('HistoryItem Interface', () => {
  it('should create a valid HistoryItem object', () => {
    const historyItem: HistoryItem = {
      id: '1',
      term: 'angular',
      searched: new Date('2025-04-27T00:00:00Z')
    };

    expect(historyItem).toBeTruthy();
    expect(historyItem.id).toBe('1');
    expect(historyItem.term).toBe('angular');
    expect(historyItem.searched).toEqual(new Date('2025-04-27T00:00:00Z'));
  });
});
