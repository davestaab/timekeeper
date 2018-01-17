<template>
  <div class="date-picker">
    <button class="arrow" @click="nextDate(-1)">&larr;</button>
    <div class="date">{{formattedDate}}</div>
    <button class="arrow" @click="nextDate(1)">&rarr;</button>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'DatePicker',
  props: {
    currentDate: {
      type: Date,
      required: true,
    },
  },
  computed: {
    formattedDate: function () {
      return moment(this.currentDate).format('MMM DD, YYYY')
    },
  },
  methods: {
    nextDate: function (amount) {
      // console.log('amount is: ', amount)
      this.$emit('nextDate', amount)
      // const next = this.current + amount
      // this.current = next < 0 ? 0 : next >= this.data.length ? this.data.length - 1 : next
    },
  },
}
</script>

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
