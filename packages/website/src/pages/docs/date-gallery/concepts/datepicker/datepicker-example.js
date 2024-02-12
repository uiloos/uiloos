import { DateGallery } from '@uiloos/core';

const datepickerEl = document.querySelector('.datepicker-example');
const titleEl = datepickerEl.querySelector('.title');
const resultEl = document.querySelector('#datepicker-example-result');

// December
export const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

// 12-31-2000
export const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const config = {
  mode: 'month',
  maxSelectionLimit: 1,
  canSelect(dateObj) {
    // Must lie in the past
    return dateObj.date < Date.now();
  },
};

function subscriber(datepicker) {
  titleEl.textContent = monthYearFormatter.format(
    datepicker.firstFrame.anchorDate
  );

  const formatted = dateFormatter.format(
    datepicker.selectedDates.at(0)
  );
  resultEl.textContent = `Selected date: ${formatted}`;
  
  const datesEl = datepickerEl.querySelector('.dates');

  datesEl.innerHTML = '';

  datepicker.firstFrame.dates.forEach((dateObj) => {
    const dayEl = document.createElement('li');

    dayEl.innerHTML = `
      <button 
        aria-label="Select ${dateFormatter.format(dateObj.date)}"
        type="button"
      >
        <time datetime="${dateObj.date.toISOString()}">
          ${dateObj.date.getDate()}
        </time>
      </button>
    `;

    dayEl.style.gridColumn = dateObj.date.getDay() + 1;

    // Get the button and apply styles based on the dateObj's state.
    const buttonEl = dayEl.firstElementChild;

    if (!dateObj.canBeSelected) {
      buttonEl.disabled = true;
    }

    if (dateObj.isSelected) {
      buttonEl.classList.add('selected');
    }

    if (dateObj.isToday) {
      buttonEl.classList.add('today');
    }

    dayEl.onclick = () => {
      dateObj.toggle();
    };

    datesEl.appendChild(dayEl);
  });
}

const datepicker = new DateGallery(config, subscriber);

datepickerEl.querySelector('.previous').onclick = () => {
  datepicker.previous();
};

datepickerEl.querySelector('.next').onclick = () => {
  datepicker.next();
};

datepickerEl.querySelector('.goto-today').onclick = () => {
  datepicker.today();
};
