import { ActiveList } from '@uiloos/core';

const activeExampleSwitchClasses = ['text-purple-800', 'border-purple-500'];

document.querySelectorAll('.js-example-switcher').forEach((exampleSwitchEl) => {
  const buttons = exampleSwitchEl.querySelectorAll('button');
  const examples = exampleSwitchEl.querySelectorAll('div.example');

  const exampleSwitcher = new ActiveList(
    {
      contents: ['JavaScript', 'HTML', 'CSS'],
      active: ['JavaScript'],
    },
    subscriber
  );

  function subscriber(activeList) {
    buttons.forEach((button, index) => {
      if (index === activeList.lastActivatedIndex) {
        button.classList.add(...activeExampleSwitchClasses);
      } else {
        button.classList.remove(...activeExampleSwitchClasses);
      }
    });

    examples.forEach((example, index) => {
      if (index === activeList.lastActivatedIndex) {
        example.classList.remove('visually-hidden');
      } else {
        example.classList.add('visually-hidden');
      }
    });
  }

  buttons.forEach((button, index) => {
    button.onclick = () => exampleSwitcher.activateByIndex(index);
  });
});

// Include all examples so they will actually work on the site.
import '../pages/docs/active-list/concepts/tabs/tabs-example';
import '../pages/docs/active-list/concepts/segment/segment-example';
import '../pages/docs/active-list/concepts/accordion/accordion-example';
import '../pages/docs/active-list/concepts/carousel/carousel-example';
import '../pages/docs/active-list/concepts/sortable/sortable-example';
