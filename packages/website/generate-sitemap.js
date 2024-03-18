const fs = require('fs');

const search = require('./src/search/data.json');
const examples = require('./src/_data/examples.json');
const tutorials = require('./src/_data/tutorials.json');

console.log('Generating sitemap');

const OUTPUT_DIR = './_site/';

let output = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  <url><loc>https://www.uiloos.dev</loc></url>
`.trim();

search.forEach((item) => {
  // Skip deep links
  if (item.link.includes('#')) {
    return
  }

  output += `\n  <url><loc>https://www.uiloos.dev${item.link}</loc></url>`;
});

examples.forEach((example) => {
  output += `\n  <url><loc>https://www.uiloos.dev/docs/${example.url}/examples/${example.framework.toLowerCase()}/</loc></url>`;
});

tutorials.forEach((tutorial) => {
  output += `\n  <url><loc>https://www.uiloos.dev${tutorial.url}</loc></url>`;
});

output += '\n</urlset>';

fs.writeFileSync(`${OUTPUT_DIR}sitemap.xml`, output);

console.log('Wrote sitemap.xml successfully');
