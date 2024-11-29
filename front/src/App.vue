<template lang="pug">
.toaster-wrapper.fixed.z-50.h-full.w-full.pointer-events-none
  .toaster.relative.z-50.h-full.w-xxl.mx-auto.flex-v.py-2.gap-1(:class="toasterClasses")
.modaler-wrapper.fixed.z-40.h-full.w-full.pointer-events-none
template(v-if="disclaimerAccepted")
  Header.z-30
  Router.z-10.mt-9
  Footer.z-10
template(v-else)
  .w-full.h-full.absolute.z-10.flex-v.x-center
    Svg.logo.w-s.important.cursor-pointer.my-9(icon="/svgs/blue", @click="routeTo('/')")
    .w-xl
      Md.h-m(file="legal/disclaimer.md")
      .flex-h.x-center.x-space-btw.mt-3
        .flex-h.x-center.gap-4.external-links
          a.nav-item.tooltip(v-for="link in externalLinks" :key="link.title" :href="link.path" :data-tooltip="`${link.path ?? '??'}`")
            Svg.w-7.h-7.fill-light-grey(:icon="link.icon")
        .flex-h.x-center.gap-5
          button.bordered.l(@click="goBack()") Back
          button.primary.l(@click="acceptDisclaimer") Accept
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import Router from './components/Router.vue';
import Md from './views/Md.vue';
import { session } from './store';
import { externalLinks } from './constants';
import { toaster } from './constants';
import { XPos, YPos } from './models/enums';

export default defineComponent({
  name: 'App',
  components: {
    Header,
    Footer,
    Router,
    Md
  },
  setup() {
    const disclaimerAccepted = ref(session.disclaimer.accepted());
    const acceptDisclaimer = () => {
      disclaimerAccepted.value = session.disclaimer.accept();
    }
    const goBack = () => {
      history.back();
    }
    const toasterClasses = [
      toaster.posX == XPos.RIGHT ? 'x-end' : 'x-start',
      toaster.posY == YPos.BOT ? 'y-end' : 'y-start'];
    return {
      toasterClasses,
      externalLinks,
      disclaimerAccepted,
      acceptDisclaimer,
      goBack
    };
  },
});
</script>

<style scoped>
</style>
