const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const syntaxHighlightPlugin = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlightPlugin);

  eleventyConfig.addPassthroughCopy('src/images');
  eleventyConfig.addPassthroughCopy('src/fonts');
  eleventyConfig.addPassthroughCopy('src/search');

  eleventyConfig.addPassthroughCopy({ 'src/**/*.css': 'css' });

  const { DateTime } = require('luxon');

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: 'utc',
    }).toFormat('yy-MM-dd');
  });

  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: 'utc',
    }).toFormat('dd-MM-yy');
  });

  eleventyConfig.addFilter('sortApi', (definitions) => {

    // This array represents the bottom
    const sort = [
      'subscriber',
      'config',
      'options',
      'callback',
      'predicate',
      'base', // So base events are above the events
      'event',
      'error'
    ];
  
    function sortValue(def) {
      const defName = def.name.toLowerCase();

      // Pure classes above anything else, does not include errors
      // which have a kindString called 'error'.
      if (def.kindString === 'class') {
        return -1;
      }

      // Next are the functions they should be below the classes
      // but above anything else.
      if (def.kindString === 'function') {
        return -1;
      }
      
      let index = 1;
      for (const name of sort) {
  
        if (defName.includes(name)) {
          return index;
        }
  
        index++;
      }
  
      return 0;
    }
  
    return definitions.sort((a, b) => {  
      const aValue = sortValue(a);
      const bValue = sortValue(b);
  
      return aValue - bValue;
    });
  });

  // Filters the api definitions based on the groups, the last
  // item is the bin for all non-matching items.
  eleventyConfig.addFilter('groupApi', (definitions, groups, groupName) => {
    // The last item collects all non matching items.
    const lastInGroup = groups[groups.length - 1];

    if (lastInGroup === groupName) {
      // Leave only the normal groups
      const filteredGroup = groups.filter(
        (_g, index) => index !== groups.length - 1
      );

      // If the definition is in none of the the normal groups it 
      // should not be displayed
      return definitions.filter((def) => {
        return filteredGroup.every(
          (filteredGroupName) =>
            !def.name.toLowerCase().includes(filteredGroupName.toLowerCase())
        );
      });
    } else {
      return definitions.filter((def) =>
        def.name.toLowerCase().includes(groupName.toLowerCase())
      );
    }
  });

  eleventyConfig.addFilter('nlnl2br', (str) => {
    if (str === null || str === undefined) {
      return '';
    }
    return (str, str.replace(/\n\n/g, '<br /><br />\n'));
  });

  return {
    dir: { input: 'src', output: '_site' },
  };
};
