<template lang="pug">
header.fixed.w-full.top-0.h-9.flex-h.y-center
  nav.w-xxl.h-full.mx-auto.flex-h.y-center.x-space-btw.text-white
    .flex-h.y-center.gap-6
      Svg.logo.h-8.important.cursor-pointer(icon="/svgs/blue-logo", @click="routeTo('/')")
      Svg.logo.mt-2.w-11.important.cursor-pointer(icon="/svgs/blue-typo", @click="routeTo('/')")
    .flex-h
      a.h2.nav-item.mt-2.pr-6(v-for="route in routes" :key="route.title" :href="route.path ? route.path : '#'") {{ route.title }}
        .dropdown.bordered.backdrop-blur-medium.transition-all.flex-v.not-italic.font-size-s(v-if="route.children?.length > 0")
          a.nav-item.font-light(v-for="child in route.children" :key="child.title" :href="child.path") {{ child.title }}

    .flex-h.y-center.gap-2.external-links
      a.nav-item.tooltip(v-for="link in externalLinks" :key="link.title" :href="link.path" @click.prevent="routeTo(link.path)" :data-tooltip="`${link.path ?? '??'}`")
        Svg.w-6.h-6.fill-white(:icon="link.icon")
      template(v-if="accountInfo?.isConnected")
        button.l.w3m.bordered.ml-3.flex-h.y-center(
          @click="connect()"
        ) {{ shortAddress }}
      template(v-else)
        button.l.w3m.bordered.ml-3.flex-h.y-center(
          @click="connect()"
        ) Connect

</template>

<script lang="ts">
import { useAppKit, useAppKitAccount, useDisconnect, useWalletInfo } from '@reown/appkit/vue';
import { computed, defineComponent, onMounted } from 'vue';
import { shortenAddress } from '../../../common/utils/format';
import { externalLinks, navRoutes } from '../constants';
import { routeTo } from './Router.vue';

export default defineComponent({
  name: 'Header',
  props: {},
  components: {},
  setup() {
    // const kitTheme = useAppKitTheme();
    // const state = useAppKitState();
    // const events = useAppKitEvents();
    const accountInfo = useAppKitAccount();
    const { walletInfo }  = useWalletInfo();
    const { disconnect } = useDisconnect();
    const { open: connect } = useAppKit();
    const shortAddress = computed(() => shortenAddress(accountInfo.value.address!));

    onMounted(async () => { });

    return {
      accountInfo,
      walletInfo,
      shortAddress,
      connect,
      disconnect,
      routes: navRoutes,
      externalLinks,
      routeTo,
    };
  },
});
</script>

<style scoped>
.nav-item {
  position: relative;
}
</style>
