import { gameStore } from "./store";

const KEYMAP: Record<string, "left" | "right" | "up" | "down"> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  KeyA: "left",
  KeyD: "right",
  KeyW: "up",
  KeyS: "down",
};

let cleanup: (() => void) | null = null;

export function bindKeyboard() {
  if (cleanup) return;
  const set = (code: string, on: boolean) => {
    const dir = KEYMAP[code];
    if (dir) gameStore.input[dir] = on;
  };
  const down = (e: KeyboardEvent) => {
    if (KEYMAP[e.code]) {
      e.preventDefault();
      set(e.code, true);
    }
  };
  const up = (e: KeyboardEvent) => {
    if (KEYMAP[e.code]) {
      e.preventDefault();
      set(e.code, false);
    }
  };
  const blur = () => {
    gameStore.input.left =
      gameStore.input.right =
      gameStore.input.up =
      gameStore.input.down =
        false;
  };
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", blur);
  cleanup = () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("blur", blur);
  };
}

export function unbindKeyboard() {
  cleanup?.();
  cleanup = null;
}
