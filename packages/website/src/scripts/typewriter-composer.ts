import {
  ActiveListEvent,
  TypewriterCursor,
  TypewriterEvent,
  ViewChannelEvent,
  typewriterActionTypeSelectLeft,
} from '@uiloos/core';
import { typewriterActionTypeBackspace } from '@uiloos/core';
import { ViewChannel } from '@uiloos/core';
import { typewriterActionTypeSelectRight } from '@uiloos/core';
import { typewriterActionTypeLeft } from '@uiloos/core';
import {
  ActiveList,
  ActiveListContent,
  Typewriter,
  TypewriterConfig,
  typewriterActionTypeRight,
  TypewriterAction,
} from '@uiloos/core';

const animationEl = document.getElementById('animation') as HTMLDivElement;
const animationInput = document.getElementById(
  'animation-input'
) as HTMLInputElement;
const cursorNameEl = document.getElementById('cursor-name') as HTMLInputElement;
const playButton = document.getElementById('play') as HTMLButtonElement;

const cursorsEl = document.getElementById('cursors') as HTMLUListElement;
const addCursorButton = document.getElementById(
  'add-cursor'
) as HTMLButtonElement;
const cursorPositionExplanationEl = document.getElementById('cursors-position-explanation') as HTMLParagraphElement;
const maxPositionCursorEl = document.getElementById(
  'max-position-cursor'
) as HTMLSpanElement;

const dialogEl = document.getElementById('dialog') as HTMLDialogElement;
const dialogContentEl = document.getElementById(
  'dialog-content'
) as HTMLDialogElement;
const resetButton = document.getElementById('reset') as HTMLButtonElement;
const exportButton = document.getElementById('export') as HTMLButtonElement;
const importButton = document.getElementById('import') as HTMLButtonElement;

const initialTextInput = document.getElementById(
  'initial-text'
) as HTMLInputElement;
const fixedDelayInput = document.getElementById(
  'fixed-delay'
) as HTMLInputElement;
const repeatTimeInput = document.getElementById('repeat-time') as HTMLInputElement;
const repeatDelayInput = document.getElementById('repeat-delay') as HTMLInputElement;
const repeatDelayWrapperEl = document.getElementById('repeat-delay-wrapper') as HTMLInputElement;
const autoplayInput = document.getElementById('autoplay') as HTMLInputElement;

const timelineEl = document.getElementById('timeline') as HTMLUListElement;
const timelineTotalTime = document.getElementById(
  'timeline-total-time'
) as HTMLSpanElement;

animationInput.focus();

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

// Represents the action which is getting dragged
let draggedAction: ActiveListContent<TypewriterAction> | null = null;

const actions = new ActiveList<TypewriterAction>();

let repeatConfig: number | boolean | undefined = false;
let repeatDelayConfig: number | undefined= 0;
let autoplayConfig: boolean | undefined = true;

let config: TypewriterConfig = {
  blinkAfter: 250,
  cursors: [{ position: 0, name: 'Cursor #1' }],
  actions: [],
  repeat: false,
};

const typewriter = new Typewriter(config);

const cursors = new ActiveList({
  contents: ['Cursor #1'],
  isCircular: true,
});

type Modal = {
  template: string;
  init(element: HTMLDivElement): void;
};
const modalViewChannel = new ViewChannel<Modal, any>();

