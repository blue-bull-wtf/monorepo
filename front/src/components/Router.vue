
<template lang="pug">
.router.w-xxl.maxw-100-p-2.mx-auto.relative.flex-v.y-start(ref="container")
  //- transition(name="view-change" @before-leave="bgDash" @enter="scrollTop" appear)
  component.z-inherit.absolute(:is="view" v-bind="viewProps" class="transition-container" :key="pathname" )
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, watch } from 'vue'
import { router } from '../store';
import { Prompt } from '../services/prompter';
import { DEFAULT_CALLBACK } from '../../../common/utils/typing';
import { appRoutes } from '../constants';

window.addEventListener('hashchange', (event) => {
  event.preventDefault();
  routeTo(window.location.hash.substring(1) || '/');
});

export const routeTo = async (path="/", popup: boolean = false) => {
  if (path === router.pathname.value)
    return window.history.replaceState({}, '', path);
  if (path.startsWith('/')) {
    router.pathname.value = path;
    return window.history.pushState({}, '', path);
  }
  // window.location.href = path;
  const isMail = path.startsWith?.('mailto')!;
  const p = await new Prompt({
      icon: "icons/info",
      innerHtml: isMail
        ? `You are about to be redirected to your email client to write to <a href="${path}" target="_blank">${path.replace('mailto:', '')}</a>, click <span class="font-bold text-primary">OK</span> to proceed`
        : `You are about to be redirected to <a href="${path}" target="_blank">${new URL(path!).origin}</a>, click <span class="font-bold text-primary">OK</span> to proceed`,
      secondaryCallbacks: { Cancel: DEFAULT_CALLBACK },
      primaryCallbacks: { Ok: DEFAULT_CALLBACK },
    }).resolve();
  if (p.name === 'Ok') window.open(path, (isMail || !popup) ? '_self' : '_blank')?.focus(); // no focus on self redirect
}

export const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const render = async () => {
  const match = router.pathname.value in appRoutes ? router.pathname.value : '/not-found';
  const route = appRoutes[match];

  if (match !== router.pathname.value)
    window.history.pushState({}, '', match);

  if (route)
    router.viewProps.value = route.props ?? {};
  router.view.value = (await (import(`../views/${route.title.replace(" ", "")}.vue`))).default;
}

watch(router.pathname, async () => render());

export default defineComponent({
  name: 'Router',
  props: {
    initial: { type: String }
  },
  setup(props) {
    const container = ref<HTMLElement>();
    onMounted(async () => {
      if (props.initial)
        window.history.pushState({}, '', props.initial);
      if (container.value) {
        router.element = container.value;
        router.rect = container.value.getBoundingClientRect();
      }
      await render();
    });
    return {
      view: router.view,
      viewProps: router.viewProps,
      pathname: router.pathname,
      scrollTop,
      container
    }
  },
})
</script>

<style scoped lang="pcss">
.router {
  min-height: calc(100% - 6rem);
}

</style>
