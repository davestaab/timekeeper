import {
  isBefore,
  isEqual,
  startOfMinute,
  addMinutes,
  subMinutes,
  getDate,
  differenceInMinutes,
  roundToNearestMinutes,
} from 'date-fns';
import type { TimelineEntry, Margin } from '../types';

const CAT_DISPLAY_LENGTH = 10;

interface XScale {
  invert(x: number): Date;
}

interface YScale {
  (d: string): number;
  domain(): string[];
}

type Domain = [Date, Date];
type Coords = [number, number];

export function sortByTime(a: TimelineEntry, b: TimelineEntry): number {
  return isBefore(new Date(a.time), new Date(b.time)) ? -1 : 1;
}

export function removeDupTimes(result: TimelineEntry[], d: TimelineEntry): TimelineEntry[] {
  const foundIndex = result.findIndex((elem) =>
    isEqual(startOfMinute(new Date(elem.time)), startOfMinute(new Date(d.time)))
  );
  if (foundIndex === -1) {
    result.push(d);
  } else if (result[foundIndex].id < d.id) {
    result.splice(foundIndex, 1, d);
  }
  return result;
}

export function removeDupCategories(results: TimelineEntry[], d: TimelineEntry): TimelineEntry[] {
  if (results.length === 0) {
    results.push(d);
    return results;
  }
  const lastData = results[results.length - 1];
  if (d.category === lastData.category) {
    if (d.id > lastData.id) {
      results.splice(results.length - 1, 1, d);
    }
  } else {
    results.push(d);
  }
  return results;
}

export function removeUnknownCategories(data: TimelineEntry[], categories: string[]): TimelineEntry[] {
  return data.reduce<TimelineEntry[]>((result, d) => {
    if (categories.indexOf(d.category) >= 0) result.push(d);
    return result;
  }, []);
}

export function cleanData(data: TimelineEntry[]): TimelineEntry[] {
  return data.sort(sortByTime).reduce(removeDupTimes, []).reduce(removeDupCategories, []);
}

export function invertX(xScale: XScale): (x: number) => Date {
  return (x) => roundToNearestMinutes(new Date(xScale.invert(x)), { nearestTo: 15 });
}

export function invertY(yScale: YScale): (y: number) => string {
  return (y) =>
    yScale.domain().reduce<{ min: number; data: string }>(
      (acc, d) => {
        const dist = Math.abs(yScale(d) - y);
        return dist < acc.min ? { min: dist, data: d } : acc;
      },
      { min: Infinity, data: '' }
    ).data;
}

export function dataFormat(time: Date | null, category: string, id?: number): TimelineEntry {
  return { time: time as Date, category, id: id ?? 0 };
}

export function noop(): void {}

export function identity(d: TimelineEntry): number {
  return d.id;
}

export function addHourAfter(
  rightEdge: number,
  inc: number
): (domain: Domain, clickCoords: Coords) => Domain | undefined {
  return (domain, clickCoords) => {
    if (clickCoords[0] > rightEdge) {
      const laterTime = addMinutes(new Date(domain[1]), inc);
      if (getDate(new Date(domain[1])) !== getDate(laterTime)) return undefined;
      return [domain[0], laterTime];
    }
    return undefined;
  };
}

export function addHourBefore(
  leftEdge: number,
  inc: number
): (domain: Domain, clickCoords: Coords) => Domain | undefined {
  return (domain, clickCoords) => {
    if (clickCoords[0] < leftEdge) {
      const earlierTime = subMinutes(new Date(domain[0]), inc);
      if (getDate(new Date(domain[0])) !== getDate(earlierTime)) return undefined;
      return [earlierTime, domain[1]];
    }
    return undefined;
  };
}

export function addPoint(
  margin: Margin,
  chartWidth: number,
  invertXScale: (x: number) => Date,
  invertYScale: (y: number) => string
): (clickCoords: Coords, dataId: number) => TimelineEntry | undefined {
  return (clickCoords, dataId) => {
    const x = clickCoords[0];
    if (x > margin.left && x < margin.left + chartWidth) {
      return dataFormat(
        invertXScale(clickCoords[0] - margin.left),
        invertYScale(clickCoords[1] - margin.top),
        dataId
      );
    }
    return undefined;
  };
}

export function minutesToDecimalHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

export function timesByCategory(data: TimelineEntry[]): Record<string, number> {
  let lastCategory: string | undefined;
  let lastTime: Date | string | undefined;

  const totals = data.reduce<Record<string, number>>((result, d) => {
    if (lastCategory !== undefined && lastTime !== undefined) {
      result[lastCategory] = (result[lastCategory] ?? 0) + differenceInMinutes(new Date(d.time), new Date(lastTime));
    }
    lastCategory = d.category;
    lastTime = d.time;
    return result;
  }, {});

  for (const key of Object.keys(totals)) {
    totals[key] = minutesToDecimalHours(totals[key]);
  }
  return totals;
}

export function findStartIndex(data: Array<{ id: number }>): number {
  return data.reduce((result, d) => (d.id > result ? d.id : result), 0) + 1;
}

export function formatCategory(d: string): string {
  return d.length > CAT_DISPLAY_LENGTH ? d.substring(0, CAT_DISPLAY_LENGTH) : d;
}
