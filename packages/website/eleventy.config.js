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
      'constant',
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

      // Errors should be at the bottom:
      if (def.kindString.endsWith('error')) {
        return sort.length + 1;
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

    const result = definitions.sort((a, b) => {
      const aValue = sortValue(a);
      const bValue = sortValue(b);

      return aValue - bValue;
    });

    return result;
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
          (filteredGroupName) => !inGroup(def.name, filteredGroupName)
        );
      });
    } else {
      return definitions.filter((def) => inGroup(def.name, groupName));
    }

    function inGroup(name, group) {
      // DateGalleryDate -> dategallerydate
      // DATE_GALLERY_MODES -> dategallerymodes
      name = name.split('_').join('').toLowerCase();
      group = group.toLowerCase();

      return name.includes(group);
    }
  });

  eleventyConfig.addFilter('text2html', (summaries) => {
    if (!summaries) {
      return '';
    }

    let html = '';

    for (const summary of summaries) {
      if (summary.kind === 'code') {
        html += `<span class="high">${summary.text}</span>`;
      } else {
        html += summary.text;
      }
    }

    const lines = html.split('\n\n').map((text) => `${text}`);

    const elements = [];
    let list = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[\d]+\./gm.test(trimmed)) {
        const sansNumber = trimmed.replace(/^[\d]+\./gm, '').trim();

        list.push(`<li class="ml-8 mb-4">${sansNumber}</li>`);
      } else {
        if (list.length > 0) {
          elements.push(`<ol class="list-decimal m-2 mb-4">${list.join('')}</ol>`);
        }
        
        list = [];
        elements.push(`<p>${trimmed}</p>`);
      }
    }

    if (list.length > 0) {
      elements.push(`<ol class="list-decimal m-2 mb-4">${list.join('')}</ol>`);
    }

    return elements.join('');
  });

  eleventyConfig.addFilter('nlnl2br', (str) => {
    if (str === null || str === undefined) {
      return '';
    }
    return str.replace(/\n\n/g, '<br /><br />\n');
  });

  return {
    dir: { input: 'src', output: '_site' },
  };
};
