# 8–10 Minute Demo Script

## 0:00–0:45 — Introduce the project

Explain that this repository contains the original .NET demo and a separate Node.js,
Express, and TypeScript Invoice Approval app under `node-app/`. State that the Node app uses
an in-memory repository and demo authentication.

## 0:45–1:45 — Show the architecture

Walk through:

- `node-app/src/controllers/` for HTTP routes.
- `node-app/src/services/approvalService.ts` for amount and approval-count rules.
- `node-app/src/repositories/invoiceRepository.ts` for in-memory persistence.
- `node-app/src/models/` and `node-app/src/middleware/` for typed domain records and
  authenticated identity.
- `node-app/public/` for the UI, `node-app/tests/` for Vitest, and `node-app/e2e/` for
  Playwright.

Emphasize that the approval service receives the authenticated user; a request cannot set
its own role.

## 1:45–2:45 — Trace the specification-first workflow

Open `node-app/specs/001-role-based-invoice-approval/spec.md`, then its `plan.md` and
`tasks.md`. Explain the confirmed thresholds, rejection-without-mutation rule, and the
clarification that either role may approve first above 500,000, while a different Director
must approve second. Point out that the feature has no invoice rejection action.

## 2:45–3:45 — Show AI customizations

Open the three custom agents under `node-app/.github/agents/`:

- Requirements analyst for requirement gaps.
- Implementation agent for approved code tasks.
- QA/review agent for verification and findings.

Show the reusable Agent Skills under `node-app/.github/skills/` for business rules, TypeScript
development, and testing. Describe the `subagentStop` quality hook in
`.github/hooks/node-quality-check.json`; it matches the invoice implementation agent names.
It runs the Node build and Vitest suite, and asks the subagent to continue if either fails.
This workspace hook depends on a trusted Copilot session; describe it as configured, not as
live-verified unless it has actually fired in the demo environment.

## 3:45–4:45 — Explain Git history

Show the branch and existing history:

```powershell
git branch --show-current
git --no-pager log --oneline origin/main..HEAD
```

Explain that the existing initial implementation commit already contains the two-approver
rules; the later enhancement commit adds tests and tooling. This history does not prove the
requested single-approver-then-two-approver sequence, and it will not be rewritten. Do not
claim that later assignment artifacts have been committed unless new commits have actually
been created.

## 4:45–5:45 — Run unit and API tests

From `node-app`, run:

```powershell
npm run build
npm test
```

Show the service boundary tests, immutable snapshots after rejected approvals, and API
authentication and role-spoofing cases. Explain that exact results shown are from the live
run, not prewritten in this script.

## 5:45–7:15 — Demonstrate the browser workflow

Run `npm run dev`, open `http://localhost:3000`, and sign in with the local demo Manager
account using the credential displayed in the UI.

1. Create a 500,001 invoice and give the first approval as Manager.
2. Show that its status remains `PENDING` and the history includes the Manager, role, and
   time.
3. Log out and sign in as a different Director; give the second approval.
4. Show the `APPROVED` status and both approval-history entries.

## 7:15–8:00 — Run Playwright

In another terminal, run:

```powershell
npm run test:e2e
```

Describe the tests as automated verification of the same role-based browser journey. Do not
claim a pass unless the command completes successfully.

## 8:00–9:00 — Run mutation testing

Run:

```powershell
npm run test:mutation -- --reporters clear-text
```

Explain that Stryker mutates the approval service to assess whether tests detect meaningful
business-rule changes. Show the actual mutation score and any surviving mutants from the
current run; do not assume an expected score.

## 9:00–9:45 — Close with evidence and limitations

Summarize the live build, Vitest, Playwright, and mutation results. Mention the assignment
report, interaction log, and outstanding limitations, including in-memory storage and
demo-only authentication. State whether there is PR review evidence; if no PR exists, say so.
