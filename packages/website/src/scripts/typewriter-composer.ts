import {
  ActiveListEvent,
  TypewriterCursor,
  TypewriterEvent,
  typewriterActionTypeClearAll,
  typewriterActionTypeSelectLeft,
} from '@uiloos/core';
import { typewriterActionTypeBackspace } from '@uiloos/core';
import { typewriterActionTypeSelectRight } from '@uiloos/core';
import { typewriterActionTypeLeft } from '@uiloos/core';
import {
  ActiveList,
  ActiveListContent,
  Typewriter,
  TypewriterConfig,
  typewriterActionTypeRight,
  TypewriterActionTypeKeyPressKey,
  TypewriterAction,
} from '@uiloos/core';

const nameEl = document.getElementById('name') as HTMLInputElement;
const inputEl = document.getElementById('input') as HTMLInputElement;
const animationEl = document.getElementById('animation') as HTMLDivElement;
const timelineEl = document.getElementById('timeline') as HTMLUListElement;
const cursorsEl = document.getElementById('cursors') as HTMLUListElement;
const cursorsExplanationEl = document.getElementById('cursorsExplanation') as HTMLParagraphElement;
const addCursorButton = document.getElementById('add-cursor') as HTMLButtonElement;
const playButton = document.getElementById('play') as HTMLButtonElement;
const resetButton = document.getElementById('reset') as HTMLButtonElement;
const initialTextEl = document.getElementById('initialText') as HTMLInputElement;
const fixedDelayEl = document.getElementById('fixedDelay') as HTMLInputElement;

inputEl.focus();

const colors = [
  '#000000',
  '#dc2626',
  '#65a30d',
  '#2563eb',
  '#c026d3',
  '#ea580c',
  '#0284c7',
  '#d97706',
  '#4f46e5',
  '#16a34a',
];

// Represents the cursor which is getting dragged
let draggedCursor: ActiveListContent<string> | null = null;

// Represents the action which is getting dragged
let draggedAction: ActiveListContent<TypewriterAction> | null = null;

const actions = new ActiveList<TypewriterAction>();

let config: TypewriterConfig = {
  blinkAfter: 250,
  cursors: [{ position: 0, name: 'Cursor #1' }],
  actions: actions.contents.map(c => c.value),
  repeat: false,
};

const typewriter = new Typewriter(config);

const cursors = new ActiveList({
  contents: ['Cursor #1'],
  activeIndexes: 0,
  isCircular: true,
});

function typewriterSubscriber(typewriter: Typewriter, event: TypewriterEvent) {
  animationEl.innerHTML = '';

  if (event.type === 'FINISHED') {
    inputEl.value = typewriter.text;
    inputEl.disabled = false;

    const cursor = event.cursor;

    if (cursor.selection) {
      inputEl.setSelectionRange(
        cursor.selection.start, 
        cursor.selection.end,
        cursor.position === cursor.selection.start ? 'forward' : 'backward'
      );
    } else {
      inputEl.setSelectionRange(event.cursor.position, event.cursor.position);
    }

    inputEl.focus();
  }

  if ('action' in event) {
    for (const actionEl of document.querySelectorAll('.timeline-item')) {
      if (actionEl instanceof HTMLLIElement) {
        actionEl.style.borderColor = 'rgb(234, 234, 234)';
      }
    }

    const index = typewriter.actions.indexOf(event.action);

    const actionEl = document.getElementById(`action-${index}`);

    if (actionEl) {
      actionEl.style.borderColor = '#c084fc';
    }
  }

  for (const position of typewriter) {
    const letterEl = document.createElement('span');
    letterEl.className = 'letter';

    animationEl.append(letterEl);

    const infoEl = document.createElement('span');
    infoEl.className = 'info';

    animationEl.append(infoEl);

    letterEl.textContent = position.character;

    // Reset the style of the span.
    letterEl.classList.remove('blink', 'cursor', 'selection');
    letterEl.style.setProperty('--cursor-color', null);

    infoEl.style.setProperty('--cursor-color', null);
    infoEl.textContent = '';

    for (const cursor of position.cursors.reverse()) {
      // This span has one or multiple cursors, the last one will win.

      const color = colorForIndex(typewriter.cursors.indexOf(cursor));
      letterEl.classList.add('cursor');
      letterEl.style.setProperty('--cursor-color', color);

      infoEl.style.setProperty('--cursor-color', color);
      infoEl.textContent = cursor.name;

      if (cursor.name === cursors.lastActivated && cursor.isBlinking) {
        letterEl.classList.add('blink');
      }
    }

    for (const cursor of position.selected.reverse()) {
      // This span has one or multiple cursors, the last one will win.

      const color = colorForIndex(typewriter.cursors.indexOf(cursor));
      letterEl.style.setProperty('--background-color', color + '30'); // 30 = opacity
    }
  }
}

