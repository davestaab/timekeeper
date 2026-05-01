import { shallowMount } from '@vue/test-utils';
import Entries from '../../src/components/summary/Entries.vue';

describe('Entries', () => {
  it('renders a row for each entry', () => {
    const entries = [
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
    const wrapper = shallowMount(Entries, { props: { entries: [] } });
    const result = wrapper.vm.formatDate(new Date('2024-01-01T09:00:00'));
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('returns null when time is falsy', () => {
    const wrapper = shallowMount(Entries, { props: { entries: [] } });
    expect(wrapper.vm.formatDate(null)).toBeNull();
    expect(wrapper.vm.formatDate('')).toBeNull();
  });

  it('renders nothing in the list when entries is empty', () => {
    const wrapper = shallowMount(Entries, { props: { entries: [] } });
    expect(wrapper.findAll('li').length).toBe(0);
  });
});
