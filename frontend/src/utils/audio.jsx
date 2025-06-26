// src/utils/audio.js

export const playSound = (src) => {
  const audio = new Audio(src);
  audio.play().catch((e) => console.warn("Erro ao tocar som:", e));
};

// Você pode adicionar outras funções de áudio aqui, como parar, ajustar volume, etc.
