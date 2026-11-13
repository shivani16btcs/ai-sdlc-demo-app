# Invoice Approval Assignment Report

## Scope and architecture

The Node.js app is a separate demo under `node-app/`; the repository root also contains a
.NET demo. The Node application is an Express API with strict TypeScript, a static browser
UI, and an in-memory invoice repository.

Approval requests pass through authentication middleware and the invoice controller to
`ApprovalService`; the service applies the amount, role, status, and distinct-approver rules
before updating the repository. Shared records are typed in `src/models/`. The service,
controller, repository, middleware, UI, Vitest tests, and Playwright tests remain separated
by their existing project boundaries.

## Approved behavior

The feature specification is the source of truth. The implementation and tests enforce:

- Managers may approve invoices through 50,000; Directors may approve invoices through
  500,000.
- An invoice above 500,000 requires two distinct approvers. Either role may approve first;
  that first approval leaves the invoice `PENDING`. A different Director must approve
  second, after which the status is `APPROVED`.
- Only `PENDING` invoices may be approved. A user cannot approve twice, and rejected
  attempts do not change invoice data or history.
- Every successful history entry includes the authenticated approver's ID, name, role, and
  timestamp; the UI displays the name, role, and timestamp.
- The feature does not add an invoice-rejection action.

The first-approver rule above 500,000 is an explicit assumption based on the literal
specification. It is not silently generalized from the Manager's 50,000 limit.

## Specifications, agents, and skills

The Node app constitution is `.specify/memory/constitution.md`. The active feature documents
are in `specs/001-role-based-invoice-approval/`, including the specification, plan, tasks,
quickstart, and requirements checklist.

Three custom agent definitions are under `.github/agents/`: requirements, implementation, and
testing/review. Three requested invoice-specific Agent Skills are under `.github/skills/`:
business rules, TypeScript development, and testing. Their YAML frontmatter, required names,
descriptions, and skill-name/folder correspondence were checked.

The available task tooling did not expose a way to invoke those repository-defined agent
files directly. The requirements review used the built-in `explore` agent, implementation
used `general-purpose`, and the independent review used `code-review`. The actual roles,
agent IDs, prompt scopes, responses, decisions, and outcomes are recorded in
`AI_INTERACTION_LOG.md`; no custom-agent invocation is claimed.

## Automated quality hook

The repository-root `.github/hooks/node-quality-check.json` uses the documented Copilot
`subagentStop` event, matched to the invoice implementation agent names. It runs
`node-app/scripts/copilot-quality-check.mjs`, which executes the Node build and Vitest suite
and blocks completion if either check fails. The config and script were validated, and the
script was run directly: the build and all 29 Vitest tests passed.

The event itself was not observed firing in a trusted Copilot session. Treat it as configured
but not runtime-verified. The format and event are documented by [VS Code agent hooks](https://code.visualstudio.com/docs/agent-customization/hooks)
and the [GitHub Copilot hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference).

## Validation results

Run Node commands from `node-app/`.

| Check | Result |
|---|---|
| `npm run build` | Passed |
| `npm test` | Passed: 29 tests across 3 files |
| `npm run test:e2e` | Passed: 2 Playwright tests |
| `npm run test:mutation -- --reporters clear-text` | Passed with 35 mutants killed, 26 TypeScript `CompileError` mutants, 0 timeouts, and 0 survivors |
| `git diff --check` | Passed |
| Copilot hook script | Passed directly: build and 29 Vitest tests passed |
| Agent and Skill frontmatter | 3 custom agents and the 3 requested invoice skills validated |

Stryker reported a 100% score for scoreable mutants. The JSON diagnostic confirmed the 26
`CompileError` results were rejected by the configured TypeScript checker because the mutated
code violated strict typing (such as removing required returns or null checks); they were
not surviving business-rule mutants. An initial parallel run had three timeouts, so the
configuration now uses concurrency 1; the final run had no timeouts. The checked-in HTML
mutation report was preserved by using the clear-text reporter for the final command.

A separate debug-level diagnostic run failed when the installed Vitest runner attempted to
JSON-serialize a circular Vite configuration. This affected debug logging only; the final
non-debug mutation run passed.

## Independent reviews

- The initial requirements review found missing approval names/history display, API
  authentication and role-spoofing coverage, and a Manager-first E2E workflow. The follow-up
  requirements review confirmed those gaps were addressed and found no confirmed remaining
  functional gap. Initial severities were High for approval history, Medium for API-boundary
  coverage, and Medium for E2E coverage. Its E2E attempt reported a server-readiness timeout;
  the main session's final Playwright run passed afterward.
- The implementation/code review reported: “No significant issues found in the reviewed
  changes.”
- The main session independently ran build, Vitest, Playwright, Stryker, and the hook script.
  Final outcomes are listed above.

The planned test-first instructions in `tasks.md` were not fully observed: the implementation
agent confirmed it edited the model/service before expanding the tests and did not capture a
pre-implementation red run. One post-edit test run exposed a failing case that was fixed
before the final passing run. This process gap is documented rather than represented as TDD
evidence.

## Git history and review evidence

Current branch: `feature/nodejs-invoice-approval`. The existing history includes:

- `41dec6b` — initial Node/Express implementation; inspection shows the two-approver rule was
  already present in this commit.
- `7910af2` — package/browser-test configuration.
- `85841ea` — service/test and mutation-testing enhancements; it does not establish a prior
  single-approver implementation stage.

Therefore, existing history cannot truthfully satisfy the requested sequence of a meaningful
single-approver implementation commit followed by a two-approver enhancement. No history was
rewritten, no commit was created, and nothing was pushed. If the sequence is mandatory, the
safe option is to create a separate branch from the agreed base and author those two stages
there, leaving this branch unchanged.

GitHub PR search found no pull requests, so there is no PR review evidence to report. No PR
was created.

## Remaining limitations

- Authentication and invoice persistence are demo/in-memory implementations, not production
  identity or durable storage.
- The approved feature scopes authentication to approval actions. Invoice creation, listing,
  and retrieval routes were not broadened without an approved requirement; confirm separately
  if the assignment expects every invoice route to require sign-in.
- The quality hook's actual event firing needs verification in a trusted Copilot session.
- The requested two-stage Git history and PR review evidence are unavailable on the current
  branch; see the safe-history option above.
- The test-first red phase was not captured.

For setup and command details, see `README.md` and the feature `quickstart.md`. The
8–10-minute walkthrough is in `DEMO_SCRIPT.md`.
