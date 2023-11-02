export function _callSubscriber<
  T,
  E extends { type: string },
  C extends { debug?: boolean }
>(subscriberName: string, event: E, component: T, config: C): void {
  // Note: this code is written in a terse fashion so it is smaller
  // when minified, normally I would have split this into multiple
  // parts.

  // 'DEACTIVATED_MULTIPLE' -> onDeactivatedMultiple
  const methodName =
    'on' +
    event.type
      .toLowerCase()
      .split('_')
      .reduce((acc, word) => {
        const letters = word.split('');
        letters[0] = letters[0].toUpperCase();
        return acc + letters.join('');
      }, '');

  // @ts-expect-error Allow me to use this as an index type.
  const method = config[methodName];

  // If the method does not exist do not call it.
  if (!method) {
    if (config.debug) {
      // Show a warning when debug is true, perhaps the user
      // forgot to implement the event.
      console.warn(
        `uiloos > ${subscriberName} event '${event.type}' was fired but '${methodName}' method is not implemented, this might not be correct.`
      );
    }
    return;
  }

  method(event, component);
}
