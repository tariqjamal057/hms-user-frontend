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

const BRANDS = ['LTC HMS', 'Aarogyam', 'Leads Health Care'];
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

const issues = [];
const warnings = [];
const info = [];

function addIssue(severity, category, file, message) {
  issues.push({ severity, category, file: relative(file), message });
}

function addWarning(category, file, message) {
  warnings.push({ category, file: relative(file), message });
}

function addInfo(category, message) {
  info.push({ category, message });
}

// Scan all source files
const files = [];
for (const dir of DIRS_TO_SCAN) {
  const abs = path.join(PROJECT_ROOT, dir);
  files.push(...getAllTsFiles(abs));
}

addInfo('scan', `Scanned ${files.length} source files`);

// Check for 'use client' directives
const filesMissingUseClient = [];
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  const usesHook = REACT_HOOKS.some(h => content.includes(h));
  const isClient = content.includes('"use client"') || content.includes("'use client'");
  // Exclude layout.tsx, page.tsx in root, providers, config, types, lib/utils, etc.
  // A simple heuristic: if it's in app/ and named layout.tsx or page.tsx, Next.js App Router pages are server by default.
  // But we only care about components that use hooks and are not already marked.
  if (usesHook && !isClient) {
    // Heuristic: skip files in app/ that are layout.tsx or page.tsx (they are server components by design in App Router)
    // Actually, hooks are not allowed in server components, so this would be a compile error. But Next.js 13+ allows some hooks in server components? No.
    // Still, if a file uses hooks and is not marked, it's an error.
    filesMissingUseClient.push(relative(file));
  }
}
addInfo('useClient', `${filesMissingUseClient.length} files use React hooks without 'use client' directive`);

// Check brand mentions
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  for (const brand of BRANDS) {
    if (content.includes(brand)) {
      addWarning('brand', file, `Mentions brand "${brand}"`);
    }
  }
}

// Check for XSS risks
const xssPatterns = [
  { regex: /dangerouslySetInnerHTML/g, label: 'dangerouslySetInnerHTML' },
  { regex: /\beval\s*\(/g, label: 'eval()' },
  { regex: /innerHTML\s*=/g, label: 'innerHTML assignment' },
];
for (const file of files) {
  const content = readFile(file);
  if (!content) return;
  for (const pat of xssPatterns) {
    if (pat.regex.test(content)) {
      addWarning('security', file, `Potential XSS risk: ${pat.label}`);
    }
  }
}

// Check for localStorage usage (security concern)
for (const file of files) {
  const content = readFile(file);
  if (!content && content.includes('localStorage')) {
    addWarning('security', file, 'Uses localStorage (client-side auth storage)');
  }
}

// Check for `any` type usage
const anyPattern = /:\s*any\b|as\s+any/g;
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  const matches = content.match(anyPattern);
  if (matches && matches.length > 0) {
    addWarning('typescript', file, `Uses 'any' type ${matches.length} times`);
  }
}

// Check for ts-ignore
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  if (content.includes('@ts-ignore') || content.includes('@ts-expect-error')) {
    addWarning('typescript', file, 'Contains @ts-ignore/@ts-expect-error');
  }
}

// Check for useEffect without cleanup (heuristic: has useEffect but no return statement inside it)
// This is complex to do with regex. We'll just flag files with useEffect.
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  if (content.includes('useEffect')) {
    addWarning('memory', file, 'Contains useEffect (verify cleanup)');
  }
}

// Extract existing routes from app/ directory
const appDir = path.join(PROJECT_ROOT, 'app');
const existingRoutes = new Set();
const walkRoutes = (dir, prefix = '') => {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkRoutes(full, prefix + '/' + entry.name);
    } else if (entry.name === 'page.tsx') {
      let route = prefix + '/' + entry.name;
      route = route.replace(/\/page\.tsx$/, '') || '/';
      // Normalize route segments
      route = route.replace(/\(([^)]+)\)/g, '').replace(/\/+/g, '/');
      if (route.length > 1 && route.endsWith('/')) route = route.slice(0, -1);
      existingRoutes.add(route);
    } else if (entry.name === 'layout.tsx') {
      // layout doesn't define a route itself
    }
  }
};
walkRoutes(appDir);

addInfo('routes', `Found ${existingRoutes.size} existing routes in app/`);

