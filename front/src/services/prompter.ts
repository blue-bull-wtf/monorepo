import { DefineComponent, ref, Ref, watch } from 'vue';
import PromptComponent from '../components/Prompt.vue';
import { FieldType } from '../models/enums';
import { IPrompt } from '../models/types';
import { app } from '../store';
import { appendVNodeWithContext } from '../utils/dom';
import { ActionByName, isEmpty, Optional } from '../../../common/utils/typing';
import { Modal } from './modaler';

export class Prompt extends Modal implements IPrompt {
  type: FieldType;
  innerHtml?: string;
  modalComponent?: DefineComponent<{}, {}, any>;
  modalComponentProps?: Object;
  in: Optional<any[]>; // in choices
  out: Ref<any>;
  primaryCallbacks: ActionByName = {};
  secondaryCallbacks: ActionByName = {};
  response: Promise<any>; // type of out

  constructor(o: IPrompt) {
    if (!o.modalComponent && !o.innerHtml)
      throw new Error('Prompt requires either innerHtml or modalComponent as content');
    if (o.modalComponent && !isEmpty(o.primaryCallbacks))
      throw new Error('Prompt with modalComponent cannot have primaryCallbacks, the callback logic should be implemented in the dedicated.vue prompt');
    super(o);
    this.vComponent = PromptComponent;
    this.type = o.type ?? FieldType.MULTI_CONTROL;
    this.innerHtml = o.innerHtml;
    this.modalComponent = o.modalComponent;
    this.modalComponentProps = o.modalComponentProps;
    this.in = o.in;
    this.out ??= ref({});
    this.primaryCallbacks = o.primaryCallbacks ?? {};
    this.secondaryCallbacks = o.secondaryCallbacks ?? {};
    this.response = this.resolve();
    this.spawn();
  }

  public async resolve(): Promise<any> {
    return new Promise<any[]>((resolve, reject) => {
      watch(this.out, (_new, _old) => resolve(_new), { deep: true });
    });
  }

  protected override spawn() {
    let props = this; // reactive(this);
    this.component = appendVNodeWithContext(this.vComponent, this.spawnParent, props, app.instance);
    this.id = this.component.id;
    this.el = this.component.element;
    // fadeIn(this.el);
    app.closeById[this.component.id] = () => this.close();
    app.modalById[this.component.id] = this;
  }
}
