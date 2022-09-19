import '../styles/main.scss';

import Alpine from 'alpinejs';
import { ActiveList } from '@uiloos/core';

// Initialize Alpine
window.Alpine = Alpine;
Alpine.start();

// ToC highlighter

const docTocEl = document.querySelector('nav[role="doc-toc"]');

if (docTocEl && !docTocEl.hasAttribute('data-no-highlight')) {
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
    liEl.innerHTML = `
      <a href="${data.link}">
        <span class="flex justify-between">
          <span class="text-ellipsis overflow-clip ${data.type === 'API' ? 'high underline' : 'font-bold' }">${data.name}</span>
          <span class="ml-2 font-mono">${data.type}</span>
        </span>
        <p class="mt-2 text-lg mb-0">${data.description}</p>
      </a>
    `;

    searchModalResults.append(liEl);
  });
};
