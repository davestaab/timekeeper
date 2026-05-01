import type { DayData } from './types';

const STORAGE_KEY = 'timeline-data-v2';

const DEMO: DayData[] = [
  { date: '2018-08-04', categories: ['personal', 'scrum', 'dev'], data: [] },
];

export function getData(): DayData[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  const data = raw ? (JSON.parse(raw) as DayData[]) : null;
  return data ?? DEMO;
}

export function saveData(data: DayData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
