import { shallowMount } from '@vue/test-utils';
import TimeSummary from '../../src/components/summary/TimeSummary.vue';
import type { TimelineEntry } from '../../src/types';

describe('TimeSummary', () => {
  function mountSummary(times: Record<string, number> = {}, data: TimelineEntry[] = []) {
    return shallowMount(TimeSummary, { props: { times, data } });
  }

  it('renders the section heading', () => {
    const wrapper = mountSummary();
    expect(wrapper.text()).toContain('Time Summary');
  });

  it('passes times to by-category', () => {
    const times = { work: 2 };
    const wrapper = mountSummary(times);
    expect(wrapper.findComponent({ name: 'ByCategory' }).props('times')).toEqual(times);
  });

  it('passes data to entries', () => {
    const data: TimelineEntry[] = [{ id: 1, time: new Date(), category: 'work' }];
    const wrapper = mountSummary({}, data);
    expect(wrapper.findComponent({ name: 'Entries' }).props('entries')).toEqual(data);
  });
});