function cursorsSubscriber(
  cursors: ActiveList<string>,
  event: ActiveListEvent<string>
) {
  cursorsEl.innerHTML = '';

  if (event.type === 'INSERTED') {
    // Technically not allowed but for the composer this works fine.
    typewriter.cursors.push(
      new TypewriterCursor(typewriter, 0, event.value, undefined)
    );
  }

  cursorsExplanationEl.hidden = cursors.isEmpty();

  for (const cursor of cursors.contents) {
    const color = colorForIndex(cursor.index);

    const template = document.querySelector(
      '#cursor-template'
    ) as HTMLTemplateElement;

    const cursorEl = template.content.firstElementChild?.cloneNode(
      true
    ) as HTMLDivElement;

    cursorEl.ondragstart = (event: DragEvent) => {
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
      }
      draggedCursor = cursor;
    };

    cursorEl.ondragover = (event: DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }

      if (draggedCursor) {
        draggedCursor.moveToIndex(cursor.index);
      }
      return false;
    };

    cursorsEl.ondrop = () => {
      return false;
    };

    cursorEl.onclick = (event) => {
      if (event.target instanceof HTMLInputElement) {
        event.stopPropagation();
        return;
      }

      cursor.activate();
    };

    const colorEl = cursorEl.querySelector(
      '[data-id="color"]'
    ) as HTMLSpanElement;
    colorEl.style.backgroundColor = color;

    const activeEl = cursorEl.querySelector(
      '[data-id="active"]'
    ) as HTMLSpanElement;
    if (cursor.isActive) {
      inputEl.focus();

      const c = typewriter.cursors.find((c) => c.name === cursor.value);
      if (c) {
        inputEl.setSelectionRange(c.position, c.position);
        inputEl.style.caretColor = colorForIndex(typewriter.cursors.indexOf(c));
      }

      nameEl.textContent = cursor.value;
    } else {
      activeEl.remove();
    }

    const cursorInputEl = cursorEl.querySelector('input') as HTMLInputElement;
    cursorInputEl.value = cursor.value;
    cursorInputEl.onkeyup = () => {
      if (cursor.isActive) {
        nameEl.textContent = cursorInputEl.value;
      }

      cursor.value = cursorInputEl.value;
    };

    cursorsEl.append(cursorEl);
  }
}

