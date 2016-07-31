import { cleanData, dataFormat, identity, addHourLater } from './utils';
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

    describe('addHourLater', () => {
        it('should add an hour if clicked past the right edge', () => {
            let domain =
                [
                    moment().hours(6).minutes(0).second(0).toDate(),
                    moment().hours(17).minutes(0).second(0).toDate()
                ];
            let update = addHourLater(500, 60)(domain, [501, 0]);
            expect(update[1]).toEqual(moment().hours(18).minutes(0).second(0).toDate());
        });

        it('should not add time if days are different', () => {
            let domain = [
                moment().hours(6).minutes(0).second(0).toDate(),
                moment().hours(24).minutes(0).second(0).toDate()
            ];
            let update = addHourLater(500, 60)(domain, [501, 0]);
            expect(update).toBeUndefined();
        });
    });
});
