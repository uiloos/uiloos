import { Typewriter } from '@uiloos/core';

const typewriterEl = document.getElementById('karaoke-typewriter-highlight');

function subscriber(typewriter) {
  typewriterEl.textContent = typewriter.text;
}

const config = {
  blinkAfter: 250,
  cursors: [
    {
      position: 0,
      data: {
        name: 'Cursor #1',
      },
    },
  ],
  actions: [
    { type: 'keyboard', cursor: 0, text: 'Turn ', delay: 400 },
    { type: 'keyboard', cursor: 0, text: 'around ', delay: 300 },
    { type: 'keyboard', cursor: 0, text: 'bright ', delay: 500 },
    { type: 'keyboard', cursor: 0, text: 'eyes! ', delay: 400 },
    { type: 'keyboard', cursor: 0, text: 'Every ', delay: 1000 },
    { type: 'keyboard', cursor: 0, text: 'now ', delay: 400 },
    { type: 'keyboard', cursor: 0, text: 'and ', delay: 100 },
    { type: 'keyboard', cursor: 0, text: 'then ', delay: 100 },
    { type: 'keyboard', cursor: 0, text: 'I ', delay: 100 },
    { type: 'keyboard', cursor: 0, text: 'fall ', delay: 100 },
    { type: 'keyboard', cursor: 0, text: 'apart!', delay: 100 },
  ],
  repeat: true,
  repeatDelay: 5000,
  autoPlay: true,
};

new Typewriter(config, subscriber);
