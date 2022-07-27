import components from './components';

import ActiveList from './ActiveList/ActiveList';
import { useActiveList } from './ActiveList/useActiveList';

import { useViewChannel } from './ViewChannel/useViewChannel';

/**
 * The uiloos Vue plugin, add it to vue via `app.use()`;
 */
const uiloosPlugin = {
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

export { uiloosPlugin, useActiveList, ActiveList, useViewChannel };
