import { select } from 'd3';
import TimeLineChart from './TimeLineChart';
import moment from 'moment';
/**
 * bootstrap the chart with default example data
 */
function BootstrapTimeline(elementSelector) {
    var chart = TimeLineChart().categories(['one', 'two', 'three']);

    var start = moment().hours(8).minutes(0).second(0);
    var chartEl = select(elementSelector)

    chartEl
    .datum([
        [start.toDate(), 'one'],
        [moment(start).add(30, 'minutes').toDate(), 'three'],
        [moment(start).add(60, 'minutes').toDate(), 'two'],
        [moment(start).add(120, 'minutes').toDate(), 'two']
    ])
    .call(chart);
    return chart;
}

export default BootstrapTimeline
