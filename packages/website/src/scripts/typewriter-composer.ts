import { Typewriter, TypewriterEvent, typewriterActionTypeRight } from '@uiloos/core';

const animationEl = document.getElementById('animation')!;

new Typewriter(
  {
    blinkAfter: 250,
    cursors: [
      { position: 0, name: 'Mary' },
      // { position: 0, name: 'Ben' },
      // { position: 0, name: 'Susan' },
    ],
    actions: [
      { type: 'keyboard', key: 'h', delay: 50, cursor: 0 },
      { type: 'keyboard', key: 'e', delay: 50, cursor: 0 },
      // { type: 'keyboard', key: typewriterActionTypeRight, delay: 200, cursor: 1 },
      { type: 'keyboard', key: 'l', delay: 50, cursor: 0 },
      { type: 'keyboard', key: 'l', delay: 50, cursor: 0 },
      // { type: 'keyboard', key: typewriterActionTypeRight, delay: 200, cursor: 1 },
      { type: 'keyboard', key: 'o', delay: 50, cursor: 0 },
      { type: 'keyboard', key: 'w', delay: 50, cursor: 0 },
      // { type: 'keyboard', key: typewriterActionTypeRight, delay: 200, cursor: 1 },
      { type: 'keyboard', key: 'o', delay: 50, cursor: 0 },
      { type: 'keyboard', key: 'r', delay: 50, cursor: 0 },
      { type: 'keyboard', key: 'l', delay: 50, cursor: 0 },
      { type: 'keyboard', key: 'd', delay: 50, cursor: 0 },
      { type: 'keyboard', key: '!', delay: 50, cursor: 0 },
    ],
    repeat: true,
    repeatDelay: 10000,
  },
  subscriber
);

function subscriber(typewriter: Typewriter, event: TypewriterEvent) {
  console.log(event);
  animationEl.innerHTML = '';

  // if (event.type === 'BLINKING') {
  //   console.log(event.cursor.name, event.cursor.isBlinking);
  // }

  // if (event.type === 'CHANGED') {
  //   const cursor = typewriter.cursors[event.action.cursor]
  //   console.log(cursor.name, cursor.isBlinking);
  // }

  for (const position of typewriter) {
    const spanEl = document.createElement('span');

    
    spanEl.textContent = position.character;
    spanEl.className = 'letter';

    for (const cursor of  position.cursors) {
      spanEl.classList.add('cursor');

      if (cursor.isBlinking) {
        spanEl.classList.add('blink');
      }
  
      spanEl.style.color = colorForName(cursor.name);
    }


    
    
    animationEl.append(spanEl);
  }
}

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return `hsl(${hash % 360}, 85%, 35%)`;
}
