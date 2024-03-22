/*
  It is highly recommended to use a date library parse / validate
  dates, using date-fns here, but you could also use Luxon, dayjs or 
  Moment.js
*/
import { parse, isValid } from "date-fns";

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
  Datepicker is a custom form element, which behaves like a 
  normal form element would because it has the same APIs.

  We recommend reading these two articles:

    1. https://web.dev/articles/more-capable-form-controls#defining_a_form-associated_custom_element
    2. https://html.spec.whatwg.org/dev/custom-elements.html

  Features:

  1. Can be made required via required attribute
  2. Supports min and max dates via attributes
  3. Can hide datepicker when no-picker attribute is set.
  4. Can parse special strings such as "today" / "yesterday" and "tomorrow" to dates
     when entered in the date input directly.
  5. Can also ask the user for the time.
  6. Can set an initial value to start the picker in
*/
class Datepicker extends HTMLElement {
  // This custom element is supposed to be used inside of a form!
  // This makes it behave as an actual form element, as long as
  // all methods are implemented.
  static formAssociated = true;

  // Listen to changes in min, max and required, when changed it
  // will call attributeChangedCallback
  static observedAttributes = ["min", "max", "required"];

  constructor() {
    super();
    this.internals = this.attachInternals();

    /* 
      This datepicker is used twice in the daterangepicker, 
      and is either the 'start' or 'end' datepicker. As such
      any date must be before on or after its linked picker
      based on the relation.

      This information is needed to add some extra validation logic.
    */
    this.linkedPicker = null; // No relation by default
    this.position = "start"; // 'start' or 'end'
    this.label = ""; // Will be filled in by the daterangepicker
  }

  connectedCallback() {
    this.timeEnabled = this.hasAttribute("time");

    // Note: this custom element works in the "light" DOM
    // and not the Shadow DOM.
    this.innerHTML = `
      <div class="datepicker">
        <div class="datepicker-input-wrapper">
          <input type="text" class="date" placeholder="06/31/2000" />
          ${this.timeEnabled ? '<input type="text" class="time" placeholder="12:30" />' : ""}
          <button aria-label="Open calendar" class="calendar-button" type="button" >📅</button>
        </div>
        <span class="error"></span>
        <dialog></dialog>
      </div>
      `;

    this.label = this.getAttribute("label") ?? "Value";

    const [dateInputEl, timeInputEl] = this.querySelectorAll("input");

    this.dateInputEl = dateInputEl;
    this.timeInputEl = timeInputEl;

    this.errorEl = this.querySelector(".error");
    this.dialogEl = this.querySelector("dialog");

    // Get the calendar button
    this.buttonEl = this.querySelector("button");

    // If the developer does not want to show a picker do not show it.
    this.noPicker = this.hasAttribute("no-picker");
    if (this.noPicker) {
      this.buttonEl.remove();
    }

    // Whenever the input changes update the value.
    this.dateInputEl.addEventListener("change", (event) => {
      // Clone since the event cannot be re-dispatched.
      const clone = new event.constructor(event.type, event);

      this.dispatchEvent(clone);

      const value = this.dateInputEl.value;

      // This allows the user to enter "today" / "tomorrow" and "yesterday"
      // and get it transformed back to a date.
      if (["today", "tomorrow", "yesterday"].includes(value)) {
        const date = dateFormatter.format(parseAsDate(value));

        this._changeDate(date);
      } else {
        this._changeDate(value);
      }
    });

    // Whenever the input changes update the value.
    this.timeInputEl?.addEventListener("change", (event) => {
      // Clone since the event cannot be re-dispatched.
      const clone = new event.constructor(event.type, event);

      this.dispatchEvent(clone);

      const date = this.dateInputEl.value;
      const time = this.timeInputEl.value;

      this.value = `${date} ${time}`;
    });

    this.addEventListener("focus", () => this.dateInputEl.focus());

    this.buttonEl.onclick = () => {
      this.showPicker();
    };

    this.dialogEl.onclose = () => {
      // Clear the dateGallery whenever the modal is closed as
      // it is no longer needed.
      this.dateGallery = null;

      // Also clear the dialog so it is no longer visible
      this.dialogEl.innerHTML = "";

      this.dialogEl.onkeydown = undefined;
    };

    // Close dialog when backdrop is clicked
    this.dialogEl.onclick = (event) => {
      if (event.target.nodeName === "DIALOG") {
        this.dialogEl.close();
      }
    };

    // Make the Datepicker tabbable.
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }

    // Set value at least once
    const value = this.getAttribute("value") ?? "";
    this.value = value;

    // Holds the error
    this.error = "";

    // Validate once to get the intial error status.
    this._validate();

