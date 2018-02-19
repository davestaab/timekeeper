<script>
  export default {
    props: ["categories"],
    data: function () {
      return {
        newCat: ""
      };
    },
    methods: {
      onDelete: function(cat) {
        this.$emit('deleteCategory', cat);
      },
      createCategory: function (cat) {
        this.$emit('createCategory', cat);
        this.newCat = "";
      }
    }
  };
</script>

<template>
  <div class="cat-container">
    <h1>Categories</h1>
    <ul>
      <li v-for="cat in categories" :key="cat">
        <span>
          {{cat}}
        </span>
        <button class="delete" @click="onDelete(cat)">✖</button>
      </li>
    </ul>
    <div class="input-wrapper">
      <input type="text" v-model="newCat" placeholder="add new category" @keyup.enter="createCategory(newCat)"/>
    </div>
  </div>
</template>

<style scoped>
  ul {
    padding: 0 40px;
  }
  li {
    display: flex;
  }
  li:hover .delete {
    visibility: visible;
  }
  li span {
    flex: 1 0 auto;
  }
  .cat-container {
    flex: 1 0 auto;
  }
  .delete {
    visibility: hidden;
    flex: 0 0 auto;
  }
  input {
    margin-left: 40px;
    visibility: hidden;
  }
  .cat-container:hover input {
    visibility: visible;
  }
</style>