function actionsSubscriber() {
  timelineEl.innerHTML = '';

  for (const actionContent of actions.contents) {
    const action = actionContent.value;

    const template = document.querySelector(
      '#timeline-item-template'
    ) as HTMLTemplateElement;

    const actionEl = template.content.firstElementChild?.cloneNode(
      true
    ) as HTMLLIElement;

    actionEl.id = `action-${actionContent.index}`;

    // Set the color of the arrow so it is visible which cursor
    // took the action.
    actionEl.style.setProperty('--cursor-color', colorForIndex(action.cursor));

    const keyEl = actionEl.querySelector(
      '[data-id="key"]'
    ) as HTMLInputElement;

    const positionEl = actionEl.querySelector(
      '[data-id="position"]'
    ) as HTMLSpanElement;

    const delayEl = actionEl.querySelector(
      '[data-id="delay"]'
    ) as HTMLInputElement;

    delayEl.value = `${action.delay}`;

    if (action.type === 'keyboard') {
      positionEl.remove();

      const mouseIcon = actionEl.querySelector(
        '[data-id="mouse"]'
      ) as HTMLImageElement;
      mouseIcon.remove();

      switch (action.key) {
        case typewriterActionTypeBackspace:
          keyEl.value = '⌫';
          break;

        case typewriterActionTypeClearAll:
          keyEl.value = '⎚';
          break;

        case typewriterActionTypeLeft:
          keyEl.value = '←';
          break;

        case typewriterActionTypeRight:
          keyEl.value = '→';
          break;

        case typewriterActionTypeSelectLeft:
          keyEl.value = '⇧←';
          break;

        case typewriterActionTypeSelectRight:
          keyEl.value = '⇧→';
          break;

        case ' ':
          keyEl.value = `''`;
          break;
        
        default:
          keyEl.value = action.key;
          break;
      }
    } else {
      keyEl.remove();

      const keyboardIcon = actionEl.querySelector(
        '[data-id="keyboard"]'
      ) as HTMLImageElement;
      keyboardIcon.remove();
      
      positionEl.textContent = '' + action.position;
    }

    const deleteButton = actionEl.querySelector(
      '[data-id="delete"]'
    ) as HTMLButtonElement;

    deleteButton.onclick = () => {
      actionContent.remove();
      
      reInit();
    };

    keyEl.onchange = () => {
      if (action.type === 'keyboard') {
        action.key = keyEl.value;
      }
      
      reInit();
    };

    delayEl.onchange = () => {
      action.delay = parseInt(delayEl.value, 10);
      
      reInit();
    };

    if (action.type === 'mouse') {
      actionEl.draggable = false;
      actionEl.style.cursor = 'default';
    }
    

    actionEl.ondragstart = (event: DragEvent) => {
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
      }
      draggedAction = actionContent;
    };

    actionEl.ondragover = (event: DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }

      if (draggedAction) {

        if (draggedAction.value.cursor === actionContent.value.cursor) {
          draggedAction.moveToIndex(actionContent.index);
          reInit();
        }
      }
      return false;
    };

    actionEl.ondrop = () => {
      return false;
    };

    timelineEl.append(actionEl);
  }
}

function reInit() {
  if (actions.isEmpty()) {
    inputEl.focus();
  } else {
    inputEl.disabled = true;
  }
  
  config.actions = actions.contents.map(c => c.value);
  
  config.cursors = cursors.contents.map((c) => ({ ...c,  position: 0, }))
  
  typewriter.initialize(config);
}

cursors.subscribe(cursorsSubscriber);
typewriter.subscribe(typewriterSubscriber);
actions.subscribe(actionsSubscriber);

addCursorButton.onclick = () => {
  const cursor = cursors.push(`Cursor #${typewriter.cursors.length + 1}`);
  cursor.activate();
};

playButton.onclick = () => {
  inputEl.disabled = true;

  typewriter.stop();
  typewriter.play();
};

let shiftPressed = false;
inputEl.onkeydown = (event) => {
  if (event.shiftKey) {
    shiftPressed = true;
  }

  const key = event.key;

  // Ignore shift, control and alt keys.
  if (key.length !== 1) {
    return;
  }

  // Happens when only key pressed is shift.
  if (!key) {
    return;
  }

  const cursor = cursors.lastActivatedContent?.index ?? 0;

  let delay = calculateDelay();
  const action: TypewriterAction = {
    type: 'keyboard',
    cursor,
    key,
    delay,
  };

  actions.push(action);

  // Technically this is illegal but it should work, what this does is
  // push and perform the action straight away.
  typewriter.actions.push(action);
  typewriter.isFinished = false;
  typewriter.play();
};

inputEl.onkeyup = (event) => {
  if (!event.shiftKey) {
    shiftPressed = false;
  }

  if (shiftPressed) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        cursors.activatePrevious();
        return false;

      case 'ArrowDown':
        event.preventDefault();
        cursors.activateNext();
        return false;
    }
  }

  const key = keyForEvent(event);

  if (key) {
    const cursor = cursors.lastActivatedContent?.index ?? 0;

    let delay = calculateDelay();

    const action: TypewriterAction = {
      type: 'keyboard',
      cursor,
      key,
      delay,
    };

    actions.push(action);

    // Technically this is illegal but it should work, what this does is
    // push and perform the action straight away.
    typewriter.actions.push(action);
    typewriter.isFinished = false;
    typewriter.play();
  }

  return false;
};

