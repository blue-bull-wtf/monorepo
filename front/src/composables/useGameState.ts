import { ref } from "vue";

export function useGameState(game: string) {
  const gameState = ref({});
  const players = ref([]);
  

  const updateState = (newState: any) => { /* ... */ };
  const validateState = (state: any) => { /* ... */ };
  const sendState = () => { /* ... */ };

  return {
    gameState,
    players,
    updateState,
    validateState,
    sendState
  };
}
