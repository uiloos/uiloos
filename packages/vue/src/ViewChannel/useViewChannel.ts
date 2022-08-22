import { Ref, onMounted, onUnmounted, shallowRef, triggerRef } from 'vue';

import { UnsubscribeFunction, ViewChannel } from '@uiloos/core';

/**
 * A composable which when given a ViewChannel from @uiloos/core
 * returns the ViewChannel inside of a ref.
 *
 * @param {ViewChannel<T, R>} viewChannel The ViewChannel to wrap in a ref.
 * @returns {Ref<ViewChannel<T,R>} A ref containing an instance of the ViewChannel from @uiloos/core
 */
 export function useViewChannel<T, R>(
  viewChannel: ViewChannel<T, R>
): Ref<ViewChannel<T, R>> {
  const vc = (shallowRef(viewChannel) as unknown) as Ref<ViewChannel<T, R>>;

  let subscriber: UnsubscribeFunction;

  onMounted(() => {
    subscriber = viewChannel.subscribe(() => {
      triggerRef(vc);
    });
  });

  onUnmounted(() => {
    subscriber();
  });

  return vc;
}