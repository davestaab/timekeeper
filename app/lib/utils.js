import moment from 'moment';


/**
 * Cleans the chart data after new entries are inserted.
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function cleanData(data) {
    // debugger;
    return data;
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

export { cleanData, invertX, invertY};