    // After the initial validate listen for all upcoming
    // invalid events, and show the errors.
    this.addEventListener("invalid", (e) => {
      // Do not pop up the default browser errors,
      // at this time (january 2024) showing the
      // errors only work for chrome. For safari
      // and firefox we need our own custom error
      // showing mechanism.
      e.preventDefault();

      // Show the error
      this.errorEl.textContent = this.error;

      // Mark the div.datepicker as invalid manually.
      // `input:invalid` does not work as of january 2024.
      this.firstElementChild.classList.add("invalid");
    });
  }

  disconnectedCallback() {
    this.innerHTML = "";
    this.dateGallery = null;
    this.dialogEl = null;
    this.dateInputEl = null;
    this.timeInputEl = null;
    this.errorEl = null;
    this.buttonEl = null;
  }

  // Form controls that show "pickers" should implement a showPicker method.
  showPicker() {
    if (this.noPicker) {
      return;
    }

    // Open the dialog when clicked
    this.dialogEl.showModal();

    // Create a dateGallery when clicked, this way the
    // DateGallery does not exist and take up memory
    // when the calendar button is never clicked.

    let initialDate = new Date();
    if (this.value) {
      const date = parseAsDate(this.value);

      if (isValid(date)) {
        initialDate = date;
      }
    }

    const datepicker = this;
    this.dateGallery = new window.uiloosDateGallery.DateGallery(
      {
        mode: "month",
        initialDate,
        selectedDates: [initialDate],
        maxSelectionLimit: 1,
        canSelect(dateObj) {
          if (datepicker.min && dateObj.date < datepicker.min) {
            return false;
          } else if (datepicker.max && dateObj.date > datepicker.max) {
            return false;
          }

          return true;
        },
      },
      (dateGallery, event) => {
        datepicker.dialogEl.innerHTML = `
            <div class="datepicker-dialog-content">
              <div class="topbar">
                <button aria-label="previous" type="button">‹</button>
                <span class="topbar-input-wrapper">
                  <select class="month"></select>
                  <input class="year"></input>
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

              <div class="bottombar">
                <button type="button">Cancel</button>
                <button type="button">Today</button>
              </div>
             </div>
           `;

        const [prevButtonEl, nextButtonEl] = Array.from(
          datepicker.dialogEl.querySelectorAll(".topbar button"),
        );

        prevButtonEl.onclick = () => {
          dateGallery.previous();
        };

        nextButtonEl.onclick = () => {
          dateGallery.next();
        };

        const monthSelectEl = datepicker.dialogEl.querySelector("select.month");

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

        const yearInputEl = datepicker.dialogEl.querySelector("input.year");
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

        const datesEl = datepicker.dialogEl.querySelector(".dates");

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

          if (dateObj.isSelected) {
            buttonEl.classList.add("selected");
          }

          if (dateObj.isToday) {
            buttonEl.classList.add("today");
          }

          dayEl.onclick = () => {
            const date = dateFormatter.format(dateObj.date);

            this._changeDate(date);

            this.dialogEl.close();
          };

          datesEl.appendChild(dayEl);
        });

        const [cancelButtonEl, todayButtonEl] = Array.from(
          datepicker.dialogEl.querySelectorAll(".bottombar button"),
        );

        cancelButtonEl.onclick = () => {
          this.dialogEl.close();
        };

        todayButtonEl.onclick = () => {
          this.dateGallery.today();
        };
      },
    );

    this.dialogEl.onkeydown = (event) => {
      // Do not interfere with the year <input>
      if (event.target.nodeName === "INPUT") {
        return;
      }

      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
      ) {
        // Copy date as not to mutate the selected date.
        const date = new Date(this.dateGallery.selectedDates.at(0));

        // Mutate the date based on the arrow keys
        if (event.key === "ArrowLeft") {
          date.setDate(date.getDate() - 1);
        } else if (event.key === "ArrowRight") {
          date.setDate(date.getDate() + 1);
        } else if (event.key === "ArrowUp") {
          date.setDate(date.getDate() - 7);
        } else if (event.key === "ArrowDown") {
          date.setDate(date.getDate() + 7);
        }

        // Select the date so it highlights in blue.
        this.dateGallery.selectDate(date);

        // Change the initialDate (changes the frames) so the user
        // can navigate to other months.
        this.dateGallery.changeConfig({ initialDate: date });
      } else if (event.key === "Enter") {
        // When enter is pressed close the dialog and set
        // the value to the selected date.

        // We do not want the dialog to open again.
        event.preventDefault();

        const date = dateFormatter.format(this.dateGallery.selectedDates[0]);

        this._changeDate(date);

        this.dialogEl.close();
      }
    };
  }

  _changeDate(date) {
    if (this.timeEnabled) {
      let time = this.timeInputEl?.value;

      if (!time) {
        time = "00:00";
      }

      this.timeInputEl.value = time;

      this.value = `${date} ${time}`;
    } else {
      this.value = date + " 00:00";
    }
  }

  // Form controls usually expose a "value" property
  get value() {
    return this._value;
  }

  // When the setter is called update the value and the internals
  set value(value) {
    this._value = value;

    // When the value is set programmatically, either by the user
    // or in this component, we need to sync it with the date and
    // time input elements.

    // Parse the date entered
    const date = parseAsDate(this.value);

    if (isValid(date)) {
      const dateAsString = dateFormatter.format(date);

      this.dateInputEl.value = dateAsString;

      let timeAsString = "00:00";

      if (this.timeEnabled) {
        timeAsString = timeFormatter.format(date);
        this.timeInputEl.value = timeAsString;
      }

      this._value = `${dateAsString} ${timeAsString}`;
    }

    /*
      The following line is what makes this custom 
      element behave as a native form element such 
      as an <input> or <select>.

      By calling the `setFormValue` the actual value 
      of this custom element is set. This is the 
      value that is used when a `FormData` is 
      created.

      So whatever you provide to `setFormValue` is 
      what is exposed to the outside world.
    */
    this.internals.setFormValue(this._value);

    const valid = this._validate();

    /* 
      If there is a linkedPicker it might become invalid if
      this picker changes, so make the linkedPicker also
      check for validity. 
      
      Only do this if this picker is invalid himself otherwise 
      the error messages for this picker will vanish.
    */
    if (valid && this.linkedPicker) {
      this.linkedPicker._validate();
    }

    if (valid) {
      this.errorEl.textContent = "";
      this.firstElementChild.classList.remove("invalid");
    }
  }

  _validate() {
    this.error = "";

    // When disabled check nothing and report that it is valid
    if (this.matches(":disabled")) {
      this.internals.setValidity({});

      return true;
    }

    // If it is required but empty report an error
    if (this.required && this.value === "") {
      this.error = `${this.label} is required`;

      this.internals.setValidity({ valueMissing: true }, this.error);

      return false;
    }

    // If it is not required and the value is empty mark as valid
    if (!this.required && this.value === "") {
      this.internals.setValidity({});

      return true;
    }

    // Parse the date entered
    const date = parseAsDate(this.value);

    // Check if it is indeed valid
    if (!isValid(date)) {
      const format = this.timeEnabled ? "mm/dd/yyyy hh:mm" : "mm/dd/yyyy";

      this.error = `${this.label} is not a valid date in the ${format} format`;

      this.internals.setValidity({ patternMismatch: true }, this.error);

      return false;
    }

    if (this.min && date < this.min) {
      this.error = `${this.label} must be after ${dateFormatter.format(this.min)}`;

      this.internals.setValidity({ rangeOverflow: true }, this.error);

      return false;
    }

    if (this.max && date > this.max) {
      this.error = `${this.label} must be before ${dateFormatter.format(this.max)}`;

      this.internals.setValidity({ rangeUnderflow: true }, this.error);

      return false;
    }

    // If we are in a range picker relation and we are the start we must not be after the end.
    if (
      this.linkedPicker &&
      this.linkedPicker.value &&
      this.position === "start" &&
      date > parseAsDate(this.linkedPicker.value)
    ) {
      this.error = `${this.label} lies after ${this.linkedPicker.label}`;

      this.internals.setValidity({ rangeOverflow: true }, this.error);

      return false;
    }

    // If we are in a range picker relation and we are the end we must not be before the start.
    if (
      this.linkedPicker &&
      this.linkedPicker.value &&
      this.position === "end" &&
      date < parseAsDate(this.linkedPicker.value)
    ) {
      this.error = `${this.label} lies before ${this.linkedPicker.label}`;

      this.internals.setValidity({ rangeUnderflow: true }, this.error);

      return false;
    }

    // No errors were detected mark it as valid
    this.internals.setValidity({});
    return true;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "min") {
      this.min = parseAsDate(newValue);
    } else if (name === "max") {
      this.max = parseAsDate(newValue);
    } else if (name === "required") {
      this.required = newValue === "";
    }

    this._validate();
  }

  // The following properties and methods aren't strictly required,
  // but browser-level form controls provide them. Providing them helps
  // ensure consistency with browser-provided controls.
  get form() {
    return this.internals.form;
  }
  get name() {
    return this.getAttribute("name");
  }
  get type() {
    return this.localName;
  }
  get validity() {
    return this.internals.validity;
  }
  get validationMessage() {
    return this.internals.validationMessage;
  }
  get willValidate() {
    return this.internals.willValidate;
  }
  checkValidity() {
    return this.internals.checkValidity();
  }
  reportValidity() {
    return this.internals.reportValidity();
  }
}

customElements.define("uiloos-datepicker", Datepicker);

export function parseAsDate(value) {
  if (!value) {
    return null;
  }

  // Check for special strings first
  if (value.toLowerCase() === "today") {
    return new Date();
  } else if (value.toLowerCase() === "tomorrow") {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    return date;
  } else if (value.toLowerCase() === "yesterday") {
    const date = new Date();
    date.setDate(date.getDate() - 1);

    return date;
  } else {
    // If the date is in format 'MM/dd/yyyy' append 00:00
    // this makes the input a little more forgiving.
    if (value.length === 10) {
      value += " 00:00";
    }

    // If it is not a special string then parse it as a date string.
    return parse(value, "MM/dd/yyyy HH:mm", new Date());
  }
}