# Lumiere Control Master Roadmap

This roadmap tracks delivery status; financial definitions remain in approved contracts and specifications.

## Checkpoint 1 - Infrastructure And Periods

Goal: reliable DEV scaffolding and safe initial monthly periods.

Prerequisites: schema runtime, period contract, local clasp binding.

Deliverables: period plan/bootstrap/validate, stage runner, local pipeline, regression harness and remote-execution gap report.

Tests and DEV verification: PB-01 through PB-15, focused tests, regression, deployment validator and local pipeline.

Stop conditions: period blocker, non-idempotent write, validator failure or unsafe DEV target.

Dependencies: workbook bootstrap and `_SYS_PERIODS` schema.

Status: complete. The replacement DEV API executable deployment passed metadata preflight and two read-only direct API calls. The legacy deployment remains retained only for rollback history because it has no `EXECUTION_API` entry point.

## Checkpoint 2 - Financial Core

Goal: canonical financial metrics and reconciled plan/fact/forecast.

Prerequisites: Checkpoint 1 and approved financial contracts.

Deliverables: revenue, refunds, discounts, master pay, materials, expenses, tax, fees, operating profit, cash, obligations, reserves, owner-withdrawable amount and control examples.

Tests and DEV verification: contracts, golden fixtures, invariants, reconciliation, negative cases and DEV validation.

Stop conditions: unresolved financial definition or source conflict.

Dependencies: canonical inputs and period states.

Status: Checkpoint 2 policy decisions are resolved. The first DEV scenario now contains append-only demo operations, a linked refund and explicit aggregated demo costs. The verified July 2026 result is revenue 10900, refunds 500, net revenue 10400, expenses 7332, operating profit 3068 and operating margin 29.5%. Completeness remains `incomplete`, so the result is explicitly preliminary; owner-withdrawable cash remains unavailable rather than zero. Installation and recovery paths are idempotent and preserve source records. Detailed cash, service and team analysis remain subsequent stages.

## Checkpoint 3 - Service And Team Analytics

Goal: contribution margin, master economics, utilisation, downtime and weighted metrics.

Prerequisites: financial core.

Deliverables: separate contribution margin and allocations, correct chair rent and owner-master treatment.

Tests and DEV verification: control examples, weighted-metric invariants, negative cases and safe-stage validation.

Stop conditions: missing approved allocation or economic rule.

Status: the first preliminary demo view is operational. `03_Услуги` shows procedure counts and net revenue for three verified demo services; `04_Команда` shows procedure counts, net revenue and final recorded pay for two demo masters. Both views reconcile to net revenue 10400, are idempotent and preserve source records. Contribution profit, master direct result and utilisation remain unavailable because costs are aggregated and shifts are absent; no allocation basis or false zero is inferred.

## Checkpoint 4 - Owner Desk

Goal: owner-facing KPI, period, plan/fact, cash and decision view.

Prerequisites: financial core and analytics.

Deliverables: current/closed/forecast views, drivers and actionable decisions.

Tests and DEV verification: data-quality and presentation contracts.

Stop conditions: metric classification conflict.

Status: a first demonstration screen is operational on `01_Рабочий стол!A30:H54`. It shows the selected period, preliminary-data warning, revenue, refunds, net revenue, expense breakdown, operating profit and margin, while unavailable owner cash is shown as `Недостаточно данных`. The screen has passed numeric, idempotency and visual checks without changing source records. Full current/closed/forecast, drivers and action views remain pending.

## Checkpoint 5 - Scenarios And Recommendations

Goal: ceteris-paribus scenarios and two recommendation queues.

Prerequisites: Owner Desk and approved financial logic.

Deliverables: price, utilisation, payroll, materials and expense scenarios including tax and percentage-pay effects.

Tests and DEV verification: scenario invariants and recommendation safety cases.

Stop conditions: unapproved formula or recommendation policy.

Status: not started.

## Checkpoint 6 - Import And Data Quality

Goal: safe staging, mapping, commit, duplicate control and repeat import.

Prerequisites: canonical data model and financial core.

Deliverables: import audit trail, validation and safe repeatability.

Tests and DEV verification: mapping, duplicate, staging and commit fixtures.

Stop conditions: destructive migration or unresolved mapping ambiguity.

Status: not started.

## Checkpoint 7 - Commercial Readiness

Goal: sellable, protected premium MVP.

Prerequisites: preceding checkpoints and accepted control workbook.

Deliverables: demo dataset, acceptance suite, implementation documentation, protected UX and hidden system sheets.

Tests and DEV verification: acceptance suite and sellable-MVP validation.

Stop conditions: client-data risk or incomplete acceptance evidence.

Status: the accelerated non-client demonstration scenario has passed read-only end-to-end acceptance across source records, Owner Desk, service analysis and team analysis. Control totals reconcile and the visible limitations are explicit. This establishes demo readiness, not full commercial readiness: acceptance with real client data, protected delivery, implementation documentation and the remaining product checkpoints are still pending.