// Extract sidebar links from config files
const sidebarFiles = getAllTsFiles(path.join(PROJECT_ROOT, 'config'));
const sidebarLinks = [];
for (const file of sidebarFiles) {
  const content = readFile(file);
  if (!content) continue;
  // Look for href: '...' patterns in arrays
  const hrefMatches = content.match(/href:\s*['"`]([^'"`]+)['"`]/g) || [];
  for (const match of hrefMatches) {
    const href = match.match(/href:\s*['"`]([^'"`]+)['"`]/)[1];
    sidebarLinks.push({ href, file: relative(file) });
  }
  // Also look for items arrays
  const itemMatches = content.match(/items:\s*\[([\s\S]*?)\]/g) || [];
  for (const itemBlock of itemMatches) {
    const hrefs = itemBlock.match(/href:\s*['"`]([^'"`]+)['"`]/g) || [];
    for (const h of hrefs) {
      const href = h.match(/href:\s*['"`]([^'"`]+)['"`]/)[1];
      sidebarLinks.push({ href, file: relative(file) });
    }
  }
}

// Normalize sidebar hrefs to routes
const normalizedSidebarRoutes = [];
for (const link of sidebarLinks) {
  let route = link.href;
  if (route === '/') route = '/';
  else if (route.startsWith('/')) route = route;
  else route = '/' + route;
  route = route.replace(/\(([^)]+)\)/g, '').replace(/\/+/g, '/');
  if (route.length > 1 && route.endsWith('/')) route = route.slice(0, -1);
  normalizedSidebarRoutes.push({ route, file: link.file, original: link.href });
}

// Check for missing routes
for (const item of normalizedSidebarRoutes) {
  if (!existingRoutes.has(item.route)) {
    addIssue('high', 'missing-page', item.file, `Sidebar link points to non-existent route: ${item.original} (normalized: ${item.route})`);
  }
}

// Check for Zod usage
let zodCount = 0;
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  if (content.includes('zod') || content.includes('zod(') || content.includes('z.')) {
    zodCount++;
  }
}
addInfo('zod', `Found ${zodCount} files referencing zod`);

// Check .gitignore for tsbuildinfo
const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');
const gitignore = readFile(gitignorePath);
if (gitignore && gitignore.includes('*.tsbuildinfo')) {
  addInfo('gitignore', '*.tsbuildinfo is present in .gitignore');
} else {
  addWarning('gitignore', '.gitignore', '*.tsbuildinfo is NOT in .gitignore');
}

// Check reference HTML files
const refDir = path.resolve(__dirname, '..', '..', 'reference-files');
let refHtmlCount = 0;
if (fs.existsSync(refDir)) {
  const refFiles = fs.readdirSync(refDir).filter(f => f.endsWith('.html'));
  refHtmlCount = refFiles.length;
  addInfo('reference', `Found ${refHtmlCount} reference HTML files in ${refDir}`);
} else {
  addWarning('reference', 'reference-files', 'Directory not found at expected location');
}

// Check for sample-data vs lib data duplication
const sampleDataDir = path.join(PROJECT_ROOT, 'sample-data');
const libDataDir = path.join(PROJECT_ROOT, 'lib');
const sampleFiles = getAllTsFiles(sampleDataDir).map(f => relative(f));
const libFiles = getAllTsFiles(libDataDir).map(f => relative(f));
addInfo('data', `sample-data files: ${sampleFiles.length}, lib data files: ${libFiles.length}`);

// Check for duplicate route definitions (same route in multiple files)
const routeFiles = new Map();
for (const file of files) {
  const content = readFile(file);
  if (!content) continue;
  const routeMatch = content.match(/route:\s*['"`]([^'"`]+)['"`]/g);
  if (routeMatch) {
    for (const r of routeMatch) {
      const route = r.match(/route:\s*['"`]([^'"`]+)['"`]/)[1];
      if (!routeFiles.has(route)) routeFiles.set(route, []);
      routeFiles.get(route).push(relative(file));
    }
  }
}
for (const [route, fileList] of routeFiles.entries()) {
  if (fileList.length > 1) {
    addWarning('duplicate-route', fileList.join(', '), `Route "${route}" defined in multiple files`);
  }
}

// Output report
const report = {
  summary: {
    totalSourceFiles: files.length,
    missingUseClient: filesMissingUseClient.length,
    sidebarLinks: normalizedSidebarRoutes.length,
    existingRoutes: existingRoutes.size,
    zodFiles: zodCount,
    refHtmlFiles: refHtmlCount,
    brandWarnings: warnings.filter(w => w.category === 'brand').length,
    securityWarnings: warnings.filter(w => w.category === 'security').length,
  },
  issues,
  warnings,
  info,
};

fs.writeFileSync(path.join(PROJECT_ROOT, 'scripts', 'review-report.json'), JSON.stringify(report, null, 2));

// Also print a summary to stdout
console.log('=== CODE REVIEW ANALYSIS SUMMARY ===');
console.log(`Total source files: ${files.length}`);
console.log(`Files missing 'use client': ${filesMissingUseClient.length}`);
console.log(`Sidebar links checked: ${normalizedSidebarRoutes.length}`);
console.log(`Existing routes: ${existingRoutes.size}`);
console.log(`Zod references: ${zodCount}`);
console.log(`Reference HTML files: ${refHtmlCount}`);
console.log(`Brand warnings: ${warnings.filter(w => w.category === 'brand').length}`);
console.log(`Security warnings: ${warnings.filter(w => w.category === 'security').length}`);
console.log(`Total issues: ${issues.length}`);
console.log(`Total warnings: ${warnings.length}`);
console.log(`Total info: ${info.length}`);
console.log('\nDetailed JSON report written to scripts/review-report.json');
