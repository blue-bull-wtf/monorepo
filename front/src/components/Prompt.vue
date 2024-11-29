<template lang="pug">

template(v-if="!modalComponent")
  Modal(:title="title", :icon="icon", :closable="false", :classes="classes", :bordered="bordered", ref="modalRef")

    template(#body)
      .message.w-full.text-left(v-html="innerHtml")

      //- basic alphanumerical inputs
      template(v-if="field?.props.type != FieldType.MULTI_CONTROL && field?.isBasic")
        Input(:field="field" :ref="field.ref")
      //- TODO: implement other field types (select/multi/date-picker/slider etc)

    template(#controls)
      button.l(v-for="(cb, name, i) in secondaryCallbacks", @click="actionClick(cb, name.toString(), i)") {{ name }}
      button.l.primary(v-for="(cb, name, i) in primaryCallbacks", @click="actionClick(cb, name.toString(), i)") {{ name }}

template(v-else)
  component(:is="modalComponent", v-bind="modalComponentProps")

</template>

<script lang="ts">

import { DefineComponent, defineComponent, ref } from "vue";
import { Callable, DEFAULT_CALLBACK } from "../../../common/utils/typing";
import Modal from "../components/Modal.vue";
import { FieldType } from "../models/enums";
import { FormField } from "../services/form";


export default defineComponent({
  name: "Prompt",
  props: {
    id: { type: String, required: true },
    title: { type: String, required: true },
    icon: { type: String, required: true },
    innerHtml: { type: String, required: false },
    modalComponent: { type: Object as () => DefineComponent<typeof Modal>, required: false },
    modalComponentProps: { type: Object, default: {} },
    primaryCallbacks: { type: Object, default: {} },
    secondaryCallbacks: { type: Object, default: {} },
    field: { type: FormField, required: false },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "Type here" },
    defaultValue: { type: String, default: "" },
    bordered: { type: Boolean, default: false },
    classes: { type: String, default: "" },
    close: { type: Function, default: DEFAULT_CALLBACK },
    out: { type: Object, default: {} }, // Ref<any>
  },
  setup: (props) => {

    const modalRef = ref();
    // TODO: fit ask.type (eg. as options for select field)
    const field = props.field ?? new FormField({
        type: FieldType.MULTI_CONTROL,
        label: props.label,
        placeholder: props.placeholder,
        value: "",
      });

    // TODO: make sure form is valid before processing fields ?
    // const form = new Form().add(field);

    const actionClick = props.modalComponent
      // generic callback for component modal prompts
      ? (res: any) => {
        props.out!.value = res;
        props.close();
      }

      // callback for field prompts
      : (cb: Callable<any, void>, name: string, i: number) => {
        if (field?.props.type == FieldType.MULTI_CONTROL) {
          props.out!.value = { name };
        } else {
          // TODO: cascade up all out values for a multi select / multi input
          props.out!.value = { value: field?.getValue() };
        }
        cb?.(props.out!.value);
        props.close();
      }

    if (props.modalComponent)
      props.modalComponentProps.actionCallback = actionClick;

    return {
      field,
      FieldType,
      modalRef,
      actionClick,
    };
  },
});
</script>

<style lang="postcss"></style>
