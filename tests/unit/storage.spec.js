import { getData, saveData } from '../../src/utils';

const STORAGE_KEY = 'timeline-data-v2';

const DEMO = [
  {
    date: '2018-08-04',
    categories: ['personal', 'scrum', 'dev'],
    data: []
  }
];

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getData', () => {
    it('should return DEMO data when storage is empty', () => {
      expect(getData()).toEqual(DEMO);
    });

    it('should parse and return stored data', () => {
      const stored = [{ date: '2024-01-01', categories: ['work'], data: [] }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      expect(getData()).toEqual(stored);
    });
  });

  describe('saveData', () => {
    it('should serialize and store data', () => {
      const data = [{ date: '2024-01-01', categories: ['work'], data: [] }];
      saveData(data);
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(data));
    });
  });
});
