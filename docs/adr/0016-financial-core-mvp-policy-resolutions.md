# ADR-0016: Financial Core MVP Policy Resolutions

**Status:** Accepted  
**Date:** 29 July 2026

## Context

Checkpoint 2 required three product decisions before the financial runtime could be planned without silently choosing financial meaning.

## Decision

### FC-01: Owner as service provider

Only the actual payment to the owner for completed services under the active compensation scheme is recognised as an operating labour expense. An owner draw is recorded separately and does not reduce operating profit. The MVP does not include a normative value for unpaid owner labour in the main result; it may be introduced later only as a separate estimate.

### FC-02: Tips

An amount is treated as a tip only when the source data explicitly identifies it as a tip. Such a tip is a transit amount: it is excluded from salon revenue, operating profit, service margin, and the master-pay base. Its receipt and transfer may be linked cash movements in the conditional cash module. When the current source cannot identify tips reliably, the amount is not silently classified or replaced with zero; it creates a controlled exception or warning.

### FC-03: Materials after a refund or cancellation

A refund, cancellation, or service correction does not automatically reverse material cost. A confirmed return, non-use, or recovery of materials may be recognised only as a separate manual material adjustment with a reason, reference to the original operation, and audit trail. Without that adjustment, the original actual or normative material cost remains. Inventory and automatic stock accounting are outside the Financial Core MVP.

## Consequences

- The financial core keeps owner labour expense distinct from owner distributions.
- Tips never enter service-revenue or master-compensation formulas without an explicit source classification.
- Material cost is retained after a refund unless an audited adjustment exists.
- These rules refine ADR-0005 and ADR-0006; they do not change period closure or cash-module scope.

## Review Conditions

Review only when the MVP gains an approved explicit tip source, a separate normative owner-labour metric, or an inventory-capable material module.
