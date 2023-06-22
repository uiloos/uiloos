import { Typewriter } from '@uiloos/core';

const typewriterEl = document.getElementById('multicursor-typewriter');

function subscriber(typewriter) {
  typewriterEl.innerHTML = '';

  for (const position of typewriter) {
    // If there are multiple cursors, the last one will be on top
    for (const cursor of position.cursors.reverse()) {
      const color = cursor.data.color;

      const cursorEl = document.createElement("span");
      cursorEl.classList.add("cursor");
      cursorEl.style.setProperty("--cursor-color", color);

      if (cursor.isBlinking) {
        cursorEl.classList.add("blink");
      }

      typewriterEl.append(cursorEl);

      const infoEl = document.createElement("span");
      infoEl.className = "info";
      infoEl.style.setProperty("--cursor-color", color);
      infoEl.textContent = cursor.data.name;

      typewriterEl.append(infoEl);
    }


    const letterEl = document.createElement('span');
    letterEl.className = 'letter';
    letterEl.textContent = position.character;

    typewriterEl.append(letterEl);


    for (const cursor of position.selected.reverse()) {
      // This span has one or multiple cursors, the last one will win.
      const color = cursor.data.color;
      letterEl.style.setProperty('--background-color', color + '30'); // 30 = opacity
    }
  }
}

const config = {
  blinkAfter: 250,
  repeat: true,
  repeatDelay: 10000,
  cursors: [
    {
      position: 0,
      data: {
        name: 'Jim',
        color: '#ef4444',
      }
    },
    {
      position: 0,
      data: {
        name: 'Dwight',
        color: '#d946ef',
      }
    },
    {
      position: 0,
      data: {
        name: 'Pam',
        color: '#22c55e',
      }
    },
    {
      position: 0,
      data: {
        name: 'Michael',
        color: '#3b82f6',
      }
    },
  ],
  actions: [
    {
      type: 'keyboard',
      cursor: 0,
      text: 'W',
      delay: 50,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'i',
      delay: 87,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 't',
      delay: 141,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'h',
      delay: 76,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ' ',
      delay: 99,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'c',
      delay: 44,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'o',
      delay: 79,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'l',
      delay: 30,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'l',
      delay: 113,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'a',
      delay: 80,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'b',
      delay: 44,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ' ',
      delay: 72,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'y',
      delay: 64,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'o',
      delay: 87,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'u',
      delay: 56,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ' ',
      delay: 80,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'c',
      delay: 88,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'a',
      delay: 84,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'n',
      delay: 59,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ' ',
      delay: 73,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'c',
      delay: 8,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'r',
      delay: 44,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'e',
      delay: 76,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'a',
      delay: 108,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 't',
      delay: 100,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'e',
      delay: 47,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ' ',
      delay: 133,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'w',
      delay: 177,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'i',
      delay: 102,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'k',
      delay: 160,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'i',
      delay: 152,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 's',
      delay: 116,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ',',
      delay: 124,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ' ',
      delay: 83,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'd',
      delay: 53,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'o',
      delay: 64,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'c',
      delay: 125,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'u',
      delay: 108,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'm',
      delay: 55,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'e',
      delay: 109,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'n',
      delay: 87,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 't',
      delay: 100,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 's',
      delay: 96,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ',',
      delay: 75,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ' ',
      delay: 40,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'p',
      delay: 100,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'r',
      delay: 106,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 's',
      delay: 100,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'e',
      delay: 139,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'n',
      delay: 132,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 't',
      delay: 104,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'a',
      delay: 55,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 't',
      delay: 160,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'i',
      delay: 78,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'o',
      delay: 61,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'n',
      delay: 44,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 's',
      delay: 50,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ',',
      delay: 44,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ' ',
      delay: 84,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'a',
      delay: 100,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'n',
      delay: 99,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'd',
      delay: 84,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ' ',
      delay: 61,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'p',
      delay: 124,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'r',
      delay: 151,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'o',
      delay: 105,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'j',
      delay: 60,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'e',
      delay: 49,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'c',
      delay: 88,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 't',
      delay: 158,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'z',
      delay: 88,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: ' ',
      delay: 156,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 't',
      delay: 43,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'o',
      delay: 63,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'g',
      delay: 33,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'e',
      delay: 144,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 't',
      delay: 87,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'h',
      delay: 43,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'e',
      delay: 96,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: 'r',
      delay: 69,
    },
    {
      type: 'keyboard',
      cursor: 0,
      text: '.',
      delay: 43,
    },
    {
      type: 'mouse',
      cursor: 1,
      position: 5,
      delay: 50,
    },
    {
      type: 'keyboard',
      cursor: 1,
      text: '"',
      delay: 500,
    },
    {
      type: 'mouse',
      cursor: 1,
      position: 12,
      delay: 34,
    },
    {
      type: 'keyboard',
      cursor: 1,
      text: '"',
      delay: 500,
    },
    {
      type: 'mouse',
      cursor: 1,
      position: 49,
      delay: 50,
    },
    {
      type: 'keyboard',
      cursor: 1,
      text: 'e',
      delay: 500,
    },
    {
      type: 'mouse',
      cursor: 1,
      position: 74,
      delay: 50,
    },
    {
      type: 'keyboard',
      cursor: 1,
      text: '⌫',
      delay: 500,
    },
    {
      type: 'keyboard',
      cursor: 1,
      text: 's',
      delay: 66,
    },
    {
      type: 'mouse',
      cursor: 2,
      position: 45,
      selection: {
        start: 36,
        end: 45,
      },
      delay: 70,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: 'd',
      delay: 1000,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: 'o',
      delay: 178,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: 'c',
      delay: 101,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: 's',
      delay: 73,
    },
    {
      type: 'mouse',
      cursor: 2,
      position: 55,
      selection: {
        start: 42,
        end: 55,
      },
      delay: 76,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: 's',
      delay: 1000,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: 'l',
      delay: 131,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: 'i',
      delay: 122,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: 'd',
      delay: 88,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: 'e',
      delay: 100,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: 's',
      delay: 160,
    },
    {
      type: 'mouse',
      cursor: 2,
      position: 72,
      delay: 50,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: '⌫',
      delay: 150,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: ' ',
      delay: 82,
    },
    {
      type: 'keyboard',
      cursor: 2,
      text: '❤️',
      delay: 50,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: ' ',
      delay: 50,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: '⌫',
      delay: 50,
    },
    {
      type: 'mouse',
      cursor: 3,
      position: 74,
      delay: 100,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: ' ',
      delay: 125,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: 'N',
      delay: 100,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: 'o',
      delay: 77,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: 'w',
      delay: 92,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: ' ',
      delay: 65,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: 'w',
      delay: 100,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: 'i',
      delay: 86,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: 't',
      delay: 53,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: 'h',
      delay: 87,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: ' ',
      delay: 136,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: 'A',
      delay: 78,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: 'I',
      delay: 114,
    },
    {
      type: 'keyboard',
      cursor: 3,
      text: '!',
      delay: 44,
    },
  ],
  repeat: false,
  repeatDelay: 0,
  autoPlay: true,
};

new Typewriter(config, subscriber);
