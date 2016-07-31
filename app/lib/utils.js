import moment from 'moment';


/**
 * Cleans the chart data after new entries are inserted.
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function cleanData(data) {
    // debugger;
    return data
        .sort(sortByTime)
        .reduce(removeDupTimes, [])
        .reduce(removeDupCategories, [])
    ;
}

function sortByTime(a,b) {
    let am = moment(a.time), bm = moment(b.time);
    return am.isSameOrBefore(bm) ? -1 : 1;
}

function removeDupTimes(result, d) {
    // find any duplicate times for d
    let foundIndex = result.findIndex(function (elem) {
        return moment(elem.time).isSame(moment(d.time), 'minute');
    });
    // if none found, keep d
    if(foundIndex === -1) {
        result.push(d);
    } else // if d is a newer createdAt time, replace found with d
        if(result[foundIndex].id < d.id) {
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
    if(results.length === 0) {
        results.push(d);
        return results;
    }
    // if d category is the same category as the last
    let lastData = results[results.length-1];
    if(d.category === lastData.category) {
        if(d.id > lastData.id){
            results.splice(results.length-1, 1, d);
        }
    } else {
        results.push(d);
    }
    return results;
}

/**
 * given pixels inverts it to the nearest 15 minutes as a Date
 * @param  {ind}  x pixels on the chart to convert
 * @return {Date}   Date representing the nearest date to clicked on the x axis.
 */
function invertX(xScale) {
    return function (x) {
        let m = moment(xScale.invert(x));
        m.minutes(Math.round(m.minutes() / 15) * 15).second(0);
        return m.toDate();
    };
}
/**
 * given pixels inverts it to the nearest category
 * @param  {int}    y pixels on the chart to convert
 * @return {string}   the nearest category
 */
function invertY(yScale) {
    return function (y) {
        let min = Infinity, minData;
        yScale.domain().forEach(function (d) {
            let minDistance = Math.abs(yScale(d) - y);
            if( minDistance < min) {
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
        time: time,
        category: category,
        id: id
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
 * @param {[type]} rightEdge [description]
 * @param {[type]} inc       [description]
 */
function addHourLater(rightEdge, inc) {
    return (domain, clickCoords) => {
        let x = clickCoords[0];
        if(x > rightEdge) {
            let laterTime = moment(domain[1]);
            if(laterTime.hours() !== 0 ){
                laterTime.add(inc, 'minutes');
                domain[1] = laterTime.toDate();
                return domain;
            }
        }
        return;
    }
}

export { cleanData, invertX, invertY, dataFormat, noop, identity, addHourLater };
