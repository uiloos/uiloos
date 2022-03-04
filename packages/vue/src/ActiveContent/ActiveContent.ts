import { ActiveContentConfig } from '@automata.dev/core';
import { useActiveContent } from './useActiveContent';
import { defineComponent } from 'vue';

/**
 * A component which wraps the ActiveContent from @automata.dev/core.
 * 
 * @param {ActiveContentConfig<T>} config The properties of the ActiveContent component.
 * @returns A component which wraps the ActiveContent from @automata.dev/core.
 */
const ActiveContent = defineComponent({
  name: 'ActiveContent',
  props: {
    config: { type: Object as () => ActiveContentConfig<unknown>, required: true },
  },
  setup(props) {
    const activeContent = useActiveContent(props.config);
    return { activeContent };
  },
  template: `<slot :activeContent="activeContent"/>`,
});

export default ActiveContent;