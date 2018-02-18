<script>
  import moment from "moment";

  export default {
    props: {
      entries: {
        required: true
      }
    },
    filters: {
      formatDate: function(value) {
        if (value) {
          return moment(value).format("hh:mm a");
        }
      }
    }
  };
</script>

<template>
  <div>
    <h3>Entries</h3>
    <ul>
      <li v-for="e in entries" :key="e.id">{{e.time | formatDate}} - {{e.category}}</li>
    </ul>
  </div>
</template>

