import { ViewChannel } from '@uiloos/core';

/**
 * The configuration for the `createViewChannelStore` function that
 * creates an Alpine.js store.
 *
 * @since 1.4.0
 */
export type AlpineCreateViewChannelStoreConfig<T, R, A> = {
  /**
   * The ViewChannel to subscribe to.
   *
   * @since 1.4.0
   */
  viewChannel: ViewChannel<T, R>;

  /**
   * Optionally the actions you want to make available via the store.
   *
   * The idea is that the `actions` you provide is an object containing
   * functions, these functions when called should do something
   * to the viewChannel.
   *
   * This allows you to "stay" in HTML as much as possible when
   * using the viewChannel.
   *
   * Defaults to undefined
   *
   * @since 1.4.0
   */
  actions?: A;
};

/**
 * Creates a store containing the provided ViewChannel from
 * @uiloos/core, and subscribes to that ViewChannel. This way each
 * time the ViewChannel is changed your component re-renders.
 *
 *  @example
 * A. Showing a success and error action
 *
 * This example shows the ViewChannel used as a flash message center.
 *
 * In the example the store is configured with the optional "actions" 
 * option and has "success" and "error" methods
 *
 * First register the store with alpine:
 * 
 * ```js
 * import Alpine from 'alpinejs';
 * import { createViewChannelStore } from '@uiloos/alpine'; 
 * 
 * const flashMessageChannel = new ViewChannel();
 *
 * const flashMessageStore = createViewChannelStore({
 *   viewChannel: flashMessageChannel,
 *   actions: {
 *     success(text): void {
 *       flashMessageChannel.present({
 *         data: {
 *           id: Math.random(),
 *           text,
 *           type: 'success'
 *         },
 *         priority: 2,
 *         autoDismiss: {
 *           duration: 2000,
 *           result: undefined
 *         }
 *       });
 *     },
 *
 *     error(text): void {
 *       flashMessageChannel.present({
 *         data: {
 *           id: Math.random(),
 *           text,
 *           type: 'error'
 *         },
 *         priority: 1,
 *         autoDismiss: {
 *           duration: 5000,
 *           result: undefined
 *         }
 *       });
 *     }
 *   }
 * });
 *
 * Alpine.store('flashMessages', flashMessageStore);
 * Alpine.start();
 * ```
 * 
 * Now you can use the flashMessages store in your HTML like this:
 *
 * ```html
 * <div x-data>
 *   <ul>
 *     <template x-for="view in $store.flashMessages.viewChannel().views :key="view.data.id"">
 *       <li>
 *         <span x-text="view.data.text"></span>
 *         <button @click="view.dismiss('DISMISSED')">dismiss</span>
 *       </li>
 *     </template>
 *   </ul>
 *
 *   <button @click="$store.flashMessages.success('Good job!')">Success<button>
 *   <button @click="$store.flashMessages.error('Something went wrong!')">Error<button>
 *   <button @click="$store.flashMessages.viewChannel().dismissAll('CLEARING HOUSE')">Clear all<button>
 * </div>
 * ```
 *
 * @param {AlpineCreateViewChannelStoreConfig} config The configuration for the store
 * @returns An Alpine.js store
 * @since 1.4.0
 */
export function createViewChannelStore<T, R, A>({
  viewChannel,
  actions,
}: AlpineCreateViewChannelStoreConfig<T, R, A>) {
  return {
    ...actions,

    /**
     * Initializes the component
     *
     * @since 1.4.0
     */
    init() {
      viewChannel.subscribe(() => {
        this.viewChannel = () => viewChannel;
      });
    },

    /**
     * Returns the ViewChannel
     *
     * @since 1.4.0
     * @returns The ViewChannel
     */
    viewChannel() {
      return viewChannel;
    },
  };
}
