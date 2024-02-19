import { DateGallery } from '@uiloos/core';

const calendarExampleEl = document.querySelector('.calendar-day-example');
const calendarWrapperEl = calendarExampleEl.querySelector('.calendar-wrapper');
const titleEl = calendarExampleEl.querySelector('.calendar-title');

const calendarDayTemplate = document.querySelector('#calendar-day-template');

const eventTemplate = document.querySelector('#calendar-day-event-template');

const START_HOUR = 9;
const END_HOUR = 18;

const WIDTH = (END_HOUR - START_HOUR) * 60;
calendarExampleEl.style.setProperty('--width', WIDTH);

// 12-31-2000
export const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// 12:45
export const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23', // 00:00 to 23:59 instead of 24:00
});

const config = {
  mode: 'day',
  events: generateEvents(),
};

function subscriber(dayCalendar) {
  const dayDate = dayCalendar.firstFrame.anchorDate;

  titleEl.textContent = dateFormatter.format(dayDate);

  const gridEl = clone(calendarDayTemplate);

  const eventRows = calculateEventRows(dayCalendar);

  // Render top bar hours
  renderHours(dayCalendar, gridEl, eventRows);

  dayCalendar.firstFrame.events.forEach((event) => {
    const eventEl = clone(eventTemplate);

    eventEl.style.backgroundColor = event.data.color;

    const buttonEl = eventEl.querySelector('button');
    buttonEl.style.backgroundColor = event.data.color;
    buttonEl.style.color = 'white';

    const titleEl = eventEl.querySelector('i');
    titleEl.title = event.data.title;
    titleEl.textContent = event.data.title;

    const [startTimeEl, endTimeEl] = Array.from(eventEl.querySelectorAll('b'));

    const start = getMinutesSinceStart(event.startDate);
    const end = getMinutesSinceStart(event.endDate);

    eventEl.style.gridColumn = `${start + 1} / ${end + 1}`;

    // When fully in this day show both times
    startTimeEl.textContent = timeFormatter.format(event.startDate);
    endTimeEl.textContent = timeFormatter.format(event.endDate);

    eventEl.style.gridRow = eventRows.get(event);

    gridEl.appendChild(eventEl);
  });

  calendarWrapperEl.innerHTML = '';
  calendarWrapperEl.appendChild(gridEl);
}

const dayCalendar = new DateGallery(config, subscriber);

calendarExampleEl.querySelector('.previous').onclick = () => {
  dayCalendar.previous();
};

calendarExampleEl.querySelector('.next').onclick = () => {
  dayCalendar.next();
};

// Packs all events on an axis (row / column) as tightly as possible
// with the least amount of rows / columns needed.
export function packEventsOnAxis(events) {
  // Note: the code below uses the term columns / column for clarity
  // but it also works for rows.

  // Step one: we place all events into the least amount of columns
  const columns = [[]];

  events.forEach((event) => {
    // Shortcut if the event does not overlap we can
    // safely place it in the first column.
    if (!event.isOverlapping) {
      columns[0].push(event);
      return;
    }

    // Find the first column we do not have overlapping events in,
    // since that is the place the event can fit into. By finding
    // the first column it fits into we make sure we use as little
    // columns as possible.
    const column = columns.find((column) => {
      return column.every(
        (otherEvent) => !event.overlappingEvents.includes(otherEvent)
      );
    });

    if (column) {
      // If we find a columm, great add the event to it.
      column.push(event);
    } else {
      // If we cannot find a column the event fits into
      // we create a new column.
      columns.push([event]);
    }
  });

  return columns;
}

