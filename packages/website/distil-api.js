const fs = require('fs');
const crypto = require('crypto');

console.log('Distilling api json files');

const OUTPUT_DIR = './src/_data/distilled';

fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR);

const EXAMPLES_OUTPUT_DIR = './src/_includes/';

const includesDir = fs.readdirSync(EXAMPLES_OUTPUT_DIR);

includesDir.forEach((file) => {
  if (file.startsWith('example-')) {
    fs.rmSync(`${EXAMPLES_OUTPUT_DIR}/${file}`);
  }
});

const PACKAGES = ['core', 'angular', 'react', 'vue'];

PACKAGES.forEach((package) => {
  console.log(`  processing ${package}`);

  const json = require(`./src/_data/api/${package}.json`);

  const data = json.children.map((child) => {
    return format(child, package);
  });

  fs.writeFileSync(
    `${OUTPUT_DIR}/${package}.json`,
    JSON.stringify(data, null, 2),
    { flag: 'w' }
  );
});

console.log('Distilled api json successfully');

// Utils

function format(def, package) {
  // console.log('    ', def.name);

  // When a function
  if (def.signatures) {
    return getSignature({
      def,
      name: def.name,
      signature: def.signatures[0],
      package,
      isMethod: false,
    });
  }

  // When a type declaration which is a function
  if (def.type?.type === 'reflection' && def.type?.declaration?.signatures) {
    return getSignature({
      def,
      name: def.name,
      signature: def.type.declaration.signatures[0],
      package,
      kindString: 'type',
      isMethod: false,
    });
  }

  return {
    name: def.name,
    package,
    kindString: getKindString(def, package),
    description: getDescription(def),
    link: `/api/${package}/${def.name}/`.toLowerCase(),
    generic: getGeneric(def),
    since: getSince(def, package),
    constructor: getConstructor(def, package),
    methods: getMethods(def, package),
    properties: getProperties(def, package),
    sees: getSees(def),
    alias: getAlias(def),
    type: def.type ? getType(def.type, package) : undefined,
    isOptional: def.flags.isOptional ?? false,
    parameters: getParameters(def, package),
    examples: getExamples(def, package),
  };
}

function getDescription(def) {
  return def.comment?.summary.map((s) => s.text).join('');
}

function getGeneric(def) {
  // Strange quirk: sometimes it is with an 's' and sometimes not,
  // but both are arrays!
  if (def.typeParameter) {
    return def.typeParameter?.map((t) => ({
      name: t.name,
    }));
  }

  return def.typeParameters?.map((t) => ({
    name: t.name,
    default: t.default?.name,
  }));
}

function getSince(def, package) {
  if (def.name === 'new _LicenseChecker') {
    return;
  }

  const sinceTag = def.comment?.blockTags?.find((bt) => bt.tag === '@since');

  // an @since tag is required for all public APIs
  if (!sinceTag) {
    throw new Error(
      `Unknown since for: '${def.name}' please add it in @uiloos/${package}`
    );
  }

  return sinceTag?.content[0].text;
}

function getReturns(def) {
  const returnTag = def.comment?.blockTags?.find((bt) => bt.tag === '@returns');

  return returnTag?.content[0].text;
}

function getSees(def) {
  return def.comment?.blockTags
    ?.filter(
      (bt) => bt.tag === '@see' && !bt.content[0].text.startsWith('http')
    )
    .map((bt) => {
      return {
        name: bt.content[0].text,
      };
    });
}

function getAlias(def) {
  const aliasTag = def.comment?.blockTags?.find((bt) => bt.tag === '@alias');

  return aliasTag?.content[0].text;
}

