// Import necessary functions from Vue
import { App, DirectiveBinding, createVNode, render } from 'vue/dist/vue.esm-bundler';
import Svg from '../components/Svg.vue'
import Lottie from '../components/Lottie.vue'
import { app } from '../store';

// Define the directive
const RenderDirective = {
  // The `mounted` hook will be called when the directive is first bound to the element
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // The value passed to the directive, expected to be a template string
    const template = binding.value ?? "bs" as string;

    // Define a dynamic component using `defineComponent` with the given template
    const DynamicComp = { template, comments: { Svg, Lottie } };

    // Create a VNode from the dynamic component
    const vnode = createVNode(DynamicComp, {});
    vnode.appContext = app.instance._context;

    // Render the VNode directly to the element. This replaces the need to use `createApp` and `mount`.
    // A temporary container is used to perform the rendering, which is then appended to the target element.
    render(vnode, el);
  },
  // The `unmounted` hook will be called when the directive is unbound from the element
  unmounted(el: HTMLElement) {
    // Clear the content when the directive is unbound to clean up
    render(null, el); // This effectively removes the rendered content
  }
};

// Export the directive as a plugin for easy installation
export default {
  install(app: App) {
    app.directive('render', RenderDirective);
  }
};
