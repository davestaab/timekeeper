<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{ categories: string[] }>(), {
  categories: () => [],
});

const emit = defineEmits<{
  deleteCategory: [cat: string];
  createCategory: [cat: string];
}>();

const newCat = ref('');

function onDelete(cat: string) {
  emit('deleteCategory', cat);
}

function createCategory(cat: string) {
  emit('createCategory', cat);
  newCat.value = '';
}

defineExpose({ newCat });
</script>

<template>
  <div class="group flex flex-col">
    <div class="text-3xl py-4">Categories</div>
    <ul class="flex flex-col">
      <li v-for="cat in props.categories" :key="cat" class="m-1 flex-auto flex">
        <span class="flex-1">{{ cat }}</span>
        <button class="invisible group-hover:visible flex-none" @click="onDelete(cat)">
          ✖
        </button>
      </li>
    </ul>
    <input
      v-model="newCat"
      class="invisible group-hover:visible m-1 my-4 px-1 border border-indigo-500"
      type="text"
      placeholder="add new category"
      @keyup.enter="createCategory(newCat)"
    />
  </div>
</template>
