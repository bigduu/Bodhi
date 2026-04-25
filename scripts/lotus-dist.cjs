#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIST = path.join(ROOT, ".lotus-dist");
const LOCAL_PATH = path.resolve(ROOT, process.env.LOTUS_LOCAL_PATH || "../lotus");
const PACKAGE_NAME = process.env.LOTUS_PACKAGE_NAME || "@bigduu/lotus";

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function dirExists(target) {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

function localLotusExists() {
  return dirExists(LOCAL_PATH) && fs.existsSync(path.join(LOCAL_PATH, "package.json"));
}

function resolvePackageRoot() {
  try {
    const pkgJsonPath = require.resolve(`${PACKAGE_NAME}/package.json`, {
      paths: [ROOT],
    });
    return path.dirname(pkgJsonPath);
  } catch {
    return null;
  }
}

function copyDist(sourceDist) {
  if (!dirExists(sourceDist)) {
    fail(`Lotus dist directory not found: ${sourceDist}`);
  }

  fs.rmSync(OUTPUT_DIST, { recursive: true, force: true });
  fs.cpSync(sourceDist, OUTPUT_DIST, { recursive: true });
  console.log(`✅ Synced Lotus dist: ${sourceDist} -> ${OUTPUT_DIST}`);
}

function resolveSource() {
  const SOURCE_MODE = (process.env.LOTUS_SOURCE || "auto").toLowerCase();

  if (!["auto", "local", "package"].includes(SOURCE_MODE)) {
    fail(`Invalid LOTUS_SOURCE="${SOURCE_MODE}" (expected auto|local|package)`);
  }

  const localAvailable = localLotusExists();
  const packageRoot = resolvePackageRoot();

  if (SOURCE_MODE === "local") {
    if (!localAvailable) {
      fail(
        `LOTUS_SOURCE=local but local Lotus not found at ${LOCAL_PATH}. ` +
          "Set LOTUS_LOCAL_PATH or use LOTUS_SOURCE=package.",
      );
    }
    return { mode: "local" };
  }

  if (SOURCE_MODE === "package") {
    if (!packageRoot) {
      fail(
        `LOTUS_SOURCE=package but package "${PACKAGE_NAME}" is not installed. ` +
          "Install it or use LOTUS_SOURCE=local.",
      );
    }
    return { mode: "package", packageRoot };
  }

  if (localAvailable) {
    return { mode: "local" };
  }
  if (packageRoot) {
    return { mode: "package", packageRoot };
  }

  fail(
    "No Lotus source found. Expected either:\n" +
      `- local checkout at ${LOCAL_PATH}\n` +
      `- installed package "${PACKAGE_NAME}"`,
  );
}

function stageDist() {
  const resolved = resolveSource();

  if (resolved.mode === "local") {
    console.log(`ℹ️ Using local Lotus at ${LOCAL_PATH}`);
    copyDist(path.join(LOCAL_PATH, "dist"));
    return;
  }

  console.log(`ℹ️ Using packaged Lotus "${PACKAGE_NAME}" at ${resolved.packageRoot}`);
  copyDist(path.join(resolved.packageRoot, "dist"));
}

function printInfo() {
  const localAvailable = localLotusExists();
  const packageRoot = resolvePackageRoot();

  console.log(`LOTUS_SOURCE=${(process.env.LOTUS_SOURCE || "auto").toLowerCase()}`);
  console.log(`LOTUS_LOCAL_PATH=${LOCAL_PATH} (${localAvailable ? "found" : "missing"})`);
  console.log(
    `LOTUS_PACKAGE_NAME=${PACKAGE_NAME} (${packageRoot ? `found at ${packageRoot}` : "missing"})`,
  );

  if (localAvailable) {
    console.log("Selected source (auto): local");
  } else if (packageRoot) {
    console.log("Selected source (auto): package");
  } else {
    console.log("Selected source (auto): unavailable");
  }
}

const command = process.argv[2] || "stage";

if (command === "stage") {
  stageDist();
  process.exit(0);
}

if (command === "info") {
  printInfo();
  process.exit(0);
}

fail(`Unknown command "${command}". Use one of: stage, info.`);
