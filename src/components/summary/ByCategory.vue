<template>
  <div>
    <h2>Total By Category</h2>
    <ul>
      <li v-for="(val, key) in times" :key="key">{{val}} hr(s): {{key}}</li>
      <li class="total">{{total}}: Total</li>
    </ul>
  </div>
</template>


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

<style scoped>
  .total {
    font-weight: 700;
  }
</style>