function typewriterSubscriber(typewriter: Typewriter, event: TypewriterEvent) {
  animationEl.innerHTML = '';

  if (event.type === 'FINISHED') {
    animationInput.value = typewriter.text;
    animationInput.disabled = false;

    const cursor = event.cursor;

    if (cursor.selection) {
      animationInput.setSelectionRange(
        cursor.selection.start,
        cursor.selection.end,
        cursor.position === cursor.selection.start ? 'forward' : 'backward'
      );
    } else {
      animationInput.setSelectionRange(
        event.cursor.position,
        event.cursor.position
      );
    }

    animationInput.focus();
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
    const position = config.text ? config.text.length : 0;
    
    // Technically not allowed but for the composer this works fine.
    typewriter.cursors.push(
      new TypewriterCursor(typewriter, position, event.value, undefined)
    );

    if (config.cursors) {
      config.cursors.push({ position, name: event.value });
    }
  }

  for (const cursor of cursors.contents) {
    const color = colorForIndex(cursor.index);

    const template = document.getElementById(
      'cursor-template'
    ) as HTMLTemplateElement;

    const cursorEl = template.content.firstElementChild?.cloneNode(
      true
    ) as HTMLDivElement;

    cursorEl.onclick = (event) => {
      if (event.target instanceof HTMLInputElement) {
        event.stopPropagation();
        return;
      }

      cursor.activate();
    };

    const colorEl = cursorEl.querySelector(
      '#cursor-template-color'
    ) as HTMLSpanElement;
    colorEl.style.backgroundColor = color;

    const activeEl = cursorEl.querySelector(
      '#cursor-template-active'
    ) as HTMLSpanElement;
    if (cursor.isActive) {
      animationInput.focus();

      const actualCursor = typewriter.cursors[cursor.index];
      if (actualCursor) {
        animationInput.setSelectionRange(actualCursor.position, actualCursor.position);
        animationInput.style.caretColor = colorForIndex(cursor.index);
      }

      cursorNameEl.textContent = cursor.value;
    } else {
      activeEl.remove();
    }

    const nameInput = cursorEl.querySelector('#cursor-template-name') as HTMLInputElement;
    nameInput.value = cursor.value;
    nameInput.onchange = () => {
      const name = nameInput.value;
      
      // Fixes the name next to the input
      if (cursor.isActive) {
        cursorNameEl.textContent = name;
      }

      if (config.cursors) {
        config.cursors[cursor.index].name = name;
      }

      cursor.value = name;
      cursor.activate();
    };

    const positionInput = cursorEl.querySelector('#cursor-template-position') as HTMLInputElement;

    if (positionInput.value === '') {
      
      // @ts-expect-error cursors is defined
      positionInput.value = "" + config.cursors[cursor.index].position;
    }

    positionInput.onchange = () => {
      let position = parseInt(positionInput.value, 10);
      
      const length = config.text?.length ?? 0;
      if (position > length || isNaN(position)) {
        positionInput.value = "" + length;
        position = length;
      } else if (position < 0) {
        positionInput.value = "0"
        position = 0;
      }

      if (config.cursors) {
        config.cursors[cursor.index].position = position;
      }
      
      reInit();
    };

    if (config.text) {
      cursorPositionExplanationEl.hidden = false;
      positionInput.parentElement?.classList.remove('hidden');
    } else {
      cursorPositionExplanationEl.hidden = true;  
      positionInput.parentElement?.classList.add('hidden');
    }

    cursorsEl.append(cursorEl);
  }
}

