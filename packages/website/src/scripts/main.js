import '../styles/main.scss';

import Alpine from 'alpinejs';
import { ActiveList } from '@uiloos/core';

// Initialize Alpine
window.Alpine = Alpine;
Alpine.start();

// ToC highlighter

const docTocEl = document.querySelector('nav[role="doc-toc"]');

if (docTocEl && !docTocEl.hasAttribute('data-no-highlight')) {
  // The classes to apply when the <a> should become highlighted.
  const activeClasses = ['font-medium', 'decoration-4'];

  // Keeps track of the current <a> which is highlighted
  let activeAEl = null;

  // Reference to all <h2> elements which
  const h2Els = Array.from(document.querySelectorAll('article h2'));

  window.addEventListener('scroll', highlightClosest, { passive: true });

  highlightClosest();

  function highlightClosest() {
    // Find the closest <h2> element to the users current scroll position.
    const closestH2el = h2Els.reduce((closestEl, h2El) => {
      // The bounding rect top is a number which is relative to the
      // current position of the Y scroll position. This means that
      // top can also be a negative number. The closer to zero the
      // absolute value of top is the closer the element is to the
      // user on the screen.
      const closestElTop = Math.abs(closestEl.getBoundingClientRect().top);
      const h2ElTop = Math.abs(h2El.getBoundingClientRect().top);

      return closestElTop < h2ElTop ? closestEl : h2El;
    });

    if (activeAEl) {
      // First remove the active classes from the old active element.
      activeAEl.classList.remove(...activeClasses);
    }

    // Find the closest <a> element the <h2> element links to.
    const aEl = document.querySelector(`a[href='#${closestH2el.id}']`);

    // Now activate it.
    aEl.classList.add(...activeClasses);

    // Now set it for the next iteration.
    activeAEl = aEl;
  }
}

// Switcher

const activeExampleSwitchClasses = ['text-purple-500', 'border-purple-500'];

document.querySelectorAll('.js-example-switcher').forEach((exampleSwitchEl) => {
  const buttons = exampleSwitchEl.querySelectorAll('button');
  const examples = exampleSwitchEl.querySelectorAll('div.example');

  const exampleSwitcher = new ActiveList(
    {
      contents: buttons,
      active: buttons[0],
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

// Dark mode toggle

document.getElementById('darkModeToggle').onclick = () => {
  const isDark = document.documentElement.classList.contains('dark');

  document.documentElement.classList.toggle('dark');

  localStorage.theme = isDark ? 'light' : 'dark';
};

// Search modal
const searchModal = document.getElementById('searchModal');
const searchModalBody = document.getElementById('searchModalBody');
const searchModalResults = document.getElementById('searchModalResults');
const searchInput = document.getElementById('searchInput');

// Load the search data index.
let searchData = [];
fetch('/search/data.json')
  .then(async (result) => {
    return result.json();
  })
  .then((data) => {
    searchData = data;
  });

document.addEventListener('keydown', searchModalListener, { passive: true });

function searchModalListener(event) {
  if (event.key === 'k' && (event.metaKey || event.ctrKey)) {
    toggleSearch();
  } else if (event.key === 'Escape') {
    searchModal.classList.add('hidden');
  }
}

document.getElementById('searchToggle').onclick = toggleSearch;

searchModal.onclick = (event) => {
  if (!searchModalBody.contains(event.target)) {
    toggleSearch();
  }
};

function toggleSearch() {
  searchModal.classList.toggle('hidden');

  if (!searchModal.classList.contains('hidden')) {
    searchInput.focus();
  }
}

// Filter search index based on query
searchInput.onkeyup = (event) => {
  searchModalResults.innerHTML = '';

  const query = event.target.value.toLowerCase();

  const filtered = searchData.filter((data) => {
    const haystack = (data.name + ' ' + data.description).toLowerCase();

    return haystack.includes(query);
  });

  filtered.forEach((data) => {
    const liEl = document.createElement('li');
    liEl.className = 'p-4 border-b-2';

    let html = `
    <a href="${data.link}">
      <span class="flex justify-between">
        <span class="text-ellipsis overflow-clip ${
          data.type === 'API' ? 'high underline' : 'font-bold'
        }">${data.name}</span>
        <span class="ml-2 font-mono">${data.type}</span>
      </span>
      <p class="mt-2 text-lg mb-0">${data.description}</p>
    </a>
  `;

    if (data.package) {
      html += `<span class="inline-block mt-4 high mb-0 text-sm">${data.package}</span>`;
    }

    html += '</a>';

    liEl.innerHTML = html;

    // Edgecase: when a user searches clicks on a link he is already
    // on the modal should still close.
    liEl.onclick = toggleSearch;

    searchModalResults.append(liEl);
  });
};
