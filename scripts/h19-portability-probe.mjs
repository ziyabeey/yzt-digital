#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const targetRoot = path.resolve(process.env.TARGET_ROOT ?? 'target');
const h19Root = path.resolve(process.env.H19_KIT_ROOT ?? 'h19-source/tools/h19-kit');
const outputPath = path.resolve(process.env.H19_REPORT ?? 'h19-portability-report.json');
const sourceRevision = process.env.TARGET_SOURCE_REVISION;
const changeRevision = process.env.TARGET_CHANGE_REVISION;
const scipExecutable = process.env.SCIP_EXECUTABLE;
const decoderIdentity = process.env.SCIP_DECODER_ID;

if (!sourceRevision || !changeRevision || !scipExecutable || !decoderIdentity) {
  throw new Error('TARGET_SOURCE_REVISION, TARGET_CHANGE_REVISION, SCIP_EXECUTABLE and SCIP_DECODER_ID are required');
}

const importH19 = async (relativePath) =>
  import(pathToFileURL(path.join(h19Root, relativePath)).href);

const [
  inventoryApi,
  historyApi,
  hotspotApi,
  shardApi,
  graphApi,
  projectGraphApi,
  impactApi,
  discoveryApi,
  packetApi,
  specApi,
] = await Promise.all([
  importH19('src/repository/inventory.mjs'),
  importH19('src/adapters/git-history.mjs'),
  importH19('src/adapters/git-hotspots.mjs'),
  importH19('src/indexing/typescript-project-shards.mjs'),
  importH19('src/indexing/typescript-evidence-graph.mjs'),
  importH19('src/impact/project-graph.mjs'),
  importH19('src/impact/change-impact.mjs'),
  importH19('src/discovery/coverage-discovery.mjs'),
  importH19('src/discovery/validation-packet.mjs'),
  importH19('src/specification/test-spec.mjs'),
]);

