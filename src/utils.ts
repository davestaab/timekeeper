const STORAGE_KEY = 'timeline-data-v2';
export const STORAGE_KEY_CATEGORIES = 'timeline-data-v2-categories';

const DEMO: Entry[] = [
  {
    date: '2025-01-01',
    categories: ['personal', 'scrum', 'dev'],
    data: []
  }
];
const STARTS_CATEGORIES = ['personal', 'scrum', 'dev'];

export function getData() {
  const data: Entry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? DEMO;
  return data
}
export function getCategories() {
  const data: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES) ?? JSON.stringify(STARTS_CATEGORIES));
  return data;
}

export function saveData(data: Entry[], key = STORAGE_KEY) {
  localStorage.setItem(key, JSON.stringify(data));
}

export interface Entry {
  date: string;
  categories: string[];
  data: Point[];
};

interface Point {
  category: string;
  id: number;
  time: string;
}
