import { cleanData, dataFormat, identity, addHourAfter, addHourBefore, removeUnknownCategories, timesByCategory, minutesToDecimalHours, findStartIndex } from './utils';
import moment from 'moment';
import { scaleTime } from 'd3';

describe('utils', () => {

    describe('cleanData', () => {

        it('should be a function', () => {
            expect(cleanData).toBeDefined();
        });

        it('should sort data by time', () => {
            let start = moment().hours(8).minutes(0).second(0);
            let data = [
                dataFormat(start.toDate(),                      'three', 1),
                dataFormat(start.add(20, 'minutes').toDate(),   'one', 2),
                dataFormat(start.add(60, 'minutes').toDate(),   'two', 3)

            ];
            let clean = cleanData(data);
            expect(clean[0].category).toBe('three');
            expect(clean[1].category).toBe('one');
            expect(clean[2].category).toBe('two');
        });

        it('should remove dups for same minute (different seconds)', () => {
            let time = moment().second(0);
            let data = [
                {
                    time: time.toDate(),
                    category: 'first',
                    id: 1
                },{
                    time: time.second(15).toDate(),
                    category: 'second',
                    id: 2
                }
            ];
            let clean = cleanData(data);
            expect(clean.length).toBe(1);
            expect(clean[0].category).toBe('second');
        });

        it('should remove dups categories', function () {
            let id = 0;
            let data = [
                dataFormat(moment().hour(8).toDate(), 'one', id++),
                dataFormat(moment().hour(9).toDate(), 'one', id++),
                dataFormat(moment().hour(10).toDate(), 'two', id++)
            ];
            let clean = cleanData(data);
            expect(clean.length).toBe(2);
            expect(clean[0].category).toBe('one');
            expect(clean[0].id).toBe(1);
            expect(clean[1].category).toBe('two');
            expect(clean[1].id).toBe(2);
        });
    });

    describe('invertX', () => {

    });

    describe('invertY', () => {

    });

    describe('identity', () => {
        it('should return the id of the object', () => {
            let data = { id: 1 };
            expect(identity(data)).toEqual(1);
            data = { id: 2 };
            expect(identity(data)).toEqual(2);
        });
    });

    describe('dataFormat', () => {
        it('should create an object', () => {
            let time = moment();
            expect(dataFormat(time, 'one', 1)).toEqual({
                time: time,
                category: 'one',
                id: 1
            });
        });
    });

    describe('addHourAfter', () => {
        function dateToString (d) {
            return d.toString();
        }
        it('should add an hour if clicked past the right edge', () => {
            let domain =
                [
                    moment().hours(6).minutes(0).second(0).toDate(),
                    moment().hours(17).minutes(0).second(0).toDate()
                ];
            let copy = domain.slice();
            expect(domain).toEqual(copy);
            let update = addHourAfter(500, 60)(domain, [501, 0]);
            expect(update[1].toString()).toEqual(moment().hours(18).minutes(0).second(0).toDate().toString());
            expect(domain.map(dateToString)).toEqual(copy.map(dateToString));
        });

        it('should not add time if days are different', () => {
            let domain = [
                moment().hours(6).minutes(0).second(0).toDate(),
                moment().hours(23).minutes(59).second(0).toDate()
            ];
            let copy = domain.slice();
            let update = addHourAfter(500, 60)(domain, [501, 0]);
            // no update
            expect(update).toBeUndefined();
            expect(domain).toEqual(copy);
        });

        it('should increment by the given value', () => {
            let domain = [
                moment().hours(6).minutes(0).second(0).toDate(),
                moment().hours(23).minutes(0).second(0).toDate()
            ];
            let tester = {
                asymmetricMatch: function(actual) {
                    return actual[0].toString() === domain[0].toString() &&
                        actual[1].toString() === moment().hours(23).minutes(1).second(0).toDate().toString();
                }
            };
            let update = addHourAfter(500, 1)(domain, [501, 0]);
            expect(update).toEqual(tester);
        });
    });

    describe('addHourBefore', () => {
        it('should add an hour if clicked before left edge', () => {
            let domain =
                [
                    moment().hours(6).minutes(0).second(0).toDate(),
                    moment().hours(17).minutes(0).second(0).toDate()
                ];

            let update = addHourBefore(100, 60)(domain, [50, 0]);
            let tester = {
                asymmetricMatch: function(actual) {
                    return actual.toString() === moment().hours(5).minutes(0).second(0).toDate().toString()
                }
            };
            expect(update[0]).toEqual(tester);
        });

        it('should not add time if days are different', () => {
            let domain = [
                moment().hours(0).minutes(0).second(0).toDate(),
                moment().hours(23).minutes(59).second(0).toDate()
            ];
            let copy = domain.slice();
            let update = addHourAfter(100, 1)(domain, [50, 0]);
            // no update
            expect(update).toBeUndefined();
            expect(domain).toEqual(copy);
        });
    });

    describe('removeUnknownCategories', () => {

        it('should return data for all known categories', () => {
            let categories = ['one', 'two', 'three'];
            let data = [
                dataFormat(null, 'one'),
                dataFormat(null, 'two'),
                dataFormat(null, 'three'),
                dataFormat(null, 'two'),
            ];
            let results = removeUnknownCategories(data, categories);
            expect(results.length).toBe(4);
        });

        it('should remove data for unknown categories', () => {
            let categories = ['one'];
            let data = [
                dataFormat(null, 'two')
            ];
            let results = removeUnknownCategories(data, categories);
            expect(results.length).toBe(0);
        });
    });

    describe('timesByCategory', () => {

        it('should total times by category', () => {
            let start = moment().hours(8).minutes(0).seconds(0);
            let input = [
                dataFormat(start.toDate(), 'one'),
                dataFormat(start.add(20, 'minutes').toDate(), 'two'),
                dataFormat(start.add(120, 'minutes').toDate(), 'three'),
                dataFormat(start.add(15, 'minutes').toDate(), 'one'),
            ];
            let output = timesByCategory(input);
            expect(output.one).toEqual(0.33);
            expect(output.two).toEqual(2);
            expect(output.three).toEqual(0.25);
            expect(Object.keys(output).length).toBe(3);
        });
        it('should not fail with empty input', () => {
            let output = timesByCategory([]);
            expect(Object.keys(output)).toEqual([]);
        });
    });

    describe('minutesToDecimalHours', () => {
        it('should round properly', () => {
            expect(minutesToDecimalHours(120)).toBe(2);
            expect(minutesToDecimalHours(121)).toBe(2.02);
            expect(minutesToDecimalHours(140)).toBe(2.33);
            expect(minutesToDecimalHours(130)).toBe(2.17);
            expect(minutesToDecimalHours(15)).toBe(0.25);
            expect(minutesToDecimalHours(30)).toBe(0.5);
            expect(minutesToDecimalHours(0)).toBe(0);
            expect(minutesToDecimalHours(-30)).toBe(-0.5);
        });
    });

    describe('findStartIndex', () => {
        it('should return 1 if no data', () => {
            expect(findStartIndex([])).toBe(1);
        });
        it('should return max id + 1', () => {
            expect(findStartIndex([
                { id: 1},
                { id: 2},
                { id: 500}
            ])).toBe(501);
        });
    });
});
