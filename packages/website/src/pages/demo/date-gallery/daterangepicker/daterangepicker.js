import { DateGallery } from "@uiloos/core";
import { parseAsDate } from "../datepicker/datepicker.js";
/*
  It is highly recommended to use a date library parse / validate
  dates, using date-fns here, but you could also use Luxon, dayjs or 
  Moment.js
*/
import { isValid } from "date-fns";

// 12:45
export const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23", // 00:00 to 23:59 instead of 24:00
});

// December
export const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
});

// 12-31-2000
export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/*
  DateRangePicker is a custom element that combines two Datepicker elements
  together, adds a single picker for both of them, and adds a validation check
  that the start date must lie on or before the end date.
*/
class DateRangePicker extends HTMLElement {
  // Listen to changes in min, max and required, when changed it
  // will call attributeChangedCallback
  static observedAttributes = [
    "min",
    "max",
    "required",
    "start-value",
    "end-value",
  ];

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  connectedCallback() {
    // Note: this custom element works in the "light" DOM
    // and not the Shadow DOM.

    const startName = this.getAttribute("start-name") ?? "start";
    const endName = this.getAttribute("end-name") ?? "end";

    const startValue = this.getAttribute("start-value") ?? "";
    const endValue = this.getAttribute("end-value") ?? "";

    const startLabel = this.getAttribute("start-label") ?? "Start";
    const endLabel = this.getAttribute("end-label") ?? "End";

    const startErrorLabel = this.getAttribute("start-error-label") ?? "Start";
    const endErrorLabel = this.getAttribute("end-error-label") ?? "End";

    this.timeEnabled = this.hasAttribute("time");

    this.innerHTML = `
      <div class="daterangepicker">
        <label>
          ${startLabel}: 
          <uiloos-datepicker 
            name="${startName}" 
            value="${startValue}"
            ${this.timeEnabled ? "time" : ""}
          ></uiloos-datepicker>
        </label>
       
        <label>
          ${endLabel}: 
          <uiloos-datepicker 
            name="${endName}" 
            value="${endValue}"
            ${this.timeEnabled ? "time" : ""}
          ></uiloos-datepicker>
        </label>

        <dialog></dialog>
      </div>`;

    const [startDateEl, endDateEl] = this.querySelectorAll("uiloos-datepicker");

    this.startDateEl = startDateEl;
    this.endDateEl = endDateEl;

    // Bind the two datepickers together, so they will start validating the range
    startDateEl.linkedPicker = endDateEl;
    endDateEl.linkedPicker = startDateEl;

    // Tell them which is which.
    startDateEl.position = "start";
    endDateEl.position = "end";
    startDateEl.label = startErrorLabel;
    endDateEl.label = endErrorLabel;

    // Remove their dialogs
    startDateEl.dialogEl.remove();
    endDateEl.dialogEl.remove();

    // Now that the inputs are set call "attributeChangedCallback" manually
    // since they did not get the initial value.
    this.attributeChangedCallback("min", null, this.getAttribute("min"));
    this.attributeChangedCallback("max", null, this.getAttribute("max"));
    this.attributeChangedCallback(
      "required",
      null,
      this.getAttribute("required"),
    );

    this.dialogEl = this.querySelector("dialog");

    // Get the inner uiloos-datepicker buttons and override their behavior
    this.querySelectorAll("button").forEach((button) => {
      button.onclick = () => {
        this.showPicker();
      };
    });

    // Will store the date that was selected first by the user
    this.firstSelectedDate = null;
    this.rangeComplete = false;

    // Stores the direction the keyboard arrow keys moved the date
    this.keyboardDirection = "later"; // or 'earlier'

    this.dialogEl.onclose = () => {
      // Clear the dateGallery whenever the modal is closed as
      // it is no longer needed.
      this.dateGallery = null;

      // Also clear the dialog so it is no longer visible
      this.dialogEl.innerHTML = "";

      this.dialogEl.onkeydown = undefined;

      this.firstSelectedDate = null;
      this.rangeComplete = false;
    };

    // Close dialog when backdrop is clicked
    this.dialogEl.onclick = (event) => {
      if (event.target.nodeName === "DIALOG") {
        this.dialogEl.close();
      }
    };
  }