// To support @examples in nunjucks we have to write them
// to files so they can be `included` from the filesystem in
// `highlight`. There exists no other way of dynamically
// "rendering" via highlight directly.
function getExamples(def, package) {
  return def.comment?.blockTags
    ?.filter((bt) => bt.tag === '@example')
    .map((bt) => {
      // Get the textual part of the @example
      const rawText = bt.content.find((bt) => bt.kind === 'text').text;

      // Get the individual lines
      const textLines = rawText.split('\n');

      // First line is the title, the rest the description
      const [title, ...descriptionLines] = textLines;

      const description = descriptionLines.join('\n').trim();

      // Get the code part of the @example
      const rawCode = bt.content.find((bt) => bt.kind === 'code').text;

      // Get the individual lines
      const codeLines = rawCode.split('\n');

      // Remove the surrounding backticks.
      const code = codeLines
        .filter((_line, index) => {
          return index > 0 && index < codeLines.length - 1;
        })
        .join('\n');

      /// ```jsx => jsx
      let type = codeLines[0].split('```')[1];

      // Vue does not render well in highlighter
      if (type === 'vue') {
        type = 'jsx';
      }

      const hash = crypto.createHash('md5').update(code).digest('hex');

      const fileName = `example-${package}-${def.name.toLowerCase()}-${hash}.njk`;

      const content = `
        {% raw %}
          ${code}
        {% endraw%}
      `;

      fs.writeFileSync(`${EXAMPLES_OUTPUT_DIR}/${fileName}`, content, {
        flag: 'w',
      });

      return { title, description, fileName, type };
    });
}

function getMethods(def, package) {
  const methods =
    def?.children?.filter(
      (c) =>
        c.name !== 'constructor' &&
        !c.name.startsWith('_') &&
        c.flags.isPublic &&
        c.signatures
    ) ?? [];

  return methods.map((m) => {
    return getMethod(def, m, package);
  });
}

function getConstructor(def, package) {
  if (package !== 'core' || def.name === '_LicenseChecker') {
    return false;
  }

  const constructor = def.children?.find((c) => c.name === 'constructor');

  if (constructor) {
    return getMethod(def, constructor, package);
  }
}

function getMethod(def, method, package) {
  return getSignature({
    def,
    name: method.name,
    signature: method.signatures[0],
    package,
    isMethod: true,
  });
}

function getSignature({ def, name, signature, package, kindString, isMethod }) {
  // Use the generic from the signature
  let generic = getGeneric(signature);
  if (!generic) {
    // Otherwise fallback to the generic of the def instead, happens
    // with callback type definitions.
    generic = getGeneric(def);
  }

  return {
    name,
    package,
    kindString: kindString ?? getKindString(signature, package),
    description: getDescription(signature),
    parameters: getParameters(signature, package),
    since: getSince(signature, package),
    throws: getThrows(def, signature, package),
    type: getType(signature.type, package),
    returns: getReturns(signature),
    sees: getSees(signature),
    generic,
    link: isMethod
      ? `/api/${package}/${def.name}/#${signature.name}`.toLowerCase()
      : `/api/${package}/${def.name}/`.toLowerCase(),
    isCallback: signature.name === '__type',
    examples: getExamples(signature, package),
  };
}

function getThrows(def, method, package) {
  if (package !== 'core') {
    return;
  }

  // tsdoc does not contain the name of the error in the  @throws.

  // First get the original source file
  const fileName = def.sources[0].fileName;

  const source = fs.readFileSync(`../../${fileName}`, {
    encoding: 'utf8',
    flag: 'r',
  });

  // Now for each error
  const errors = method.comment?.blockTags
    ?.filter((bt) => bt.tag === '@throws')
    .map((bt) => {
      // Get the comment of the @throws
      const description = bt.content[0].text;

      // Find the first line that matches the error all @throws for
      // a specific error are assumed to have the same text.
      const line = source.split('\n').find((line) => {
        return line.includes(description);
      });

      // Get the text between the two {}'s
      const name = line.split('{')[1].split('}')[0];

      return {
        name,
        description,
      };
    });

  return errors;
}

function getParameters(method, package) {
  return method.parameters?.map((parameter) => {
    return {
      name: parameter.name,
      type: getType(parameter.type, package),
      description: getDescription(parameter),
    };
  });
}