function keyForEvent(
  event: KeyboardEvent
): TypewriterActionTypeKeyPressKey | false {
  if (shiftPressed) {
    switch (event.key) {
      case 'ArrowRight':
        return typewriterActionTypeSelectRight;

      case 'ArrowLeft':
        return typewriterActionTypeSelectLeft;
    }
  }

  switch (event.key) {
    case 'ArrowRight':
      return typewriterActionTypeRight;

    case 'ArrowLeft':
      return typewriterActionTypeLeft;

    case 'Backspace':
      return typewriterActionTypeBackspace;
  }

  return false;
}

let prevTime = Date.now();
function calculateDelay(): number {
  if (fixedDelayEl.value) {
    return parseInt(fixedDelayEl.value, 10);
  }

  const delay = Date.now() - prevTime;

  prevTime = Date.now();

  return delay < 1000 ? delay : 50;
}

inputEl.onmouseup = () => {
  const cursor = cursors.lastActivatedContent?.index ?? 0;

  const position = inputEl.selectionStart ?? 0;

  const action: TypewriterAction = {
    type: 'mouse',
    cursor,
    position,
    delay: calculateDelay(),
  };

  actions.push(action);

  // Technically this is illegal but it should work, what this does is
  // push and perform the action straight away.
  typewriter.actions.push(action);
  typewriter.isFinished = false;
  typewriter.play();
};

// Fired when the selection changes, either by keyboard or mouse.
inputEl.onselect = () => {
  // Ignore selection from arrow left and right
  if (shiftPressed) {
    return;
  }

  const cursor = cursors.lastActivatedContent?.index ?? 0;

  const actualCursor = typewriter.cursors[cursor];

  // We only support going from no selection to suddenly
  // having a selection.
  if (actualCursor.selection) {
    return;
  }

  const start = inputEl.selectionStart ?? -1;
  const end = inputEl.selectionEnd ?? -1;

  // When the cursor is added and the focus is set automatically,
  // it will trigger a "onselect", we do not want this to end up
  // as a mouse click action, the start and end will in this scenario
  // both be zero, so we can check if they are the same.
  if (start === end) {
    return;
  }

  const action: TypewriterAction = {
    type: 'mouse',
    cursor,
    position: end,
    selection: { start, end },
    delay: calculateDelay(),
  };

  actions.push(action);

  // Technically this is illegal but it should work, what this does is
  // push and perform the action straight away.
  typewriter.actions.push(action);
  typewriter.isFinished = false;
  typewriter.play();
};

initialTextEl.onchange = () => {
  const text = initialTextEl.value;

  inputEl.value = text;
  inputEl.focus();
  
  if (config.cursors) {
    config.cursors[0].position = Array.from(text).length;
  }
  config.text = text;

  reInit();
};

fixedDelayEl.onchange = () => {
  const delay = parseInt(fixedDelayEl.value);
  
  actions.contents.forEach(action => action.value.delay = delay);
  actions.activateNext();

  reInit();
};

resetButton.onclick = () => {
  config = {
    blinkAfter: 250,
    cursors: [{ position: 0, name: 'Cursor #1' }],
    actions: actions.contents.map(c => c.value),
    repeat: false,
  }

  actions.initialize({});
  cursors.initialize({
    contents: ['Cursor #1'],
    activeIndexes: 0,
    isCircular: true,
  });

  inputEl.value = '';

  reInit();
};

// Utils

function colorForIndex(index: number): string {
  return colors[index % colors.length];
}

/*
  TODO:


  . Implement timeline
    - total time
  . Config
    - word mode
  . Pause
  . import
  . export
  . reset
  . Dark mode
  . Mobile mode
  . Fix safari
  . Fix firefox
*/
