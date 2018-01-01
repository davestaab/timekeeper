const STORAGE_KEY = 'ngStorage-SAVEDDATA'

const localStorage = window.localStorage

let DEMO
export function getData () {
  const data = localStorage.getItem(STORAGE_KEY)

  return data || DEMO
}

export function savData () {

}

DEMO = [
  { date: '2017-10-02',
    categories: ['personal', 'scrum', 'dev', 'planning', 'testing'],
    data: [
      { time: '2017-10-02T12:00:00.000Z', category: 'dev', id: 1 }, { time: '2017-10-02T17:30:00.000Z', category: 'scrum', id: 3 }, { time: '2017-10-02T18:00:00.000Z', category: 'dev', id: 4 }, { time: '2017-10-02T21:00:00.000Z', category: 'personal', id: 6 }, { time: '2017-10-03T02:00:00.000Z', category: 'dev', id: 12 }, { time: '2017-10-03T02:30:00.000Z', category: 'personal', id: 13 }] },
  { date: '2017-10-03',
    categories: ['personal', 'scrum', 'dev', 'support'],
    data: [
      { time: '2017-10-03T12:00:00.000Z', category: 'dev', id: 1 }, { time: '2017-10-03T17:30:00.000Z', category: 'scrum', id: 3 }, { time: '2017-10-03T21:00:00.000Z', category: 'personal', id: 4 }, { time: '2017-10-04T01:45:00.000Z', category: 'dev', id: 10 }, { time: '2017-10-04T02:15:00.000Z', category: 'personal', id: 12 }] },
  { date: '2017-10-04',
    categories: ['personal', 'scrum', 'dev'],
    data: [
      { time: '2017-10-04T13:30:00.000Z', category: 'dev', id: 1 }, { time: '2017-10-04T19:00:00.000Z', category: 'personal', id: 4 }, { time: '2017-10-04T19:30:00.000Z', category: 'dev', id: 5 }, { time: '2017-10-04T21:00:00.000Z', category: 'personal', id: 6 }] },
  { date: '2017-10-05',
    categories: ['Lunch', 'Overhead', 'Work'],
    data: [

    ] },
  { date: '2017-10-06',
    categories: ['personal', 'dev', 'sprint rev', 'overhead'],
    data: [
      { time: '2017-10-06T11:30:00.000Z', category: 'sprint rev', id: 3 }, { time: '2017-10-06T15:00:00.000Z', category: 'personal', id: 4 }, { time: '2017-10-06T15:30:00.000Z', category: 'dev', id: 7 }, { time: '2017-10-06T16:00:00.000Z', category: 'overhead', id: 8 }, { time: '2017-10-06T17:30:00.000Z', category: 'personal', id: 9 }] },
  { date: '2017-10-07',
    categories: ['personal', 'scrum', 'dev', 'meeting'],
    data: [
      { time: '2017-10-07T12:00:00.000Z', category: 'dev', id: 1 }, { time: '2017-10-07T15:45:00.000Z', category: 'personal', id: 2 }, { time: '2017-10-07T16:45:00.000Z', category: 'dev', id: 3 }, { time: '2017-10-07T17:30:00.000Z', category: 'scrum', id: 4 }, { time: '2017-10-07T18:00:00.000Z', category: 'meeting', id: 5 }, { time: '2017-10-07T21:00:00.000Z', category: 'personal', id: 8 }] },
  { date: '2017-10-10',
    categories: ['Lunch', 'Overhead', 'Work'],
    data: [
    ] },
  { date: '2017-10-11',
    categories: ['personal', 'dev', 'planning', 'scrum'],
    data: [
      { time: '2017-10-11T13:00:00.000Z', category: 'planning', id: 2 }, { time: '2017-10-11T17:00:00.000Z', category: 'scrum', id: 5 }, { time: '2017-10-11T17:30:00.000Z', category: 'planning', id: 6 }, { time: '2017-10-11T19:30:00.000Z', category: 'personal', id: 3 }] },
  { date: '2017-10-13',
    categories: ['personal', 'scrum', 'dev'],
    data: [
      { time: '2017-10-13T11:45:00.000Z', category: 'dev', id: 1 }, { time: '2017-10-13T20:30:00.000Z', category: 'personal', id: 4 }] },
  { date: '2017-10-16',
    categories: ['personal', 'scrum', 'dev', 'planning'],
    data: [
      { time: '2017-10-16T11:45:00.000Z', category: 'planning', id: 2 }, { time: '2017-10-16T12:00:00.000Z', category: 'dev', id: 3 }, { time: '2017-10-16T21:00:00.000Z', category: 'personal', id: 5 }] },
  { date: '2017-10-17',
    categories: ['personal', 'dev'],
    data: [
      { time: '2017-10-17T12:00:00.000Z', category: 'dev', id: 1 }, { time: '2017-10-17T16:15:00.000Z', category: 'personal', id: 2 }, { time: '2017-10-17T17:15:00.000Z', category: 'dev', id: 3 }, { time: '2017-10-17T21:15:00.000Z', category: 'personal', id: 5 }] },
  { date: '2017-10-18',
    categories: ['Lunch', 'Overhead', 'Work'],
    data: [
    ] },
  { date: '2017-10-19',
    categories: ['personal', 'dev', 'scrum'],
    data: [
      { time: '2017-10-19T13:30:00.000Z', category: 'dev', id: 1 }, { time: '2017-10-19T17:30:00.000Z', category: 'scrum', id: 2 }, { time: '2017-10-19T18:00:00.000Z', category: 'dev', id: 3 }, { time: '2017-10-19T20:45:00.000Z', category: 'personal', id: 6 }] },
  { date: '2017-10-20',
    categories: ['personal', 'dev', 'meeting'],
    data: [
      { time: '2017-10-20T10:15:00.000Z', category: 'dev', id: 2 }, { time: '2017-10-20T12:30:00.000Z', category: 'meeting', id: 3 }, { time: '2017-10-20T14:30:00.000Z', category: 'dev', id: 6 }, { time: '2017-10-20T15:45:00.000Z', category: 'personal', id: 8 }] },
  { date: '2017-10-23',
    categories: ['Lunch', 'Overhead', 'Work'],
    data: [
    ]
  }
]
