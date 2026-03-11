#!/usr/bin/env node
/**
 * Update aiapps, @taias/aiapps-devtools, and taias versions
 * in template and example apps
 *
 * Usage:
 *   node scripts/bump.js          # Uses latest published versions
 *   node scripts/bump.js 0.30.0   # Uses specific aiapps version
 */
import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(__dirname);

function fetchLatestVersion(packageName) {
  try {
    return execSync(`npm view ${packageName} version`, {
      encoding: "utf8",
    }).trim();
  } catch {
    console.error(`Error: Could not fetch latest version of ${packageName}`);
    return null;
  }
}

// Get aiapps version from arg or fetch latest from npm
const aiappsVersion = process.argv[2] || fetchLatestVersion("aiapps");
if (!aiappsVersion) {
  process.exit(1);
}

const devtoolsVersion = fetchLatestVersion("@taias/aiapps-devtools");
const taiasVersion = fetchLatestVersion("taias");

const aiappsRange = `>=${aiappsVersion} <1.0.0`;
const devtoolsRange = devtoolsVersion ? `>=${devtoolsVersion} <1.0.0` : null;
const taiasRange = taiasVersion ? `^${taiasVersion}` : null;

console.log(`aiapps:               ${aiappsRange}`);
if (devtoolsRange) {
  console.log(`@taias/aiapps-devtools: ${devtoolsRange}`);
}
if (taiasRange) {
  console.log(`taias:                ${taiasRange}`);
}

// Find all example package.json files dynamically
const exampleTargets = [];
const examplesDir = join(rootDir, "examples");
if (existsSync(examplesDir)) {
  for (const dirEntry of readdirSync(examplesDir, {
    withFileTypes: true,
  })) {
    const packagePath = `examples/${dirEntry.name}/package.json`;
    if (dirEntry.isDirectory() && existsSync(join(rootDir, packagePath))) {
      exampleTargets.push(packagePath);
    }
  }
}

const targets = [
  "packages/create-aiapps/template/package.json",
  ...exampleTargets,
];

for (const target of targets) {
  const file = join(rootDir, target);

  if (!existsSync(file)) {
    console.log(`Skipping (not found): ${target}`);
    continue;
  }

  console.log(`Updating: ${target}`);

  const pkg = JSON.parse(readFileSync(file, "utf8"));

  if (pkg.dependencies?.aiapps) {
    pkg.dependencies.aiapps = aiappsRange;
  }

  if (devtoolsRange && pkg.devDependencies?.["@taias/aiapps-devtools"]) {
    pkg.devDependencies["@taias/aiapps-devtools"] = devtoolsRange;
  }

  if (taiasRange && pkg.devDependencies?.taias) {
    pkg.devDependencies.taias = taiasRange;
  }

  writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
}

console.log("\nDone.");
