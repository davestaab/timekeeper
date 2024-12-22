<script>
import moment from 'moment';

export default {
  name: 'DatePicker',
  props: {
    currentDate: {
      type: Date,
      required: true
    }
  },
  computed: {
    formattedDate() {
      return moment(this.currentDate).format('MMM DD, YYYY');
    }
  },
  methods: {
    nextDate(amount) {
      this.$emit('nextDate', amount);
    },
    findToday() {
      this.$emit('findToday');
    }
  }
};
</script>

<template>
  <div class="flex justify-center items-center">
    <button class="cursor-pointer flex-none" @click="nextDate(-1)">
      &larr;
    </button>
    <div class="flex-none m-2" @click="findToday">{{ formattedDate }}</div>
    <button class="cursor-pointer flex-none" @click="nextDate(1)">
      &rarr;
    </button>
  </div>
</template>
