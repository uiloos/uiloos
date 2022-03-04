import components from './components';

import ActiveContent from './ActiveContent/ActiveContent';
import { useActiveContent } from './ActiveContent/useActiveContent';

/**
 * The Automata Vue plugin, add it to vue via `app.use()`;
 */
const automataPlugin = {
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

export { automataPlugin, useActiveContent, ActiveContent };
