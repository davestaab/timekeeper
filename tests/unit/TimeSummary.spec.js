import { shallowMount } from '@vue/test-utils';
import TimeSummary from '../../src/components/summary/TimeSummary.vue';

describe('TimeSummary', () => {
  function mountSummary(times = {}, data = []) {
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
    const data = [{ id: 1, time: new Date(), category: 'work' }];
    const wrapper = mountSummary({}, data);
    expect(wrapper.findComponent({ name: 'Entries' }).props('entries')).toEqual(data);
  });
});
