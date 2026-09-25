#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
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
    mappedUnits: result.symbolImpact.mapping.matched.length,
    unmatchedUnits: result.symbolImpact.mapping.unmatched.length,
    referencePaths: result.symbolImpact.report.referencedPaths.length,
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
  'M6-promotion-guard',
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
  safeToNarrow:
    report.stages['M4-change-impact']?.value?.safeToNarrow ?? null,
  verdict: failed === 0 ? 'portable-through-M5-with-M6-fail-closed' : 'partial-portability',
};

await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report.summary, null, 2));
