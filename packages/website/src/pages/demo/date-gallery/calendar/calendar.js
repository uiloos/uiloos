/*
  It is highly recommended to use a date library parse / validate
  dates, using date-fns here, but you could also use Luxon, dayjs or 
  Moment.js
*/
import { isValid } from 'date-fns';
import {
  DateGallery,
  ActiveList,
  createActiveListSubscriber,
} from '@uiloos/core';

// You can change the number of hours shown here,
// by default all hours are shown.
const WEEK_START_HOUR = 9;
const WEEK_END_HOUR = 18;
const WEEK_HEIGHT = (WEEK_END_HOUR - WEEK_START_HOUR) * 60;

// You can change the number of hours shown here,
// by default all hours are shown.
const DAY_START_HOUR = 9;
const DAY_END_HOUR = 18;
const DAY_WIDTH = (DAY_END_HOUR - DAY_START_HOUR) * 60;

let id = 0;

// December 2002
export const monthAndYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

// 2000-01-01
export const isoFormatter = new Intl.DateTimeFormat('fr-CA', {
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

// 2000
export const yearFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
});

// December
export const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
});

// 12-31-2000
export const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// 12-31-2000, 12:34
export const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23', // 00:00 to 23:59 instead of 24:00
});

// Monday 1
export const weekDayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  weekday: 'short',
});

class Calendar extends HTMLElement {
  connectedCallback() {
    // Write the HTML into the <uiloos-calendar /> component needed
    // for the component to render.
    this.writeHTML();

    // For each mode write the <templates> that the modes need
    // this is so the <templates> used per mode is located in
    // the file that renders the mode.
    writeYearTemplates(this);
    writeMonthTemplates(this);
    writeWeekTemplates(this);
    writeDayTemplates(this);

    // The formEvent tracks which event is shown in the <form>
    // element, when null it means a new event is added.
    this.formEvent = null;

    this.calendarWrapperEl = this.querySelector('.calendar-wrapper');
    this.calendarTitleEl = this.querySelector('.calendar-title');
    this.calendarEventFormEl = this.querySelector('.calendar-event-form');
    this.addEventDialogEl = this.querySelector('dialog');
    this.deleteButtonEl = this.querySelector('.delete-event-button');
    this.modeButtonsEls = Array.from(this.querySelectorAll('.mode-button'));

    const { mode, numberOfFrames, initialDate } = this.readConfigFromUrl();

    // An array which holds ids returned from setInterval calls,
    // is cleared after a mode change. The idea is that some modes
    // may use window.setInterval to register some recurring action
    // but that these should be cleanup whenever the mode changes.
    this.intervalsIds = [];

    const calendar = this;
    this.dateGallery = new DateGallery(
      {
        mode,
        numberOfFrames,
        initialDate,
        events: generateEvents(),
      },
      (dateGallery) => {
        // Sync the query parameters, so that the url changes and the
        // user can reload the page and still see the same calendar
        const url = new URL(window.location.href);
        url.searchParams.set('mode', dateGallery.mode);
        url.searchParams.set(
          'initialDate',
          isoFormatter.format(dateGallery.firstFrame.anchorDate)
        );

        // Only push if the url has actually changed,
        // otherwise it will push duplicates.
        if (url.href !== window.location.href) {
          window.history.pushState({}, '', url);
        }

        // The day mode runs an
        calendar.intervalsIds.forEach((id) => {
          clearInterval(id);
        });
        calendar.intervalsIds.length = 0;

        // The delay is needed so modeSegmentedButton is initialized
        setTimeout(() => {
          // Sync with the mode segemented button
          calendar.activateMode(dateGallery.mode);
        }, 1);

        // Clear the wrapper so the mode can render cleanly
        calendar.calendarWrapperEl.innerHTML = '';

        // Delegate the rendering of the actual mode to
        // the various render helper functions.
        if (dateGallery.mode === 'month-six-weeks') {
          renderMonthCalendar(calendar, dateGallery);
        } else if (dateGallery.mode === 'month') {
          renderYearCalendar(calendar, dateGallery);
        } else if (dateGallery.mode === 'week') {
          renderWeekCalendar(calendar, dateGallery);
        } else {
          renderDayCalendar(calendar, dateGallery);
        }
      }
    );

    window.addEventListener('popstate', this.syncFromUrl);

    this.modeSegmentedButton = new ActiveList(
      {
        contents: this.modeButtonsEls,
      },
      createActiveListSubscriber({
        onActivated(event, modeSegmentedButton) {
          if (modeSegmentedButton.lastDeactivated) {
            modeSegmentedButton.lastDeactivated.classList.remove('active');
          }

          modeSegmentedButton.lastActivated.classList.add('active');

          // Sync with the DateGallery
          calendar.activateMode(modeSegmentedButton.lastActivated.dataset.mode);
        },
      })
    );

    this.activateMode(mode);

    this.registerInteractions();
  }

  disconnectedCallback() {
    window.removeEventListener('popstate', this.syncFromUrl);

    this.calendarWrapperEl = null;
    this.calendarTitleEl = null;
    this.calendarEventFormEl = null;
    this.addEventDialogEl = null;
    this.deleteButtonEl = null;
    this.modeButtonsEls = null;

    this.dateGallery = null;
    this.modeSegmentedButton = null;
  }

  syncFromUrl = () => {
    const config = this.readConfigFromUrl();

    this.dateGallery.changeConfig(config);
  };

  // Writes the initial HTML into the uiloos-calendar element
  writeHTML() {
    this.innerHTML = `
      <div class="calendar-example">
        <dialog>
          <form class="calendar-event-form">
            <b class="calendar-event-form-title">Edit event</b>
      
            <div class="calendar-event-form-field">
              <label for="title">Title</label>
              <input id="title" name="title" required />
            </div>
      
            <div class="calendar-event-form-field">
              <label for="description">Description</label>
              <textarea
                id="description"
                name="description"
                cols="4"
                rows="4"
                required
              ></textarea>
            </div>

            <uiloos-daterangepicker
              time
              start-name="start"
              end-name="end"
              start-label="Start (mm/dd/yyyy hh:mm)"
              end-label="End (mm/dd/yyyy hh:mm)"
              start-error-label="Start"
              end-error-label="End"
              required
            >
              Loading...
            </uiloos-daterangepicker>
      
            <div class="calendar-event-form-field">
              <label for="color">Color</label>
              <input id="color" name="color" type="color" required />
            </div>
      
            <button type="submit">Save</button>
          </form>

          <button class="delete-event-button">Delete event</button>
        </dialog>
      
        <div class="calender-topbar">
          <div class="calendar-mode">
            <button class="mode-button" data-mode='month'>Year</button>
            <button class="mode-button" data-mode='month-six-weeks'>Month</button>
            <button class="mode-button" data-mode='week'>Week</button>
            <button class="mode-button" data-mode='day'>Day</button>
          </div>
          
          <div class='calendar-controls'>
            <button class="calendar-previous calendar-button" aria-label="previous">❮</button>
            <span class="calendar-title">Loading...</span>
            <button class="calendar-next calendar-button" aria-label="next">❯</button>
          </div>
      
          <div class="calendar-actions">
            <button class="calendar-today calendar-button">Today</button>
            <button class="calendar-add-event calendar-button">
              + Add event
            </button>
          </div>
        </div>
      
        <div class="calendar-wrapper">Loading...</div>
      </div>
    `;
  }

