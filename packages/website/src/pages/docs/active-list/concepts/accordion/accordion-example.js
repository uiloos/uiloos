import { ActiveList } from '@uiloos/core';

const accordionEl = document.querySelector('.accordion-example');
const detailsEl = Array.from(
  accordionEl.querySelectorAll('details')
);
const summariesEl = accordionEl.querySelectorAll('summary');

console.log(summariesEl);

const config = {
  contents: detailsEl,
  active: detailsEl.filter(
    (detail) => detail.getAttribute('open') === 'open'
  ),
  maxActivationLimit: 1
};

function subscriber(accordion) {
  accordion.contents.forEach((content) => {
    const detailEl = content.value;

    if (!content.isActive) {
      detailEl.open = false;
    }
  });
}

const accordion = new ActiveList(config, subscriber);

summariesEl.forEach((summaryEl, index) => {
  summaryEl.onclick = (event) => {
    accordion.activateByIndex(index);
  };
});
