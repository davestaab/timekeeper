<script>
  import moment from "moment";

  export default {
    name: "DatePicker",
    props: {
      currentDate: {
        type: Date,
        required: true
      }
    },
    computed: {
      formattedDate() {
        return moment(this.currentDate).format("MMM DD, YYYY");
      }
    },
    methods: {
      nextDate(amount) {
        this.$emit("nextDate", amount);
      },
      findToday() {
        this.$emit('findToday');
      }
    }
  };
</script>

<template>
  <div class="date-picker">
    <button class="arrow" @click="nextDate(-1)">&larr;</button>
    <div class="date" @click="findToday">{{formattedDate}}</div>
    <button class="arrow" @click="nextDate(1)">&rarr;</button>
  </div>
</template>

<style scoped>
  .date-picker {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .date {
    margin: 10px;
    flex: 0 0 auto;
  }
  .arrow {
    flex: 0 0 auto;
    cursor: pointer;
  }
</style>
