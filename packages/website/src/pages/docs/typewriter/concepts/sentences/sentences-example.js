import { typewriterFromSentences } from '@uiloos/core';

const typewriterEl = document.getElementById('sentences-typewriter');

typewriterFromSentences(
  {
    sentences: [
      'Superman is the man of steel',
      'Supergirls real name is Kara Zor-El',
      'Batman is the dark knight',
      'Batman\s nemesis is called the Joker',
      'The Flash can run through time',
      'Wonder woman possesses the Lasso of Truth',
    ],
    repeat: true,
    repeatDelay: 2000,
    text: 'Wonder woman possesses the Lasso of Truth',
  },
  (typewriter) => {
    typewriterEl.textContent = typewriter.text;

    const cursorEl = document.createElement('span');
    cursorEl.id = 'sentences-typewriter-cursor';
    if (typewriter.cursors[0].isBlinking) {
      cursorEl.classList.add('blinking');
    }
    typewriterEl.append(cursorEl);
  }
);
