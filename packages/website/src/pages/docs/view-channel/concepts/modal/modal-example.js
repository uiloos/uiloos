import { ViewChannel } from "@uiloos/core";

export const modalChannel = new ViewChannel(
  {},
  subscriber
);

function subscriber(viewChannel, event) {
  const modalsContainerEl = document.getElementById('modals');

  if (event.type === 'PRESENTED') {
    const view = event.view;
    const modal = view.data;

    const backdropEl = document.createElement('div');
    backdropEl.id = `${modal.id}-backdrop`;
    backdropEl.className = 'modal-backdrop';
    backdropEl.onclick = () => view.dismiss(modalCancelled);

    const modalEl = document.createElement('div');
    modalEl.id = `${modal.id}-modal`;
    modalEl.className = 'modal';
    modalEl.setAttribute('role', 'dialog');
    modalEl.ariaLabel = modal.info.title;
    modalEl.setAttribute('aria-describedby', 'modal-description');

    const headerEl = document.createElement('div');
    headerEl.className = 'modal-close';

    const closeButtonEl = document.createElement('button');
    closeButtonEl.textContent = '✖';
    closeButtonEl.className = 'modal-close';
    closeButtonEl.onclick = () => view.dismiss(modalCancelled);

    headerEl.append(closeButtonEl);
    modalEl.append(headerEl);

    const h1El = document.createElement('h1');
    h1El.textContent = modal.info.title;

    modalEl.append(h1El);

    const pEl = document.createElement('p');
    pEl.id = 'modal-description';
    pEl.textContent = modal.info.description;

    modalEl.append(pEl);

    const innerModalEl = document.createElement('div');

    modal.render(view, innerModalEl);

    modalEl.append(innerModalEl);

    modalsContainerEl.append(backdropEl, modalEl);

    return;
  }

  if (event.type === 'DISMISSED') {
    const view = event.view;
    const modal = view.data;

    const dialogEl = document.getElementById(`${modal.id}-modal`);
    dialogEl.remove();

    const backdropEl = document.getElementById(`${modal.id}-backdrop`);
    backdropEl.remove();

    return;
  }
}

// A symbol which represents a modal's result being
// cancelled. By using a Symbol here we make sure we
// never accidentally collide with any success result
// coming from the actual modals.
export const modalCancelled = Symbol('modal cancelled');

export function showModal(render, info) {
  const view = modalChannel.present({
    data: {
      id: Math.random(),
      // A function which accepts a ViewChannelView,
      // a HTML div element to render the modal into.
      render,
      info
    }
  });

  return view.result;
}

export function doctorWhoModal(view, modalEl) {
  function onSelected(doctor) {
    view.dismiss(doctor);
  }

  modalEl.innerHTML = `
    <button 
      id="Matt Smit"
      class="modal-choice-button"
    >
      Matt Smit
    </button>
  
    <button 
      id="David Tennant"
      class="modal-choice-button"
    >
      David Tennant
    </button>
  
    <button 
      id="Robert Picardo"
      class="modal-choice-button"
    >
      Robert Picardo
    </button>
  
    <button 
      id="Jodie Whittaker"
      class="modal-choice-button"
    >
      Jodie Whittaker
    </button>
  `;

  modalEl.querySelectorAll('button').forEach((btn) => {
    btn.onclick = () => onSelected(btn.id);
  });
}

const modalSelectedEl = document.getElementById('modal-selected');

document.getElementById('modalTrigger').onclick = async () => {
  const result = await showModal(doctorWhoModal, {
    title: "Who is your favorite doctor?",
    description: `Please select your favorite actor to have portrayed the eponymous "doctor" from the show "Doctor Who".`
  });

  if (result === modalCancelled) {
    modalSelectedEl.textContent = "What you don't like Doctor Who?";
  } else if (result === 'Robert Picardo') {
    modalSelectedEl.innerHTML = `<strong>${result}</strong> having a Tardis would have saved him some time!`;
  } else {
    modalSelectedEl.innerHTML = `<strong>${result}</strong> is a very good choice.`;
  }
};