  disconnectedCallback() {
    this.innerHTML = "";
    this.dateGallery = null;
    this.dialogEl = null;
    this.startDateEl = null;
    this.endDateEl = null;
  }

  showPicker() {
    // Open the dialog when clicked
    this.dialogEl.showModal();

    // Create a dateGallery when clicked, this way the
    // DateGallery does not exist and take up memory
    // when the calendar button is never clicked.

    const daterangepicker = this;
    this.dateGallery = new DateGallery(
      {
        mode: "month",
        maxSelectionLimit: false,
        canSelect(dateObj) {
          if (daterangepicker.min && dateObj.date < daterangepicker.min) {
            return false;
          } else if (
            daterangepicker.max &&
            dateObj.date > daterangepicker.max
          ) {
            return false;
          }

          return true;
        },
      },
      (dateGallery, event) => {
        // First we handle the various selected events, we do not
        // want to re-render the datepicker to aggressively here
        // since we select on hover for the animaton. So instead
        // of re-rendering the entire <dialog> we change the
        // existing DOM.
        if (
          event.type === "DATE_SELECTED" ||
          event.type === "DATE_SELECTED_MULTIPLE" ||
          event.type === "DATE_DESELECTED_MULTIPLE"
        ) {
          this._syncDayButtons();
          return;
        }

        // For all other events we re-create the <dialog>
        daterangepicker.dialogEl.innerHTML = `
          <form method="dialog">
            <div class="daterangepicker-dialog-content">
              <span>Please select a range</span>

              <div class="daterangepicker-dialog-content-calendar">
                <div class="topbar">
                  <button aria-label="previous" type="button">‹</button>
                  <span class="topbar-input-wrapper">
                    <select class="month"></select>
                    <input class="year"></select>
                  </span>
                  <button aria-label="next" type="button">›</button>
                </div>

                <ul class="daygrid">
                  <li><abbr title="Sunday">S</abbr></li>
                  <li><abbr title="Monday">M</abbr></li>
                  <li><abbr title="Tuesday">T</abbr></li>
                  <li><abbr title="Wednesday">W</abbr></li>
                  <li><abbr title="Thursday">T</abbr></li>
                  <li><abbr title="Friday">F</abbr></li>
                  <li><abbr title="Saturday">S</abbr></li>
                </ul>

                <ul class="dates daygrid"></ul>
              </div>

              <div class="bottombar">
                <button type="button">Cancel</button>
                <button type="button">Today</button>
                <button type="button">Save</button>
              </div>
             </form>
           `;

        const [prevButtonEl, nextButtonEl] = Array.from(
          daterangepicker.dialogEl.querySelectorAll(".topbar button"),
        );

        prevButtonEl.onclick = () => {
          dateGallery.previous();
        };

        nextButtonEl.onclick = () => {
          dateGallery.next();
        };

        const monthSelectEl =
          daterangepicker.dialogEl.querySelector("select.month");

        for (let month = 0; month < 12; month++) {
          const label = monthFormatter.format(new Date(2000, month, 1));

          const isSelected =
            dateGallery.firstFrame.anchorDate.getMonth() === month;

          monthSelectEl.innerHTML += `<option ${
            isSelected ? "selected" : ""
          } value="${month}">${label}</option>`;
        }

        monthSelectEl.onchange = (e) => {
          const month = parseInt(e.target.value, 10);

          const date = new Date(dateGallery.firstFrame.anchorDate);
          date.setMonth(month);

          dateGallery.changeConfig({ initialDate: date });
        };

        const yearInputEl =
          daterangepicker.dialogEl.querySelector("input.year");
        yearInputEl.value = dateGallery.firstFrame.anchorDate.getFullYear();

        yearInputEl.onchange = (e) => {
          let year = parseInt(e.target.value, 10);

          if (isNaN(year)) {
            year = new Date().getFullYear();
            yearInputEl.value = year;
          }

          const date = new Date(
            year,
            dateGallery.firstFrame.anchorDate.getMonth(),
            dateGallery.firstFrame.anchorDate.getDate(),
          );

          dateGallery.changeConfig({ initialDate: date });
        };

        const datesEl = daterangepicker.dialogEl.querySelector(".dates");

        datesEl.innerHTML = "";

        dateGallery.firstFrame.dates.forEach((dateObj) => {
          const dayEl = document.createElement("li");

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

          this._setDayButtonClasses(buttonEl, dateObj);

          dayEl.onclick = () => {
            // If the user has not selected any date yet
            if (this.firstSelectedDate === null) {
              // Store that date that was clicked
              this.firstSelectedDate = dateObj.date;

              // Treat it as the user wanting to start
              // a new selection on that date.
              dateGallery.deselectAll();

              // Also visually select this date so it becomes blue.
              dateGallery.selectDate(this.firstSelectedDate);

              // Reset so hover animation works again.
              this.rangeComplete = false;
            } else {
              /*
                If the user has already selected a date the
                second click should close the range.

                Note: selectRange does not care in which order
                it receives the parameters, it will find the
                earlier and later dates itself.
              */
              dateGallery.selectRange(this.firstSelectedDate, dateObj.date);

              // Now reset the firstSelectedDate so the next click
              // is treated as the user wanting to change the range
              //again.
              this.firstSelectedDate = null;

              // Mark the range as complete
              this.rangeComplete = true;
            }
          };

          // Hover select animation
          dayEl.onmouseover = () => {
            // If the user has selected the first day and the
            // range is not complete do the hover animation.
            if (this.firstSelectedDate && !this.rangeComplete) {
              dateGallery.deselectAll();
              dateGallery.selectRange(this.firstSelectedDate, dateObj.date);
            }
          };

          datesEl.appendChild(dayEl);
        });

        const [cancelButtonEl, todayButtonEl, saveButtonEl] = Array.from(
          daterangepicker.dialogEl.querySelectorAll(".bottombar button"),
        );

        cancelButtonEl.onclick = () => {
          this.dialogEl.close();
        };

        todayButtonEl.onclick = () => {
          this.dateGallery.today();
        };

        saveButtonEl.onclick = () => {
          this._saveAndClose();
        };
      },
    );

    // If there is already a selection reselect it.
    if (this.startDateEl.value && this.endDateEl.value) {
      const startDate = parseAsDate(this.startDateEl.value);
      const endDate = parseAsDate(this.endDateEl.value);

      if (isValid(startDate) && isValid(endDate)) {
        this.dateGallery.changeConfig({ initialDate: endDate });
        this.dateGallery.selectRange(startDate, endDate);
      }
    }

    this.dialogEl.onkeydown = (event) => {
      // Do not interfere with the year <input>
      if (event.target.nodeName === "INPUT") {
        return;
      }

      // Stop the propagation here so not all elements
      // are called for better performance.
      event.stopPropagation();

      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
      ) {
        this.firstSelectedDate = null;

        // If there is no date selected select the first date
        // that can be selected from the first frame.
        if (this.dateGallery.selectedDates.length === 0) {
          const dateObj = this.dateGallery.firstFrame.dates.find(
            (dateObj) => dateObj.canBeSelected,
          );

          if (dateObj) {
            // Select the date so it highlights in blue.
            this.dateGallery.selectDate(dateObj.date);
          }

          return;
        }

        // Base the direction on when the first date of the
        // range is selected. This will also be true when
        // a range is reduced to 1 again.
        if (this.dateGallery.selectedDates.length === 1) {
          if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
            this.keyboardDirection = "earlier";
          } else {
            this.keyboardDirection = "later";
          }
        }

        const [startDate, endDate] =
          this._getStartAndEndDateOfSelectedDatesRange();

        // We want to change the range in the direction
        // the arrow keys go but keep the other date as is.
        let moveDate = null;
        let otherDate = null;

        if (this.keyboardDirection === "earlier") {
          moveDate = startDate;
          otherDate = endDate;
        } else {
          moveDate = endDate;
          otherDate = startDate;
        }

        // Copy last moveDate so the original is
        // not mutated. This is undesirable when the
        // start date is the same as the endDate when
        // the number of moveDate is 1, as the code
        // below would then update them both!
        moveDate = new Date(moveDate);

        // Mutate the moveDate based on the arrow keys
        if (event.key === "ArrowLeft") {
          moveDate.setDate(moveDate.getDate() - 1);
        } else if (event.key === "ArrowRight") {
          moveDate.setDate(moveDate.getDate() + 1);
        } else if (event.key === "ArrowUp") {
          moveDate.setDate(moveDate.getDate() - 7);
        } else if (event.key === "ArrowDown") {
          moveDate.setDate(moveDate.getDate() + 7);
        }

        // Select the date so it highlights in blue.
        this.dateGallery.deselectAll();
        this.dateGallery.selectRange(moveDate, otherDate);

        // Change the initialDate (changes the frames) so the user
        // can navigate to other months when month changes
        if (
          moveDate.getMonth() !==
          this.dateGallery.firstFrame.anchorDate.getMonth()
        ) {
          this.dateGallery.changeConfig({ initialDate: moveDate });

          // Set the focus back on the dialogEl otherwise
          // the arrow keys will not work after the frame
          // has been switched.
          this.dialogEl.focus();
        }
      } else if (event.key === "Enter") {
        // When enter is pressed close the dialog and set
        // the value to the selected date.

        // We do not want the dialog to open again.
        event.preventDefault();

        this._saveAndClose();
      }
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // attributeChangedCallback is called before connectedCallback
    // ignore those calls.
    if (this.startDateEl === undefined || this.endDateEl === undefined) {
      return;
    }

