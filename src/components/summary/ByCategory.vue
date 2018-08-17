<script>
export default {
  props: {
    times: {
      type: Object,
      required: true
    }
  },
  computed: {
    total: function() {
      let total = 0;
      for (let key in this.times) {
        total = total + this.times[key];
      }
      return total;
    }
  }
};
</script>

<template>
  <div>
    <div class="text-xl my-2">Total By Category</div>
    <ul>
      <li
        v-for="(val, key) in times"
        :key="key"
        class="m-1">{{ val }} hr(s): {{ key }}</li>
      <li class="m-1 font-bold">{{ total }}: Total</li>
    </ul>
  </div>
</template>
