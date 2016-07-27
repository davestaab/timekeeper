import { cleanData, dataFormat, dataId } from './utils';
import moment from 'moment';

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

        it('should remove dups for same time', () => {
            let time = moment();
            let data = [
                {
                    time: time.toDate(),
                    category: 'first',
                    id: 1
                },{
                    time: time.toDate(),
                    category: 'second',
                    id: 2
                }
            ];
            let clean = cleanData(data);
            expect(clean.length).toBe(1);
            expect(clean[0].category).toBe('second');
        });
    });

    describe('invertX', () => {

    });

    describe('invertY', () => {

    });

    describe('dataId', () => {
        it('should return the id of the object', () => {
            let data = { id: 1 };
            expect(dataId(data)).toEqual(1);
            data = { id: 2 };
            expect(dataId(data)).toEqual(2);
        });
    });

    describe('dataFormat', () => {
        it('should create ', () => {
            let time = moment();
            expect(dataFormat(time, 'one', 1)).toEqual({
                time: time,
                category: 'one',
                id: 1
            });
        });
    });
});