  // Gathers all buttons / forms and sets up what happens when you use them
  registerInteractions() {
    // Step 1: setup the topbar actions
    this.querySelector('.calendar-next').onclick = () => {
      this.dateGallery.next();
    };

    this.querySelector('.calendar-previous').onclick = () => {
      this.dateGallery.previous();
    };

    this.querySelector('.calendar-today').onclick = () => {
      this.dateGallery.today();
    };

    this.modeButtonsEls.forEach((button) => {
      button.onclick = () => {
        this.modeSegmentedButton.activate(button);
      };
    });

    // Step 2: setup the actions that are about adding events.
    this.querySelector('.calendar-add-event').onclick = () => {
      // Mark the form as being for a new event.
      this.formEvent = null;

      this.openNewEventForm(new Date());
    };

    // Reset the form whenever it is closed, will be
    // on submit and when esc or backdrop is clicked
    this.addEventDialogEl.onclose = () => {
      // Whenever the event is closed reset the form,
      // since it is re-used.
      this.calendarEventFormEl.reset();

      // Set to null so we do not keep an event in memory,
      this.formEvent = null;

      this.deleteButtonEl.onclick = undefined;
    };

    // Close dialog when backdrop is clicked
    this.addEventDialogEl.onclick = (event) => {
      if (event.target.nodeName === 'DIALOG') {
        this.addEventDialogEl.close();
      }
    };

    // Create a new event, or edit the event based on whether or not
    // there is a formEvent.
    this.calendarEventFormEl.onsubmit = (event) => {
      event.preventDefault();

      const formData = new FormData(this.calendarEventFormEl);

      const isCreating = this.formEvent === null;

      if (isCreating) {
        // Inform the dateGallery of the new event
        this.dateGallery.addEvent({
          data: {
            id: eventId(),
            title: formData.get('title'),
            description: formData.get('description'),
            color: formData.get('color'),
          },
          startDate: formData.get('start'),
          endDate: formData.get('end'),
        });
      } else {
        // Inform the dateGallery that the event has changed.

        // First update the data object of the event, to whatever
        // the user filled in.
        this.formEvent.changeData({
          id: this.formEvent.data.id,
          title: formData.get('title'),
          description: formData.get('description'),
          color: formData.get('color'),
        });

        // Then tell the DateGallery that the event has actually moved
        this.formEvent.move({
          startDate: formData.get('start'),
          endDate: formData.get('end'),
        });
      }

      // Close the dialog, note that this causes the
      // `addEventDialogEl.onclose` to fire.
      this.addEventDialogEl.close();
    };
  }

  // Activates a mode and syncs both the dateGallery and modeSegmentedButton (ActiveList)
  // This way no matter how the mode changes, either from inside the dateGallery subscriber
  // or via a button click on the mode segemented button they will always be in sync.
  activateMode(mode) {
    // Step 1: sync with the segmented button

    // Find the button that represents the mode
    const button = this.modeButtonsEls.find(
      (button) => button.dataset.mode === mode
    );
    // and activate that button.
    this.modeSegmentedButton.activate(button);

    // Step 2: sync with the DateGallery

    // When the 'mode' is month it means 'year' has been selected
    // and we show 12 month calenders side by side.
    if (mode === 'month') {
      // Anchor date to january first, otherwise the 'year' will start
      // at the current month.
      const initialDate = new Date(this.dateGallery.firstFrame.anchorDate);
      initialDate.setMonth(0);
      initialDate.setDate(1);

      this.dateGallery.changeConfig({
        mode,
        numberOfFrames: 12,
        initialDate,
      });
    } else {
      this.dateGallery.changeConfig({ mode, numberOfFrames: 1 });
    }
  }

  // Opens the "event form" in "new" mode and sets the start date and time
  // to the Date object provided.
  openNewEventForm(startDate) {
    const rangePickerEl = this.calendarEventFormEl.querySelector(
      'uiloos-daterangepicker'
    );

    // Set the startDate to what was provided.
    rangePickerEl.setAttribute('start-value', formatDateForInput(startDate));

    // Set the endDate to the startDate plus one hour
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1, startDate.getMinutes());

    rangePickerEl.setAttribute('end-value', formatDateForInput(endDate));

    this.calendarEventFormEl.querySelector('#color').value = '#9333ea';

    this.addEventDialogEl.showModal();
    this.calendarEventFormEl.querySelector(
      '.calendar-event-form-title'
    ).textContent = 'Add event';

    this.deleteButtonEl.style.display = 'none';
    this.deleteButtonEl.onclick = () => undefined;
  }

  // Opens the "event form" in "edit" mode and sets all input fields to the
  // provided event.
  openEditEventForm(event) {
    this.formEvent = event;

    this.calendarEventFormEl.querySelector('#title').value = event.data.title;

    this.calendarEventFormEl.querySelector('#description').value =
      event.data.description;

    this.calendarEventFormEl.querySelector('#color').value = event.data.color;

    const rangePickerEl = this.calendarEventFormEl.querySelector(
      'uiloos-daterangepicker'
    );

    rangePickerEl.setAttribute(
      'start-value',
      formatDateForInput(event.startDate)
    );

    rangePickerEl.setAttribute('end-value', formatDateForInput(event.endDate));

    this.addEventDialogEl.showModal();
    this.calendarEventFormEl.querySelector(
      '.calendar-event-form-title'
    ).textContent = 'Edit event';

    this.deleteButtonEl.style.display = 'block';
    this.deleteButtonEl.onclick = () => {
      this.formEvent.remove();

      // Close the dialog, note that this causes the
      // `addEventDialogEl.onclose` to fire.
      this.addEventDialogEl.close();
    };
  }

  readConfigFromUrl() {
    const url = new URL(window.location.href);

    let mode = url.searchParams.get('mode') ?? 'month-six-weeks';

    if (
      !['month', 'month-six-weeks', 'week', 'day'].includes(mode.toLowerCase())
    ) {
      mode = 'month-six-weeks';
    }

    const numberOfFrames = mode === 'month' ? 12 : 1;

    let initialDate = url.searchParams.get('initialDate') ?? new Date();
    initialDate = new Date(initialDate);

    if (!isValid(initialDate)) {
      initialDate = new Date();
    }

    return {
      mode,
      numberOfFrames,
      initialDate,
    };
  }
}