    if (name === "start-value") {
      this.startDateEl.value = newValue;
    } else if (name === "end-value") {
      this.endDateEl.value = newValue;
    } else {
      // Pass along min, max and required to both inputs.
      this.startDateEl.attributeChangedCallback(name, oldValue, newValue);
      this.endDateEl.attributeChangedCallback(name, oldValue, newValue);

      if (name === "min") {
        this.min = parseAsDate(newValue);
      } else if (name === "max") {
        this.max = parseAsDate(newValue);
      }
    }
  }

  _syncDayButtons() {
    const buttonEls = this.dialogEl.querySelectorAll(`.dates button`);

    this.dateGallery.firstFrame.dates.forEach((dateObj, index) => {
      const buttonEl = buttonEls[index];

      this._setDayButtonClasses(buttonEl, dateObj);
    });
  }

  _setDayButtonClasses(buttonEl, dateObj) {
    // Reset the classnames
    buttonEl.className = "";

    if (dateObj.isSelected) {
      buttonEl.classList.add("selected");
    }

    if (this.dateGallery) {
      const [startDate, endDate] =
        this._getStartAndEndDateOfSelectedDatesRange();

      if (this.dateGallery.isSameDay(startDate, dateObj.date)) {
        buttonEl.classList.add("start-of-range");
      } else if (this.dateGallery.isSameDay(endDate, dateObj.date)) {
        buttonEl.classList.add("end-of-range");
      }
    }
  }

  _saveAndClose() {
    const [startDate, endDate] = this._getStartAndEndDateOfSelectedDatesRange();

    const start = dateFormatter.format(startDate);
    const end = dateFormatter.format(endDate);

    if (this.timeEnabled) {
      const startTime = this._getTimeOfDate(this.startDateEl.value);
      const endTime = this._getTimeOfDate(this.endDateEl.value);

      this.startDateEl.value = `${start} ${startTime}`;
      this.endDateEl.value = `${end} ${endTime}`;
    } else {
      this.startDateEl.value = start;
      this.endDateEl.value = end;
    }

    this.dialogEl.close();
  }

  _getStartAndEndDateOfSelectedDatesRange() {
    // Sort from past to future.
    const sorted = [...this.dateGallery.selectedDates].sort(
      (a, b) => a.getTime() - b.getTime(),
    );

    // The first date is the start date.
    const startDate = sorted.at(0) ?? new Date();

    // The last date is the end date
    const endDate = sorted.at(-1) ?? new Date();

    return [startDate, endDate];
  }

  _getTimeOfDate(date) {
    let time = parseAsDate(date);

    if (this.timeEnabled) {
      return timeFormatter.format(time);
    } else {
      return "00:00";
    }
  }
}

customElements.define("uiloos-daterangepicker", DateRangePicker);