function command(cmd, args, cwd = targetRoot) {
  return execFileSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function changedPaths(revision) {
  return command('git', [
    'show',
    '--pretty=format:',
    '--name-only',
    '--no-renames',
    revision,
  ]).split(/\r?\n/).map((x) => x.trim()).filter(Boolean).sort();
}

function summarizeError(error) {
  return error instanceof Error ? {
    name: error.name,
    message: error.message,
    stack: error.stack?.split('\n').slice(0, 6).join('\n') ?? null,
  } : {
    name: 'NonError',
    message: String(error),
    stack: null,
  };
}

const report = {
  schemaVersion: 1,
  kind: 'h19-cross-repo-portability-probe',
  target: {
    repository: 'ziyabeey/yzt-digital',
    sourceRevision,
    changeRevision,
  },
  h19: {
    repository: 'ziyabeey/randevu',
    revision: process.env.H19_SOURCE_REVISION ?? null,
  },
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  stages: {},
  observations: {},
};

async function stage(id, fn) {
  const started = performance.now();
  try {
    const value = await fn();
    report.stages[id] = {
      status: 'pass',
      durationMs: performance.now() - started,
      value,
    };
    return value;
  } catch (error) {
    report.stages[id] = {
      status: 'fail',
      durationMs: performance.now() - started,
      error: summarizeError(error),
    };
    return null;
  }
}

const doctor = await stage('M0-doctor', async () => ({
  node: process.version,
  git: command('git', ['--version'], targetRoot),
  scip: command(scipExecutable, ['--version'], targetRoot),
  scipTypeScript: command('scip-typescript', ['--version'], targetRoot),
}));

const inventory = await stage('M1-repository-inventory', async () => {
  const result = await inventoryApi.repositoryInventory(targetRoot);
  report.observations.inventory = result;
  const languages = {};
  for (const unit of result.units) {
    const language = unit.language ?? 'unknown';
    languages[language] = (languages[language] ?? 0) + 1;
  }
  return {
    filesScanned: result.filesScanned,
    semanticUnits: result.units.length,
    errors: result.errors,
    languages,
  };
});

const history = await stage('M2-history-evidence', async () => {
  const [couplings, hotspots] = await Promise.all([
    historyApi.temporalCoupling({ cwd: targetRoot, since: '365 days ago' }),
    hotspotApi.gitHotspots({ cwd: targetRoot, since: '365 days ago' }),
  ]);
  report.observations.temporalCoupling = couplings;
  report.observations.hotspots = hotspots;
  return {
    couplingPairs: couplings.length,
    hotspotFiles: hotspots.length,
    topHotspots: hotspots.slice(0, 8),
    topCouplings: couplings.slice(0, 8),
  };
});

const shards = await stage('M3.5-typescript-shards', async () => {
  const result = await shardApi.resolveTypeScriptProjectShards({
    cwd: targetRoot,
    rootConfig: 'tsconfig.json',
  });
  report.observations.shards = result;
  return {
    shardCount: result.length,
    shards: result.map((x) => ({
      id: x.id,
      sourceFiles: x.sourceFiles.length,
      configFiles: x.configFiles,
    })),
  };
});

const graphResult = await stage('M3.5-scip-evidence-graph', async () => {
  const result = await graphApi.buildTypeScriptEvidenceGraph({
    cwd: targetRoot,
    strategy: 'project-shards',
    allowWholeFallback: true,
    rootConfig: 'tsconfig.json',
    scipTypeScriptVersion: '0.4.0',
    scipTypeScriptCommand: 'scip-typescript',
    scipExecutable,
    decoderIdentity,
    graphSchemaVersion: 1,
  });
  report.observations.graphSummary = {
    mode: result.mode,
    fallbackReason: result.fallbackReason,
    nodeCount: result.graph.nodeCount,
    cache: result.cache,
    project: result.project ?? null,
    shards: result.shards,
  };
  report._graph = result.graph;
  return report.observations.graphSummary;
});

const selectedChangeFiles = changedPaths(changeRevision);
report.target.changeFiles = selectedChangeFiles;

const impact = await stage('M4-change-impact', async () => {
  if (!inventory || !graphResult || !history) {
    throw new Error('M4 prerequisites did not all pass');
  }
  const graph = projectGraphApi.projectGraph({
    projects: [{ id: 'yzt-digital', root: '' }],
    dependencies: [],
  });
  const result = impactApi.analyzeChangeImpact({
    projectGraph: graph,
    changedFiles: selectedChangeFiles,
    semanticUnits: report.observations.inventory.units,
    symbolGraph: report._graph,
    coverageByPath: {},
    temporalCoupling: report.observations.temporalCoupling,
    companionThreshold: 0.75,
    includeRelatedSymbols: true,
  });
  report.observations.impact = result;
  return {
    changedFiles: result.changedFiles,
    touchedProjects: result.projectImpact.touched,
    affectedProjects: result.projectImpact.affected,
    mappedUnits: result.symbolImpact.mapping.matches.length,
    unmatchedUnits: result.symbolImpact.mapping.unmatched.length,
    referenceSiteCount: result.symbolImpact.report.referenceSiteCount,
    impactedPaths: result.symbolImpact.report.impactedPaths,
    testReferencePaths: result.symbolImpact.report.testReferencePaths,
    unknownCoveragePaths: result.symbolImpact.report.unknownCoveragePaths,
    uncoveredPaths: result.symbolImpact.report.uncoveredPaths,
    historicalCompanionsMissing: result.symbolImpact.report.historicalCompanionsMissing,
    candidateTests: result.candidateTests,
    unknowns: result.unknowns,
    safeToNarrow: result.safeToNarrow,
  };
});

const discovery = await stage('M5-coverage-discovery', async () => {
  if (!impact) throw new Error('M5 requires M4 impact');
  const testPaths = [...new Set(
    report.observations.inventory.units
      .map((x) => x.path)
      .filter((p) => impactApi.isLikelyTestPath(p)),
  )].sort();

  const result = discoveryApi.discoverCoverageHypotheses({
    impact: report.observations.impact,
    survivingMutants: [],
    existingTests: testPaths,
  });
  const packet = packetApi.freezeCoverageDiscoveryPacket({
    changeId: `commit:${changeRevision}`,
    sourceRevision,
    impact: report.observations.impact,
    discovery: result,
  });
  report.observations.discovery = result;
  report.observations.packet = packet;
  return {
    hypothesisCount: result.hypotheses.length,
    highPriorityCount: result.highPriorityCount,
    reasons: Object.fromEntries(
      [...new Set(result.hypotheses.map((x) => x.reason))]
        .sort()
        .map((reason) => [reason, result.hypotheses.filter((x) => x.reason === reason).length]),
    ),
    hypotheses: result.hypotheses.slice(0, 12),
    packetSha256: packet.packetSha256,
    safeToNarrow: packet.safeToNarrow,
  };
});

const runtimeValidation = await stage('M5-runtime-validation', async () => {
  if (!discovery) throw new Error('runtime validation requires M5 output');

  const hypothesisId =
    'coverage:unknown-runtime-coverage-on-impacted-reference:components_SitePhysicsDirector.tsx';
  const hypothesis = report.observations.packet.hypotheses
    .find((item) => item.id === hypothesisId);
  if (!hypothesis) throw new Error('SitePhysicsDirector coverage hypothesis missing');

  const sourcePath = 'components/SitePhysicsDirector.tsx';
  const testPath = 'tests/mobile.spec.ts';
  const [sourceText, testText] = await Promise.all([
    readFile(path.join(targetRoot, sourcePath), 'utf8'),
    readFile(path.join(targetRoot, testPath), 'utf8'),
  ]);

  for (const witness of [
    'materialRoot.dataset.physicsReady = "true"',
    'materialRoot.dataset.currentMaterialState',
  ]) {
    if (!sourceText.includes(witness)) {
      throw new Error('source-bound runtime witness missing: ' + witness);
    }
  }
  for (const witness of [
    'data-physics-ready',
    'data-current-material-state',
  ]) {
    if (!testText.includes(witness)) {
      throw new Error('Playwright witness assertion missing: ' + witness);
    }
  }

  const testNames = [
    'aynı 19 modül baştan finale kadar biçim değiştiriyor',
    'dört proje aynı 19 parçaya dört farklı dil veriyor',
  ];
  const grep = testNames.join('|');
  const stdout = command('npx', [
    'playwright',
    'test',
    testPath,
    '--project=mobile-small',
    '--grep',
    grep,
    '--reporter=list',
  ], targetRoot);

  const validation = packetApi.coverageValidationResult({
    packet: report.observations.packet,
    hypothesisId,
    status: 'confirmed',
    observed: {
      kind: 'source-bound-playwright-runtime-witness-v1',
      sourceRevision,
      sourcePath,
      sourceBlobSha: command(
        'git',
        ['rev-parse', sourceRevision + ':' + sourcePath],
        targetRoot,
      ),
      testPath,
      testBlobSha: command(
        'git',
        ['rev-parse', sourceRevision + ':' + testPath],
        targetRoot,
      ),
      project: 'mobile-small',
      testNames,
      witnesses: [
        'SitePhysicsDirector writes data-physics-ready=true',
        'SitePhysicsDirector writes data-current-material-state during project transitions',
        'existing Playwright tests assert both source-owned markers while scrolling the same 19 material modules',
      ],
      outputTail: stdout.split(/\r?\n/).slice(-24),
    },
  });
  report.observations.sitePhysicsValidation = validation;
  return {
    hypothesisId,
    status: validation.status,
    project: 'mobile-small',
    tests: testNames.length,
    sourcePath,
    testPath,
  };
});

const testSpecification = await stage('M6-test-specification', async () => {
  if (!runtimeValidation) throw new Error('M6 specification requires runtime validation');

  const hypothesisId = runtimeValidation.hypothesisId;
  const recipe = specApi.freezeTestRecipe({
    recipeId: 'yzt-digital-site-physics-playwright',
    version: '0.1',
    matches: {
      reason: 'unknown-runtime-coverage-on-impacted-reference',
    },
    setup: [
      'Use frozen yzt-digital source revision and Playwright mobile-small viewport.',
      'Load / and wait for .site-material to expose data-physics-ready=true.',
    ],
    action: 'Scroll the persistent 19 material modules through the lab and project sections.',
    expectedInvariant: 'Site physics initializes, material transforms/state markers change across sections, and horizontal overflow remains absent.',
    observations: [
      '.site-material[data-physics-ready="true"]',
      '.site-material[data-current-material-state] reaches kepenk, yote, kldrm and h19',
      '19 .material-module nodes persist while transform signatures change',
      'viewport remains free of horizontal overflow',
    ],
  });

  const spec = specApi.buildTestSpecification({
    packet: report.observations.packet,
    hypothesisId,
    validationResult: report.observations.sitePhysicsValidation,
    recipe,
  });
  specApi.validateTestSpecification(spec);
  report.observations.sitePhysicsRecipe = recipe;
  report.observations.sitePhysicsTestSpecification = spec;
  return {
    hypothesisId,
    specSha256: spec.specSha256,
    readyForExecution: spec.readyForExecution,
    unknowns: spec.unknowns,
    target: spec.target,
    validation: spec.origin.validation,
  };
});

await stage('M6-promotion-guard', async () => {
  if (!discovery) throw new Error('M6 guard requires M5 output');
  const first = report.observations.packet.hypotheses[0];
  if (!first) {
    return {
      state: 'not-applicable',
      reason: 'M5 emitted no hypothesis',
    };
  }
  try {
    specApi.buildTestSpecification({
      packet: report.observations.packet,
      hypothesisId: first.id,
    });
  } catch (error) {
    if (/requires confirmed validation before test specification/.test(String(error?.message))) {
      return {
        state: 'correctly-blocked',
        hypothesisId: first.id,
        reason: 'runtime-validation-required-before-M6',
      };
    }
    throw error;
  }
  throw new Error('M6 unexpectedly promoted an unvalidated non-mutant hypothesis');
});

delete report._graph;

const passed = Object.values(report.stages).filter((x) => x.status === 'pass').length;
const failed = Object.values(report.stages).filter((x) => x.status === 'fail').length;
const deepest = [
  'M6-test-specification',
  'M6-promotion-guard',
  'M5-runtime-validation',
  'M5-coverage-discovery',
  'M4-change-impact',
  'M3.5-scip-evidence-graph',
  'M3.5-typescript-shards',
  'M2-history-evidence',
  'M1-repository-inventory',
  'M0-doctor',
].find((id) => report.stages[id]?.status === 'pass') ?? null;

report.summary = {
  stageCount: Object.keys(report.stages).length,
  passed,
  failed,
  deepestPassingStage: deepest,
  generatedCoverageHypotheses:
    report.stages['M5-coverage-discovery']?.value?.hypothesisCount ?? null,
  validatedCoverageHypotheses:
    report.stages['M5-runtime-validation']?.status === 'pass' ? 1 : 0,
  m6ReadyForExecution:
    report.stages['M6-test-specification']?.value?.readyForExecution ?? null,
  safeToNarrow:
    report.stages['M4-change-impact']?.value?.safeToNarrow ?? null,
  verdict: failed === 0
    ? 'portable-through-M6-with-source-bound-runtime-validation'
    : 'partial-portability',
};

await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report.summary, null, 2));
if (failed > 0) process.exitCode = 1;