function getProperties(def, package) {
  const properties =
    def.children?.filter(
      (c) =>
        c.name !== 'constructor' &&
        !c.name.startsWith('_') &&
        c.flags.isPublic &&
        !c.signatures
    ) ?? [];

  return properties.map((property) => ({
    name: property.name,
    package,
    description: getDescription(property),
    since: getSince(property, package),
    type: getType(property.type, package),
    link: `/api/${package}/${def.name}/#${property.name}`.toLowerCase(),
  }));
}

function getKindString(def, package) {
  if (def.name.endsWith('Error')) {
    return 'error';
  }

  // Class
  if (def.kind === 128) {
    if (package === 'angular') {
      if (def.name.endsWith('Component')) {
        return 'component';
      }

      if (def.name.endsWith('Directive')) {
        return 'directive';
      }

      if (def.name.endsWith('Module')) {
        return 'module';
      }
    }

    return 'class';
  }

  // A function of sorts
  if (def.kind === 32 || def.kind === 4096) {
    if (package === 'react') {
      if (def.type.name === 'JSX.Element') {
        return 'component';
      }

      if (def.name.startsWith('use')) {
        return 'hook';
      }
    }

    if (package === 'vue') {
      if (def.type.target?.qualifiedName === 'DefineComponent') {
        return 'component';
      }

      if (def.name.startsWith('use')) {
        return 'composable';
      }

      if (def.name === 'uiloosPlugin') {
        return 'plugin';
      }
    }

    if (package === 'core' && def.name === 'licenseChecker') {
      return 'instance';
    }

    return 'function';
  }

  // A type definitions
  if (def.kind === 4194304) {
    return 'type';
  }

  if (def.kind === 1024) {
    return 'property';
  }

  if (def.kind === 16384) {
    return 'constructor';
  }

  throw 'No type could be determined for ' + def.name;
}

function getType(typeDef, package) {
  if (typeDef.type === 'intrinsic') {
    return {
      value: typeDef.name,
      type: 'intrinsic',
    };
  }

  if (typeDef.type === 'literal') {
    let value;

    if (typeDef.value === null) {
      value = 'null';
    } else if (typeDef.value === true) {
      value = 'true';
    } else if (typeDef.value === false) {
      value = 'false';
    } else if (/^\d*(\.\d+)?$/g.test(typeDef.value)) {
      value = typeDef.value;
    } else {
      value = `"${typeDef.value}"`;
    }
    return { value, type: 'literal' };
  }

  if (typeDef.type === 'reference') {
    const value = typeDef.typeArguments
      ? `${typeDef.name}<${typeDef.typeArguments.map((t) => t.name).join(',')}>`
      : typeDef.name;

    const link = getLink(typeDef);

    return {
      value,
      link,
      type: 'reference',
    };
  }

  if (typeDef.type === 'union') {
    const value = typeDef.types.map((t) => getType(t, package));
    sortUnion(value);
    return {
      value,
      type: 'union',
    };
  }

  if (typeDef.type === 'intersection') {
    const value = typeDef.types.map((t) => getType(t, package));
    return {
      value,
      type: 'intersection',
    };
  }

  if (typeDef.type === 'array') {
    return {
      value: getType(typeDef.elementType, package),
      type: 'array',
    };
  }

  if (typeDef.type === 'reflection') {
    return {
      value: typeDef.declaration?.children?.map((child) => {
        return format(child.signatures ? child.signatures[0] : child, package);
      }),
      type: 'reflection',
    };
  }
}

function sortUnion(types) {
  // This array represents the bottom
  const sort = ['reference', 'literal'];

  function sortValue(defName) {
    let index = 1;
    for (const name of sort) {
      if (defName.includes(name)) {
        return index;
      }

      index++;
    }

    return 0;
  }

  types.sort((a, b) => {
    const aValue = sortValue(a.type);
    const bValue = sortValue(b.type);

    return aValue - bValue;
  });
}

function getLink(typeDef) {
  const package = typeDef.package ?? '';

  if (!package.startsWith('@uiloos')) {
    return false;
  }

  // @uiloos/core -> core
  const name = package.split('/')[1];

  return `/api/${name}/${typeDef.name}`.toLowerCase();
}