customElements.define('uiloos-calendar', Calendar);

// Will contain information when event is dragged.
const dayDragData = {
  xAtDragStart: 0,
  dragStartTime: 0,
  dragEndTime: 0,
};

function renderDayCalendar(calendar, dateGallery) {
  const calendarDayTemplate = calendar.querySelector('#calendar-day-template');

  const eventTemplate = calendar.querySelector('#calendar-day-event-template');

  const dayDate = dateGallery.firstFrame.anchorDate;

  calendar.calendarTitleEl.textContent = dateFormatter.format(dayDate);

  const dayCalendarEl = clone(calendarDayTemplate);
  
  const gridEl =  dayCalendarEl.querySelector('.calendar-day-grid');
  gridEl.style.setProperty('--width',DAY_WIDTH);

  const eventRows = calculateEventRows(dateGallery);

  // Render top bar hours
  renderHours(calendar, dateGallery, gridEl, eventRows);

  // Render current hour vertical red line, but only when today is shown
  renderCurrentHour(calendar, dateGallery, gridEl, eventRows);

  dateGallery.firstFrame.events.forEach((event) => {
    const eventEl = clone(eventTemplate);

    eventEl.style.backgroundColor = event.data.color;

    const buttonEl = eventEl.querySelector('button');
    buttonEl.style.backgroundColor = event.data.color;
    buttonEl.style.color = yiq(event.data.color);
    buttonEl.ariaLabel = ariaLabelForEvent(event);

    const titleEl = eventEl.querySelector('i');
    titleEl.title = event.data.title;
    titleEl.textContent = event.data.title;

    const [startTimeEl, endTimeEl] = Array.from(eventEl.querySelectorAll('b'));

    const [startTimeDragEl, endTimeDragEl] = Array.from(
      eventEl.querySelectorAll('.drag-indicator')
    );

    if (event.spansMultipleDays) {
      if (dateGallery.isSameDay(event.startDate, dayDate)) {
        // When the event starts on this day, make it span the
        // entire day, as we know it does not end on this day.
        const start = getMinutesSinceStart(event.startDate, DAY_START_HOUR);
        eventEl.style.gridColumn = `${start + 1} / ${DAY_WIDTH}`;

        // No end time indicator as it is on another day
        endTimeDragEl.draggable = false;

        // Show start time only on first day
        startTimeEl.textContent = timeFormatter.format(event.startDate);
      } else if (dateGallery.isSameDay(event.endDate, dayDate)) {
        // When the event ends on this day start it at midnight, since
        // we know it started on a previous day.
        const end = getMinutesSinceStart(event.endDate, DAY_START_HOUR);
        eventEl.style.gridColumn = `1 / ${end + 2}`;

        // No start time drag indicator as it is on another day
        startTimeDragEl.draggable = false;

        // Show end time only on last day
        endTimeEl.textContent = timeFormatter.format(event.endDate);
      } else {
        // When the event is during this whole day
        eventEl.style.gridColumn = `1 / ${DAY_WIDTH}`;

        // No start / end drag indicator as it is on another day
        startTimeDragEl.draggable = false;
        endTimeDragEl.draggable = false;
      }
    } else {
      // The event is contained within this day.

      const start = getMinutesSinceStart(event.startDate, DAY_START_HOUR);
      const end = getMinutesSinceStart(event.endDate, DAY_START_HOUR);

      eventEl.style.gridColumn = `${start + 1} / ${end + 1}`;

      // When fully in this day show both times
      startTimeEl.textContent = timeFormatter.format(event.startDate);
      endTimeEl.textContent = timeFormatter.format(event.endDate);
    }

    eventEl.style.gridRow = eventRows.get(event);

    // When clicking on an event open the "event form"
    // and prefill it with the clicked event.
    eventEl.onclick = (e) => {
      e.stopPropagation();

      calendar.openEditEventForm(event);
    };

    // An event is draggable when it can be fitted on this day
    eventEl.draggable = event.spansMultipleDays === false;

    // When the drag starts store information about which event is dragged
    function onDragStart(e) {
      e.stopPropagation();

      // Store what the mouse position was at the start of the drag.
      // Used to calulate how many minutes the user wants the event
      // to move.
      dayDragData.xAtDragStart = e.clientX;

      // Set store the original start and end time for when
      // the dragging began. This way we always know the
      // original times even after we "move" the event.
      dayDragData.dragStartTime = new Date(event.startDate).getTime();
      dayDragData.dragEndTime = new Date(event.endDate).getTime();

      // Set the drag image to an empty image. Because we are
      // going to continuously "move" the event we do not need
      // a "ghost".
      e.dataTransfer.setDragImage(emptyImage, 0, 0);
    }

    // When the the event is dragged alter the time period of the vent.
    function onDrag(e) {
      e.stopPropagation();

      // Sometimes the clientX is suddenly zero on drag end,
      // do nothing if this is the case. Otherwise the event
      // will suddenly jump to the previous day
      if (e.clientX === 0) {
        return;
      }

      // The number of minutes moved is the amount of pixels away
      // the cursor (clientX) is from the clientX at the start of
      // the drag start.
      const minutesMoved = e.clientX - dayDragData.xAtDragStart;

      // Move by an increment of 5 minutes, to create a snap effect
      if (minutesMoved % 5 === 0) {
        // Date constructor wants milliseconds since 1970
        const msMoved = minutesMoved * 60 * 1000;

        // Note: moving the event will cause the entire DOM to be ripped
        // to shreds and be rebuilt. So the 5 minute snap effect is
        // also a performance boost.

        if (e.target === eventEl) {
          // Move both start and end times with the same values
          // so the duration of the event stays the same.
          event.move({
            startDate: new Date(dayDragData.dragStartTime + msMoved),
            endDate: new Date(dayDragData.dragEndTime + msMoved),
          });
        } else if (e.target === startTimeDragEl) {
          // Move only the start time
          event.move({
            startDate: new Date(dayDragData.dragStartTime + msMoved),
            endDate: event.endDate,
          });
        } else {
          // Move only the end time
          event.move({
            startDate: event.startDate,
            endDate: new Date(dayDragData.dragEndTime + msMoved),
          });
        }
      }
    }

    eventEl.ondragstart = onDragStart;
    startTimeDragEl.ondragstart = onDragStart;
    endTimeDragEl.ondragstart = onDragStart;

    eventEl.ondrag = onDrag;
    startTimeDragEl.ondrag = onDrag;
    endTimeDragEl.ondrag = onDrag;

    gridEl.appendChild(eventEl);
  });

  calendar.calendarWrapperEl.appendChild(dayCalendarEl);
}

