const { ActiveList, createActiveListSubscriber } = require('@uiloos/core');

const galleryEl = document.querySelector('.image-gallery');
const buttons = Array.from(galleryEl.querySelectorAll('.gallery-items button'));
const dialogEl = galleryEl.querySelector('.gallery-dialog');
const activeImageEl = galleryEl.querySelector('.dialog-img-container');

const FADE_ANIMATION_DURATION = 400;

const gallery = new ActiveList(
  {
    contents: buttons,
    isCircular: true,
  },
  createActiveListSubscriber({
    onActivated(event, gallery) {
      const button = gallery.lastActivated;

      const imgEl = button.querySelector('picture');

      activeImageEl.innerHTML = '';

      activeImageEl.append(imgEl.cloneNode(true));
    },
  })
);

buttons.forEach((button) => {
  button.onclick = () => {
    gallery.activate(button);

    dialogEl.addEventListener('keyup', keyup);

    dialogEl.showModal();
  };
});

galleryEl.querySelector('.next').onclick = () => {
  gallery.activateNext();
};

galleryEl.querySelector('.previous').onclick = () => {
  gallery.activatePrevious();
};

// Close dialog when backdrop is clicked
dialogEl.onclick = (event) => {
  if (event.target.nodeName === 'DIALOG') {
    dialogEl.classList.add('out');

    setTimeout(() => {
      dialogEl.classList.remove('out');

      dialogEl.close();
    }, FADE_ANIMATION_DURATION);
  }
};

dialogEl.onclose = () => {
  dialogEl.removeEventListener('keyup', keyup);
};

function keyup(event) {
  if (event.key === 'ArrowLeft' || event.key === 'a') {
    event.preventDefault();
    
    gallery.activatePrevious();
  } else if (event.key === 'ArrowRight' || event.key === 'd') {
    event.preventDefault();

    gallery.activateNext();
  }
}

// Disable the carousel when users touches the carousel

let touchXStart = 0;
const SWIPE_DISTANCE = 100;

// Disable the carousel when users touches the carousel
dialogEl.addEventListener('touchstart', (event) => {
  touchXStart = event.changedTouches[0].screenX;
});

dialogEl.addEventListener('touchmove', (event) => {
  event.preventDefault();

  const touchXCurrent = event.changedTouches[0].screenX;

  const distance = touchXCurrent - touchXStart;

  if (distance > SWIPE_DISTANCE) {
    gallery.activateNext();
  } else  if (distance < -SWIPE_DISTANCE) {
    gallery.activatePrevious();
  }
});