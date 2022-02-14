import { ActiveContentConfig } from '@automata.dev/core';
import { useActiveContent } from './useActiveContent';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActiveContent',
  props: {
    options: { type: Object as () => ActiveContentConfig<unknown>, required: true },
  },
  setup(props) {
    const activeContent = useActiveContent(props.options);
    return { activeContent };
  },
  template: `<slot :activeContent="activeContent"/>`,
});