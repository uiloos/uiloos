import '../styles/main.scss';

// Import Alpine.js
import Alpine from 'alpinejs';

// Import aos
import AOS from 'aos';

// Initialize Alpine
window.Alpine = Alpine;
Alpine.start();

AOS.init({
  once: true,
  disable: 'phone',
  duration: 700,
  easing: 'ease-out-cubic',
});

// Code switch examples

import { ActiveList } from '@uiloos/core';

const activeCodeSwitchClasses = ['text-purple-800', 'border-purple-500'];
const preferredLanguageKey = 'PREFERRED_LANGUAGE';

const codeSwitcher = new ActiveList({
  contents: ["js", 'ts'],
  active: [localStorage.getItem(preferredLanguageKey) || 'ts']
}, subscriber);

function subscriber(activeList) {
  localStorage.setItem(preferredLanguageKey, activeList.lastActivated);

  document.querySelectorAll('.js-code-switch').forEach((codeswitch) => {
    const buttons = codeswitch.querySelectorAll('li');

    buttons.forEach((button, index) => {
      if (index === activeList.lastActivatedIndex) {
        button.classList.add(...activeCodeSwitchClasses);  
      } else {
        button.classList.remove(...activeCodeSwitchClasses);  
      }
    });

    const examples = codeswitch.querySelectorAll('div');

    examples.forEach((example, index) => {
      if (index === activeList.lastActivatedIndex) {
        example.classList.remove('visually-hidden');
      } else {
        example.classList.add('visually-hidden');
      }
    });
  });
}

document.querySelectorAll('.js-code-switch').forEach((codeswitch) => {
  const buttons = codeswitch.querySelectorAll('li');

  buttons.forEach((button, index) => {
    button.onclick = () => codeSwitcher.activateByIndex(index);
  });
});
