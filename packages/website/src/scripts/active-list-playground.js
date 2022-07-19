import { ActiveList } from '@uiloos/core';

const config = {
  contents: ['A', 'B', 'C'],
  active: ['A'],
};

const gridEl = document.getElementById('grid');
const jsonEl = document.getElementById('json');

const selects = [
  {
    element: document.getElementById('activate-select'),
    mode: 'value',
  },
  {
    element: document.getElementById('activateByIndex-select'),
    mode: 'index',
  },
  {
    element: document.getElementById('deactivate-select'),
    mode: 'value',
  },
  {
    element: document.getElementById('deactivateByIndex-select'),
    mode: 'index',
  },
  {
    element: document.getElementById('insertAtIndex-select'),
    mode: 'index-plus-one',
  },
  {
    element: document.getElementById('remove-select'),
    mode: 'value',
  },
  {
    element: document.getElementById('removeByIndex-select'),
    mode: 'index',
  },
];

const activeList = new ActiveList(config, (activeList) => {
  gridEl.textContent = '';

  for (const select of selects) {
    select.element.textContent = '';
  }

  for (const item of activeList.contents) {
    syncVisual(item);

    for (const select of selects) {
      if (select.mode === 'index' || select.mode === 'index-plus-one') {
        addIndexOptions(select.element, item);
      } else {
        addValueOptions(select.element, item);
      }
    }
  }

  for (const select of selects) {
    if (select.mode === 'index-plus-one') {
      addIndexOptions(select.element, {
        isActive: false,
        index: activeList.contents.length,
        label: `${activeList.contents.length}`,
      });
    }
  }

  syncJSON(activeList);
});

// SYNC

function syncVisual(item) {
  // VISUAL
  const div = document.createElement('div');
  div.className =
    'w-32 h-32 shrink-0 border rounded-full flex justify-center items-center text-white text-4xl cursor-pointer';

  if (item.isActive) {
    div.classList.add('bg-blue-400');
  } else {
    div.classList.add('bg-gray-400');
  }

  div.textContent = item.value;

  div.onclick = () => {
    item.toggle();
  };

  gridEl.append(div);
}

function addValueOptions(el, item) {
  // SELECTION BOXES
  const option = document.createElement('option');
  option.selected = item.isActive;
  option.value = item.value;
  option.label = `"${item.value}"`;

  el.append(option);
}

function addIndexOptions(el, item) {
  // SELECTION BOXES
  const option = document.createElement('option');
  option.selected = item.isActive;
  option.value = item.index;
  option.label = `${item.index}`;

  el.append(option);
}

function syncJSON(activeList) {
  jsonEl.textContent = JSON.stringify(
    activeList,
    makeReplacerMiddleware(ignorePrivateProps, circularReplacer()),
    2
  );
}

// EVENTS

document.getElementById('activate-select').onchange = (event) => {
  activeList.activate(event.target.value);
};

document.getElementById('activateByIndex-select').onchange = (event) => {
  const index = parseInt(event.target.value, 0);
  activeList.activateByIndex(index);
};

document.getElementById('activateByPredicate-select').onchange = (event) => {
  switch (event.target.value) {
    case 'A':
      activeList.activateByPredicate(({ value }) => value === 'A');
      break;
    case 'B':
      activeList.activateByPredicate(({ index }) => index === 1);
      break;
    default:
      activeList.activateByPredicate(({ content }) => content.isLast);
      break;
  }
};

document.getElementById('activateFirst').onclick = () => {
  activeList.activateFirst();
};

document.getElementById('activateLast').onclick = () => {
  activeList.activateLast();
};

document.getElementById('activateNext').onclick = () => {
  activeList.activateNext();
};

document.getElementById('activatePrevious').onclick = () => {
  activeList.activatePrevious();
};

document.getElementById('deactivate-select').onchange = (event) => {
  activeList.deactivate(event.target.value);
};

document.getElementById('deactivateByIndex-select').onchange = (event) => {
  const index = parseInt(event.target.value, 0);
  activeList.deactivateByIndex(index);
};

document.getElementById('deactivateByPredicate-select').onchange = (event) => {
  switch (event.target.value) {
    case 'A':
      activeList.deactivateByPredicate(({ value }) => value === 'A');
      break;
    case 'B':
      activeList.deactivateByPredicate(({ index }) => index === 1);
      break;
    default:
      activeList.deactivateByPredicate(({ content }) => content.isLast);
      break;
  }
};

document.getElementById('insertAtIndex-select').onchange = (event) => {
  const index = parseInt(event.target.value, 0);
  activeList.insertAtIndex(nextLetter(), index);
};

document.getElementById('insertByPredicate-select').onchange = (event) => {
  switch (event.target.value) {
    case 'A':
      activeList.insertByPredicate(nextLetter(), ({ value }) => value === 'A');
      break;
    case 'B':
      activeList.insertByPredicate(nextLetter(), ({ index }) => index === 1);
      break;
    default:
      activeList.insertByPredicate(
        nextLetter(),
        ({ content }) => content.isLast
      );
      break;
  }
};

document.getElementById('push').onclick = () => {
  activeList.push(nextLetter());
};

document.getElementById('unshift').onclick = () => {
  activeList.unshift(nextLetter());
};

document.getElementById('remove-select').onchange = (event) => {
  activeList.remove(event.target.value);
};

document.getElementById('removeByIndex-select').onchange = (event) => {
  const index = parseInt(event.target.value, 0);
  activeList.removeByIndex(index);
};

document.getElementById('removeByPredicate-select').onchange = (event) => {
  switch (event.target.value) {
    case 'A':
      activeList.removeByPredicate(({ value }) => value === 'A');
      break;
    case 'B':
      activeList.removeByPredicate(({ index }) => index === 1);
      break;
    default:
      activeList.removeByPredicate(({ content }) => content.isLast);
      break;
  }
};

document.getElementById('pop').onclick = () => {
  activeList.pop();
};

document.getElementById('shift').onclick = () => {
  activeList.shift();
};

// HELPERS

function makeReplacerMiddleware(...replacers) {
  return (key, value) => {
    let result = null;

    for (const replacer of replacers) {
      result = replacer(key, value);

      if (result === undefined) {
        break;
      }
    }
    return result;
  };
}

function ignorePrivateProps(key, value, c, d, v, b) {
  if (key[0] === '_') {
    return undefined;
  }

  return value;
}

function circularReplacer() {
  const seen = new WeakSet();

  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return undefined;
      }
      seen.add(value);
    }
    return value;
  };
}

let index = 3;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
function nextLetter() {
  const letter = LETTERS[index % LETTERS.length];

  index += 1;
  return letter;
}
