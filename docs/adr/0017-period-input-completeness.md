# ADR-0017: Completeness Of Period Financial Inputs

**Status:** Accepted  
**Date:** 29 July 2026

## Context

An empty canonical operations or refunds table cannot distinguish a confirmed zero-activity period from missing input. Treating both as zero violates the Financial Core no-false-zero rule.

## Decision

Each reporting period has an explicit, auditable input-completeness status.

- `incomplete`: inputs are not confirmed complete. Metrics may be shown only as `preliminary/incomplete`; empty sources do not mean zero.
- `complete`: an actor confirms that all available operations and refunds have been loaded or entered. Empty sources then mean confirmed zero activity.
- `closed`: remains the period state defined by ADR-0006 and requires input completeness `complete`.

The confirmation is tied to `period_id` and records timestamp, actor, and source. It is idempotent and never deletes source facts. Returning `complete` to `incomplete` is allowed only through controlled reopening or an audited adjustment under ADR-0006.

## Consequences

- `_SYS_PERIODS` receives an append-only completeness extension through a separately approved schema migration.
- Formula installation is blocked until the extension is present and its data-quality contract is satisfied.
- A complete period with no operations and refunds is a confirmed zero; an incomplete period with no such rows has no zero-valued Financial Core metric.

## Review Conditions

Review only if a later import architecture supplies an equivalent immutable period-completeness audit record.
