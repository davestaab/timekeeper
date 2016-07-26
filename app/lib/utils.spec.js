import { cleanData, dataFormat } from './utils';
import moment from 'moment';

describe('utils', () => {

    describe('cleanData', () => {

        it('should be a function', () => {
            expect(cleanData).toBeDefined();
        });

        it('should sort data by time', () => {
            let start = moment().hours(8).minutes(0).second(0);
            let data = [
                dataFormat(start.toDate(),                      'three'),
                dataFormat(start.add(20, 'minutes').toDate(),   'one'),
                dataFormat(start.add(60, 'minutes').toDate(),   'two')

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
                    createdAt: moment().hours(8)
                },{
                    time: time.toDate(),
                    category: 'second',
                    createdAt: moment().hours(9)
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

});
