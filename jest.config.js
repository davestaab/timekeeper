module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,ts,vue}',
    '!src/main.ts',
    '!src/registerServiceWorker.js',
    '!src/timeline/TimeLineChart.js'
  ],
  coverageThreshold: {
    global: { lines: 70 }
  }
};
