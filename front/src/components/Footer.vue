<template lang="pug">
footer.italic.font-medium.w-full.h-7.mt-2.flex-h.y-center.font-light.font-size-s
  nav.px-2.w-xxl.h-full.mx-auto.flex-h.y-center.x-space-btw.text-white.z-inherit
    .copyright.cursor-pointer.flex-h.x-start.y-center(@click="scrollTop")
      .text-left.text-center.text-grey © {{ new Date().getFullYear() }} - Blue Bull
    ul.flex-h.y-center.gap-4
      li.nav-item(v-for="route in routes" :key="route.title")
        a.nav-item(:href="route.path ? route.path : '#'") {{ route.title }}
      Svg.logo.cursor-pointer.w-8.h-5.fill-paths-white(icon="/svgs/blue-typo", @click="scrollTop")
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { routeTo, scrollTop } from './Router.vue';
import { NavRoute } from '../models/types';

const routes: NavRoute[] = [
  { title: "Disclaimer", path: "#/disclaimer"},
];

const externalLinks: NavRoute[] = [
  { title: 'Docs', icon: '/svgs/docs.svg', path: '#/docs' },
  { title: 'X', icon: '/svgs/x.svg', path: 'https://x.com/BlueBull' },
  { title: 'Github', icon: '/svgs/github.svg', path: 'https://github.com/BlueBull' }
];

export default defineComponent({
  name: 'Footer',
  props: {},
  components: {},
  setup() {
    onMounted(async () => { });
    return {
      routes,
      externalLinks,
      routeTo,
      scrollTop
    };
  },
});

</script>

<style scoped>
a, .logo {
  padding-left: .9rem;
}
a:hover {
  padding-left: 0;
  &::before {
    content: '⇨ ';
  }
}
</style>
