import { shallowMount } from '@vue/test-utils';
import DatePicker from '../../src/components/DatePicker.vue';

describe('DatePicker', () => {
  const currentDate = new Date('2024-06-15T12:00:00');

  function mountPicker() {
    return shallowMount(DatePicker, { props: { currentDate } });
  }

  it('formats the date for display', () => {
    const wrapper = mountPicker();
    expect(wrapper.text()).toContain('Jun 15, 2024');
  });

  it('emits nextDate with -1 when left arrow is clicked', async () => {
    const wrapper = mountPicker();
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('nextDate')).toEqual([[-1]]);
  });

  it('emits nextDate with 1 when right arrow is clicked', async () => {
    const wrapper = mountPicker();
    await wrapper.findAll('button')[1].trigger('click');
    expect(wrapper.emitted('nextDate')).toEqual([[1]]);
  });

  it('emits findToday when the date label is clicked', async () => {
    const wrapper = mountPicker();
    await wrapper.find('div.flex-none').trigger('click');
    expect(wrapper.emitted('findToday')).toBeTruthy();
  });
});
