# Frontend Docs Moved to Lotus

Bodhi no longer contains frontend source files (`src/`, `index.html`, `public/`, Vite/TS configs).  
Frontend implementation docs are now maintained in `lotus/docs`.

Lotus docs root:
- [`../../lotus/docs/README.md`](../../lotus/docs/README.md)

## Moved Paths

| Old Path (Bodhi) | New Path (Lotus) |
|---|---|
| `docs/architecture/FRONTEND_ARCHITECTURE.md` | `lotus/docs/architecture/FRONTEND_ARCHITECTURE.md` |
| `docs/development/README.md` | `lotus/docs/development/README.md` |
| `docs/development/STYLING_GUIDELINES.md` | `lotus/docs/development/STYLING_GUIDELINES.md` |
| `docs/development/LIBRARY_INTEGRATION_PLAN.md` | `lotus/docs/development/LIBRARY_INTEGRATION_PLAN.md` |
| `docs/development/components/SystemPromptSelector.md` | `lotus/docs/development/components/SystemPromptSelector.md` |
| `docs/features/MERMAID_ENHANCEMENT_COMPLETE.md` | `lotus/docs/features/MERMAID_ENHANCEMENT_COMPLETE.md` |
| `docs/features/command-selector/*` | `lotus/docs/features/command-selector/*` |
| `docs/features/question-dialog/*` | `lotus/docs/features/question-dialog/*` |
| `docs/testing/FRONTEND_TESTS_SUMMARY.md` | `lotus/docs/testing/FRONTEND_TESTS_SUMMARY.md` |
| `docs/testing/FRONTEND_MERMAID_TESTING.md` | `lotus/docs/testing/FRONTEND_MERMAID_TESTING.md` |
| `docs/tools/MERMAID_EXAMPLES.md` | `lotus/docs/tools/MERMAID_EXAMPLES.md` |
| `docs/fixes/MERMAID_DYNAMIC_IMPORT_FIX.md` | `lotus/docs/fixes/MERMAID_DYNAMIC_IMPORT_FIX.md` |
| `docs/fixes/MERMAID_DYNAMIC_THEME_FIX.md` | `lotus/docs/fixes/MERMAID_DYNAMIC_THEME_FIX.md` |
| `docs/fixes/MERMAID_THEME_RESPONSIVE_FIX.md` | `lotus/docs/fixes/MERMAID_THEME_RESPONSIVE_FIX.md` |
| `docs/fixes/COPILOT_AUTH_ERROR_HANDLING.md` | `lotus/docs/fixes/COPILOT_AUTH_ERROR_HANDLING.md` |
| `docs/fixes/MODEL_HARDCODING_FIX_IMPLEMENTATION.md` | `lotus/docs/fixes/MODEL_HARDCODING_FIX_IMPLEMENTATION.md` |
| `docs/fixes/MODEL_RACE_CONDITION_FIX.md` | `lotus/docs/fixes/MODEL_RACE_CONDITION_FIX.md` |
| `docs/fixes/LIMITATIONS_RESOLVED.md` | `lotus/docs/fixes/LIMITATIONS_RESOLVED.md` |
| `docs/fixes/AGENT_RESUME_FIX_SUMMARY.md` | `lotus/docs/fixes/AGENT_RESUME_FIX_SUMMARY.md` |
| `docs/reports/agent-system/AGENT_APPROVAL_FRONTEND_SUMMARY.md` | `lotus/docs/reports/agent-system/AGENT_APPROVAL_FRONTEND_SUMMARY.md` |

## Ownership Rule

- Frontend behavior/UI docs: update in Lotus.
- Desktop shell/runtime/package docs: update in Bodhi.
