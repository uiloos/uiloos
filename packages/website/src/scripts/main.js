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

const codeSwitcher = new ActiveList(
  {
    contents: ['js', 'ts'],
    active: [localStorage.getItem(preferredLanguageKey) || 'ts'],
  },
  subscriber
);

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

// ToC highlighter

const docTocEl = document.querySelector('nav[role="doc-toc"]');

if (!docTocEl.hasAttribute('data-no-highlight')) {
  // Keeps track of the current <a> which is highlighted
  let activeAEl = document.querySelector('nav[role="doc-toc"] a');
  const activeClasses = ['font-medium', 'decoration-4'];
  activeAEl.classList.add(...activeClasses);

  const observer = new IntersectionObserver((entries) => {
    const entry = entries.find((entry) => entry.intersectionRatio > 0);

    if (entry) {
      // Get the <a> which belongs to this <h2>
      const aEl = document.querySelector(`a[href='#${entry.target.id}']`);

      // If it is in the view
      if (entry.intersectionRatio > 0) {
        // Remove from previous active <a>
        activeAEl.classList.remove(...activeClasses);

        // Now change it
        activeAEl = aEl;

        // And make it active
        activeAEl.classList.add(...activeClasses);
      }
    }
  });

  // For each h2 in the document observe when it is in view.
  document.querySelectorAll('h2').forEach((e) => observer.observe(e));
}
