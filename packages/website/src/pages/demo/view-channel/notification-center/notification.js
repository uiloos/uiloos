import { ViewChannel, createViewChannelSubscriber } from '@uiloos/core';

const notificationCenterEl = document.querySelector('.notification-center');

const mailGroupEl = notificationCenterEl.querySelector('.mail');
const chatGroupEl = notificationCenterEl.querySelector('.chat');
const calendarGroupEl = notificationCenterEl.querySelector('.calendar');

const ANIMATION_DURATION = 200;

// 2000-01-01
export const isoFormatter = new Intl.DateTimeFormat('fr-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const notificationCenter = new ViewChannel(
  {},
  createViewChannelSubscriber({
    onPresented(event) {
      const view = event.view;

      const groupEl = getGroupEl(view.data.application);

      const notificationEl = document.createElement('li');
      notificationEl.id = `notification-${view.data.id}`;
      notificationEl.className = 'notification';

      const topbarEl = groupEl.querySelector(
        '.notification-group-topbar'
      );

      const openButtonEl = groupEl.querySelector(
        '.notification-group-topbar-open'
      );

      topbarEl.onclick = () => {
        if (groupEl.classList.contains('open')) {
          groupEl.classList.remove('open');

          openButtonEl.textContent = '›';
          openButtonEl.ariaLabel = 'Open';
        } else {
          openButtonEl.textContent = '⌄';
          openButtonEl.ariaLabel = 'Close';

          groupEl.classList.add('open');
        }
      };

      const contentEl = document.createElement('div');
      contentEl.className = 'notification-content';
      contentEl.innerHTML = `
        <span class="notification-icon">✉</span>
        <span>${view.data.title}</span>
        ${view.data.subtitle ? `<span>${view.data.subtitle}</span>` : ''}
      `;

      const deleteButtonEl = document.createElement('button');
      deleteButtonEl.classList = 'notification-delete';
      deleteButtonEl.ariaLabel = 'Delete';
      deleteButtonEl.textContent = '×';

      deleteButtonEl.onclick = () => {
        view.dismiss();
      };

      notificationEl.append(contentEl, deleteButtonEl);

      groupEl.querySelector('ol').append(notificationEl);

      syncGroupEl(groupEl);
    },

    onDismissed(event) {
      const notificationEl = notificationCenterEl.querySelector(
        `#notification-${event.view.data.id}`
      );

      const groupEl = notificationEl.parentNode.parentNode;

      notificationEl.classList.add('fade-out');

      setTimeout(() => {
        notificationEl.remove();
        syncGroupEl(groupEl);
      }, ANIMATION_DURATION);
    },
  })
);

function getGroupEl(application) {
  if (application === 'mail') {
    return mailGroupEl;
  } else if (application === 'calendar') {
    return calendarGroupEl;
  } else {
    return chatGroupEl;
  }
}

// Helpers
function syncGroupEl(groupEl) {
  const notificationsEl = groupEl.querySelector('ol');

  groupEl.style.setProperty('--count', notificationsEl.children.length);

  const children = Array.from(notificationsEl.children);

 children.forEach((child, index) => {
    child.style.setProperty('--offset', index);

    // Show the first 5 notifications when stacked.
    child.style.setProperty('--opacity', index > 4 ? 0 : 1);
  });

  const emptyMessageEl = groupEl.querySelector('.notification-group-empty');
  if (children.length === 0) {
    notificationsEl.style.display = 'none';
    emptyMessageEl.style.display = 'block';
  } else {
    notificationsEl.style.display = 'block';
    emptyMessageEl.style.display = 'none';
  }
}

// Fill the notification center with dummy data

let id = 1;

notificationCenter.present({
  priority: 0,
  data: {
    id: id++,
    application: 'mail',
    title: 'Project-details.pdf',
  },
});

notificationCenter.present({
  priority: 1,
  data: {
    id: id++,
    application: 'mail',
    title: 'Welcome to zombo.com',
  },
});

notificationCenter.present({
  priority: 0,
  data: {
    id: id++,
    application: 'calendar',
    title: 'Meeting with boss',
  },
});

notificationCenter.present({
  priority: 1,
  data: {
    id: id++,
    application: 'calendar',
    title: 'Sprint meeting',
  },
});

notificationCenter.present({
  priority: 2,
  data: {
    id: id++,
    application: 'calendar',
    title: 'Birthday party',
  },
});

notificationCenter.present({
  priority: 3,
  data: {
    id: id++,
    application: 'calendar',
    title: 'Briefing',
  },
});

notificationCenter.present({
  priority: 4,
  data: {
    id: id++,
    application: 'calendar',
    title: 'Coffee',
  },
});

notificationCenter.present({
  priority: 5,
  data: {
    id: id++,
    application: 'calendar',
    title: 'Workout',
  },
});

notificationCenter.present({
  priority: 0,
  data: {
    id: id++,
    application: 'chat',
    title: 'Hello',
    subtitle: '- Bert',
  },
});

notificationCenter.present({
  priority: 1,
  data: {
    id: id++,
    application: 'chat',
    title: 'Sure can do!',
    subtitle: '- Sarah',
  },
});

notificationCenter.present({
  priority: 2,
  data: {
    id: id++,
    application: 'chat',
    title: "Let's zoom about this instead",
    subtitle: '- John',
  },
});

setInterval(() => {
  notificationCenter.present({
    priority: 2,
    data: {
      id: id++,
      application: 'chat',
      title: 'Another message ' + id,
      subtitle: '- Maarten',
    },
  });
}, 10000);
