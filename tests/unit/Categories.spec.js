import { shallowMount } from '@vue/test-utils';
import Categories from '../../src/components/Categories.vue';

describe('Categories', () => {
  const categories = ['work', 'personal', 'lunch'];

  function mountCategories(cats = categories) {
    return shallowMount(Categories, { propsData: { categories: cats } });
  }

  it('renders each category', () => {
    const wrapper = mountCategories();
    const items = wrapper.findAll('li');
    expect(items.length).toBe(3);
    expect(wrapper.text()).toContain('work');
    expect(wrapper.text()).toContain('personal');
    expect(wrapper.text()).toContain('lunch');
  });

  it('emits deleteCategory with the category when delete is clicked', async () => {
    const wrapper = mountCategories();
    await wrapper.findAll('button').at(0).trigger('click');
    expect(wrapper.emitted('deleteCategory')).toEqual([['work']]);
  });

  it('emits createCategory and clears input on enter', async () => {
    const wrapper = mountCategories();
    const input = wrapper.find('input');
    await input.setValue('deep work');
    await input.trigger('keyup.enter');
    expect(wrapper.emitted('createCategory')).toEqual([['deep work']]);
    expect(wrapper.vm.newCat).toBe('');
  });

  it('renders with empty categories list', () => {
    const wrapper = mountCategories([]);
    expect(wrapper.findAll('li').length).toBe(0);
  });
});
