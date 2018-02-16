<template>
  <div class="cat-container">
    <h1>Categories</h1>
    <ul>
      <li v-for="cat in categories" :key="cat">{{cat}}</li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: [
      'categories'
    ]
  };
</script>


<style scoped>
  ul {
    margin: 0;
    padding: 0;
  }
  li {
    list-style: none;
  }
  .cat-container {
    width: 760px;
    margin: 0 auto;
  }
</style>
