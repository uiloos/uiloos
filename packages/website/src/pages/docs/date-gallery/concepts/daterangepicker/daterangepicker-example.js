import { DateGallery } from '@uiloos/core';

const dateRangePickerEl = document.querySelector('.daterangepicker-example');
const titleEl = dateRangePickerEl.querySelector('.title');
const resultEl = document.querySelector('#daterangepicker-example-result');

// December 2000
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

const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 1);

const config = {
  mode: 'month',
  selectedDates: [new Date(), nextWeek],
};

// Will store the date that was selected first by the user
let firstSelectedDate = null;

function subscriber(dateRangePicker) {
  titleEl.textContent = monthYearFormatter.format(
    dateRangePicker.firstFrame.anchorDate
  );

  // Sort from past to future.
  const sorted = [...dateRangePicker.selectedDates].sort(
    (a, b) => a.getTime() - b.getTime()
  );

  // The first date is the start date.
  const startDate = sorted.at(0);

  // The last date is the end date
  const endDate = sorted.at(-1);

  if (startDate && endDate && startDate !== endDate) {
    const startFormatted = dateFormatter.format(startDate);

    const endFormatted = dateFormatter.format(endDate);

    resultEl.textContent = `You selected ${startFormatted} to ${endFormatted}.`;
  } else {
    resultEl.textContent = 'Please make a selection';
  }

  const datesEl = dateRangePickerEl.querySelector('.dates');

  datesEl.innerHTML = '';

  dateRangePicker.firstFrame.dates.forEach((dateObj) => {
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

      if (dateRangePicker.isSameDay(startDate, dateObj.date)) {
        buttonEl.classList.add('start-of-range');
      } else if (dateRangePicker.isSameDay(endDate, dateObj.date)) {
        buttonEl.classList.add('end-of-range');
      }
    }

    dayEl.onclick = () => {
      // If the user has not selected any date yet
      if (firstSelectedDate === null) {
        // Store that date that was clicked
        firstSelectedDate = dateObj.date;

        // Treat it as the user wanting to start
        // a new selection on that date.
        dateRangePicker.deselectAll();

        // Also visually select this date so it becomes blue.
        dateRangePicker.selectDate(firstSelectedDate);
      } else {
        /*
          If the user has already selected a date the
          second click should close the range.

          Note: selectRange does not care in which order
          it receives the parameters, it will find the
          earlier and later dates itself.
        */
        dateRangePicker.selectRange(firstSelectedDate, dateObj.date);

        // Now reset the firstSelectedDate so the next click
        // is treated as the user wanting to change the range
        //again.
        firstSelectedDate = null;
      }
    };

    datesEl.appendChild(dayEl);
  });
}

const dateRangePicker = new DateGallery(config, subscriber);

dateRangePickerEl.querySelector('.previous').onclick = () => {
  dateRangePicker.previous();
};

dateRangePickerEl.querySelector('.next').onclick = () => {
  dateRangePicker.next();
};

dateRangePickerEl.querySelector('.goto-today').onclick = () => {
  dateRangePicker.today();
};