/* 
  Takes a DateGallery and returns a Map to which the events 
  are keys, and the values are CSS gridRow strings.

  For example: 
  
  {eventA: '1 / 2', eventB: '2 / 3', eventC: '3 / 4'}

  The events are packed as tight as possible so the least
  amount of rows are used.
*/
function calculateEventRows(dateGallery) {
  // Step one: we place all events into the least amount of rows
  const rows = packEventsOnAxis(dateGallery.firstFrame.events);

  // Step two: we take the rows array and turn it into a Map of CSS
  // grid row strings.
  const eventRows = new Map();

  dateGallery.firstFrame.events.forEach((event) => {
    const row = rows.findIndex((row) => row.includes(event));

    // Finally we know where to place the event, but we need to
    // account for the fact that CSS grid starts counting at one
    // and not zero. So we +1 the rows. Also we now that the first
    // row shows the hours so another +1 is needed.
    eventRows.set(event, `${row + 2}`);
  });

  return eventRows;
}

function renderHours(dayCalendar, gridEl, eventRows) {
  // Render the hours on the top
  for (let i = START_HOUR; i < END_HOUR; i++) {
    const hourEl = document.createElement('li');
    hourEl.className = 'calendar-day-hour';
    hourEl.ariaHidden = true;

    const column = (i - START_HOUR) * 60 + 1;
    hourEl.style.gridColumn = `${column} / ${column + 60}`;

    hourEl.style.gridRow = `1 / ${getNoRows(eventRows)}`;

    const date = new Date(dayCalendar.firstFrame.anchorDate);
    date.setHours(i, 0, 0, 0);

    const time = timeFormatter.format(date);
    hourEl.textContent = time;

    gridEl.appendChild(hourEl);
  }
}

function getNoRows(eventRows) {
  let noRows = 0;
  eventRows.forEach((x) => {
    noRows = Math.max(parseInt(x, 10), noRows);
  });

  return noRows < 10 ? 10 : noRows;
}

// When given a date it returns the number of minutes
// that have passed since the START_HOUR.
export function getMinutesSinceStart(date) {
  // First get the number of minutes since midnight: for example
  // if the time was 12:30 you would get 12 * 60 + 30 = 750 minutes.
  const midnight = date.getHours() * 60 + date.getMinutes();

  // Since we start on 09:00 hours we need to treat 09:00 hours
  // as the starting point, so shift the minutes back by 09:00
  // hours.
  return midnight - START_HOUR * 60;
}

// Helpers

export function clone(template) {
  return template.content.cloneNode(true).firstElementChild;
}

// Generate some events for the current month
export function generateEvents() {
  let id = 0;
  function eventId() {
    id++;
    return id;
  }

  const events = [];

  const yearGallery = new DateGallery({ mode: 'month' });

  yearGallery.firstFrame.dates.forEach((dateObj) => {
    const startDate = new Date(dateObj.date);
    const endDate = new Date(dateObj.date);

    startDate.setHours(randomNumberBetween(10, 12), 30, 0);
    endDate.setHours(randomNumberBetween(14, 16), 15, 0);

    events.push({
      data: {
        id: eventId(),
        title: 'Jane',
        color: '#ef4444',
      },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    startDate.setHours(randomNumberBetween(9, 15), 30, 0);
    endDate.setHours(17, 0, 0);

    events.push({
      data: {
        id: eventId(),
        title: 'Diane',
        color: '#c026d3',
      },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    startDate.setHours(10, 0, 0);
    endDate.setHours(randomNumberBetween(14, 17), 0, 0);

    events.push({
      data: {
        id: eventId(),
        title: 'John',
        color: '#3b82f6',
      },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    startDate.setHours(randomNumberBetween(12, 14), 45, 0);
    endDate.setHours(randomNumberBetween(15, 17), 0, 0);

    events.push({
      data: {
        id: eventId(),
        title: 'Ian',
        color: '#10b981',
      },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    startDate.setHours(randomNumberBetween(9, 15), 0, 0);
    endDate.setHours(16, 30, 0);

    events.push({
      data: {
        id: eventId(),
        title: 'Eva',
        color: '#f97316',
      },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    startDate.setHours(9, 0, 0);
    endDate.setHours(randomNumberBetween(14, 17), 45, 0);

    events.push({
      data: {
        id: eventId(),
        title: 'Dirk',
        color: '#84cc16',
      },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  });

  return events;
}

function randomNumberBetween(min, max) {
  return Math.random() * (max - min) + min;
}
