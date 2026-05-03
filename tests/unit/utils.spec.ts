import { set, addMinutes } from 'date-fns';
import * as util from '../../src/timeline/utils';

function makeDate(hours: number, minutes = 0, seconds = 0): Date {
  return set(new Date(), { hours, minutes, seconds, milliseconds: 0 });
}

describe('utils', () => {
  describe('cleanData', () => {
    it('should be a function', () => {
      expect(util.cleanData).toBeDefined();
    });

    it('should sort data by time', () => {
      const start = makeDate(8, 0, 0);
      const three = util.dataFormat(start, 'three', 1);
      const one = util.dataFormat(addMinutes(start, 20), 'one', 2);
      const two = util.dataFormat(addMinutes(start, 80), 'two', 3);
      const clean = util.cleanData([one, two, three]);
      expect(clean[0].category).toBe('three');
      expect(clean[1].category).toBe('one');
      expect(clean[2].category).toBe('two');
    });

    it('should remove duplicate for same minute (different seconds)', () => {
      const base = set(new Date(), { seconds: 0, milliseconds: 0 });
      const data = [
        { time: base, category: 'first', id: 1 },
        { time: set(base, { seconds: 15 }), category: 'second', id: 2 },
      ];
      const clean = util.cleanData(data);
      expect(clean.length).toBe(1);
      expect(clean[0].category).toBe('second');
    });

    it('should remove duplicate categories', () => {
      let id = 0;
      const data = [
        util.dataFormat(makeDate(8), 'one', (id += 1)),
        util.dataFormat(makeDate(9), 'one', (id += 1)),
        util.dataFormat(makeDate(10), 'two', (id += 1)),
      ];
      const clean = util.cleanData(data);
      expect(clean.length).toBe(2);
      expect(clean[0].category).toBe('one');
      expect(clean[0].id).toBe(2);
      expect(clean[1].category).toBe('two');
      expect(clean[1].id).toBe(3);
    });
  });

  describe('invertX', () => {
    it('should invert pixels to a date rounded to nearest 15 minutes', () => {
      const base = makeDate(8, 0, 0);
      const later = makeDate(8, 17, 0);
      const mockScale = {
        invert: (x: number): Date => (x === 0 ? base : later),
      };
      const invert = util.invertX(mockScale);
      const result = invert(0);
      expect(result.getMinutes() % 15).toBe(0);
    });

    it('should return a Date', () => {
      const d = makeDate(9, 7, 0);
      const mockScale = { invert: (): Date => d };
      const invert = util.invertX(mockScale);
      expect(invert(0) instanceof Date).toBe(true);
    });
  });

  describe('invertY', () => {
    it('should return the nearest category to the given y pixel', () => {
      const lookup: Record<string, number> = { one: 10, two: 50, three: 90 };
      const mockScale = Object.assign((d: string): number => lookup[d], {
        domain: (): string[] => ['one', 'two', 'three'],
      });
      const invert = util.invertY(mockScale);
      expect(invert(12)).toBe('one');
      expect(invert(48)).toBe('two');
      expect(invert(88)).toBe('three');
    });
  });

  describe('identity', () => {
    it('should return the id of the object', () => {
      let data = { id: 1, time: new Date(), category: '' };
      expect(util.identity(data)).toBe(1);
      data = { id: 2, time: new Date(), category: '' };
      expect(util.identity(data)).toBe(2);
    });
  });

  describe('dataFormat', () => {
    it('should create an object', () => {
      const time = new Date();
      expect(util.dataFormat(time, 'one', 1)).toEqual({
        time,
        category: 'one',
        id: 1,
      });
    });
  });

  describe('addHourAfter', () => {
    it('should add an hour if clicked past the right edge', () => {
      const domain: [Date, Date] = [makeDate(6, 0, 0), makeDate(17, 0, 0)];
      const copy = domain.slice();
      const update = util.addHourAfter(500, 60)(domain, [501, 0]);
      expect(update![1].toString()).toEqual(makeDate(18, 0, 0).toString());
      expect(domain.map((d) => d.toString())).toEqual(
        copy.map((d) => d.toString()),
      );
    });

    it('should not add time if days are different', () => {
      const domain: [Date, Date] = [makeDate(6, 0, 0), makeDate(23, 59, 0)];
      const copy = domain.slice();
      const update = util.addHourAfter(500, 60)(domain, [501, 0]);
      expect(update).toBeUndefined();
      expect(domain).toEqual(copy);
    });

    it('should return undefined when click is not past the right edge', () => {
      const domain: [Date, Date] = [makeDate(6, 0, 0), makeDate(17, 0, 0)];
      expect(util.addHourAfter(500, 60)(domain, [400, 0])).toBeUndefined();
    });

    it('should increment by the given value', () => {
      const domain: [Date, Date] = [makeDate(6, 0, 0), makeDate(23, 0, 0)];
      const tester = {
        asymmetricMatch(actual: Date[]) {
          return (
            actual[0].toString() === domain[0].toString() &&
            actual[1].toString() === makeDate(23, 1, 0).toString()
          );
        },
      };
      const update = util.addHourAfter(500, 1)(domain, [501, 0]);
      expect(update).toEqual(tester);
    });
  });

  describe('addHourBefore', () => {
    it('should add an hour if clicked before left edge', () => {
      const domain: [Date, Date] = [makeDate(6, 0, 0), makeDate(17, 0, 0)];
      const tester = {
        asymmetricMatch(actual: Date) {
          return actual.toString() === makeDate(5, 0, 0).toString();
        },
      };
      const update = util.addHourBefore(100, 60)(domain, [50, 0]);
      expect(update![0]).toEqual(tester);
    });

    it('should not add time if days are different', () => {
      const domain: [Date, Date] = [makeDate(0, 0, 0), makeDate(23, 59, 0)];
      const copy = domain.slice();
      const update = util.addHourBefore(100, 60)(domain, [50, 0]);
      expect(update).toBeUndefined();
      expect(domain).toEqual(copy);
    });

    it('should return undefined when click is not before the left edge', () => {
      const domain: [Date, Date] = [makeDate(6, 0, 0), makeDate(17, 0, 0)];
      const update = util.addHourBefore(100, 60)(domain, [150, 0]);
      expect(update).toBeUndefined();
    });
  });

  describe('removeUnknownCategories', () => {
    it('should return data for all known categories', () => {
      const categories = ['one', 'two', 'three'];
      const data = [
        util.dataFormat(null, 'one'),
        util.dataFormat(null, 'two'),
        util.dataFormat(null, 'three'),
        util.dataFormat(null, 'two'),
      ];
      const results = util.removeUnknownCategories(data, categories);
      expect(results.length).toBe(4);
    });

    it('should remove data for unknown categories', () => {
      const categories = ['one'];
      const data = [util.dataFormat(null, 'two')];
      const results = util.removeUnknownCategories(data, categories);
      expect(results.length).toBe(0);
    });
  });

  describe('timesByCategory', () => {
    it('should total times by category', () => {
      const base = makeDate(8, 0, 0);
      const input = [
        util.dataFormat(base, 'one'),
        util.dataFormat(addMinutes(base, 20), 'two'),
        util.dataFormat(addMinutes(base, 140), 'three'),
        util.dataFormat(addMinutes(base, 155), 'one'),
      ];
      const output = util.timesByCategory(input);
      expect(output.one).toEqual(0.33);
      expect(output.two).toEqual(2);
      expect(output.three).toEqual(0.25);
      expect(Object.keys(output).length).toBe(3);
    });
    it('should not fail with empty input', () => {
      const output = util.timesByCategory([]);
      expect(Object.keys(output)).toEqual([]);
    });
  });

  describe('minutesToDecimalHours', () => {
    it('should round properly', () => {
      expect(util.minutesToDecimalHours(120)).toBe(2);
      expect(util.minutesToDecimalHours(121)).toBe(2.02);
      expect(util.minutesToDecimalHours(140)).toBe(2.33);
      expect(util.minutesToDecimalHours(130)).toBe(2.17);
      expect(util.minutesToDecimalHours(15)).toBe(0.25);
      expect(util.minutesToDecimalHours(30)).toBe(0.5);
      expect(util.minutesToDecimalHours(0)).toBe(0);
      expect(util.minutesToDecimalHours(-30)).toBe(-0.5);
    });
  });

  describe('findStartIndex', () => {
    it('should return 1 if no data', () => {
      expect(util.findStartIndex([])).toBe(1);
    });
    it('should return max id + 1', () => {
      expect(util.findStartIndex([{ id: 1 }, { id: 2 }, { id: 500 }])).toBe(
        501,
      );
    });
  });

  describe('formatCategory', () => {
    it("should shorten the category if it's more then max characters", () => {
      expect(util.formatCategory('super duper long one')).toBe('super dupe');
      expect(util.formatCategory('short')).toBe('short');
      expect(util.formatCategory('')).toBe('');
    });
  });

  describe('addPoint', () => {
    const margin = { left: 50, top: 20, right: 0, bottom: 0 };
    const chartWidth = 400;
    const mockInvertX = (x: number): Date => new Date(x);
    const mockInvertY = (): string => 'work';

    it('should return a data point when click is inside the chart area', () => {
      const result = util.addPoint(
        margin,
        chartWidth,
        mockInvertX,
        mockInvertY,
      )([100, 50], 1);
      expect(result).toBeDefined();
      expect(result!.category).toBe('work');
      expect(result!.id).toBe(1);
    });

    it('should return undefined when click is left of the chart', () => {
      const result = util.addPoint(
        margin,
        chartWidth,
        mockInvertX,
        mockInvertY,
      )([10, 50], 1);
      expect(result).toBeUndefined();
    });

    it('should return undefined when click is right of the chart', () => {
      const result = util.addPoint(
        margin,
        chartWidth,
        mockInvertX,
        mockInvertY,
      )([500, 50], 1);
      expect(result).toBeUndefined();
    });
  });
});
