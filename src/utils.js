const STORAGE_KEY = 'timeline-data-v2';
export const STORAGE_KEY_CATEGORIES = 'timeline-data-v2-categories';

let DEMO;
export function getData(key = STORAGE_KEY) {
  const data = JSON.parse(localStorage.getItem(key));
  return data || (key === STORAGE_KEY ? DEMO : {});
}

export function saveData(data, key = STORAGE_KEY) {
  localStorage.setItem(key, JSON.stringify(data));
}

DEMO = [
  {
    date: '2018-08-04',
    categories: ['personal', 'scrum', 'dev'],
    data: []
  }
];
