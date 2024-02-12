import { DateGallery } from '@uiloos/core';

const calendarExampleEl = document.querySelector('.calendar-week-example');
const calendarWrapperEl = calendarExampleEl.querySelector('.calendar-wrapper');
const titleEl = calendarExampleEl.querySelector('.calendar-title');

const calendarWeekTemplate = document.querySelector('#calendar-week-template');

const eventTemplate = document.querySelector('#calendar-week-event-template');

const START_HOUR = 9;
const END_HOUR = 18;

const HEIGHT = (END_HOUR - START_HOUR -1)  * 60
calendarExampleEl.style.setProperty('--height', HEIGHT);

// M 1
export const weekDayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  weekday: 'narrow',
});

// December 2002
export const monthAndYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

// 12:45
export const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23', // 00:00 to 23:59 instead of 24:00
});

const config = {
  mode: 'week',
  events: generateEvents(),
};

function subscriber(weekCalendar) {
  titleEl.textContent = monthAndYearFormatter.format(
    weekCalendar.firstFrame.anchorDate
  );

  const weekEl = clone(calendarWeekTemplate);

  const gridEl = weekEl.querySelector('.calendar-week-grid');

  renderLeftHours(gridEl);

  weekCalendar.firstFrame.dates.forEach((dateObj, index) => {
    const eventColumns = calculateEventColumns(dateObj);

    const dayNameEl = document.createElement('button');
    dayNameEl.className = 'calendar-week-dayname';
    dayNameEl.innerHTML = `
        <time datetime="${dateObj.date.toISOString()}">
          ${weekDayFormatter.format(dateObj.date)}
        </time>
      `;
    dayNameEl.style.gridColumn = index + 2;

    gridEl.appendChild(dayNameEl);

    // Will be a subgrid for each day containing the events
    const dayEl = document.createElement('ul');

    // Create sub grid for each day in the week.
    dayEl.className = 'calendar-week-day-grid';
    dayEl.style.gridColumn = dateObj.date.getDay() + 2;

    dateObj.events.forEach((event) => {
      const eventEl = clone(eventTemplate);

      eventEl.style.backgroundColor = event.data.color;

      const buttonEl = eventEl.querySelector('button');
      buttonEl.style.backgroundColor = event.data.color;
      buttonEl.style.color = 'white';

      const titleEl = eventEl.querySelector('i');
      titleEl.title = event.data.title;
      titleEl.textContent = event.data.title;

      const [startTimeEl, endTimeEl] = Array.from(
        eventEl.querySelectorAll('b')
      );

      const start = getMinutesSinceStart(event.startDate);
      const end = getMinutesSinceStart(event.endDate);

      eventEl.style.gridRow = `${start + 2} / ${end + 2}`;

      startTimeEl.textContent = timeFormatter.format(event.startDate);
      endTimeEl.textContent = timeFormatter.format(event.endDate);

      eventEl.style.gridColumn = eventColumns.get(event);

      dayEl.appendChild(eventEl);
    });

    gridEl.appendChild(dayEl);
  });

  calendarWrapperEl.innerHTML = '';
  calendarWrapperEl.appendChild(weekEl);
}

const weekCalendar = new DateGallery(config, subscriber);

calendarExampleEl.querySelector('.previous').onclick = () => {
  weekCalendar.previous();
};

calendarExampleEl.querySelector('.next').onclick = () => {
  weekCalendar.next();
};

function renderLeftHours(gridEl) {
  // Render the hours on the left
  for (let i = START_HOUR; i < END_HOUR; i++) {
    const hourEl = document.createElement('span');
    hourEl.className = 'calendar-week-hour';
    hourEl.ariaHidden = true;

    const row = (i - START_HOUR) * 60 + 3;
    hourEl.style.gridRow = `${row} / ${row + 60}`;

    const date = new Date();
    date.setHours(i, 0, 0, 0);

    const time = timeFormatter.format(date);
    hourEl.textContent = time;

    gridEl.appendChild(hourEl);
  }
}

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
  Takes a DateGalleryDate and returns a Map to which the events 
  are keys, and the values are CSS gridColumn strings.

  For example: 
  
  {eventA: '1 / 2', eventB: '2 / 3', eventC: '3 / 4'}

  The events are packed as tight as possible so the least
  amount of columns are used.

  Note: since we are using a CSS grid we do get one limitation:
  you cannot always divide a CSS grid equally over multiple events.
  This is because CSS grids cannot have varying columns / rows, 
  meaning you cannot make one row have three columns, and the other
  row have two.

  This is a problem for us: say you have a day with five events, 
  three of which are overlapping, and the other two overlap as well. 
  This means we end up with 3 columns total to hold the three 
  overlapping events, but then the other 2 events also need to be 
  divided over three columns. 

  In an ideal world we would be able to say: CSS Grid make those 
  two events take the same amount of space in the 3 columns. 
  Essentially making the 2 events the same size, but unfortunately 
  CSS cannot do this.

  So my solution is to make one of the two events take up 2/3 and 
  the other 1/3. Not ideal but it works
