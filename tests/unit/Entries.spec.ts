import { shallowMount } from '@vue/test-utils';
import Entries from '../../src/components/summary/Entries.vue';
import type { TimelineEntry } from '../../src/types';

describe('Entries', () => {
  it('renders a row for each entry', () => {
    const entries: TimelineEntry[] = [
      { id: 1, time: new Date('2024-01-01T09:00:00'), category: 'work' },
      { id: 2, time: new Date('2024-01-01T11:30:00'), category: 'lunch' }
    ];
    const wrapper = shallowMount(Entries, { props: { entries } });
    const items = wrapper.findAll('li');
    expect(items.length).toBe(2);
    expect(wrapper.text()).toContain('work');
    expect(wrapper.text()).toContain('lunch');
  });

  it('formats entry times as hh:mm am/pm', () => {
    const entries: TimelineEntry[] = [{ id: 1, time: new Date('2024-01-01T09:00:00'), category: 'work' }];
    const wrapper = shallowMount(Entries, { props: { entries } });
    expect(wrapper.text()).toContain('09:00 am');
  });

  it('renders nothing for the time when time is falsy', () => {
    const entries = [{ id: 1, time: null as unknown as string, category: 'work' }];
    const wrapper = shallowMount(Entries, { props: { entries } });
    expect(wrapper.find('li').text()).toBe('- work');
  });

  it('renders nothing in the list when entries is empty', () => {
    const wrapper = shallowMount(Entries, { props: { entries: [] } });
    expect(wrapper.findAll('li').length).toBe(0);
  });
});