function writeDayTemplates(calendar) {
  calendar.innerHTML += `
    <template id="calendar-day-template">
      <div class="calendar-day">
        <ul class="calendar-day-grid"></ul>
      </div>
    </template>

    <template id="calendar-day-event-template">
      <li class="calendar-day-event">
        <button>
          <span class="drag-indicator" draggable="true"></span>
          <span class="text-container">
            <b></b>
            <i></i>
            <b class="end-time"></b>
          </span>
          <span class="drag-indicator" draggable="true"></span>
        </button>
      </li>
    </template>
  `;
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

function renderHours(calendar, dateGallery, gridEl, eventRows) {
  // Render the hours on the top
  for (let i = DAY_START_HOUR; i < DAY_END_HOUR; i++) {
    const hourEl = document.createElement('li');
    hourEl.className = 'calendar-day-hour';
    hourEl.ariaHidden = true;

    const column = (i - DAY_START_HOUR) * 60 + 1;
    hourEl.style.gridColumn = `${column} / ${column + 60}`;

    hourEl.style.gridRow = `1 / ${getNoRows(eventRows)}`;

    const date = new Date(dateGallery.firstFrame.anchorDate);
    date.setHours(i, 0, 0, 0);

    const time = timeFormatter.format(date);
    hourEl.textContent = time;

    // When clicking on a hour open the "event form" with the
    // clicked hour selected.
    hourEl.onclick = (event) => {
      // To determine the minute we look to where the user
      // clicked in the hour cell. Remember: the hour cell
      // is 60px in height, one pixel per minute.
      const rect = hourEl.getBoundingClientRect();
      const distanceInMinutes = event.clientX - rect.left;

      // Round to closest 5 minutes
      const minute = Math.round(distanceInMinutes / 5) * 5;

      const eventDate = new Date(date);
      eventDate.setHours(date.getHours(), minute);

      calendar.openNewEventForm(eventDate);
    };

    gridEl.appendChild(hourEl);
  }
}

function renderCurrentHour(calendar, dateGallery, gridEl, eventRows) {
  // Add a red line showing the current time, but only
  // when showing today
  if (dateGallery.firstFrame.dates[0].isToday) {
    const currentHourEl = document.createElement('div');
    currentHourEl.className = 'calendar-day-current-time';

    currentHourEl.style.gridRow = `1 / ${getNoRows(eventRows)}`;

    function update() {
      const now = new Date();

      const column = getMinutesSinceStart(now, DAY_START_HOUR);
      currentHourEl.style.gridColumn = `${column + 1} / ${column + 2}`;

      currentHourEl.setAttribute('time', timeFormatter.format(now));
    }

    update();

    // Update the position of the red line every second
    const id = setInterval(update, 1000);

    // Register this interval to the calendar, so the calendar
    // can remove the interval when the mode changes.
    calendar.intervalsIds.push(id);

    gridEl.append(currentHourEl);
  }
}

function getNoRows(eventRows) {
  let noRows = 0;
  eventRows.forEach((x) => {
    noRows = Math.max(parseInt(x, 10), noRows);
  });

  return noRows < 20 ? 20 : noRows;
}

function formatDateForInput(date) {
  const time = timeFormatter.format(date);

  return `${dateFormatter.format(date)} ${time}`;
}

// Packs all events on an axis (row / column) as tightly as possible
// with the least amount of rows / columns needed.
function packEventsOnAxis(events) {
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

function ariaLabelForEvent(event) {
  const start = dateTimeFormatter.format(event.startDate);
  const end = dateTimeFormatter.format(event.endDate);

  return `Edit event titled: '${event.data.title}', which starts on ${start} and ends on ${end}`;
}

function generateEvents() {
  const currentYear = new Date().getFullYear();

  const events = [];

  for (const year of [currentYear - 1, currentYear, currentYear + 1]) {
    for (let i = 1; i < 13; i++) {
      const month = i > 9 ? i : '0' + i;

      events.push({
        data: {
          id: eventId(),
          title: 'Smith',
          description: "Business meeting",
          color: '#ef4444',
        },
        startDate: new Date(`${year}-${month}-01T10:30:00`),
        endDate: new Date(`${year}-${month}-01T16:15:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Smith',
          description: "Business meeting",
          color: '#ef4444',
        },
        startDate: new Date(`${year}-${month}-02T10:00:00`),
        endDate: new Date(`${year}-${month}-02T14:45:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Steel',
          description: "Dentist appointment",
          color: '#3b82f6',
        },
        startDate: new Date(`${year}-${month}-04T09:00:00`),
        endDate: new Date(`${year}-${month}-04T17:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Steel',
          description: "Dentist appointment",
          color: '#3b82f6',
        },
        startDate: new Date(`${year}-${month}-07T15:00:00`),
        endDate: new Date(`${year}-${month}-07T17:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Smith',
          description: "Business meeting",
          color: '#ef4444',
        },
        startDate: new Date(`${year}-${month}-07T09:00:00`),
        endDate: new Date(`${year}-${month}-07T15:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Rose',
          description: "Trip to the museum",
          color: '#f97316',
        },
        startDate: new Date(`${year}-${month}-10T10:00:00`),
        endDate: new Date(`${year}-${month}-10T15:30:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'York',
          description: "Discussing work",
          color: '#3b82f6',
        },
        startDate: new Date(`${year}-${month}-12T10:00:00`),
        endDate: new Date(`${year}-${month}-12T16:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Vala',
          description: "Planning project",
          color: '#84cc16',
        },
        startDate: new Date(`${year}-${month}-15T09:00:00`),
        endDate: new Date(`${year}-${month}-15T14:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Vala',
          description: "Planning project",
          color: '#84cc16',
        },
        startDate: new Date(`${year}-${month}-17T12:00:00`),
        endDate: new Date(`${year}-${month}-17T15:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Vala',
          description: "Planning project",
          color: '#84cc16',
        },
        startDate: new Date(`${year}-${month}-18T12:00:00`),
        endDate: new Date(`${year}-${month}-18T15:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'York',
          description: "Discussing work",
          color: '#3b82f6',
        },
        startDate: new Date(`${year}-${month}-19T10:00:00`),
        endDate: new Date(`${year}-${month}-19T16:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'York',
          description: "Discussing work",
          color: '#3b82f6',
        },
        startDate: new Date(`${year}-${month}-20T11:00:00`),
        endDate: new Date(`${year}-${month}-20T17:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Rose',
          description: "Trip to the museum",
          color: '#f97316',
        },
        startDate: new Date(`${year}-${month}-23T10:00:00`),
        endDate: new Date(`${year}-${month}-23T15:30:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Croft',
          description: "Meeting with Croft",
          color: '#10b981',
        },
        startDate: new Date(`${year}-${month}-25T12:00:00`),
        endDate: new Date(`${year}-${month}-25T13:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Rose',
          description: "Trip to the museum",
          color: '#f97316',
        },
        startDate: new Date(`${year}-${month}-28T10:00:00`),
        endDate: new Date(`${year}-${month}-28T13:00:00`),
      });

      events.push({
        data: {
          id: eventId(),
          title: 'Vala',
          description: "Planning project",
          color: '#84cc16',
        },
        startDate: new Date(`${year}-${month}-25T13:00:00`),
        endDate: new Date(`${year}-${month}-25T17:00:00`),
      });
    }
  }

  return events;
}

function eventId() {
  id++;
  return id;
}

// Will contain the event that is dragged
let monthDraggedEvent = null;

function renderMonthCalendar(calendar, dateGallery) {
  const calendarMonthTemplate = calendar.querySelector(
    '#calendar-month-template'
  );
  const calendarDayTemplate = calendar.querySelector(
    '#calendar-month-daycell-template'
  );
  const eventTemplate = calendar.querySelector(
    '#calendar-month-event-template'
  );

  calendar.calendarTitleEl.textContent = monthAndYearFormatter.format(
    dateGallery.firstFrame.anchorDate
  );

  const calendarMonthEl = clone(calendarMonthTemplate);

  const cellsEl = calendarMonthEl.querySelector('.calendar-month-daycells');

  const eventPositionsByDay = calculateEventPositionByDay(dateGallery);

  dateGallery.firstFrame.dates.forEach((dateObj, index) => {
    const eventsForDay = eventPositionsByDay[index];

    const dayEl = clone(calendarDayTemplate);

    // Set the aria label of the button to something sensible
    const date = new Date(dateObj.date);

    // Set the date to the current hour, and to the closest 5 minutes
    const now = new Date();
    date.setHours(now.getHours(), Math.round(now.getMinutes() / 5) * 5);

    const formatted = dateTimeFormatter.format(date);
    dayEl.ariaLabel = `Create new event at around ${formatted}`;

    if (dateObj.isPadding) {
      dayEl.classList.add('padding');
    }

    // When clicking on a day open the "event form" with the
    // clicked date selected.
    dayEl.onclick = () => {
      calendar.openNewEventForm(date);
    };

    // Now set the number of the date in the right corner
    const dayNumberEl = dayEl.querySelector('.calendar-month-daycell-number');
    dayNumberEl.innerHTML = `
      <time datetime="${dateObj.date.toISOString()}">
        ${dateObj.date.getDate()}
      </time>
    `;
    dayNumberEl.onclick = (e) => {
      e.stopPropagation();

      dateGallery.changeConfig({
        initialDate: dateObj.date,
        mode: 'day',
        numberOfFrames: 1,
      });
    };

    const eventsEl = dayEl.querySelector('.calendar-month-daycell-events');

    const noRows = eventsForDay.length;
    eventsEl.style.gridTemplateRows = `repeat(${noRows}, 32px)`;

    for (const event of dateObj.events) {
      const eventEl = clone(eventTemplate);

      // Needed for the ::before event dot
      eventEl.style.setProperty('--color', event.data.color);

      const buttonEl = eventEl.querySelector('button');
      buttonEl.ariaLabel = ariaLabelForEvent(event);

      const eventTitleEl = eventEl.querySelector('.calendar-month-event-title');
      eventTitleEl.title = event.data.title;

      const timeEl = eventEl.querySelector('.calendar-month-event-time');

      if (event.spansMultipleDays) {
        /*
          Here we put an event on a specific row in the CSS grid
          by doing this all event that are on multiple days are
          neatly ordered within a week, without any gaps.

          See the `calculateEventPositionByDay` function below to
          see how this is calculated.

          The +1 is needed because CSS Grid starts counting at 1.
        */
        eventEl.style.gridRow = eventsForDay.indexOf(event) + 1;

        eventEl.classList.add('multiple');

        buttonEl.style.color = yiq(event.data.color);
        eventEl.style.backgroundColor = event.data.color;

        /*
           An event that spans multiple days is rendered once in each 
           day the event occurs. 
           
           On the startDate we render the title and start time, on the 
           endDate we render the end time. For all days in between we 
           only give it a background color.
        */
        if (dateGallery.isSameDay(event.startDate, dateObj.date)) {
          // Adds a left border
          eventEl.classList.add('first-day-of-event');

          eventTitleEl.textContent = event.data.title;
          timeEl.textContent = timeFormatter.format(event.startDate);
        } else if (dateGallery.isSameDay(event.endDate, dateObj.date)) {
          timeEl.textContent = timeFormatter.format(event.endDate);
        }
      } else {
        // When an event happens on a single day show the title and start time.
        eventTitleEl.textContent = event.data.title;
        timeEl.textContent = timeFormatter.format(event.startDate);
      }

      // When clicking on an event open the "event form"
      // and prefill it with the clicked event.
      eventEl.onclick = (e) => {
        e.stopPropagation();

        calendar.openEditEventForm(event);
      };

      // All events are draggable.
      eventEl.draggable = true;

      // When the drag starts store which event is dragged
      eventEl.ondragstart = (e) => {
        e.stopPropagation();

        // Set the drag image to an empty image. Because we are
        // going to continuously "move" the event we do not need
        // a "ghost".
        e.dataTransfer.setDragImage(emptyImage, 0, 0);

        monthDraggedEvent = event;
      };

      eventsEl.appendChild(eventEl);
    }

    // When the event is dragged over a day, set that day as the
    // events startDate, but keep the original duration of the event.
    dayEl.ondragover = (e) => {
      e.stopPropagation();

      // Create a new startDate based on the date that the event
      // has been dragged over.
      const startDate = new Date(date);

      // Now copy the original start hours.
      startDate.setHours(
        monthDraggedEvent.startDate.getHours(),
        monthDraggedEvent.startDate.getMinutes()
      );

      // Calculate the duration of the event.
      const duration =
        monthDraggedEvent.endDate.getTime() - monthDraggedEvent.startDate.getTime();

      // Add the duration to the new startDate to get the endDate
      const endDate = new Date(startDate.getTime() + duration);

      monthDraggedEvent.move({
        startDate,
        endDate,
      });
    };

    cellsEl.appendChild(dayEl);
  });

  calendar.calendarWrapperEl.appendChild(calendarMonthEl);
}

function writeMonthTemplates(calendar) {
  calendar.innerHTML += `
    <template id="calendar-month-template">
      <div class="calendar-month">
        <ul class="calendar-month-daynames">
          <li class="calendar-month-dayname">Sun</li>
          <li class="calendar-month-dayname">Mon</li>
          <li class="calendar-month-dayname">Tue</li>
          <li class="calendar-month-dayname">Wed</li>
          <li class="calendar-month-dayname">Thu</li>
          <li class="calendar-month-dayname">Fri</li>
          <li class="calendar-month-dayname">Sat</li>
        </ul>

        <ul class="calendar-month-daycells"></ul>
      </div>
    </template>

    <template id="calendar-month-daycell-template">
      <li class="calendar-month-daycell" role="button">
        <button class="calendar-month-daycell-number"></button>
        <ul class="calendar-month-daycell-events">
        </ul>
      </li>
    </template>

    <template id="calendar-month-event-template">
      <li class="calendar-month-event">
        <button class="calendar-month-event-wrapper">
          <span class="calendar-month-event-title"></span>
          <span class="calendar-month-event-time"></span>
        </button>
      </li>
    </template>
  `;
}

/* 
  Takes a calendar and returns an array of arrays, each
  subarray represents a day and contains all events of that
  day. 
  
  The position / index of the event with the "day" array is 
  the "row" it should be put in the CSS Grid.
  
  The events are packed as tight as possible so the least
  amount of rows are used.
*/
function calculateEventPositionByDay(dateGallery) {
  // Will contain an array for each day of the month
  const month = [];

  dateGallery.firstFrame.dates.forEach((dateObj, index) => {
    // Will contain all events within the day.
    const day = [];

    const prevDay = month[index - 1];

    dateObj.events.forEach((event) => {
      if (!event.spansMultipleDays) {
        return;
      }

      // If there is a previous day, meaning it is not the
      // first day of the displayed month calendar
      if (prevDay) {
        // Try finding the event within the previous day
        const index = prevDay.indexOf(event);

        // If the event exists add it on this day at the same index / row
        // as the day before, this makes an event appear on the same
        // row for multiple days which is visually pleasing.
        if (index !== -1) {
          day[index] = event;
          return;
        }
      }

      let firstEmptyIndex = 0;

      // Find the first empty position within the `day` array.
      // This way we find the first empty row and fill it, this
      // makes sure the events are packed close together.
      while (day[firstEmptyIndex]) {
        firstEmptyIndex++;
      }

      day[firstEmptyIndex] = event;
    });

    month.push(day);
  });

  return month;
}

function clone(template) {
  return template.content.cloneNode(true).firstElementChild;
}

// Based on the background color given, it will return
// whether or not the text color should be black or white.
function yiq(backgroundColorHex) {
  const r = parseInt(backgroundColorHex.substr(1, 2), 16);
  const g = parseInt(backgroundColorHex.substr(3, 2), 16);
  const b = parseInt(backgroundColorHex.substr(5, 2), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}

// When given a date it returns the number of minutes
// that have passed since midnight. For example if the time
// was 12:30 you would get 12 * 60 + 30 = 750 minutes.
function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes();
}

// When given a date it returns the number of minutes
// that have passed since the startHour.
function getMinutesSinceStart(date, startHour) {
  const midnight = minutesSinceMidnight(date);

  // Since we start on 09:00 hours we need to treat 09:00 hours
  // as the starting point, so shift the minutes back by 09:00
  // hours.
  const minutesSinceStart = midnight - startHour * 60;

  // If the start time lied before the startHour, place it on
  // the start.
  if (minutesSinceStart < 0) {
    return 0;
  }

  return minutesSinceStart;
}

// An empty image used when dragging of an event, so
// no drag ghost appears
const emptyImage = document.createElement('img');
// Set the src to be a 0x0 gif
emptyImage.src =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

// Will contain information when event is dragged.
const weekDragData = {
  yAtDragStart: 0,
  dragStartTime: 0,
  dragEndTime: 0,
};

function renderWeekCalendar(calendar, dateGallery) {
  const calendarWeekTemplate = calendar.querySelector(
    '#calendar-week-template'
  );

  const eventTemplate = calendar.querySelector('#calendar-week-event-template');

  calendar.calendarTitleEl.textContent = monthAndYearFormatter.format(
    dateGallery.firstFrame.anchorDate
  );

  const weekEl = clone(calendarWeekTemplate);

  const gridEl = weekEl.querySelector('.calendar-week-grid');
  gridEl.style.setProperty('--height', WEEK_HEIGHT);

  renderLeftHours(gridEl);

  dateGallery.firstFrame.dates.forEach((dateObj, index) => {
    const eventColumns = calculateEventColumns(dateObj);

    const dayNameEl = document.createElement('button');
    dayNameEl.className = 'calendar-week-dayname';
    dayNameEl.innerHTML = `
          <time datetime="${dateObj.date.toISOString()}">
            ${weekDayFormatter.format(dateObj.date)}
          </time>
        `;
    dayNameEl.style.gridColumn = index + 2;

    // When clicking on a day open the "event form" with the
    // clicked date selected.
    dayNameEl.onclick = (e) => {
      e.preventDefault();

      dateGallery.changeConfig({
        initialDate: dateObj.date,
        mode: 'day',
        numberOfFrames: 1,
      });
    };

    gridEl.appendChild(dayNameEl);

    // Will be a subgrid for each day containing the events
    const dayEl = document.createElement('ul');

    // Store the date of this element, for event drag and drop
    dayEl.dataset.date = dateObj.date.getTime();

    // Create sub grid for each day in the week.
    dayEl.className = 'calendar-week-day-grid';
    dayEl.style.gridColumn = dateObj.date.getDay() + 2;

    dateObj.events.forEach((event) => {
      const eventEl = clone(eventTemplate);

      eventEl.style.backgroundColor = event.data.color;

      const buttonEl = eventEl.querySelector('button');
      buttonEl.style.backgroundColor = event.data.color;
      buttonEl.style.color = yiq(event.data.color);
      buttonEl.ariaLabel = ariaLabelForEvent(event);

      const titleEl = eventEl.querySelector('i');
      titleEl.title = event.data.title;
      titleEl.textContent = event.data.title;

      const [startTimeEl, endTimeEl] = Array.from(
        eventEl.querySelectorAll('b')
      );

      eventEl.querySelector('.event-description').textContent =
        event.data.description;

      const [startTimeDragEl, endTimeDragEl] = Array.from(
        eventEl.querySelectorAll('.drag-indicator')
      );

      /*
          An event that spans multiple days is rendered once in each 
          day the event occurs. 
          
          On dates that match the startDate and endDate we make draggable.
        */
      if (event.spansMultipleDays) {
        if (dateGallery.isSameDay(event.startDate, dateObj.date)) {
          // When the event starts on this day, make it span the
          // entire day, as we know it does not end on this day.
          const start = getMinutesSinceStart(event.startDate, WEEK_START_HOUR);
          eventEl.style.gridRow = `${start + 1} / ${WEEK_HEIGHT}`;

          // No end time indicator as it is on another day
          endTimeDragEl.draggable = false;

          // Show start time only on first day
          startTimeEl.textContent = timeFormatter.format(event.startDate);
        } else if (dateGallery.isSameDay(event.endDate, dateObj.date)) {
          // When the event ends on this day start it at midnight, since
          // we know it started on a previous day.
          const end = getMinutesSinceStart(event.endDate, WEEK_START_HOUR);

          eventEl.style.gridRow = `1 / ${end + 2}`;

          // No start time drag indicator as it is on another day
          startTimeDragEl.draggable = false;

          // Show end time only on last day
          endTimeEl.textContent = timeFormatter.format(event.endDate);
        } else {
          // When the event is during this whole day take up all space
          eventEl.style.gridRow = `1 / ${WEEK_HEIGHT}`;

          // No start / end drag indicator as it is on another day
          startTimeDragEl.draggable = false;
          endTimeDragEl.draggable = false;
        }
      } else {
        // The event is contained within this day.

        const start = getMinutesSinceStart(event.startDate, WEEK_START_HOUR);
        const end = getMinutesSinceStart(event.endDate, WEEK_START_HOUR);

        eventEl.style.gridRow = `${start + 1} / ${end + 1}`;

        // It has both start and end time drag, and additionaly
        // the event can be dragged itself.
        event.draggable = true;

        // When fully in this day show both times
        startTimeEl.textContent = timeFormatter.format(event.startDate);
        endTimeEl.textContent = timeFormatter.format(event.endDate);
      }

      eventEl.style.gridColumn = eventColumns.get(event);

      // When clicking on an event open the "event form"
      // and prefill it with the clicked event.
      eventEl.onclick = (e) => {
        e.stopPropagation();

        calendar.openEditEventForm(event);
      };

      // An event is draggable when it can be fitted on this day
      eventEl.draggable = event.spansMultipleDays === false;

      // When the drag starts store information about which event is dragged
      function onDragStart(e) {
        e.stopPropagation();

        // Store what the mouse position was at the start of the drag.
        // Used to calulate how many minutes the user wants the event
        // to move.
        weekDragData.yAtDragStart = e.clientY;

        // Set store the original start and end time for when
        // the dragging began. This way we always know the
        // original times even after we "move" the event.
        weekDragData.dragStartTime = new Date(event.startDate).getTime();
        weekDragData.dragEndTime = new Date(event.endDate).getTime();

        // Set the drag image to an empty image. Because we are
        // going to continuously "move" the event we do not need
        // a "ghost".
        e.dataTransfer.setDragImage(emptyImage, 0, 0);
      }

      // When the the event is dragged alter the time period of the vent.
      function onDrag(e) {
        e.stopPropagation();

        // Sometimes the clientX is suddenly zero on drag end,
        // do nothing if this is the case. Otherwise the event
        // will suddenly jump to the previous day
        if (e.clientX === 0) {
          return;
        }

        // The number of minutes moved is the amount of pixels away
        // the cursor (clientY) is from the clientY at the start of
        // the drag start.
        const minutesMoved = e.clientY - weekDragData.yAtDragStart;

        // Find the dayEl element the cursor is currently hovering
        // over, if it has found one the date of the event must
        // be changed.
        const hoveredDayEl = document
          .elementsFromPoint(e.clientX, e.clientY)
          .find((element) => {
            return element.classList.contains('calendar-week-day-grid');
          });

        // The user might mouse out of the calendar, in that case default
        // to the current startDate
        let movedToDate = event.startDate;
        if (hoveredDayEl) {
          movedToDate = new Date(parseInt(hoveredDayEl.dataset.date, 10));
        }

        // Move by an increment of 5 minutes, to create a snap effect
        if (
          minutesMoved % 5 === 0 ||
          !dateGallery.isSameDay(movedToDate, event.startDate)
        ) {
          // Date constructor wants milliseconds since 1970
          const msMoved = minutesMoved * 60 * 1000;

          // Note: moving the event will cause the entire DOM to be ripped
          // to shreds and be rebuilt. So the 5 minute snap effect is
          // also a performance boost.

          if (e.target === eventEl) {
            const duration = weekDragData.dragEndTime - weekDragData.dragStartTime;

            // First update to the new start time
            const startDate = new Date(weekDragData.dragStartTime + msMoved);

            /* 
                Second update the start date.
                
                We do this via a call to `setFullYear` with all date parts. 
                Setting them in separate calls like this:
                
                startDate.setFullYear(movedToDate.getFullYear());
                startDate.setMonth(movedToDate.getMonth());
                startDate.setDate(movedToDate.getDate());
  
                Could cause a very nasty bug were it could set the date to a non 
                existing date. But only for very few dates were the size of the 
                month differs from the month the date is moved into.
                
                The bug can be triggered like so:
  
                const d = new Date(2024, 30, 1); // 1/30/2024 - Feb 30th 2024
                d.setFullYear(2025) // Date is now 1/30/2025
                d.setMonth(2); // Date tries to be 2/30/2025, which doesn't exist, and rolls over to 3/1/2025
                d.setDate(15); // Date is now 3/15/2025 instead of 2/15/2025 as expected
  
                The above I credit to Marc Hughes see: https://github.com/Simon-Initiative/oli-torus/pull/4614
              */
            startDate.setFullYear(
              movedToDate.getFullYear(),
              movedToDate.getMonth(),
              movedToDate.getDate()
            );

            // Move both start and end times with the same values
            // so the duration of the event stays the same.
            event.move({
              startDate: startDate,
              endDate: new Date(startDate.getTime() + duration),
            });
          } else if (e.target === startTimeDragEl) {
            // Move only the start time
            event.move({
              startDate: new Date(weekDragData.dragStartTime + msMoved),
              endDate: event.endDate,
            });
          } else {
            // Move only the end time
            event.move({
              startDate: event.startDate,
              endDate: new Date(weekDragData.dragEndTime + msMoved),
            });
          }
        }
      }

      eventEl.ondragstart = onDragStart;
      startTimeDragEl.ondragstart = onDragStart;
      endTimeDragEl.ondragstart = onDragStart;

      eventEl.ondrag = onDrag;
      startTimeDragEl.ondrag = onDrag;
      endTimeDragEl.ondrag = onDrag;

      dayEl.appendChild(eventEl);
    });

    // When clicking on a hour open the "event form" with the
    // clicked hour selected.
    dayEl.onclick = (event) => {
      // To determine the minute we look to where the user
      // clicked in the day cell. Remember: the day cell
      // is HEIGHTpx in height, one pixel per minute.
      const rect = dayEl.getBoundingClientRect();
      const distanceInMinutes = event.clientY - rect.top;

      const hour = Math.floor(distanceInMinutes / 60);

      let minute = Math.round(distanceInMinutes % 60);
      // Round to closest 5 minutes
      minute = Math.round(minute / 5) * 5;

      const date = new Date(dateObj.date);
      date.setHours(hour, minute);

      calendar.openNewEventForm(date);
    };

    gridEl.appendChild(dayEl);
  });

  calendar.calendarWrapperEl.appendChild(weekEl);
}

function renderLeftHours(gridEl) {
  // Render the hours on the left
  for (let i = WEEK_START_HOUR; i < WEEK_END_HOUR + 1; i++) {
    const hourEl = document.createElement('span');
    hourEl.className = 'calendar-week-hour';
    hourEl.ariaHidden = true;

    const row = (i - WEEK_START_HOUR) * 60 + 3;
    hourEl.style.gridRow = `${row} / ${row + 60}`;

    const date = new Date();
    date.setHours(i, 0, 0, 0);

    const time = timeFormatter.format(date);
    hourEl.textContent = time;

    gridEl.appendChild(hourEl);
  }
}

function writeWeekTemplates(calendar) {
  calendar.innerHTML += `
      <template id="calendar-week-template">
        <div class="calendar-week">
          <div class="calendar-week-grid"></div>
        </div>
      </template>
  
      <template id="calendar-week-event-template">
        <li class="calendar-week-event">
          <button>
            <span class="drag-indicator" draggable="true"></span>
            <span class="text-container">
              <span class="inner-text-container">
                <b></b>
                <i></i>
                <span class="event-description"></span>
              </span>
              <b class="end-time"></b>
            </span>
            <span class="drag-indicator" draggable="true"></span>
          </button>
        </li>
      </template>
    `;
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
    two events take the same amount of space in the 3 columms. 
    Essentialy making the 2 events the same size, but unfortunately 
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

function renderYearCalendar(calendar, dateGallery) {
  const calendarMonthTemplate = calendar.querySelector(
    '#calendar-year-template'
  );

  const calendarDayTemplate = calendar.querySelector(
    '#calendar-year-daycell-template'
  );

  calendar.calendarTitleEl.textContent = yearFormatter.format(
    dateGallery.firstFrame.anchorDate
  );

  const wrapperEl = document.createElement('ul');
  wrapperEl.className = 'calendar-year-months';

  dateGallery.frames.forEach((frame) => {
    const calendarMonthEl = clone(calendarMonthTemplate);

    const monthNameEl = calendarMonthEl.querySelector(
      '.calendar-year-monthname'
    );
    monthNameEl.textContent = monthFormatter.format(frame.anchorDate);
    monthNameEl.onclick = () => {
      dateGallery.changeConfig({
        mode: 'month-six-weeks',
        numberOfFrames: 1,
        initialDate: frame.anchorDate,
      });
    };

    const cellsEl = calendarMonthEl.querySelector('.calendar-year-daycells');

    frame.dates.forEach((dateObj) => {
      const dayEl = clone(calendarDayTemplate);

      /*
       Place the dayEl in the correct column, this is only needed
       for the "month" mode because it starts at the first of the 
       month, which may be on an other day than the start of 
       the week.

       The +1 is needed because CSS Grid starts counting at 1.
    */
      dayEl.style.gridColumn = dateObj.date.getDay() + 1;

      if (dateObj.hasEvents) {
        dayEl.classList.add('has-event');
      }

      // When clicking on a day open the "event form" with the
      // clicked date selected.
      dayEl.onclick = (e) => {
        e.preventDefault();

        dateGallery.changeConfig({
          initialDate: dateObj.date,
          mode: 'day',
          numberOfFrames: 1,
        });
      };

      // Now set the number of the date in the right corner
      const dayNumberEl = dayEl.querySelector('.calendar-year-daycell-number');
      dayNumberEl.innerHTML = `
        <time datetime="${dateObj.date.toISOString()}">
          ${dateObj.date.getDate()}
        </time>
      `;

      cellsEl.appendChild(dayEl);
    });

    wrapperEl.appendChild(calendarMonthEl);
  });

  calendar.calendarWrapperEl.appendChild(wrapperEl);
}

function writeYearTemplates(calendar) {
  calendar.innerHTML += `
    <template id="calendar-year-template">
      <li class="calendar-year">
        <button class="calendar-year-monthname">December</button>

        <ul class="calendar-year-daynames">
          <li class="calendar-year-dayname"><abbr title="Sunday">S</abbr></li>
          <li class="calendar-year-dayname"><abbr title="Monday">M</abbr></li>
          <li class="calendar-year-dayname"><abbr title="Tuesday">T</abbr></li>
          <li class="calendar-year-dayname"><abbr title="Wednesday">W</abbr></li>
          <li class="calendar-year-dayname"><abbr title="Thursday">T</abbr></li>
          <li class="calendar-year-dayname"><abbr title="Friday">F</abbr></li>
          <li class="calendar-year-dayname"><abbr title="Saturday">S</abbr></li>
        </ul>

        <ul class="calendar-year-daycells"></ul>
      </li>
    </template>

    <template id="calendar-year-daycell-template">
      <li class="calendar-year-daycell">
        <button class="calendar-year-daycell-number"></button>
      </li>
    </template>
  `;
}
