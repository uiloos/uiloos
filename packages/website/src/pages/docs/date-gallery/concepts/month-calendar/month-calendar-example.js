import { DateGallery } from '@uiloos/core';

const calendarExampleEl = document.querySelector('.calendar-month-example');
const calendarWrapperEl = calendarExampleEl.querySelector('.calendar-wrapper');
const titleEl = calendarExampleEl.querySelector('.calendar-title');

const calendarMonthTemplate = document.querySelector(
  '#calendar-month-template'
);
const calendarDayTemplate = document.querySelector(
  '#calendar-month-daycell-template'
);
const eventTemplate = document.querySelector('#calendar-month-event-template');

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
  mode: 'month-six-weeks',
  events: generateEvents(),
};

function subscriber(monthCalendar) {
  titleEl.textContent = monthAndYearFormatter.format(
    monthCalendar.firstFrame.anchorDate
  );

  const calendarMonthEl = clone(calendarMonthTemplate);

  const cellsEl = calendarMonthEl.querySelector('.calendar-month-daycells');

  monthCalendar.firstFrame.dates.forEach((dateObj) => {
    const dayEl = clone(calendarDayTemplate);

    // Set the aria label of the button to something sensible
    const date = new Date(dateObj.date);

    // Set the date to the current hour, and to the closest 5 minutes
    const now = new Date();
    date.setHours(now.getHours(), Math.round(now.getMinutes() / 5) * 5);

    if (dateObj.isPadding) {
      dayEl.classList.add('padding');
    }

    // Now set the number of the date in the right corner
    const dayNumberEl = dayEl.querySelector('.calendar-month-daycell-number');
    dayNumberEl.textContent = dateObj.date.getDate();

    const eventsEl = dayEl.querySelector('.calendar-month-daycell-events');

    const noRows = dateObj.events.length;
    eventsEl.style.gridTemplateRows = `repeat(${noRows}, 32px)`;

    for (const event of dateObj.events) {
      const eventEl = clone(eventTemplate);

      // Needed for the ::before event dot
      eventEl.style.setProperty('--color', event.data.color);

      const eventTitleEl = eventEl.querySelector('.calendar-month-event-title');
      eventTitleEl.title = event.data.title;

      const timeEl = eventEl.querySelector('.calendar-month-event-time');

      // When an event happens on a single day show the title and start time.
      eventTitleEl.textContent = event.data.title;
      timeEl.textContent = timeFormatter.format(event.startDate);

      eventsEl.appendChild(eventEl);
    }

    cellsEl.appendChild(dayEl);
  });

  calendarWrapperEl.innerHTML = '';
  calendarWrapperEl.appendChild(calendarMonthEl);
}

const monthCalendar = new DateGallery(config, subscriber);

calendarExampleEl.querySelector('.previous').onclick = () => {
  monthCalendar.previous();
};

calendarExampleEl.querySelector('.next').onclick = () => {
  monthCalendar.next();
};

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

      // Add a hair salon appointment at every first of the month
      events.push({
        data: {
          id: eventId(),
          title: 'Hairsalon',
          color: '#ef4444',
        },
        startDate: new Date(`${year}-${month}-01T12:00:00`),
        endDate: new Date(`${year}-${month}-01T12:45:00`),
      });

      // Add a gym appointment at the 20th
      events.push({
        data: {
          id: eventId(),
          title: 'Gym with friends from work',
          color: '#f97316',
        },
        startDate: new Date(`${year}-${month}-20T20:00:00`),
        endDate: new Date(`${year}-${month}-20T22:00:00`),
      });

      // Add DnD appointment on 15th
      events.push({
        data: {
          id: eventId(),
          title: 'DnD',
          color: '#84cc16',
        },
        startDate: new Date(`${year}-${month}-15T20:00:00`),
        endDate: new Date(`${year}-${month}-15T22:00:00`),
      });

      // Add Pinball tournament on the 25th
      events.push({
        data: {
          id: eventId(),
          title: 'Pinball',
          color: '#10b981',
        },
        startDate: new Date(`${year}-${month}-25T20:00:00`),
        endDate: new Date(`${year}-${month}-25T22:00:00`),
      });

      // Add JS meetup on 15th as well
      events.push({
        data: {
          id: eventId(),
          title: 'JS Meetup',
          color: '#3b82f6',
        },
        startDate: new Date(`${year}-${month}-15T20:00:00`),
        endDate: new Date(`${year}-${month}-15T21:00:00`),
      });
    }
  }

  return events;
}
