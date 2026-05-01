/*  consistent-return: 0 */
/*  no-param-reassign: 0 */

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

const CAT_DISPLAY_LENGTH = 10;

function sortByTime(a, b) {
  return isBefore(new Date(a.time), new Date(b.time)) ? -1 : 1;
}

function removeDupTimes(result, d) {
  const foundIndex = result.findIndex((elem) =>
    isEqual(
      startOfMinute(new Date(elem.time)),
      startOfMinute(new Date(d.time)),
    ),
  );
  if (foundIndex === -1) {
    result.push(d);
  } else if (result[foundIndex].id < d.id) {
    result.splice(foundIndex, 1, d);
  }
  return result;
}

function removeDupCategories(results, d) {
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

function removeUnknownCategories(data, categories) {
  return data.reduce((result, d) => {
    if (categories.indexOf(d.category) >= 0) {
      result.push(d);
    }
    return result;
  }, []);
}

function cleanData(data) {
  return data
    .sort(sortByTime)
    .reduce(removeDupTimes, [])
    .reduce(removeDupCategories, []);
}

function invertX(xScale) {
  return (x) => {
    const d = new Date(xScale.invert(x));
    return roundToNearestMinutes(d, { nearestTo: 15 });
  };
}

function invertY(yScale) {
  return (y) => {
    let min = Infinity;
    let minData;
    yScale.domain().forEach((d) => {
      const minDistance = Math.abs(yScale(d) - y);
      if (minDistance < min) {
        min = minDistance;
        minData = d;
      }
    });
    return minData;
  };
}

function dataFormat(time, category, id) {
  return { time, category, id };
}

function noop() {}

function identity(d) {
  return d.id;
}

function addHourAfter(rightEdge, inc) {
  return (domain, clickCoords) => {
    const x = clickCoords[0];
    if (x > rightEdge) {
      const laterTime = addMinutes(new Date(domain[1]), inc);
      if (getDate(new Date(domain[1])) !== getDate(laterTime)) {
        return;
      }
      return [domain[0], laterTime];
    }
  };
}

function addHourBefore(leftEdge, inc) {
  return (domain, clickCoords) => {
    const x = clickCoords[0];
    if (x < leftEdge) {
      const earlierTime = subMinutes(new Date(domain[0]), inc);
      if (getDate(new Date(domain[0])) !== getDate(earlierTime)) {
        return;
      }
      return [earlierTime, domain[1]];
    }
  };
}

function addPoint(margin, chartWidth, invertXScale, invertYScale) {
  return (clickCoords, dataId) => {
    const x = clickCoords[0];
    if (x > margin.left && x < margin.left + chartWidth) {
      return dataFormat(
        invertXScale(clickCoords[0] - margin.left),
        invertYScale(clickCoords[1] - margin.top),
        dataId,
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
      result[lastCategory] += differenceInMinutes(
        new Date(d.time),
        new Date(lastTime),
      );
    }
    lastCategory = d.category;
    lastTime = d.time;
    return result;
  }, {});

  Object.keys(totals).map((key) => {
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
  formatCategory,
};
