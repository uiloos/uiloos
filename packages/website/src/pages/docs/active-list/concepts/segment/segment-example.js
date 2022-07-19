import { ActiveList } from '@uiloos/core';

const segmentEl = document.querySelector('.segment-example');
const buttonsEl = Array.from(
  segmentEl.querySelectorAll('button')
);

const config = {
  contents: buttonsEl,
  active: buttonsEl.filter(
    (b) => b.classList.contains('active')
  ),
};

function subscriber(segmentedButton) {
  segmentedButton.contents.forEach((content) => {
    const buttonEl = content.value;

    if (content.isActive) {
      buttonEl.classList.add('active');
    } else {
      buttonEl.classList.remove('active');
    }
  });
}

const segmentedButton = new ActiveList(config, subscriber);

buttonsEl.forEach((buttonEl) => {
  const actualOnClick = buttonEl.onclick;

  buttonEl.onclick = (event) => {
    segmentedButton.activate(buttonEl);
    actualOnClick(event);
  };
});
