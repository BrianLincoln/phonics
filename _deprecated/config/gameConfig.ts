export const gameConfig = {
  canvas: {
    width: 1280, // Increased for higher detail
    height: 960,
    backgroundColor: '#ffffff',
  },
  button: {
    width: 160,
    height: 50,
    spacing: 30,
    fontSize: '32px',
    borderColor: 0x000000,
    borderWidth: 2,
    fillColor: 0xffffff,
    textColor: '#000',
  },
  button_selected: {
    correct: {
      fillColor: 0x90EE90,
      borderColor: 0x00aa00,
      borderWidth: 3,
    },
    incorrect: {
      fillColor: 0xFF6B6B,
      borderColor: 0xff0000,
      borderWidth: 3,
    },
  },
  button_layout: {
    yPos: 300,
  },
  prompt_text: {
    x: 400,
    y: 100,
    fontSize: '28px',
    color: '#000',
    align: 'center',
    wordWrapWidth: 0.8, // 80% of viewport width
  },
  animation: {
    fadeOutDuration: 300,
    fadeInDuration: 300,
    retryDelay: 1500,
  },
  // audio config removed; promptFile should be per-question
};
