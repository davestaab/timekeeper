import Categories from '../Categories.vue';
import { shallowMount } from '@vue/test-utils';

describe('Categories', () => {
  it('should add category', () => {
    const wrapper = shallowMount(Categories, {
      propsData: {
        categories: ['one', 'two']
      }
    });
    wrapper.find('input').setValue('three');
    wrapper.find('input').trigger('keyup.enter');
    expect(wrapper.emitted().createCategory[0]).toEqual(['three']);
  });
  it('should not allow duplicate categories', () => {
    const wrapper = shallowMount(Categories, {
      propsData: {
        categories: ['one', 'two']
      }
    });
    wrapper.find('input').setValue('one');
    wrapper.find('input').trigger('keyup.enter');
    expect(wrapper.emitted()).toEqual({});
  });
  it('should not allow empty categories', () => {
    const wrapper = shallowMount(Categories);
    // wrapper.find('input').setValue('');
    wrapper.find('input').trigger('keyup.enter');
    expect(wrapper.emitted()).toEqual({});
  });
});
