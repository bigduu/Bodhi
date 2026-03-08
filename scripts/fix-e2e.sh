#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BODHI_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOTUS_ROOT="${BODHI_ROOT}/../lotus"
BAMBOO_ROOT="${BODHI_ROOT}/../bamboo"

if ! command -v claude >/dev/null 2>&1; then
  echo "❌ Claude CLI is not installed or not in PATH."
  exit 1
fi

if [ ! -d "${LOTUS_ROOT}" ]; then
  echo "❌ Lotus workspace not found at ${LOTUS_ROOT}"
  echo "   This script assumes lotus is the frontend source of truth."
  exit 1
fi

cd "${BODHI_ROOT}"

echo "========================================"
echo "Bodhi/Lotus E2E repair helper"
echo "========================================"
echo ""
echo "Frontend source of truth: ${LOTUS_ROOT}"
echo "Desktop shell workspace:   ${BODHI_ROOT}"
echo "Backend workspace:         ${BAMBOO_ROOT}"
echo ""
echo "Press Enter to launch Claude with the repair task..."
read -r

claude --dangerously-skip-permissions "$(cat <<EOF
Fix E2E tests for the Zenith desktop/web stack.

Workspace layout:
- Bodhi shell root: ${BODHI_ROOT}
- Lotus frontend source of truth: ${LOTUS_ROOT}
- Bamboo backend: ${BAMBOO_ROOT}

Follow these steps:

## Step 1: Diagnose failures
1. Read ${LOTUS_ROOT}/e2e/REPAIR_PLAN.md if present.
2. Inspect ${LOTUS_ROOT}/e2e/playwright.config.ts.
3. Inspect selectors and data-testid usage in ${LOTUS_ROOT}/src.
4. Verify shell-level wrappers in ${BODHI_ROOT}/package.json.

## Step 2: Fix test/runtime config
1. Fix ${LOTUS_ROOT}/e2e/playwright.config.ts as needed.
2. Add or fix global setup/teardown files under ${LOTUS_ROOT}/e2e when required.
3. Ensure test startup matches current scripts (Lotus + Bodhi shell model).

## Step 3: Fix selectors and UI coupling
1. Validate that test selectors exist in Lotus components.
2. Add or adjust missing data-testid attributes in Lotus code.
3. Keep selectors stable and intention-revealing.

## Step 4: Verify API expectations
1. Check the backend endpoints used by E2E tests against current Bamboo/Bodhi runtime wiring.
2. Fix mismatched paths or assumptions in tests.

## Step 5: Run and close
1. Run the E2E suite through Bodhi shell scripts from ${BODHI_ROOT}.
2. Fix remaining failures.
3. Report:
   - what was fixed
   - what remains
   - exact commands to reproduce and rerun

Important constraints:
- Do not use or recreate legacy Bodhi frontend mirror paths (src/, index.html in bodhi root).
- Lotus is the only frontend source of truth.
EOF
)"
