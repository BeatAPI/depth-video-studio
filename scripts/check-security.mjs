import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

const failures = [];

const pinnedPackages = [
  {
    name: 'Transformers.js',
    pattern: /https:\/\/cdn\.jsdelivr\.net\/npm\/@huggingface\/transformers@([^/'"]+)/g,
    expectedVersion: '3.8.1',
    expectedReferences: 2,
  },
  {
    name: 'MediaPipe Tasks Vision',
    pattern: /https:\/\/cdn\.jsdelivr\.net\/npm\/@mediapipe\/tasks-vision@([^/'"]+)/g,
    expectedVersion: '0.10.35',
    expectedReferences: 2,
  },
];

for (const dependency of pinnedPackages) {
  const versions = [...html.matchAll(dependency.pattern)].map((match) => match[1]);
  if (versions.length !== dependency.expectedReferences) {
    failures.push(
      `${dependency.name} must have ${dependency.expectedReferences} pinned references`,
    );
  }
  if (versions.some((version) => version !== dependency.expectedVersion)) {
    failures.push(
      `${dependency.name} must use exact version ${dependency.expectedVersion}`,
    );
  }
}

const pinnedModels = [
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
];
for (const modelUrl of pinnedModels) {
  if (!html.includes(modelUrl)) failures.push(`Missing pinned model URL: ${modelUrl}`);
}
if (/\/float16\/latest\//.test(html)) {
  failures.push('MediaPipe model URLs must not use latest');
}

const depthModelRevision = '4472b7362082ad9968fee890ca0f1e5aca36b93d';
if (!html.includes(`const DEPTH_MODEL_REVISION = '${depthModelRevision}'`)) {
  failures.push('Depth Anything V2 must declare its pinned Hugging Face revision');
}
if (!html.includes('revision: DEPTH_MODEL_REVISION')) {
  failures.push('Depth Anything V2 pipeline must load its pinned revision');
}

const csp = html.match(
  /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"\s*\/?>/i,
)?.[1];

if (!csp) {
  failures.push('A Content Security Policy meta tag is required');
} else {
  const directives = new Map(
    csp
      .split(';')
      .map((part) => part.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...sources]) => [name, new Set(sources)]),
  );
  const requiredDirectives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'wasm-unsafe-eval'", 'https://cdn.jsdelivr.net'],
    'connect-src': [
      "'self'",
      'blob:',
      'https://cdn.jsdelivr.net',
      'https://storage.googleapis.com',
      'https://huggingface.co',
      'https://*.huggingface.co',
      'https://hf-mirror.com',
      'https://*.hf-mirror.com',
      'https://*.hf.co',
      'https://*.xethub.hf.co',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'none'"],
    'form-action': ["'none'"],
  };
  for (const [name, requiredSources] of Object.entries(requiredDirectives)) {
    const actualSources = directives.get(name);
    for (const source of requiredSources) {
      if (!actualSources?.has(source)) failures.push(`CSP ${name} is missing: ${source}`);
    }
  }
  for (const [name, sources] of directives) {
    if (sources.has('*')) failures.push(`CSP ${name} must not use an unrestricted wildcard`);
    if ([...sources].some((source) => source.startsWith('http:'))) {
      failures.push(`CSP ${name} must not allow insecure HTTP sources`);
    }
  }
}

if (!/<meta\s+name="referrer"\s+content="no-referrer"\s*\/?>/i.test(html)) {
  failures.push('A no-referrer policy is required');
}

if (failures.length) {
  console.error(failures.map((message) => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log('Security check passed: dependencies are pinned and CSP is present.');