function actionsSubscriber() {
  timelineEl.innerHTML = '';

  let total = 0;
  for (const actionContent of actions.contents) {
    const action = actionContent.value;

    total += action.delay;

    const template = document.getElementById(
      'timeline-item-template'
    ) as HTMLTemplateElement;

    const actionEl = template.content.firstElementChild?.cloneNode(
      true
    ) as HTMLLIElement;

    actionEl.id = `action-${actionContent.index}`;

    // Set the color of the arrow so it is visible which cursor
    // took the action.
    actionEl.style.setProperty('--cursor-color', colorForIndex(action.cursor));

    const keyEl = actionEl.querySelector('#timeline-item-key') as HTMLInputElement;

    const positionEl = actionEl.querySelector(
      '#timeline-item-position'
    ) as HTMLSpanElement;

    const delayEl = actionEl.querySelector(
      '#timeline-item-delay'
    ) as HTMLInputElement;

    delayEl.value = `${action.delay}`;

    if (action.type === 'keyboard') {
      positionEl.remove();

      const mouseIcon = actionEl.querySelector(
        '#timeline-item-mouse'
      ) as HTMLImageElement;
      mouseIcon.remove();

      keyEl.value = action.key === ' ' ? `' '` : action.key;
    } else {
      keyEl.remove();

      const keyboardIcon = actionEl.querySelector(
        '#timeline-item-keyboard'
      ) as HTMLImageElement;
      keyboardIcon.remove();

      positionEl.textContent = '' + action.position;
    }

    const deleteButton = actionEl.querySelector(
      '#timeline-item-delete'
    ) as HTMLButtonElement;

    deleteButton.onclick = () => {
      actionContent.remove();

      reInit();
    };

    if (action.type === 'keyboard') {
      keyEl.onchange = () => {
        console.log(keyEl.value);

        action.key = keyEl.value;
        
        reInit();
      };
    }

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

  timelineTotalTime.textContent = (total / 1000).toFixed(2);
}

function modalSubscriber(
  _viewChannel: ViewChannel<Modal, boolean>,
  event: ViewChannelEvent<Modal, boolean>
) {
  if (event.type === 'PRESENTED') {
    const template = document.getElementById(
      event.view.data.template
    ) as HTMLTemplateElement;

    const element = template.content.cloneNode(true) as HTMLDivElement;

    event.view.data.init(element);

    dialogContentEl.innerHTML = '';
    dialogContentEl.append(element);

    dialogEl.classList.remove('hidden');
    dialogEl.classList.add('flex', 'justify-center');
    dialogEl.showModal();

    dialogEl.oncancel = () => {
      event.view.dismiss(false);
    };
  }

  if (event.type === 'DISMISSED') {
    dialogEl.classList.remove('flex', 'justify-center');
    dialogEl.classList.add('hidden');
    dialogEl.close();
  }
}

cursors.subscribe(cursorsSubscriber);
typewriter.subscribe(typewriterSubscriber);
actions.subscribe(actionsSubscriber);
modalViewChannel.subscribe(modalSubscriber);

cursors.activateFirst();

addCursorButton.onclick = () => {
  const cursor = cursors.push(`Cursor #${typewriter.cursors.length + 1}`);
  cursor.activate();
};

playButton.onclick = () => {

  if (actions.isEmpty()) {
    return;
  } 

  animationInput.disabled = true;

  reInit();
};

let shiftPressed = false;
animationInput.onkeydown = (event) => {
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

animationInput.onkeyup = (event) => {
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

function keyForEvent(event: KeyboardEvent): string | false {
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
  if (fixedDelayInput.value) {
    return parseInt(fixedDelayInput.value, 10);
  }

  const delay = Date.now() - prevTime;

  prevTime = Date.now();

  return delay < 1000 ? delay : 50;
}

animationInput.onmouseup = () => {
  const cursor = cursors.lastActivatedContent?.index ?? 0;

  const position = animationInput.selectionStart ?? 0;

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
animationInput.onselect = () => {
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

  const start = animationInput.selectionStart ?? -1;
  const end = animationInput.selectionEnd ?? -1;

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

// Config

initialTextInput.onchange = () => {
  const text = initialTextInput.value;

  animationInput.value = text;
  animationInput.focus();

  config.text = text;

  maxPositionCursorEl.textContent = "" + text.length;

  config.cursors?.forEach((cursor) => {
    cursor.position = text.length;
  });

  reInit();

  // Trigger re-render so this can be seen.
  cursors.deactivateByIndex(0);
  cursors.activateByIndex(0);
};

fixedDelayInput.onchange = () => {
  const delay = parseInt(fixedDelayInput.value);

  actions.contents.forEach((action) => (action.value.delay = delay));
  actions.activateNext();

  reInit();
};

document.querySelectorAll('[name="repeat"]').forEach((element) => {
  const input = element as HTMLInputElement;
  
  input.onchange = () => {
    if (input.value === 'infinitely') {
      repeatConfig = true;
    } else if (input.value === 'never') {
      repeatConfig = false;
    } else {
      let value = parseInt(repeatTimeInput.value, 10);

      if (value < 0 || isNaN(value)) {
        value = 1;
      }

      repeatConfig = value;
    }

    showHideRepeat();
  }
});

repeatDelayInput.onchange = () => {
  let value = parseInt(repeatDelayInput.value, 10);

  if (value < 0 || isNaN(value)) {
    value = 1;
    repeatDelayInput.value = "1";
  }

  repeatDelayConfig = value;
};

autoplayInput.onchange = () => {
  autoplayConfig = autoplayInput.checked;
};

// Actions

resetButton.onclick = async () => {
  const view = modalViewChannel.present({
    data: {
      template: 'confirm-reset-modal',
      init: (element) => {
        const confirmButton = element.querySelector(
          '#reset-confirm'
        ) as HTMLButtonElement;
        confirmButton.onclick = () => {
          view.dismiss(true);
        };

        const cancelButton = element.querySelector(
          '#reset-cancel'
        ) as HTMLButtonElement;
        cancelButton.onclick = () => {
          view.dismiss(false);
        };
      },
    },
  });

  const result = await view.result;

  if (!result) {
    return;
  }

  repeatConfig = false;
  repeatDelayConfig = 0;
  autoplayConfig = true;

  config = {
    blinkAfter: 250,
    cursors: [{ position: 0, name: 'Cursor #1' }],
    actions: actions.contents.map((c) => c.value),
    repeat: false,
  };

  actions.initialize({});
  cursors.initialize({
    contents: ['Cursor #1'],
    activeIndexes: 0,
    isCircular: true,
  });

  fixedDelayInput.value = '';
  animationInput.value = '';

  reInit();
};

exportButton.onclick = () => {
  const view = modalViewChannel.present({
    data: {
      template: 'export-modal',
      init: (element) => {
        const codeEl = element.querySelector('#export-code') as HTMLPreElement;

        const copyButton = element.querySelector(
          '#export-copy'
        ) as HTMLButtonElement;

        if (actions.isEmpty()) {
          const message = document.createElement('p');
          message.textContent = 'No animation yet to export!';

          element.insertBefore(message, codeEl);

          codeEl.remove();
          copyButton.remove();
        } else {
          config.actions = actions.contents.map((c) => c.value);
          
          config.repeat = repeatConfig;
          config.repeatDelay = repeatDelayConfig;
          config.autoPlay = autoplayConfig;

          const code = JSON.stringify(config, null, 2);

          config.repeat = false;
          config.repeatDelay = undefined;
          config.autoPlay = undefined;

          codeEl.textContent = code;

          copyButton.onclick = async () => {
            await navigator.clipboard.writeText(code);

            copyButton.textContent = 'Copied!';

            window.setTimeout(() => {
              view.dismiss(true);
            }, 500);
          };
        }

        const cancelButton = element.querySelector(
          '#export-cancel'
        ) as HTMLButtonElement;
        cancelButton.onclick = () => {
          view.dismiss(false);
        };
      },
    },
  });
};

importButton.onclick = () => {
  const view = modalViewChannel.present({
    data: {
      template: 'import-modal',
      init: (element) => {
        const importInput =  element.querySelector(
          '#import-input'
        ) as HTMLInputElement; 

        const importButton = element.querySelector(
          '#import-import'
        ) as HTMLButtonElement;
        
        importButton.onclick = () => {
          const json = JSON.parse(importInput.value) as TypewriterConfig;

          config = json;
        
          // Read in thea actual values
          repeatConfig = config.repeat; 
          repeatDelayConfig = config.repeatDelay;
          autoplayConfig = config.autoPlay;

          // Set correctly for "preview";
          config.repeat = false;
          config.repeatDelay = undefined;
          config.autoPlay = undefined;

          // Set the fixed delay only when all delays are exactly the same.
          if (json.actions) {
            const firstDelay = json.actions[0].delay;
            const everyDelayTheSame = json.actions.every(a => a.delay === firstDelay);

            if (everyDelayTheSame) {
              fixedDelayInput.value = "" + firstDelay;
            }
          }

          actions.initialize({ contents: json.actions });
          cursors.initialize({
            contents: config.cursors ? config.cursors.map(c => c.name ?? '') : [],
            activeIndexes: 0,
            isCircular: true,
          });
        
          animationInput.value = '';

          reInit();

          view.dismiss(true);
        };

        const cancelButton = element.querySelector(
          '#import-cancel'
        ) as HTMLButtonElement;
        cancelButton.onclick = () => {
          view.dismiss(false);
        };
      },
    },
  });
};

// Utils

function colorForIndex(index: number): string {
  return colors[index % colors.length];
}

function reInit() {
  if (actions.isEmpty()) {
    animationInput.focus();
  } else {
    animationInput.disabled = true;
  }

  showHideRepeat();

  if (repeatConfig === true) {
    // @ts-expect-error this selects a input typecheckbox
    document.querySelectorAll('[name="repeat"]')[0].checked = true;
  } else if (repeatConfig === 0 || repeatConfig === false) {
    // @ts-expect-error this selects a input typecheckbox
    document.querySelectorAll('[name="repeat"]')[2].checked = true;
  } else if (typeof repeatConfig === 'number') {
    // @ts-expect-error this selects a input typecheckbox
    document.querySelectorAll('[name="repeat"]')[1].checked = true;
    repeatTimeInput.value = "" + repeatConfig;
  }

  initialTextInput.value = config.text ? "" + config.text : '';
  autoplayInput.checked = !!autoplayConfig;
  repeatDelayInput.value = "" + repeatDelayConfig;

  config.actions = actions.contents.map((c) => c.value);

  typewriter.initialize(config);
}

function showHideRepeat() {
  if (repeatConfig === false || repeatConfig === 1 || repeatConfig === undefined) {
    repeatDelayWrapperEl.classList.add('hidden');
  } else {
    repeatDelayWrapperEl.classList.remove('hidden');
  }
}

/*
  TODO:
  . word mode
  . Pause
  . Emoji picker
  . Dark mode
  . Mobile mode
  . Fix safari
  . Fix firefox

  Bugs:

  . blinking does not always work?
*/
