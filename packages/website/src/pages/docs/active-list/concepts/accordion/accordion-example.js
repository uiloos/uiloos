import { ActiveList } from '@uiloos/core';

const segmentEl = document.querySelector('.accordion-example');
const itemsEl = Array.from(
  segmentEl.querySelectorAll('.accordion-item')
);
const titlesEl = segmentEl.querySelectorAll('.accordion-title');

const config = {
  contents: itemsEl,
  active: itemsEl.filter(
    (i) => i.classList.contains('opened')
  ),
  maxActivationLimit: false
};

function subscriber(accordion) {
  accordion.contents.forEach((content) => {
    const itemEl = content.value;

    const buttonEl = itemEl.querySelector('button');

    if (content.isActive) {
      itemEl.classList.add('opened');
      itemEl.classList.remove('closed');

      buttonEl.textContent = '-';
    } else {
      itemEl.classList.add('closed');
      itemEl.classList.remove('opened');

      buttonEl.textContent = '+';
    }
    
    const pEl = itemEl.querySelector('p');
    pEl.ariaHidden = !content.isActive;
  });
}

const accordion = new ActiveList(config, subscriber);

titlesEl.forEach((titleEl, index) => {
  titleEl.onclick = () => {
    accordion.contents[index].toggle();
  };
});
