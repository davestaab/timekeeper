import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Timeline from '../../src/components/Timeline.vue';
import * as storage from '../../src/utils';
import { format, subDays, parseISO } from 'date-fns';
import DatePicker from '../../src/components/DatePicker.vue';
import Categories from '../../src/components/Categories.vue';
import TimeLineChart from '../../src/components/TimeLineChart.vue';
import TimeSummary from '../../src/components/summary/TimeSummary.vue';
import type { DayData, TimelineEntry } from '../../src/types';

vi.mock('../../src/utils');

const today = format(new Date(), 'yyyy-MM-dd');
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

const mockData: DayData[] = [
  { date: yesterday, categories: ['work', 'lunch'], data: [] },
  { date: today, categories: ['work', 'lunch'], data: [] }
];

function mountTimeline(data: DayData[] = mockData) {
  vi.mocked(storage.getData).mockReturnValue(JSON.parse(JSON.stringify(data)));
  return shallowMount(Timeline);
}

describe('Timeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findToday', () => {
    it('navigates to existing today entry', async () => {
      const wrapper = mountTimeline();
      wrapper.findComponent(DatePicker).vm.$emit('nextDate', -1);
      await nextTick();
      expect(wrapper.findComponent(DatePicker).props('currentDate')).toEqual(parseISO(yesterday));

      wrapper.findComponent(DatePicker).vm.$emit('findToday');
      await nextTick();
      expect(wrapper.findComponent(DatePicker).props('currentDate')).toEqual(parseISO(today));
    });

    it('creates a new entry when today is not found', async () => {
      vi.mocked(storage.getData).mockReturnValue([{ date: '2020-01-01', categories: ['work'], data: [] }]);
      const wrapper = shallowMount(Timeline);
      wrapper.findComponent(DatePicker).vm.$emit('findToday');
      await nextTick();
      expect(wrapper.findComponent(DatePicker).props('currentDate')).toEqual(parseISO(today));
      expect(wrapper.findComponent(Categories).props('categories')).toEqual(['one', 'two', 'three', 'four']);
    });
  });

  describe('nextDate', () => {
    it('moves forward by 1', async () => {
      const wrapper = mountTimeline();
      wrapper.findComponent(DatePicker).vm.$emit('nextDate', -1);
      await nextTick();
      wrapper.findComponent(DatePicker).vm.$emit('nextDate', 1);
      await nextTick();
      expect(wrapper.findComponent(DatePicker).props('currentDate')).toEqual(parseISO(today));
    });

    it('moves backward by 1', async () => {
      const wrapper = mountTimeline();
      wrapper.findComponent(DatePicker).vm.$emit('nextDate', -1);
      await nextTick();
      expect(wrapper.findComponent(DatePicker).props('currentDate')).toEqual(parseISO(yesterday));
    });

    it('wraps to last when going below 0', async () => {
      const wrapper = mountTimeline();
      wrapper.findComponent(DatePicker).vm.$emit('nextDate', -1);
      await nextTick();
      wrapper.findComponent(DatePicker).vm.$emit('nextDate', -1);
      await nextTick();
      expect(wrapper.findComponent(DatePicker).props('currentDate')).toEqual(parseISO(today));
    });

    it('wraps to first when going past end', async () => {
      const wrapper = mountTimeline();
      wrapper.findComponent(DatePicker).vm.$emit('nextDate', 1);
      await nextTick();
      expect(wrapper.findComponent(DatePicker).props('currentDate')).toEqual(parseISO(yesterday));
    });
  });

  describe('deleteCategory', () => {
    it('removes the category from current data', async () => {
      const wrapper = mountTimeline();
      wrapper.findComponent(Categories).vm.$emit('deleteCategory', 'work');
      await nextTick();
      expect(wrapper.findComponent(Categories).props('categories')).not.toContain('work');
      expect(wrapper.findComponent(Categories).props('categories')).toContain('lunch');
    });
  });

  describe('createCategory', () => {
    it('adds the category to current data', async () => {
      const wrapper = mountTimeline();
      wrapper.findComponent(Categories).vm.$emit('createCategory', 'deep work');
      await nextTick();
      expect(wrapper.findComponent(Categories).props('categories')).toContain('deep work');
    });

    it('replaces the array so watchers fire', async () => {
      const wrapper = mountTimeline();
      const before = wrapper.findComponent(Categories).props('categories');
      wrapper.findComponent(Categories).vm.$emit('createCategory', 'deep work');
      await nextTick();
      expect(wrapper.findComponent(Categories).props('categories')).not.toBe(before);
    });
  });

  describe('chartUpdated', () => {
    it('updates times and saves data', async () => {
      const wrapper = mountTimeline();
      const times: Record<string, number> = { work: 2.5 };
      const chartData: TimelineEntry[] = [{ time: new Date(), category: 'work', id: 1 }];
      wrapper.findComponent(TimeLineChart).vm.$emit('onUpdate', times, chartData);
      await nextTick();
      expect(wrapper.findComponent(TimeSummary).props('times')).toEqual(times);
      expect(vi.mocked(storage.saveData)).toHaveBeenCalled();
    });
  });
});
