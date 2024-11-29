import { defineComponent } from 'vue';
import ModalComponent from '../components/Modal.vue';
import { IModal } from '../models/types';
import { app } from '../store';
import { appendVNodeWithContext, fadeIn, fadeOut, IComponent, isOrEmbedsComponent } from '../utils/dom';

export class Modal implements IModal {
  vComponent: any = ModalComponent;
  id: string;
  icon: string;
  closable: boolean;
  title: string;
  // reactive: any;
  el?: HTMLElement;
  component?: IComponent;
  classes: string;
  bordered: boolean;
  spawnParent: HTMLElement;

  constructor(o: IModal) {

    // this.content = reactive(new PromptContent(o.content));
    if (!o.title) {
      o.title = o.componentModule?.name; // State.content?.[toPascal(componentModule.name)]?.title;
    }
    this.id = o.id ?? '';
    this.icon = o.icon ?? '';
    this.title = o.title ?? '';
    this.bordered = o.bordered ?? false;
    this.closable = o.closable ?? false;
    this.classes = o.classes ?? '';
    this.spawnParent = o.spawnParent ?? document.querySelector('.modaler-wrapper') as HTMLElement;
    this.vComponent = o.componentModule;
    // this.reactive = reactive(this);
    if (o.componentModule) {
      this.spawn();
    }
  }

  public close = () => { // arrow function required to be recognized as props
    if (!this.el || !this.component?.instance)
      return;
    fadeOut(this.el, () => {
      this.component?.instance?.unmount?.();
      this.el = undefined; // dereference for the update to flush it
    });
  }

  protected spawn() {
    // componentModule is awaited from import(`../component/${toPascal(file.name as string)}.vue`)
    // check if the component is already a modal
    if (!this.component) {
      throw new Error('Modal requires this.vComponent (componentModule) to be defined');
    }
    if (isOrEmbedsComponent(this.component, ModalComponent)) {
      // this.component = this.component;
    } else {
      // if not, dynamically create a new component that embeds the provided component inside a Modal
      this.vComponent = defineComponent({
        name: 'ModalWrapper',
        components: { ModalComponent, EmbeddedComponent: this.vComponent },
        template: `
          <Modal v-bind="props" >
            <template #body>
              <EmbeddedComponent v-bind="props" />
            </template>
          </Modal>
        `,
        setup() {
          return { props };
        }
      });
    }
    let props = this; // reactive(this);
    this.component = appendVNodeWithContext(this.vComponent, this.spawnParent, props, app.instance);
    this.el = this.component.element;
    this.el.style.zIndex = `${app.modalZOffset++}`;
    this.id = this.component.id;
    // fadeIn(this.el);
    app.closeById[this.component.id] = () => this.close();
    app.modalById[this.component.id] = this;
  }
}
