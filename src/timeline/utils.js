/*  consistent-return: 0 */
/*  no-param-reassign: 0 */

import moment from "moment";

const CAT_DISPLAY_LENGTH = 10;

function sortByTime(a, b) {
  const am = moment(a.time);
  const bm = moment(b.time);
  return am.isSameOrBefore(bm) ? -1 : 1;
}

function removeDupTimes(result, d) {
  // find any duplicate times for d
  const foundIndex = result.findIndex(elem =>
    moment(elem.time).isSame(moment(d.time), "minute")
  );
  // if none found, keep d
  if (foundIndex === -1) {
    result.push(d);
    // if d is a newer createdAt time, replace found with d
  } else if (result[foundIndex].id < d.id) {
    result.splice(foundIndex, 1, d);
  }
  return result;
}

/**
 * Remove any duplicate categories that are next to each other sequentially.
 * The higher key replaces the lower key.
 * @param  {[type]} results [description]
 * @param  {[type]} d       [description]
 * @return {[type]}         [description]
 */
function removeDupCategories(results, d) {
  if (results.length === 0) {
    results.push(d);
    return results;
  }
  // if d category is the same category as the last
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

function removeUnknownCategories(data, categories) {
  return data.reduce((result, d) => {
    if (categories.indexOf(d.category) >= 0) {
      result.push(d);
    }
    return result;
  }, []);
}

/**
 * Cleans the chart data after new entries are inserted.
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function cleanData(data) {
  return data
    .sort(sortByTime)
    .reduce(removeDupTimes, [])
    .reduce(removeDupCategories, []);
}

/**
 * given pixels inverts it to the nearest 15 minutes as a Date
 * @param  {ind}  x pixels on the chart to convert
 * @return {Date}   Date representing the nearest date to clicked on the x axis.
 */
function invertX(xScale) {
  return x => {
    const m = moment(xScale.invert(x));
    m.minutes(Math.round(m.minutes() / 15) * 15)
      .second(0)
      .millisecond(0);
    return m.toDate();
  };
}
/**
 * given pixels inverts it to the nearest category
 * @param  {int}    y pixels on the chart to convert
 * @return {string}   the nearest category
 */
function invertY(yScale) {
  return y => {
    let min = Infinity;
    let minData;
    yScale.domain().forEach(d => {
      const minDistance = Math.abs(yScale(d) - y);
      if (minDistance < min) {
        min = minDistance;
        minData = d;
      }
    });
    return minData;
  };
}

/**
 * Creates a data structure for our internal data
 * @param  {[type]} time [description]
 * @param  {[type]} category [description]
 * @param  {[type]} i [description]
 * @return {[type]}   [description]
 */
function dataFormat(time, category, id) {
  return {
    time,
    category,
    id
  };
}

function noop() {}

/**
 * Identity accessor for the chart data format.
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
function identity(d) {
  return d.id;
}

/**
 * Closure to check if a click event should update the given domain.
 * @param {int} rightEdge rightEdge to test the x click coords against
 * @param {int} inc       amount to increment by (in minutes)
 * @return function       returns a function that take a domain and click clickCoords
 *                        and will return updated domain or undefined
 */

function addHourAfter(rightEdge, inc) {
  return (domain, clickCoords) => {
    const x = clickCoords[0];
    if (x > rightEdge) {
      const laterTime = moment(domain[1]);
      laterTime.add(inc, "minutes");
      if (moment(domain[1]).date() !== laterTime.date()) {
        // don't allow the incremented date to go to the next day
        return;
      }
      return [domain[0], laterTime.toDate()];
    }
  };
}

function addHourBefore(leftEdge, inc) {
  return (domain, clickCoords) => {
    const x = clickCoords[0];
    if (x < leftEdge) {
      const earlierTime = moment(domain[0]);
      earlierTime.subtract(inc, "minutes");
      if (moment(domain[0]).date() !== earlierTime.date()) {
        // don't allow the incremented date to go to the next day
        return;
      }
      return [earlierTime.toDate(), domain[1]];
    }
  };
}

/**
 * Checks the click coords and returns a data point if one is within
 * the target area to be added.
 *
 * @param {[type]} margin     margin of the chart. used to translate
 *                            the click coords to the correct locations
 * @param {[type]} chartWidth width of the chart. Use with the margin
 *                            to determine the right edge of the click area
 */
function addPoint(margin, chartWidth, invertXScale, invertYScale) {
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

function minutesToDecimalHours(minutes) {
  return Math.round((minutes / 60) * 100) / 100;
}

function timesByCategory(data) {
  let lastCategory;
  let lastTime;

  const totals = data.reduce((result, d) => {
    if (lastCategory) {
      if (!result[lastCategory]) {
        result[lastCategory] = 0;
      }
      result[lastCategory] += moment(d.time).diff(lastTime, "minutes");
    }
    lastCategory = d.category;
    lastTime = d.time;
    return result;
  }, {});

  Object.keys(totals).map(key => {
    totals[key] = minutesToDecimalHours(totals[key]);
    return key;
  });
  return totals;
}

function findStartIndex(data) {
  return (
    data.reduce((result, d) => {
      if (d.id > result) {
        return d.id;
      }
      return result;
    }, 0) + 1
  );
}

function formatCategory(d) {
  return d.length > CAT_DISPLAY_LENGTH ? d.substring(0, CAT_DISPLAY_LENGTH) : d;
}

export {
  cleanData,
  invertX,
  invertY,
  dataFormat,
  noop,
  identity,
  addHourAfter,
  addHourBefore,
  addPoint,
  removeUnknownCategories,
  timesByCategory,
  minutesToDecimalHours,
  findStartIndex,
  formatCategory
};
