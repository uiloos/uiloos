const fs = require('fs');

console.log('Generating search data file');

const core = require('./src/_data/api/core.json');

const data = [
  {
    name: "Installation",
    description: "Learn how to install uiloos",
    type: "Docs",
    link: "/docs/getting-started/installation/"
  },
  {
    name: "Activation",
    description: "Learn how to activate uiloos",
    type: "Docs",
    link: "/docs/getting-started/activation/"
  },

  // ActiveList
  {
    name: "ActiveList Concepts",
    description: "Learn the concepts behind the ActiveList",
    type: "Docs",
    link: "/docs/active-list/concepts/"
  },
  {
    name: "ActiveList tutorial",
    description: "Learn how to build a carousel with the ActiveList",
    type: "Docs",
    link: "/docs/active-list/tutorial/"
  },
  {
    name: "ActiveList examples",
    description: "Examples for the ActiveList",
    type: "Docs",
    link: "/docs/active-list/examples/"
  },

  // ActiveList concepts
  {
    name: "ActiveList Concepts AutoPlay",
    description: "Learn the concepts behind the ActiveList AutoPlay",
    type: "Docs",
    link: "/docs/active-list/concepts/#autoplay"
  },
  {
    name: "ActiveList Concepts isCircular",
    description: "Learn the concepts behind the ActiveList isCircular",
    type: "Docs",
    link: "/docs/active-list/concepts/#circular-or-linear"
  },
  {
    name: "ActiveList Concepts Cooldown",
    description: "Learn the concepts behind the ActiveList cooldown",
    type: "Docs",
    link: "/docs/active-list/concepts/#cooldown"
  },
  {
    name: "ActiveList Concepts Multiple or Single mode",
    description: "Learn the concepts behind the ActiveList multiple or single mode",
    type: "Docs",
    link: "/docs/active-list/concepts/#multiple-or-single"
  },

  // ViewChannel
  {
    name: "ViewChannel Concepts",
    description: "Learn the concepts behind the ViewChannel",
    type: "Docs",
    link: "/docs/view-channel/concepts/"
  },
  {
    name: "ViewChannel tutorial",
    description: "Learn how to build flash messages using the ViewChannel",
    type: "Docs",
    link: "/docs/view-channel/tutorial/"
  },
  {
    name: "ViewChannel examples",
    description: "Examples for the ViewChannel",
    type: "Docs",
    link: "/docs/view-channel/examples/"
  },

  // ViewChannel concepts
  {
    name: "ViewChannel Concepts AutoDismiss",
    description: "Learn the concepts behind the ViewChannel AutoDismiss",
    link: "/docs/view-channel/concepts/#autodismiss",
    type: "Docs",
  },
  {
    name: "ActiveList Concepts priority",
    description: "Learn the concepts behind the ViewChannels priority",
    type: "Docs",
    link: "/docs/view-channel/concepts/#priority"
  }
];

core.children.forEach((child) => {
  data.push({
    name: child.name,
    description: child.comment?.shortText ?? '',
    link: `/api/core/${child.name}/`,
    type: "API",
    package: '@uiloos/core',
    kindString: child.kindString,
  });

  if (child.children && !child.name.endsWith("Error")) {
    child.children.forEach( (grandchild) => {
      if (!grandchild.name.startsWith('_') && grandchild.name !== 'constructor') {
        
        data.push({
          name: child.name + "::" + grandchild.name,
          description: grandchild.comment?.shortText ?? '' + grandchild.signatures[0].comment.shortText ?? '',
          link: `/api/core/${child.name}/#${grandchild.name}`,
          kindString: grandchild.kindString,
          type: "API",
          package: '@uiloos/core',
        });
      }
    })
  }
});

fs.writeFileSync('./src/search/data.json', JSON.stringify(data, null, 2));

console.log('Wrote search data file successfully');
