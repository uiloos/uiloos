const fs = require('fs');

console.log('Generating search data file');

const core = require('./src/_data/api/core.json');

const releases = getReleases();

const data = [
  // Getting started
  {
    name: 'Installation',
    description: 'Learn how to install uiloos',
    type: 'Docs',
    link: '/docs/getting-started/installation/',
  },
  {
    name: 'Activation',
    description: 'Learn how to activate uiloos',
    type: 'Docs',
    link: '/docs/getting-started/activation/',
  },
  {
    name: 'Overview',
    description:
      'Get an overview of the uiloos library, get to know the use case, learn the philosophy behind uiloos.',
    type: 'Docs',
    link: '/docs/getting-started/overview/',
  },

  // Miscellaneous
  {
    name: 'Rules',
    description: 'Learn about the rules of using uiloos.',
    type: 'Docs',
    link: '/docs/miscellaneous/rules/',
  },
  {
    name: 'TypeScript',
    description: 'uiloos fully supports TypeScript',
    type: 'Docs',
    link: '/docs/miscellaneous/typescript/',
  },
  {
    name: 'Future',
    description:
      'View what the future of uiloos holds, read about upcoming features',
    type: 'Docs',
    link: '/docs/miscellaneous/future/',
  },

  // ActiveList
  {
    name: 'ActiveList Concepts',
    description: 'Learn the concepts behind the ActiveList',
    type: 'Docs',
    link: '/docs/active-list/concepts/',
  },
  {
    name: 'ActiveList tutorial',
    description: 'Learn how to build a carousel with the ActiveList',
    type: 'Docs',
    link: '/docs/active-list/tutorial/',
  },
  {
    name: 'ActiveList examples',
    description: 'Examples for the ActiveList',
    type: 'Docs',
    link: '/docs/active-list/examples/',
  },

  // ActiveList concepts
  {
    name: 'ActiveList Concepts AutoPlay',
    description: 'Learn the concepts behind the ActiveList AutoPlay',
    type: 'Docs',
    link: '/docs/active-list/concepts/#autoplay',
  },
  {
    name: 'ActiveList Concepts isCircular',
    description: 'Learn the concepts behind the ActiveList isCircular',
    type: 'Docs',
    link: '/docs/active-list/concepts/#circular-or-linear',
  },
  {
    name: 'ActiveList Concepts Cooldown',
    description: 'Learn the concepts behind the ActiveList cooldown',
    type: 'Docs',
    link: '/docs/active-list/concepts/#cooldown',
  },
  {
    name: 'ActiveList Concepts Multiple or Single mode',
    description:
      'Learn the concepts behind the ActiveList multiple or single mode',
    type: 'Docs',
    link: '/docs/active-list/concepts/#multiple-or-single',
  },

  // ViewChannel
  {
    name: 'ViewChannel Concepts',
    description: 'Learn the concepts behind the ViewChannel',
    type: 'Docs',
    link: '/docs/view-channel/concepts/',
  },
  {
    name: 'ViewChannel tutorial',
    description: 'Learn how to build flash messages using the ViewChannel',
    type: 'Docs',
    link: '/docs/view-channel/tutorial/',
  },
  {
    name: 'ViewChannel examples',
    description: 'Examples for the ViewChannel',
    type: 'Docs',
    link: '/docs/view-channel/examples/',
  },

  // ViewChannel concepts
  {
    name: 'ViewChannel Concepts AutoDismiss',
    description: 'Learn the concepts behind the ViewChannel AutoDismiss',
    link: '/docs/view-channel/concepts/#autodismiss',
    type: 'Docs',
  },
  {
    name: 'ViewChannel Concepts priority',
    description: 'Learn the concepts behind the ViewChannels priority',
    type: 'Docs',
    link: '/docs/view-channel/concepts/#priority',
  },

  // Typewriter
  {
    name: 'Typewriter Concepts',
    description: 'Learn the concepts behind the Typewriter',
    type: 'Docs',
    link: '/docs/typewriter/concepts/',
  },
  {
    name: 'Typewriter tutorial',
    description: 'Learn how to style a Typewriter',
    type: 'Docs',
    link: '/docs/typewriter/tutorial/',
  },
  {
    name: 'Typewriter examples',
    description: 'Examples for the Typewriter',
    type: 'Docs',
    link: '/docs/typewriter/examples/',
  },
  {
    name: 'Typewriter composer',
    description: 'Compose your own Typewriter animations using a web app',
    type: 'Docs',
    link: '/docs/typewriter/composer/',
  },

  // Releases
  {
    name: 'Releases HUB',
    description: 'View all releases of all uiloos',
    type: 'Release',
    link: '/releases/',
  },
  {
    name: 'Releases of @uiloos/core',
    description: 'View all releases of @uiloos/core',
    type: 'Release',
    link: '/releases/core/',
  },
  {
    name: 'Releases of @uiloos/angular',
    description: 'View all releases of @uiloos/angular',
    type: 'Release',
    link: '/releases/angular/',
  },
  {
    name: 'Releases of @uiloos/vue',
    description: 'View all releases of @uiloos/vue',
    type: 'Release',
    link: '/releases/vue/',
  },
  {
    name: 'Releases of @uiloos/react',
    description: 'View all releases of @uiloos/react',
    type: 'Release',
    link: '/releases/react/',
  },

  ...releases,
];

core.children.forEach((child) => {
  data.push({
    name: child.name,
    description: child.comment?.shortText ?? '',
    link: `/api/core/${child.name}/`.toLowerCase(),
    type: 'API',
    package: '@uiloos/core',
    kindString: child.kindString,
  });

  if (child.children && !child.name.endsWith('Error')) {
    child.children.forEach((grandchild) => {
      if (
        !grandchild.name.startsWith('_') &&
        grandchild.name !== 'constructor'
      ) {
        data.push({
          name: child.name + '::' + grandchild.name,
          description:
            grandchild.comment?.shortText ??
            '' + grandchild.signatures[0].comment.shortText ??
            '',
          link: `/api/core/${child.name}/#${grandchild.name}`.toLowerCase(),
          kindString: grandchild.kindString,
          type: 'API',
          package: '@uiloos/core',
        });
      }
    });
  }
});

fs.writeFileSync('./src/search/data.json', JSON.stringify(data, null, 2));

console.log('Wrote search data file successfully');

// utils

function getReleases() {
  const releases = [];

  const releasesDir = './src/pages/releases/';

  const files = fs.readdirSync(releasesDir);

  files.forEach((file) => {
    if (fs.lstatSync(releasesDir + file).isDirectory()) {
      const releasesFiles = fs.readdirSync(releasesDir + file);

      releasesFiles.forEach((releaseFile) => {
        if (!releaseFile.endsWith('-releases.njk')) {
          const version = releaseFile.split('.njk')[0];

          releases.push({
            name: `@uiloos/${file} ${version}`,
            description: `The release notes / change logs of @uiloos/${file} ${version}`,
            type: 'Release',
            link: `/releases/${file}/${version}`,
          });
        }
      });
    }
  });

  return releases;
}
