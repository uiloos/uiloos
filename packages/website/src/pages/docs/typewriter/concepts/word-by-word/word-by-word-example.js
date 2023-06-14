import { Typewriter } from '@uiloos/core';

const typewriterEl = document.getElementById('word-by-word-typewriter');

function subscriber(typewriter) {
  typewriterEl.innerHTML = typewriter.text;
}

const config = {
  "blinkAfter": 250,
  "cursors": [
    {
      "position": 0,
      "data": {
        "name": "Cursor #1"
      }
    }
  ],
  "actions": [
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "This",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "summer",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "experience",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "a",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "film",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "like",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "never",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "before",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": ":",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "Vampires",
      "delay": 1000
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "from",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "Venus",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "VII:",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "the",
      "delay": 2000
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": " ",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": "Quickening",
      "delay": 50
    },
    {
      "type": "keyboard",
      "cursor": 0,
      "text": ".",
      "delay": 50
    }
  ],
  "repeat": true,
  "repeatDelay": 10000,
  "autoPlay": true
}

new Typewriter(config, subscriber);
