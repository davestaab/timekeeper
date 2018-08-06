const STORAGE_KEY = 'timeline-data-v2';

let DEMO;
export function getData() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  return data || DEMO;
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

DEMO = [
  {
    date: '2018-08-04',
    categories: ['personal', 'scrum', 'dev'],
    data: []
  }
];
