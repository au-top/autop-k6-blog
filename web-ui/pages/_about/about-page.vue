<template>
  <main>
    <h1>about</h1>
    <p>{{d}}</p>
    <el-button @click="add">add</el-button>
  </main>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data(): { d: { about: number } } {
    return {
      d: {
        about: 1,
      },
    }
  },
  methods: {
    add() {
    },
  },
})
</script>

<style>
</style>
