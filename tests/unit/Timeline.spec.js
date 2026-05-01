import { shallowMount } from '@vue/test-utils';
import Timeline from '../../src/components/Timeline.vue';
import * as storage from '../../src/utils';
import moment from 'moment';

jest.mock('../../src/utils');

const today = moment().format('YYYY-MM-DD');
const yesterday = moment()
  .subtract(1, 'day')
  .format('YYYY-MM-DD');

const mockData = [
  { date: yesterday, categories: ['work', 'lunch'], data: [] },
  { date: today, categories: ['work', 'lunch'], data: [] }
];

function mountTimeline() {
  storage.getData.mockReturnValue(JSON.parse(JSON.stringify(mockData)));
  return shallowMount(Timeline, {
    stubs: ['time-line-chart', 'date-picker', 'categories', 'time-summary']
  });
}

describe('Timeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findToday', () => {
    it('navigates to existing today entry', () => {
      const wrapper = mountTimeline();
      wrapper.vm.current = 0;
      wrapper.vm.findToday();
      expect(wrapper.vm.current).toBe(1);
    });

    it('creates a new entry when today is not found', () => {
      storage.getData.mockReturnValue([
        { date: '2020-01-01', categories: ['work'], data: [] }
      ]);
      const wrapper = shallowMount(Timeline, {
        stubs: ['time-line-chart', 'date-picker', 'categories', 'time-summary']
      });
      const sizeBefore = wrapper.vm.data.length;
      wrapper.vm.findToday();
      expect(wrapper.vm.data.length).toBe(sizeBefore + 1);
      expect(wrapper.vm.data[wrapper.vm.current].date).toBe(today);
    });
  });

  describe('nextDate', () => {
    it('moves forward by 1', () => {
      const wrapper = mountTimeline();
      wrapper.vm.current = 0;
      wrapper.vm.nextDate(1);
      expect(wrapper.vm.current).toBe(1);
    });

    it('moves backward by 1', () => {
      const wrapper = mountTimeline();
      wrapper.vm.current = 1;
      wrapper.vm.nextDate(-1);
      expect(wrapper.vm.current).toBe(0);
    });

    it('wraps to last when going below 0', () => {
      const wrapper = mountTimeline();
      wrapper.vm.current = 0;
      wrapper.vm.nextDate(-1);
      expect(wrapper.vm.current).toBe(mockData.length - 1);
    });

    it('wraps to first when going past end', () => {
      const wrapper = mountTimeline();
      wrapper.vm.current = mockData.length - 1;
      wrapper.vm.nextDate(1);
      expect(wrapper.vm.current).toBe(0);
    });
  });

  describe('deleteCategory', () => {
    it('removes the category from current data', () => {
      const wrapper = mountTimeline();
      wrapper.vm.current = 0;
      wrapper.vm.deleteCategory('work');
      expect(wrapper.vm.currentData.categories).not.toContain('work');
      expect(wrapper.vm.currentData.categories).toContain('lunch');
    });
  });

  describe('createCategory', () => {
    it('adds the category to current data', () => {
      const wrapper = mountTimeline();
      wrapper.vm.current = 0;
      wrapper.vm.createCategory('deep work');
      expect(wrapper.vm.currentData.categories).toContain('deep work');
    });
  });

  describe('chartUpdated', () => {
    it('updates times and saves data', () => {
      const wrapper = mountTimeline();
      const times = { work: 2.5 };
      const chartData = [{ time: new Date(), category: 'work', id: 1 }];
      wrapper.vm.chartUpdated(times, chartData);
      expect(wrapper.vm.times).toEqual(times);
      expect(wrapper.vm.currentData.data).toEqual(chartData);
      expect(storage.saveData).toHaveBeenCalled();
    });
  });
});
