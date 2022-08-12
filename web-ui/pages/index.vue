<template>
  <main>
    <div id="xxx">{{posts}}</div>
    <NuxtLink to="/1/about-page">About (internal link that belongs to the Nuxt App)</NuxtLink>
    {{helloWorld}}
  </main>
</template>

<script lang="ts">
import Vue from 'vue'
import gql from 'graphql-tag'

export default Vue.extend({
  name: 'IndexPage',
  data() {
    return {
      helloWorld: 1,
    }
  },
  apollo: {
    posts: gql`
      {
        posts(where: {}) {
          content
        }
      }
    `,
  },
} as any)
</script>
