
export class _History<T> {
  // The events that occurred
  public _events: T[] = [];
  
  // The amount items that should be remembered in the history.
  private _keepHistoryFor: number = 0;

  constructor(_keepHistoryFor: number = 0) {
    this._keepHistoryFor = _keepHistoryFor;
  }

  // Add an event to the history
  public _push(event: T) {
    // Track history if the developer wants it.
    if (this._keepHistoryFor > 0) {
      this._events.push(event);

      // Prevent from growing infinitely
      if (this._events.length - 1 === this._keepHistoryFor) {
        this._events.shift();
      }
    }
  }
}
