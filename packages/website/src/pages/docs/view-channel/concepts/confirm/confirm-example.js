import { ViewChannel } from "@uiloos/core";

export const confirmationDialogChannel = new ViewChannel(
  {},
  subscriber
);

function subscriber(viewChannel, event) {
  const dialogsContainerEl = document
    .getElementById('confirmation-dialogs');

  if (event.type === 'PRESENTED') {
    const view = event.view;
    const dialog = view.data;

    const backdropEl = document.createElement('div');
    backdropEl.id = `${dialog.id}-backdrop`;
    backdropEl.className = 'confirmation-dialog-backdrop';
    backdropEl.onclick = () => view.dismiss(false);

    const dialogEl = document.createElement('div');
    dialogEl.id = `${dialog.id}-dialog`;
    dialogEl.className = 'confirmation-dialog';
    dialogEl.innerHTML = `
      <strong>Please confirm</strong>
      <p>${dialog.text}</p>
    `;

    const dialogButtonBar = document.createElement('div');
    dialogButtonBar.className = 'confirmation-dialog-button-bar';

    const okButtonEl = document.createElement('button');
    okButtonEl.className = "confirm-choice-button";
    okButtonEl.textContent = 'Ok';
    okButtonEl.onclick = () => view.dismiss(true);

    const cancelButtonEl = document.createElement('button');
    cancelButtonEl.className = "confirm-choice-button";
    cancelButtonEl.textContent = 'Cancel';
    cancelButtonEl.onclick = () => view.dismiss(false);

    dialogButtonBar.append(okButtonEl, cancelButtonEl);

    dialogEl.append(dialogButtonBar);

    dialogsContainerEl.append(backdropEl, dialogEl);

    return;
  }

  if (event.type === 'DISMISSED') {
    const view = event.view;
    const dialog = view.data;

    const dialogEl = document
      .getElementById(`${dialog.id}-dialog`);

    dialogEl.remove();

    const backdropEl = document
      .getElementById(`${dialog.id}-backdrop`);

    backdropEl.remove();

    return;
  }
}

export function confirmDialog(text) {
  return confirmationDialogChannel.present({
    data: {
      id: Math.random(),
      text
    }
  }).result;
}

const confirmMessageEl = document.getElementById("confirm-message");

document.getElementById('confirmTrigger').onclick = async () => {
  const result = await confirmDialog("Are you sure you want to delete the database?");

  if (result) {
    confirmMessageEl.innerHTML = 
      "<strong>Database and backups</strong> were destroyed";
  } else {
    confirmMessageEl.innerHTML = 
      "<strong>The database lives</strong> to query another day";
  }
};