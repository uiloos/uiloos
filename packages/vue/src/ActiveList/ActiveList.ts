import { ActiveListConfig } from '@uiloos/core';
import { useActiveList } from './useActiveList';
import { defineComponent } from 'vue';

/**
 * A component which wraps the ActiveList from @uiloos/core.
 * 
 * @param {ActiveListConfig<T>} config The properties of the ActiveList component.
 * @returns A component which wraps the ActiveList from @uiloos/core.
 */
const ActiveList = defineComponent({
  name: 'ActiveList',
  props: {
    config: { type: Object as () => ActiveListConfig<unknown>, required: true },
  },
  setup(props) {
    const activeList = useActiveList(props.config);
    return { activeList };
  },
  template: `<slot :activeList="activeList"/>`,
});

export default ActiveList;