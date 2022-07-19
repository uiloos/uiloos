import { ActiveList } from '@uiloos/core';

const tabsEl = document.querySelector('.tabs-example');
const buttonsEl = tabsEl.querySelectorAll('.tab');
const contentsEl = tabsEl.querySelectorAll('.tab-content');

const config = {
  contents: ['all', 'friends', 'active'],
  active: ['all']
};

function subscriber(tabs) {
  buttonsEl.forEach((buttonEl, index) => {
    if (index === tabs.lastActivatedIndex) {
      buttonEl.classList.add('active');
    } else {
      buttonEl.classList.remove('active');
    }
  });

  contentsEl.forEach((contentEl, index) => {
    if (index === tabs.lastActivatedIndex) {
      contentEl.classList.remove('visually-hidden');
      contentEl.ariaHidden = false;
    } else {
      contentEl.classList.add('visually-hidden');
      contentEl.ariaHidden = true;
    }
  });
}

const tabs = new ActiveList(config, subscriber);

buttonsEl.forEach((buttonEl, index) => {
  buttonEl.onclick = () => tabs.activateByIndex(index);
});
