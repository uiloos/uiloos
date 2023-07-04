import components from './components';

import ActiveList from './ActiveList/ActiveList';
import { useActiveList } from './ActiveList/useActiveList';
import { useViewChannel } from './ViewChannel/useViewChannel';
import { useTypewriter } from './Typewriter/useTypewriter';
import { useTypewriterFromSentences } from './Typewriter/useTypewriterFromSentences';

/**
 * The uiloos Vue plugin, add it to vue via `app.use()`;
 *
 * @since 1.0.0
 * 
 * @example
 * A. Installing the plugin
 * 
 * Shows how to install the uiloosPlugin in your Vue app.
 * 
 * Note: If you plan on using the ActiveList component
 * the vue configuration called "runtimeCompiler" must
 * be set to "true" since it uses templates.
 * 
 * ```js
 * import { createApp } from "vue";
 * import { uiloosPlugin } from "@uiloos/vue";
 * import App from "./App.vue";
 * 
 * const app = createApp(App);
 * 
 * app.use(uiloosPlugin);
 * 
 * app.mount("#app");
 * ```
 * 
 */
const uiloosPlugin = {

  /**
   * Installs the uiloos Vue plugin
   * 
   * @since 1.0.0
   */
  install(Vue: any) {
    for (const prop in components) {
      if (components.hasOwnProperty(prop)) {
        // @ts-expect-error This should work.
        const component = components[prop];
        Vue.component(component.name, component);
      }
    }
  },
};

export {
  uiloosPlugin,
  useActiveList,
  ActiveList,
  useViewChannel,
  useTypewriter,
  useTypewriterFromSentences,
};
