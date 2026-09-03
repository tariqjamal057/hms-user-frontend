const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIRS_TO_SCAN = [
  'app',
  'lib',
  'components',
  'types',
  'config',
  'providers',
  'hooks',
  'sample-data',
];

const REACT_HOOKS = [
  'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback',
  'useMemo', 'useRef', 'useLayoutEffect', 'useImperativeHandle',
  'useTransition', 'useDeferredValue', 'useSyncExternalStore',
  'useInsertionEffect', 'useId',
];

function getAllTsFiles(dir) {
  const results = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(d, entry.name);
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist' || entry.name === 'build') continue;
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.(ts|tsx)$/.test(entry.name)) {
        results.push(full);
      }
    }
  };
  walk(dir);
  return results;
}

function readFile(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    return null;
  }
}

function relative(file) {
  return path.relative(PROJECT_ROOT, file).replace(/\\/g, '/');
}

const files = [];
for (const dir of DIRS_TO_SCAN) {
  const abs = path.join(PROJECT_ROOT, dir);
  files.push(...getAllTsFiles(abs));
}

// Check for 'use client' directives
const filesMissingUseClient = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  const usesHook = REACT_HOOKS.some(h => content.includes(h));
  const isClient = content.includes('"use client"') || content.includes("'use client'");
  if (usesHook && !isClient) {
    filesMissingUseClient.push(relative(file));
  }
}

// Check for alert() usage
const alertFiles = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  if (content.includes('alert(')) {
    alertFiles.push(relative(file));
  }
}

// Check for next/image without width/height
const imageIssues = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  const matches = content.match(/<Image\s+[^>]*>/g) || [];
  for (const match of matches) {
    if (!match.includes('width=') || !match.includes('height=')) {
      if (!match.includes('fill')) {
        imageIssues.push({ file: relative(file), tag: match });
      }
    }
  }
}

// Check for missing alt attributes on images
const altIssues = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  const matches = content.match(/<Image\s+[^>]*>/g) || [];
  for (const match of matches) {
    if (!match.includes('alt=')) {
      altIssues.push({ file: relative(file), tag: match });
    }
  }
}

// Check for empty alt (alt="" might be intentional but flag)
const emptyAlt = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  const matches = content.match(/<Image\s+[^>]*>/g) || [];
  for (const match of matches) {
    if (match.includes('alt=""')) {
      emptyAlt.push({ file: relative(file), tag: match });
    }
  }
}

// Check for use of dangerouslySetInnerHTML
const innerHTMLFiles = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  if (content.includes('dangerouslySetInnerHTML')) {
    innerHTMLFiles.push(relative(file));
  }
}

// Check for eval
const evalFiles = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  if (/\beval\s*\(/.test(content)) {
    evalFiles.push(relative(file));
  }
}

// Check for localStorage
const localStorageFiles = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  if (content.includes('localStorage')) {
    localStorageFiles.push(relative(file));
  }
}

// Check for any
const anyFiles = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  if (/:\s*any\b|as\s+any/.test(content)) {
    anyFiles.push(relative(file));
  }
}

// Check for ts-ignore
const tsIgnoreFiles = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  if (content.includes('@ts-ignore') || content.includes('@ts-expect-error')) {
    tsIgnoreFiles.push(relative(file));
  }
}

// Check for useEffect without cleanup (heuristic: if useEffect has no return)
const effectFiles = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  // Simple heuristic: look for useEffect(() => { ... }) without a return statement inside the arrow function
  // This is hard with regex. We'll just flag all files with useEffect.
  if (content.includes('useEffect')) {
    effectFiles.push(relative(file));
  }
}

// Check for missing aria-labels on icon-only buttons
const iconButtonIssues = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  // Look for <button ...> with only an icon (no text) and no aria-label
  const buttonRegex = /<button\s+[^>]*>\s*<[^>]+\s+\/>\s*<\/button>/g;
  let match;
  while ((match = buttonRegex.exec(content)) !== null) {
    const buttonTag = match[0];
    if (!buttonTag.includes('aria-label')) {
      iconButtonIssues.push({ file: relative(file), snippet: buttonTag.trim() });
    }
  }
}

// Output results
const report = {
  filesMissingUseClient,
  alertFiles,
  imageIssues,
  altIssues,
  emptyAlt,
  innerHTMLFiles,
  evalFiles,
  localStorageFiles,
  anyFiles,
  tsIgnoreFiles,
  effectFiles,
  iconButtonIssues,
};

fs.writeFileSync(path.join(PROJECT_ROOT, 'scripts', 'detailed-report.json'), JSON.stringify(report, null, 2));

console.log('Files missing use client:', filesMissingUseClient.length);
if (filesMissingUseClient.length > 0) console.log(filesMissingUseClient.join('\n'));
console.log('\nalert() usage files:', alertFiles.length);
if (alertFiles.length > 0) console.log(alertFiles.join('\n'));
console.log('\nImage width/height issues:', imageIssues.length);
console.log('\nImage alt issues:', altIssues.length);
console.log('\nEmpty alt:', emptyAlt.length);
console.log('\ndangerouslySetInnerHTML files:', innerHTMLFiles.length);
console.log('\neval() files:', evalFiles.length);
console.log('\nlocalStorage files:', localStorageFiles.length);
console.log('\nany type files:', anyFiles.length);
console.log('\nts-ignore files:', tsIgnoreFiles.length);
console.log('\nuseEffect files:', effectFiles.length);
console.log('\nIcon-only button issues:', iconButtonIssues.length);
