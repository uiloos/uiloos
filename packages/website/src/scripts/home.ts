import {
  ActiveList,
  ActiveListConfig,
  ViewChannel,
  ViewChannelEvent,
  typewriterFromSentences,
} from '@uiloos/core';

document.addEventListener('DOMContentLoaded', function () {
  initCarousel();
  initTypewriter();
  initViewChannel();
});

function initCarousel() {
  const carouselCurrentActive = document.getElementById(
    'carousel-current-active'
  ) as HTMLLIElement;

  const previousButton = document.getElementById(
    'carousel-prev'
  ) as HTMLButtonElement;
  const nextButton = document.getElementById(
    'carousel-next'
  ) as HTMLButtonElement;

  const slides = [0, 1, 2, 3, 4];

  let previouslyActive: number | null = 0;

  const config: ActiveListConfig<number> = {
    contents: slides,
    activeIndexes: 0,
    autoPlay: { duration: 3000, stopsOnUserInteraction: true },
    isCircular: true,
    cooldown: 500,
  };

  const carousel = new ActiveList(config, (carousel, event) => {
    if (
      event.type === 'AUTO_PLAY_PAUSED' ||
      event.type === 'AUTO_PLAY_PLAYING'
    ) {
      const button = document.getElementById(
        `carousel-button-${carousel.lastActivated}`
      ) as HTMLButtonElement;

      if (carousel.autoPlay.isPlaying) {
        button.style.animationPlayState = 'running';
      } else {
        button.style.animationPlayState = 'paused';
      }

      return;
    }

    if (
      event.type === 'COOLDOWN_ENDED' ||
      event.type === 'COOLDOWN_STARTED' ||
      event.type === 'AUTO_PLAY_STOPPED'
    ) {
      return;
    }

    if (!carousel.isCircular) {
      if (carousel.lastActivatedContent?.isFirst) {
        previousButton.classList.add('opacity-50', 'cursor-not-allowed');
        previousButton.ariaDisabled = 'true';
      } else {
        previousButton.classList.remove('opacity-50', 'cursor-not-allowed');
        previousButton.ariaDisabled = 'false';
      }

      if (carousel.lastActivatedContent?.isLast) {
        nextButton.classList.add('opacity-50', 'cursor-not-allowed');
        nextButton.ariaDisabled = 'true';
      } else {
        nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        nextButton.ariaDisabled = 'false';
      }
    }

    if (event.type === 'INITIALIZED') {
      const button = document.getElementById(
        `carousel-button-${carousel.lastActivated}`
      ) as HTMLButtonElement;
      
      button.style.animation = `progress ${carousel.autoPlay.duration}ms linear`;
      return;
    }

    carousel.contents.forEach((content) => {
      const slide = document.getElementById(
        `carousel-slide-${content.value}`
      ) as HTMLLIElement;

      const button = document.getElementById(
        `carousel-button-${content.value}`
      ) as HTMLButtonElement;

      slide.className = 'absolute';

      if (content.isActive) {
        slide.classList.add('visible');
        slide.ariaHidden = 'false';

        requestAnimationFrame(() => {
          if (carousel.direction === 'right') {
            slide.classList.add('translate-x-full', 'duration-0');
          } else {
            slide.classList.add('-translate-x-full', 'duration-0');
          }

          requestAnimationFrame(() => {
            slide.classList.remove(
              '-translate-x-full',
              'translate-x-full',
              'duration-0'
            );
            slide.classList.add('duration-500', 'translate-x-0');

            setTimeout(() => {
              slide.classList.remove('translate-x-0', 'duration-500');
            }, 500);
          });
        });

        button.classList.add('carousel-button-animation');
        button.classList.remove('bg-gray-600');
        button.style.animation = `progress ${carousel.autoPlay.duration}ms linear`;

        if (button.lastElementChild) {
          button.lastElementChild.classList.remove('hidden');
        }
      } else if (content.value === previouslyActive) {
        slide.classList.add('visible');
        slide.ariaHidden = 'true';

        setTimeout(() => {
          if (carousel.direction === 'right') {
            slide.classList.add('duration-500', '-translate-x-full');
          } else {
            slide.classList.add('duration-500', 'translate-x-full');
          }

          setTimeout(() => {
            slide.classList.remove(
              '-translate-x-full',
              'translate-x-full',
              'duration-500',
              'visible'
            );
            slide.classList.add('invisible');
          }, 500);
        }, 10);
        button.classList.add('bg-gray-600');
        button.classList.remove('carousel-button-animation');
        button.style.animation = '';
      } else {
        slide.classList.add('invisible');
        slide.ariaHidden = 'true';

        button.classList.add('bg-gray-600');
        button.classList.remove('carousel-button-animation');
        button.style.animation = '';

        if (button.lastElementChild) {
          button.lastElementChild.classList.remove('hidden');
        }
      }
    });

    carouselCurrentActive.textContent = '' + carousel.lastActivatedIndex + 1;

    previouslyActive = carousel.lastActivated;
    return;
  });

  nextButton.onclick = () => {
    carousel.activateNext();
  };

  previousButton.onclick = () => {
    carousel.activatePrevious();
  };

  const stopButton = document.getElementById(
    'carousel-stop'
  ) as HTMLButtonElement;
  stopButton.onclick = () => {
    carousel.stop();
  };

  slides.forEach((slide) => {
    const link = document.getElementById(`carousel-button-${slide}`);
    if (link) {
      link.onclick = () => {
        carousel.activate(slide);
      };
    }
  });

  const carouselEl = document.getElementById('carousel') as HTMLDivElement;

  carouselEl.addEventListener('mouseenter', () => {
    carousel.pause();
  });

  carouselEl.addEventListener('mouseleave', () => {
    if (!carousel.autoPlay.hasBeenStoppedBefore) {
      carousel.play();
    }
  });

  const durationSelect = document.getElementById(
    'carousel-duration'
  ) as HTMLSelectElement;

  durationSelect.onchange = (event) => {
    // @ts-expect-error Is always a value
    const duration = parseInt(event.target.value, 10);

    // @ts-expect-error It has an autoplay
    config.autoPlay.duration = duration;
    config.activeIndexes = [...carousel.activeIndexes];

    carousel.initialize(config);
  };

  const isCircularSelect = document.getElementById(
    'carousel-is-circular'
  ) as HTMLSelectElement;

  isCircularSelect.onchange = (event) => {
    // @ts-expect-error either "true" or "false"
    config.isCircular = event.target.value === 'true';
    config.activeIndexes = [...carousel.activeIndexes];

    carousel.initialize(config);
  };

  const stopsOnUserInteractionSelect = document.getElementById(
    'carousel-duration'
  ) as HTMLSelectElement;

  stopsOnUserInteractionSelect.onchange = (event) => {
    // @ts-expect-error either "true" or "false"
    config.autoPlay.stopsOnUserInteraction = event.target.value === 'true';
    config.activeIndexes = [...carousel.activeIndexes];

    carousel.initialize(config);
  };
}

