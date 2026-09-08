import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const THEME_CSS = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../assets/theme.css'
);

const SCOPE = 'bio-theme-parent';
const BLOCK = new RegExp(`\\.${SCOPE}[^{]*\\{([^}]*)\\}`, 'g');

const DECLARATION = /(--bio-[a-z0-9-]+)\s*:\s*([^;]+);/g;


function declarations(css, offset = 0) {
  const found = new Map();

  for (const match of css.matchAll(DECLARATION)) {
    const [ , name, value ] = match;

    if (!found.has(name)) {
      found.set(name, { value: value.trim(), index: offset + match.index });
    }
  }

  return found;
}

function lineAt(css, index) {
  return css.slice(0, index).split('\n').length;
}

// formatting is not drift
function normalize(value) {
  return value.replace(/\s+/g, ' ').replace(/\s*([(),])\s*/g, '$1');
}


/**
 * Check that the `--bio-*` tokens a stylesheet declares on `.bio-theme-parent`
 * are copied faithfully from `@bpmn-io/theme`.
 *
 * A name that is not a token is dead weight no theme will ever override; a value
 * that has drifted makes the library render differently from the rest of
 * bpmn.io until a theme is applied. Tokens declared outside the scope are
 * unreachable for a theme, so a stylesheet without it fails too.
 *
 * @param {string[]} files
 * @param { { theme?: string } } [options]
 *
 * @return {Array<{ file: string, line: number, message: string }>}
 */
export function validate(files, options = {}) {
  const theme = declarations(
    fs.readFileSync(options.theme || THEME_CSS, 'utf8')
  );

  const problems = [];

  for (const file of files) {
    const css = fs.readFileSync(file, 'utf8');
    const blocks = [ ...css.matchAll(BLOCK) ];

    if (!blocks.length) {
      problems.push({
        file,
        line: 1,
        message: `no \`.${SCOPE}\` block — declare the tokens the stylesheet ` +
          'reads on that scope, so a theme can override them'
      });

      continue;
    }

    for (const block of blocks) {
      const offset = block.index + block[0].indexOf('{') + 1;

      for (const [ name, declaration ] of declarations(block[1], offset)) {
        const line = lineAt(css, declaration.index);
        const expected = theme.get(name);

        if (!expected) {
          problems.push({
            file,
            line,
            message: `\`${name}\` is not a token of @bpmn-io/theme — compare ` +
              `the \`.${SCOPE}\` block against \`@bpmn-io/theme/assets/theme.css\``
          });

          continue;
        }

        if (normalize(expected.value) !== normalize(declaration.value)) {
          problems.push({
            file,
            line,
            message: `\`${name}\` drifted from the theme — expected ` +
              `\`${expected.value}\`, found \`${declaration.value}\``
          });
        }
      }
    }
  }

  return problems;
}
