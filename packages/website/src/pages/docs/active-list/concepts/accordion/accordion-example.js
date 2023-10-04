import { ActiveList } from '@uiloos/core';

const accordionEl = document.querySelector('.accordion-example');
const detailsEl = Array.from(accordionEl.querySelectorAll('details'));

const config = {
  contents: detailsEl,
  active: detailsEl.filter((detail) => detail.getAttribute('open') === 'open'),
  maxActivationLimit: 1,
};

function subscriber(accordion) {
  accordion.contents.forEach((content) => {
    const detailEl = content.value;
    detailEl.open = content.isActive;
  });
}

const accordion = new ActiveList(config, subscriber);

detailsEl.forEach((detailEl) => {
  detailEl.onclick = (event) => {
    // Prevent default opening of details subscriber handle this. 
    event.preventDefault();

    accordion.activate(detailEl);
  };
});
