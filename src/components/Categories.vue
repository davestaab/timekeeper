<script>
export default {
  props: {
    categories: {
      type: Array,
      default: () => []
    }
  },
  data: function() {
    return {
      newCat: ''
    };
  },
  methods: {
    onDelete: function(cat) {
      this.$emit('deleteCategory', cat);
    },
    createCategory: function(cat) {
      if (this.categories.indexOf(cat) !== -1 || cat.trim() === '') {
        return;
      }
      console.warn(`Category "${cat}" is already being used`);
      this.$emit('createCategory', cat);
      this.newCat = '';
    }
  }
};
</script>

<template>
  <div class="group flex flex-col">
    <div class="text-3xl py-4">Categories</div>
    <ul class="flex flex-col">
      <li
        v-for="cat in categories"
        :key="cat"
        class="m-1 flex-auto flex">
        <span class="flex-1">
          {{ cat }}
        </span>
        <button
          class="invisible group-hover:visible flex-none"
          @click="onDelete(cat)">✖</button>
      </li>
    </ul>
    <input
      v-model="newCat"
      class="invisible group-hover:visible m-1 my-4 px-1 border border-indigo "
      type="text"
      placeholder="add new category"
      @keyup.enter="createCategory(newCat)">
  </div>
</template>
