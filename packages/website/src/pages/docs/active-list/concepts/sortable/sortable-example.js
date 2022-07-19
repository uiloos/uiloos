import { ActiveList } from '@uiloos/core';

const exampleEl = document.querySelector('.sortable-example');
const sortableEl = exampleEl.querySelector('.sortable');
const sortableEls = Array.from(
  exampleEl.querySelectorAll('.sortable-item')
);
const noFinishedEl = exampleEl.querySelector('#no-finished');

const config = {
  contents: sortableEls,
  maxActivationLimit: false
};

function subscriber(sortable, event) {
  if (event.type === 'INITIALIZED') {
    return;
  }

  if (event.type === 'MOVED' || event.type === 'SWAPPED') {
    sortableEl.textContent = '';

    sortable.contents.forEach((content) => {
      sortableEl.append(content.value);
    });
  } else {
    sortable.contents.forEach((content) => {
      const todoEl = content.value;

      if (content.isActive) {
        todoEl.classList.add('done');
      } else {
        todoEl.classList.remove('done');
      }

      noFinishedEl.textContent = sortable.activeContents.length;
    });
  }
}

const sortable = new ActiveList(config, subscriber);

let draggedElement = null;

sortableEls.forEach((sortableEl) => {
  sortableEl.draggable = true;

  sortableEl.ondragstart = (event) => {
    event.dataTransfer.effectAllowed = 'move';

    draggedElement = sortableEl;
  };

  sortableEl.ondragover = (event) => {
    event.preventDefault();

    const toIndex = sortable.getIndex(sortableEl);
    sortable.move(draggedElement, toIndex);
  };

  sortableEl.ondrop = (event) => {
    event.preventDefault();
  };

  // Make reorder buttons work
  const [upEl, downEl] = sortableEl.querySelectorAll('button');

  upEl.onclick = () => {
    const index = sortable.getIndex(sortableEl);
    console.log(index);

    sortable.contents[index].swapWithPrevious();
  };

  downEl.onclick = () => {
    const index = sortable.getIndex(sortableEl);

    sortable.contents[index].swapWithNext();
  };

  // Handle the checked logic
  const inputEl = sortableEl.querySelector('input');
  inputEl.onchange = (event) => {
    if (event.target.checked) {
      sortable.activate(sortableEl);
    } else {
      sortable.deactivate(sortableEl);
    }
  };
});
