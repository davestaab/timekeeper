<script>
  import moment from "moment";

  export default {
    props: ["times"],
    computed: {
      total: function() {
        let total = 0;
        for(let key in this.times) {
          total = total + this.times[key];
        }
        return total;
      }
    }
  };
</script>

<template>
  <div>
    <h3>Total By Category</h3>
    <ul>
      <li v-for="(val, key) in times" :key="key">{{val}} hr(s): {{key}}</li>
      <li class="total">{{total}}: Total</li>
    </ul>
  </div>
</template>

<style scoped>
  .total {
    font-weight: 700;
  }
</style>
