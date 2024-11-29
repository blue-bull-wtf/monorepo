<!-- /front/src/views/Lobby.vue -->
<template lang="pug">
.lobby.container.mx-auto.p-4
  // Stats Bar
  .stats-bar.bg-gray-800.rounded-lg.p-4.mb-6
    .grid.grid-cols-4.gap-4
      .stat-item.text-center
        .text-2xl.font-bold {{ stats.playersInLobby }}
        .text-sm.text-gray-400 Players in Lobby
      .stat-item.text-center
        .text-2xl.font-bold {{ stats.pendingGames }}
        .text-sm.text-gray-400 Games Pending
      .stat-item.text-center
        .text-2xl.font-bold {{ stats.ongoingGames }}
        .text-sm.text-gray-400 Games Ongoing
      .stat-item.text-center
        .text-2xl.font-bold {{ stats.playersInGame }}
        .text-sm.text-gray-400 Players In-Game

  // Actions Bar
  .actions-bar.flex.justify-between.items-center.mb-6
    .search-filter
      input.px-4.py-2.rounded(
        type="text"
        v-model="searchQuery"
        placeholder="Search games..."
      )
    .actions.flex.gap-4
      button.btn.primary(
        @click="openCreateGameModal"
      ) Create Game

  // Games Table
  table.w-full.bg-gray-800.rounded-lg.overflow-hidden
    thead
      tr.text-left.bg-gray-700
        th.p-4 Game
        th.p-4 Type
        th.p-4 Players
        th.p-4 Config
        th.p-4 Stakes
        th.p-4 Created
        th.p-4 Action
    tbody
      tr.border-t.border-gray-700(
        v-for="game in filteredGames"
        :key="game.id"
      )
        td.p-4
          .font-medium {{ game.id.slice(0, 8) }}
          .text-sm.text-gray-400 by {{ shortenAddress(game.creator) }}
        td.p-4 {{ game.type }}
        td.p-4 {{ game.players.length }}/{{ game.config.maxPlayers }}
        td.p-4
          .text-sm
            .mb-1 Map: {{ game.config.mapSize }}
            .mb-1 Speed: {{ game.config.gameSpeed }}
        td.p-4
          .text-sm(v-if="game.config.stakes.tokenAddress")
            | {{ formatEther(game.config.stakes.amount) }} ETH
          .text-sm(v-else) Free
        td.p-4 {{ formatTime(game.createdAt) }}
        td.p-4
          button.btn.secondary(
            @click="joinGame(game.id)"
            :disabled="!canJoinGame(game)"
          ) Join

  // Create Game Modal
  CreateGameModal(
    v-if="showCreateModal"
    @close="showCreateModal = false"
    @create="handleCreateGameModal"
  )
</template>

<script lang="ts">
import { Game, GameConfig, GameType } from '@common/types/game';
import { useAppKitAccount } from '@reown/appkit/vue';
import { formatEther } from 'ethers';
import { computed, defineComponent, ref } from 'vue';
import { shortenAddress } from '../../../common/utils/format';
import CreateGameModal from '../components/CreateGameModal.vue';
import { useLobby } from '../composables/useLobby';
import { epochToString } from '@common/utils/date';
import { Modal } from '@/services/modaler';
import { IModal, NavRoute } from '@/models/types';
import { navRoutes } from '../constants';

export default defineComponent({
  name: 'Lobby',
  components: { CreateGameModal },

  setup() {

    const accountInfo = useAppKitAccount();
    const gameList = navRoutes[0].children!.map(
      (nav: NavRoute) => ({
        name: nav.title,
        slug: nav.path!.replace('#/', ''),
      })
    );
    const { pendingGames, ongoingGames, protocolStats, createGame, joinGame } = useLobby();

    const searchQuery = ref('');
    const showCreateModal = ref(false);
    const filteredGames = computed(() => searchQuery.value ? Array.from(pendingGames.value).filter(
      (game: Game) => game.type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        game.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        game.creator.address.toLowerCase().includes(searchQuery.value.toLowerCase())
    ) : Array.from(pendingGames.value));

    const openCreateGameModal = () => {
      showCreateModal.value = true;
    };

    const handleCreateGameModal = async (gameData: {
      type: GameType;
      config: GameConfig;
    }) => {
      await createGame(gameData.type, gameData.config);
      new Modal(<IModal>{
        componentModule: CreateGameModal,
        closable: true,
        bordered: true
      });
    };
    // console.log(isConnected, address);

    return {
      gameList,
      accountInfo,
      shortenAddress,
      pendingGames,
      ongoingGames,
      protocolStats,
      searchQuery,
      filteredGames,
      showCreateModal,
      formatEther,
      epochToString,
      openCreateGameModal,
      handleCreateGameModal,
      joinGame
    };
  }
});
</script>