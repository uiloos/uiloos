import { ViewChannel } from "@uiloos/core";

const flashMessageChannel = new ViewChannel(
  {},
  subscriber
);

const ANIMATION_DURATION = 200;

document.documentElement.style.setProperty(
  '--flash-message-animation-duration',
  `${ANIMATION_DURATION}ms`
);

function subscriber(viewChannel, event) {
  const flashMessagesContainerEl = document.getElementById(
    'flash-messages-container'
  );

  if (event.type === 'PRESENTED') {
    const view = event.view;
    const flashMessage = view.data;

    const zIndex = viewChannel.views.length - view.index;

    const flashMessageEl = document.createElement('div');
    flashMessageEl.id = flashMessage.id;

    flashMessageEl.className = `
      flash-message flash-message-${flashMessage.type}
    `;
    flashMessageEl.style.zIndex = zIndex;

    flashMessageEl.onclick = () => view.dismiss();
    flashMessageEl.onmouseover = () => view.pause();
    flashMessageEl.onmouseleave = () => view.play();

    flashMessageEl.innerHTML = `
      <div class="flash-message-row">
        <div class="flash-message-content">
          <span class="flash-message-icon">
            ${typeToSymbol(flashMessage.type)}
          </span>
          <p>${flashMessage.text}</p>
        </div>
        <span class="flash-message-close">𐄂</span>
      </div>

      <div 
        id="${flashMessage.id}-progress" 
        class="
          flash-message-progress 
          flash-message-progress-${flashMessage.type}
        "
      ></div>
    `;

    flashMessagesContainerEl.append(flashMessageEl);

    const progressEl = document
      .getElementById(`${flashMessage.id}-progress`);

    progressEl.style.animation = `
      progress ${view.autoDismiss.duration}ms ease-out
    `;

    return;
  }

  if (event.type === 'DISMISSED') {
    const view = event.view;
    const flash = view.data;

    const flashMessageEl = document.getElementById(flash.id);

    flashMessageEl.classList.add('flash-message-exit');

    flashMessageEl.onanimationend = (event) => {
      if (event.animationName === 'slide-out') {
        flashMessageEl.remove();
      }
    };

    return;
  }

  if (event.type === 'AUTO_DISMISS_PLAYING') {
    const progressEl = document.getElementById(
      `${event.view.data.id}-progress`
    );
    progressEl.style.animationPlayState = 'running';

    return;
  }

  if (event.type === 'AUTO_DISMISS_PAUSED') {
    const progressEl = document.getElementById(
      `${event.view.data.id}-progress`
    );
    progressEl.style.animationPlayState = 'paused';

    return;
  }
}

export function infoFlashMessage(text) {
  flashMessageChannel.present({
    data: {
      id: Math.random(),
      text,
      type: 'info'
    },
    priority: 4,
    autoDismiss: {
      duration: 2000,
      result: undefined
    }
  });
}

export function warningFlashMessage(text) {
  flashMessageChannel.present({
    data: {
      id: Math.random(),
      text,
      type: 'warning'
    },
    priority: 1,
    autoDismiss: {
      duration: 3000,
      result: undefined
    }
  });
}

export function errorFlashMessage(text) {
  flashMessageChannel.present({
    data: {
      id: Math.random(),
      text,
      type: 'error'
    },
    priority: 0,
    autoDismiss: {
      duration: 5000,
      result: undefined
    }
  });
}

export function successFlashMessage(text) {
  flashMessageChannel.present({
    data: {
      id: Math.random(),
      text,
      type: 'success'
    },
    priority: 2,
    autoDismiss: {
      duration: 2000,
      result: undefined
    }
  });
}

// UTILS

function typeToSymbol(type) {
  switch (type) {
    case 'info':
      return 'ⓘ';

    case 'warning':
      return '⚠';

    case 'error':
      return '☠';

    case 'success':
      return '✓';

    default:
      return 'unknown';
  }
}

// Button events

document.getElementById('flashInfo').onclick = () => {
  infoFlashMessage("An info message");
};

document.getElementById('flashSuccess').onclick = () => {
  successFlashMessage("A success message");
};

document.getElementById('flashWarning').onclick = () => {
  warningFlashMessage("A warning message");
};

document.getElementById('flashError').onclick = () => {
  errorFlashMessage("An error message");
};