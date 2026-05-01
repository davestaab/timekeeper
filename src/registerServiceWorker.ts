import { register } from 'register-service-worker';

if (import.meta.env.MODE === 'production') {
  register(`${import.meta.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log('App is being served from cache by a service worker.');
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updated() {
      console.log('New content is available; please refresh.');
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.');
    },
    error(error: Error) {
      console.error('Error during service worker registration:', error);
    },
  });
}
