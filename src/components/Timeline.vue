<template>
    <div>
        <h1>Time Line</h1>
    </div>
</template>

<script>
import { getData } from '../utils';

export default {
  name: 'Timeline',
  data() {
    return {
      data: getData(),
    };
  },
};

</script>

<style scoped>

</style>