*/
function calculateEventColumns(dateObj) {
  // Step one: we place all events into the least amount of columns
  const columns = packEventsOnAxis(dateObj.events);

  // Step two: we take the columns array and turn it into a Map of CSS
  // grid column strings.
  const eventColumns = new Map();

  dateObj.events.forEach((event) => {
    // Shortcut if the event does not overlap make it span
    // all columns.
    if (!event.isOverlapping) {
      eventColumns.set(event, `1 / ${columns.length + 1}`);
      return;
    }

    // The start column is the first column this event can be found in.
    const startColumn = columns.findIndex((column) => column.includes(event));

    // Now that we have found the start, we need to find the end in the
    // remaining columns.
    const remainingColumns = columns.slice(startColumn);

    // The end column is the first column an overlapping event can be found in,
    // since it has to share the column with that event.
    let endColumn = remainingColumns.findIndex((column) =>
      column.some((otherEvent) => event.overlappingEvents.includes(otherEvent))
    );

    // If we cannot find an endColumn it means it was already on the
    // last column, so place it there.
    if (endColumn === -1) {
      endColumn = columns.length;
    } else {
      // If the endColumn can be found we need to add the startColumn
      // to it since the remainingColumns start counting at 0 again,
      // so we need to make up the difference.
      endColumn += startColumn;
    }

    // Finally we know where to place the event, but we need to
    // account for the fact that CSS grid starts counting at one
    // and not zero. So we +1 the columns.
    eventColumns.set(event, `${startColumn + 1} / ${endColumn + 1}`);
  });

  return eventColumns;
}

// When given a date it returns the number of minutes
// that have passed since START_HOUR.
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

// Generate some events for the current year
export function generateEvents() {
  let id = 0;
  function eventId() {
    id++;
    return id;
  }

  const currentYear = new Date().getFullYear();

  const events = [];

  for (const year of [currentYear - 1, currentYear, currentYear + 1]) {
    for (let i = 1; i < 13; i++) {
      const month = i > 9 ? i : '0' + i;

      events.push({
        data: {
          id: eventId(),
          title: 'Smith',
          color: '#ef4444',
        },
        startDate: new Date(`${year}-${month}-01T10:30:00`),
        endDate: new Date(`${year}-${month}-01T16:15:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Smith',
          color: '#ef4444',
        },
        startDate: new Date(`${year}-${month}-02T10:00:00`),
        endDate: new Date(`${year}-${month}-02T14:45:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Steel',
          color: '#3b82f6',
        },
        startDate: new Date(`${year}-${month}-04T09:00:00`),
        endDate: new Date(`${year}-${month}-04T17:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Steel',
          color: '#3b82f6',
        },
        startDate: new Date(`${year}-${month}-07T15:00:00`),
        endDate: new Date(`${year}-${month}-07T17:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Smith',
          color: '#ef4444',
        },
        startDate: new Date(`${year}-${month}-07T09:00:00`),
        endDate: new Date(`${year}-${month}-07T15:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Rose',
          color: '#f97316',
        },
        startDate: new Date(`${year}-${month}-10T10:00:00`),
        endDate: new Date(`${year}-${month}-10T15:30:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'York',
          color: '#3b82f6',
        },
        startDate: new Date(`${year}-${month}-12T10:00:00`),
        endDate: new Date(`${year}-${month}-12T16:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Vala',
          color: '#84cc16',
        },
        startDate: new Date(`${year}-${month}-15T09:00:00`),
        endDate: new Date(`${year}-${month}-15T14:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Vala',
          color: '#84cc16',
        },
        startDate: new Date(`${year}-${month}-17T12:00:00`),
        endDate: new Date(`${year}-${month}-17T15:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Vala',
          color: '#84cc16',
        },
        startDate: new Date(`${year}-${month}-18T12:00:00`),
        endDate: new Date(`${year}-${month}-18T15:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'York',
          color: '#3b82f6',
        },
        startDate: new Date(`${year}-${month}-19T10:00:00`),
        endDate: new Date(`${year}-${month}-19T16:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'York',
          color: '#3b82f6',
        },
        startDate: new Date(`${year}-${month}-20T11:00:00`),
        endDate: new Date(`${year}-${month}-20T17:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Rose',
          color: '#f97316',
        },
        startDate: new Date(`${year}-${month}-23T10:00:00`),
        endDate: new Date(`${year}-${month}-23T15:30:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Croft',
          color: '#10b981',
        },
        startDate: new Date(`${year}-${month}-25T12:00:00`),
        endDate: new Date(`${year}-${month}-25T13:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Rose',
          color: '#f97316',
        },
        startDate: new Date(`${year}-${month}-28T10:00:00`),
        endDate: new Date(`${year}-${month}-28T13:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Vala',
          color: '#84cc16',
        },
        startDate: new Date(`${year}-${month}-25T13:00:00`),
        endDate: new Date(`${year}-${month}-25T17:00:00`),
      });
    }
  }

  return events;
}
