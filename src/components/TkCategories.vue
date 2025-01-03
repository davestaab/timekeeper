<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps<{ categories: string[] }>();
const newCat = ref('');
const emit = defineEmits<{
  (e: 'deleteCategory', cat: string): void;
  (e: 'createCategory', cat: string): void;
  (e: 'saveDefaultCategories', cats: string[]): void;
}>();

function onDelete(cat: string) {
  emit('deleteCategory', cat);
}
function createCategory(cat: string) {
  if (cat.trim() === '') return;
  if (props.categories.indexOf(cat) !== -1) {
    console.warn(`Category "${cat}" is already being used`);
    return;
  }
  emit('createCategory', cat);
  newCat.value = '';
}
function saveDefaults() {
  emit('saveDefaultCategories', props.categories);
}
</script>

<template>
  <div class="group flex flex-col">
    <div class="text-3xl py-4">Categories</div>
    <ul class="flex flex-col">
      <li v-for="cat in categories" :key="cat" class="m-1 flex-auto flex">
        <span class="flex-1">
          {{ cat }}
        </span>
        <button class="invisible group-hover:visible flex-none" @click="onDelete(cat)">✖</button>
      </li>
    </ul>
    <input
      v-model="newCat"
      class="invisible group-hover:visible m-1 my-4 px-1 border border-indigo-500"
      type="text"
      placeholder="add new category"
      @keyup.enter="createCategory(newCat)"
    />
    <button
      class="bg-transparent hover:bg-indigo-900 text-indigo-900 font-semibold hover:text-white py-2 px-4 border border-indigo-900 hover:border-transparent rounded group-hover:visible invisible self-end"
      @click="saveDefaults()"
    >
      Save as Default
    </button>
  </div>
</template>
