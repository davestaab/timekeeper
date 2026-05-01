import { shallowMount } from '@vue/test-utils';
import ByCategory from '../../src/components/summary/ByCategory.vue';

describe('ByCategory', () => {
  it('renders a row for each category', () => {
    const wrapper = shallowMount(ByCategory, {
      props: { times: { work: 2, lunch: 0.5 } }
    });
    const items = wrapper.findAll('li');
    expect(items.length).toBe(3); // 2 categories + total row
    expect(wrapper.text()).toContain('2 hr(s): work');
    expect(wrapper.text()).toContain('0.5 hr(s): lunch');
  });

  it('computes the correct total', () => {
    const wrapper = shallowMount(ByCategory, {
      props: { times: { work: 2, lunch: 0.5, meeting: 1 } }
    });
    expect(wrapper.vm.total).toBe(3.5);
    expect(wrapper.text()).toContain('3.5: Total');
  });

  it('shows zero total for empty times', () => {
    const wrapper = shallowMount(ByCategory, { props: { times: {} } });
    expect(wrapper.vm.total).toBe(0);
    expect(wrapper.text()).toContain('0: Total');
  });
});
