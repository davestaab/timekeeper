import { select } from 'd3';
import TimeLineChart from './TimeLineChart';
import moment from 'moment';
import { dataFormat } from './utils';
/**
 * bootstrap the chart with default example data
 */
function BootstrapTimeline(elementSelector) {
    let index = 1;
    var start = moment().hours(8).minutes(0).second(0);
    var chart = TimeLineChart()
        .categories(['one', 'two', 'three'])
        .data([
            dataFormat(start.toDate(), 'one', index++),
            dataFormat(moment(start).add(30, 'minutes').toDate(), 'three', index++),
            dataFormat(moment(start).add(60, 'minutes').toDate(), 'two', index++),
            dataFormat(moment(start).add(120, 'minutes').toDate(), 'one', index++)
        ]);

    select(elementSelector)
        .call(chart);
    return chart;
}

export default BootstrapTimeline