function initTypewriter() {
  const typewriterEl = document.getElementById(
    'home-typewriter'
  ) as HTMLHeadingElement;

  typewriterFromSentences(
    {
      sentences: [
        'With uiloos you can build self playing carousels',
        'With uiloos you can build sortable lists',
        'With uiloos you can build awaitable modals and dialogs',
        'With uiloos you can build pauseable flash messages',
        'With uiloos you can build notification centers with priority messages',
        'With uiloos you can build whimsical typewriter animations',
      ],
      repeat: true,
      repeatDelay: 2000,
      text: 'With uiloos you can build whimsical typewriter animations',
    },
    (typewriter) => {
      typewriterEl.textContent = typewriter.text;

      const cursorEl = document.createElement('span');
      cursorEl.id = 'home-typewriter-cursor';
      cursorEl.className = 'border-purple-700';
      if (typewriter.cursors[0].isBlinking) {
        cursorEl.classList.add('blinking');
      }
      typewriterEl.append(cursorEl);
    }
  );
}

type FlashMessageType = 'info' | 'success' | 'error' | 'warning';

type FlashMessage = {
  id: number;
  type: FlashMessageType;
  text: string;
};

function initViewChannel() {
  const prioritySelect = document.getElementById(
    'flashmessage-priority'
  ) as HTMLSelectElement;

  const durationSelect = document.getElementById(
    'flashmessage-duration'
  ) as HTMLSelectElement;

  const flashMessageChannel = new ViewChannel<FlashMessage>({}, subscriber);

  const ANIMATION_DURATION = 200;

  document.documentElement.style.setProperty(
    '--flash-message-animation-duration',
    `${ANIMATION_DURATION}ms`
  );

  function subscriber(
    viewChannel: ViewChannel<FlashMessage>,
    event: ViewChannelEvent<FlashMessage, void>
  ) {
    const flashMessagesContainerEl = document.getElementById(
      'flash-messages-container'
    ) as HTMLDivElement;

    if (event.type === 'PRESENTED') {
      const view = event.view;
      const flashMessage = view.data;

      const zIndex = viewChannel.views.length - view.index;

      const flashMessageEl = document.createElement('div');
      flashMessageEl.id = `${flashMessage.id}`;

      flashMessageEl.className = `
        flash-message flash-message-${flashMessage.type}
      `;
      flashMessageEl.style.zIndex = `${zIndex}`;

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

      // Insert before the current item holding the
      // index, if that index does not exist provide
      // `null` so it is appended to the list.
      flashMessagesContainerEl.insertBefore(
        flashMessageEl,
        flashMessagesContainerEl.children[view.index] ?? null
      );

      const progressEl = document.getElementById(
        `${flashMessage.id}-progress`
      ) as HTMLDivElement;

      progressEl.style.animation = `
        progress ${view.autoDismiss.duration}ms ease-out
      `;

      return;
    }

    if (event.type === 'DISMISSED') {
      const view = event.view;
      const flash = view.data;

      const flashMessageEl = document.getElementById(
        `${flash.id}`
      ) as HTMLDivElement;

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
      ) as HTMLDivElement;
      progressEl.style.animationPlayState = 'running';

      return;
    }

    if (event.type === 'AUTO_DISMISS_PAUSED') {
      const progressEl = document.getElementById(
        `${event.view.data.id}-progress`
      ) as HTMLDivElement;
      progressEl.style.animationPlayState = 'paused';

      return;
    }
  }

  function infoFlashMessage(text: string) {
    flashMessageChannel.present({
      data: {
        id: Math.random(),
        text,
        type: 'info',
      },
      priority: parseInt(prioritySelect.value, 10),
      autoDismiss: {
        duration: parseInt(durationSelect.value, 10),
        result: undefined,
      },
    });
  }

  function warningFlashMessage(text: string) {
    flashMessageChannel.present({
      data: {
        id: Math.random(),
        text,
        type: 'warning',
      },
      priority: 3,
      autoDismiss: {
        duration: 3000,
        result: undefined,
      },
    });
  }

  function errorFlashMessage(text: string) {
    flashMessageChannel.present({
      data: {
        id: Math.random(),
        text,
        type: 'error',
      },
      priority: 2,
      autoDismiss: {
        duration: 5000,
        result: undefined,
      },
    });
  }

  function successFlashMessage(text: string) {
    flashMessageChannel.present({
      data: {
        id: Math.random(),
        text,
        type: 'success',
      },
      priority: 4,
      autoDismiss: {
        duration: 2000,
        result: undefined,
      },
    });
  }

  // UTILS

  function typeToSymbol(type: FlashMessageType): string {
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

  const infoButton = document.getElementById('flashInfo') as HTMLButtonElement;
  const successButton = document.getElementById(
    'flashSuccess'
  ) as HTMLButtonElement;
  const warningButton = document.getElementById(
    'flashWarning'
  ) as HTMLButtonElement;
  const errorButton = document.getElementById(
    'flashError'
  ) as HTMLButtonElement;

  infoButton.onclick = () => {
    infoFlashMessage('An info message');
  };

  successButton.onclick = () => {
    successFlashMessage('A success message');
  };

  warningButton.onclick = () => {
    warningFlashMessage('A warning message');
  };

  errorButton.onclick = () => {
    errorFlashMessage('An error message');
  };
}
