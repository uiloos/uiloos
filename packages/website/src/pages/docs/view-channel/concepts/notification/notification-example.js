import { ViewChannel } from "@uiloos/core";

export const notificationChannel = new ViewChannel(
  {},
  subscriber
);

function subscriber(viewChannel, event) {
  const isEmpty = viewChannel.views.length === 0;

  const clearAllButtonEl = document
  .getElementById('clear-notification');
  
  clearAllButtonEl.onclick = () => {
    viewChannel.dismissAll(undefined);
  };

  clearAllButtonEl.style.display = !isEmpty 
    ? 'block' 
    : 'none';

  const emptyMessageEl = document
    .getElementById('notification-empty');

  emptyMessageEl.style.display = isEmpty ? 'block' : 'none';

  const notificationContainerEl = document.getElementById(
    'notifications-container'
  );

  if (event.type === 'PRESENTED') {
    const view = event.view;
    const notification = view.data;

    const notificationEl = document.createElement('div');
    notificationEl.id = notification.id;
    notificationEl.className = 'notification';
    notificationEl.textContent = notification.text;

    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'notification-buttons';

    const clearButtonEl = document.createElement('button');
    clearButtonEl.textContent = 'Clear';
    clearButtonEl.onclick = () => view.dismiss(undefined);
    clearButtonEl.className = 'notification-button';

    buttonsEl.append(clearButtonEl);

    notificationEl.append(buttonsEl);

    // Insert before the current item holding the 
    // index, if that index does not exist provide
    // `null` so it is appended to the list.
    notificationContainerEl.insertBefore(
      notificationEl,
      notificationContainerEl.children[view.index] ?? null
    );
    
    return;
  }

  if (event.type === 'DISMISSED') {
    const view = event.view;
    const notification = view.data;

    const notificationEl = document
      .getElementById(notification.id);

    notificationEl.remove();

    return;
  }

  if (event.type === 'DISMISSED_ALL') {
    notificationContainerEl.innerHTML = '';
    return;
  }
}

export function addNotification({ priority = 0, text }) {
  notificationChannel.present({
    priority,
    data: {
      id: Math.random(),
      text
    }
  });
}

addNotification({ text: "Top priority" });

// Create a notification every 5 seconds with a 
// different priority.
setInterval(() => {
  if (notificationChannel.views.length < 5) {
    const priority = Math.ceil(Math.random() * 100);
    addNotification({ 
      priority, 
      text: `Message with priority ${priority}`
    });
  }
}, 5000);