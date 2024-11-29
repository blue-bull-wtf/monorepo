<template lang="pug">
button.picker.relative(@click="toggleDropdown" :class="{ multiple }")
  .flex-h.gap-2.y-center.x-space-btw.selected-option
    template(v-if="isEmpty(modelValue)")
      span.text-light-grey.w-full.text-left {{ placeholder }}
    template(v-else)
      template(v-if="multiple")
        .m-1.p-1.tag(
          v-for="(option, index) in modelValue"
          :key="option.value"
        )
          span {{ option.label }}
          button.text-grey(
            @click.stop="removeOption(index)"
          )
            i.bi.bi-x-circle-fill
      template(v-else)
        span.w-full.text-left {{ modelValue[0]?.label }}
    template(v-if="isDropdownOpen")
      Svg.w-4.fill-light-grey(icon="icons/up")
    template(v-else)
      Svg.w-4.fill-light-grey(icon="icons/down")

  .dropdown.bordered.absolute.backdrop-blur-medium.mt-3.w-full.min-w-xs.font-light.not-italic.text-left(
    :class="{ active: isDropdownOpen }"
    @mousedown.stop.prevent="focusDropdown"
  )
    input.filter.w-full.bg-transparent.border-none.outline-none(
      ref="searchInput"
      v-model="filterText"
      placeholder="Search..."
      v-if="typeFriendly"
    )
    .options.w-full.uppercase.font-size-s.overflow-y-auto.max-h-xs
      .option.block.cursor-pointer(
        v-for="option in filteredOptions"
        :key="option.value"
        @click.stop="selectOption(option)"
        :class="{ 'selected': isSelected(option) }"
      )
        span {{ option.label }}
</template>

<script>
import { ref, computed, watch, nextTick, defineComponent } from 'vue';
import { isEmpty } from '../../../common/utils/typing';

export default defineComponent({
  name: 'Picker',
  props: {
    options: {
      type: Array,
      required: true,
      validator: (options) => options.every((option) => 'value' in option && 'label' in option),
    },
    placeholder: {
      type: String,
      default: 'Select an option',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    typeFriendly: {
      type: Boolean,
      default: true,
    },
    modelValue: {
      type: [Object, Array], // Expect an object for single select or an array for multiple
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const isDropdownOpen = ref(false);
    const filterText = ref('');
    const modelValue = ref(props.multiple ? props.modelValue : [props.modelValue]);
    const searchInput = ref(null);

    watch(
      () => props.modelValue,
      (newValue) => {
        modelValue.value = props.multiple ? newValue : [newValue];
      }
    );

    const filteredOptions = computed(() =>
      filterText.value
        ? props.options.filter((option) =>
          option.label.toLowerCase().includes(filterText.value.toLowerCase())
        )
        : props.options
    );

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
      if (isDropdownOpen.value) {
        nextTick(() => {
          searchInput.value?.focus(); // Focus on the input once the dropdown opens
        });
      }
    };

    const closeDropdown = () => {
      isDropdownOpen.value = false;
      filterText.value = '';
    };

    const selectOption = (option) => {
      if (props.multiple) {
        if (!isSelected(option)) {
          modelValue.value.push(option);
          emit('update:modelValue', modelValue.value);
        }
      } else {
        modelValue.value = [option];
        emit('update:modelValue', option);
        closeDropdown();
      }
    };

    const removeOption = (index) => {
      modelValue.value.splice(index, 1);
      emit('update:modelValue', modelValue.value);
    };

    const isSelected = (option) =>
      modelValue.value.some((selected) => selected?.value === option.value);

    return {
      isEmpty,
      isDropdownOpen,
      filterText,
      modelValue,
      filteredOptions,
      searchInput,
      toggleDropdown,
      closeDropdown,
      selectOption,
      removeOption,
      isSelected,
    };
  },
});
</script>

<style lang="postcss" scoped>
.multiple .selected {
  @apply flex-wrap;
}
</style>
