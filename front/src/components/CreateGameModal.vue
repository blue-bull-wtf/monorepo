<template lang="pug">
Modal(title="Create a Game", :closable="true", :bordered="bordered", ref="modalRef")
  .modal-header.flex.justify-between.items-center.mb-6
    h2.text-xl.font-bold Create New Game

  .modal-body
    form(@submit.prevent="handleSubmit")
      // Game Type
      .form-group.mb-6
        label.block.mb-2 Game Type
        select.w-full.bg-gray-700.rounded.px-3.py-2(
          v-model="formData.type"
          required
        )
          option(value="Blue Pill") Blue Pill
          option(value="Bull Run") Bull Run

      // Map Size
      .form-group.mb-6
        label.block.mb-2 Map Size
        select.w-full.bg-gray-700.rounded.px-3.py-2(
          v-model="formData.config.mapSize"
          required
        )
          option(value="SMALL") Small
          option(value="MEDIUM") Medium
          option(value="LARGE") Large

      // Game Speed
      .form-group.mb-6
        label.block.mb-2 Game Speed
        select.w-full.bg-gray-700.rounded.px-3.py-2(
          v-model="formData.config.gameSpeed"
          required
        )
          option(value="SLOW") Slow
          option(value="NORMAL") Normal
          option(value="FAST") Fast

      // Max Players
      .form-group.mb-6
        label.block.mb-2 Max Players
        input.w-full.bg-gray-700.rounded.px-3.py-2(
          type="number"
          v-model.number="formData.config.maxPlayers"
          min="2"
          max="6"
          required
        )

      // Stakes
      .form-group.mb-6
        label.block.mb-2 Stakes
        .flex.items-center.gap-4.mb-2
          input(
            type="radio"
            v-model="stakeType"
            value="free"
            id="free"
          )
          label(for="free") Free to Play
        .flex.items-center.gap-4
          input(
            type="radio"
            v-model="stakeType"
            value="paid"
            id="paid"
          )
          label(for="paid") Entry Fee

        .stake-amount.mt-4(v-if="stakeType === 'paid'")
          label.block.mb-2 Entry Fee (ETH)
          input.w-full.bg-gray-700.rounded.px-3.py-2(
            type="number"
            v-model="entryFee"
            step="0.01"
            min="0"
            required
          )

      .flex.justify-end.gap-4.mt-8
        button.btn.secondary(
          type="button"
          @click="$emit('close')"
        ) Cancel
        button.btn.primary(
          type="submit"
          :disabled="isSubmitting"
        ) Create Game
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { GameType, GameConfig } from '@common/types/game';
import { parseEther } from 'ethers';

export default defineComponent({
  name: 'CreateGameModal',

  emits: ['close', 'create'],

  setup(props, { emit }) {
    const isSubmitting = ref(false);
    const stakeType = ref<'free' | 'paid'>('free');
    const entryFee = ref<string>('0');

    const formData = ref({
      type: 'Blue Pill' as GameType,
      config: {
        theme: 'DEFAULT',
        mapSize: 'MEDIUM',
        gameSpeed: 'NORMAL',
        maxPlayers: 10,
      } as GameConfig
    });

    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;

        // Update stakes based on type
        // formData.value.config.stakes = {
        //   token: stakeType.value === 'paid' ? 'ETH' : null,
        //   amount: stakeType.value === 'paid' ?
        //     parseEther(entryFee.value).toString() :
        //     '0'
        // };

        emit('create', {
          type: formData.value.type,
          config: formData.value.config
        });
      } catch (error) {
        console.error('Error creating game:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      formData,
      stakeType,
      entryFee,
      isSubmitting,
      handleSubmit
    };
  }
});
</script>
