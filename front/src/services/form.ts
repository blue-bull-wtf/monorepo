import { FieldType } from '../models/enums';
import { Ref, ref, VNodeRef } from 'vue';
import { toCamel } from '../../../common/utils/format';
import { Stringifiable, Optional } from '@common/utils/typing';

export type VModelNodeRef = VNodeRef & {
  model: string;
}
export const isAreaField = (type: FieldType): boolean => type == FieldType.TEXTAREA;
export const isSliderField = (type: FieldType): boolean => type == FieldType.SLIDER;
export const isToggleField = (type: FieldType): boolean => [FieldType.CHECKBOX, FieldType.RADIO, FieldType.SWITCH].includes(type);
export const isSelectField = (type: FieldType): boolean => [FieldType.SELECT, FieldType.SELECT_DROPDOWN].includes(type);
export const isBasicField = (type: FieldType): boolean => !isToggleField(type) && !isAreaField(type) && !isSelectField(type);

export type FormValue = number | number[] | string | string[] | boolean | boolean[];

// TODO: simplify into IFormField and extend with FormField
export interface FormFieldProps {
  type: FieldType;
  label?: string;
  showLabel?: boolean;
  classes?: string;
  inputId?: string;
  value?: FormValue | Ref<FormValue>;
  default?: string | number | boolean;
  placeholder?: string;
  isValid?: boolean;
  validationMessage?: string;
  icon?: string;
  iconLeft?: boolean; // defaults is right
  onClick?: () => void;
  onKeyup?: () => void;
  onKeydown?: () => void;
  validate?: (value: unknown) => string;
  onChange?: (value: unknown) => void;
  onInput?: (value: unknown) => void;
  onValidate?: (value: unknown) => void;
  validateOnInput?: boolean;
  validateOnChange?: boolean;
  options?: { [key: string]: number | string }[];
  // optionRefs?: Ref<InstanceType<any>>;
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
  autocomplete?: boolean;
}

export class FormField {
  // implements IFormField {

  public isToggle: boolean = false;
  public isSelect: boolean = false;
  public isArea: boolean = false;
  public isSlider: boolean = false;
  public isBasic: boolean = false;
  public onValidate: any = (v: unknown) => {};
  public ref: VModelNodeRef | any; // VModelNodeRef; // ref<InstanceType<typeof Input>>();

  // TODO: use a default props object + lodash merge override on construct
  constructor(public props: FormFieldProps) {

    this.ref = ref();

    props.label ??= "";
    props.showLabel ??= !!props.label;
    props.autocomplete ??= true;
    props.validateOnChange ??= true;
    props.validateOnInput ??= false;
    if (!props?.classes && props.label) {
      props.classes = toCamel(props.label);
    }
    props.inputId ??= 'input-' + props.classes;

    if (isToggleField(props.type)) {
      this.isToggle = true;
    } else if (isSelectField(props.type)) {
      this.isSelect = true;

      if (!this.props.options) return;
      for (let i in this.props.options) {
        if (!('text' in this.props.options[i])) {
          const v: number | Stringifiable = this.props.options[i].value;
          this.props.options[i].text = `${v}`; // v.toString();
        }
      }
    } else if (isAreaField(props.type)) {
      this.isArea = true;
    } else if (isSliderField(props.type)) {
      this.isSlider = true;
      if (!props?.min) props.min = 0.0;
      if (!props?.max) props.max = 100.0;
    } else {
      this.isBasic = true;
    }
    if (!props?.value) {
      if (this.isBasic || this.isArea) {
        props.value = '';
      } else if (this.isSelect) {
        // TODO: make sure we have options
        // @ts-ignore
        props.value = props.options[0].value;
      } else if (this.isToggle) {
        props.value = false;
      } else if (this.isSlider) {
        // @ts-ignore
        props.value = (props?.max - props.min) / 2;
      }
    }
    if (!props?.default) {
      // @ts-ignore
      props.default = props.value;
    }
  }

  public getValue(): Optional<string> {
    return this.ref.value?.model;
  }

  public getAsFloat(): number {
    const val = this.getValue();
    return val ? Number.parseFloat(val) : 0.0;
  }

  public getAsInt(): number {
    const val = this.getValue();
    return val ? Number.parseInt(val) : 0.0;
  }

  public setValue(val: unknown) {
    if (this.ref != undefined) {
      this.ref.value.model = val as string;
      if (this.props?.onInput) this.props.onInput(val);
      else if (this.props?.onChange) this.props.onChange(val);
    } else {
      console.error('FormField.setValue requires ref to be mounted');
    }
  }

  public reset() {
    this.setValue(this.props.value);
  }

  public validate(value: unknown = this.getValue()): string {
    if (this.props?.validate) {
      this.props.validationMessage = this.props.validate(value);
      this.props.isValid = this.props.validationMessage.length > 0;
      return this.props.validationMessage;
    }
    this.onValidate(this.getValue());
    return '';
  }
}

export class FormFieldGroup {
  public fields: FormField[] = [];
}

export class Form {
  constructor(public labels: string[] = [], public fieldByLabel: { [key: string]: FormField } = {}) { }

  public add(field: FormField): Form {
    this.labels.push(field.props.label as string);
    this.fieldByLabel[field.props.label as string] = field;
    return this;
  }

  public validate(): string {
    for (const l of this.labels) {
      const err = this.fieldByLabel[l].validate();
      if (err) {
        return err;
      }
    }
    return '';
  }
}
