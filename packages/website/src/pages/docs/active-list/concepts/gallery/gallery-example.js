import { ActiveList } from '@uiloos/core';

const galleryEl = document.querySelector('.gallery-example');
const buttons = Array.from(galleryEl.querySelectorAll('button'));
const selectedEl = galleryEl.querySelector('.gallery-selected');

const config = {
  contents: buttons,
  active: buttons[0],
};

function subscriber(carousel) {
  const activeButton = carousel.lastActivated;

  const pictureEl = activeButton.querySelector('picture');

  selectedEl.innerHTML = '';
  selectedEl.append(pictureEl.cloneNode(true));
}

const carousel = new ActiveList(config, subscriber);

buttons.forEach((button) => {
  button.onclick = () => {
    carousel.activate(button);
  };
});
