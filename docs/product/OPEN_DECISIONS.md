# Open Decisions and Approval Register

## Must be decided by the owner now

| Priority | Decision | Recommended default | Why / confirmation |
|---|---|---|---|
| P0 | Exact 15 gate and EM1–EM4 doctrine | **In progress:** complete and approve [STRATEGY_RULEBOOK.md](STRATEGY_RULEBOOK.md); no invented rules. | Owner inputs still required for Yes/No rules, evidence, timeframes, macro/profile/structure, stops and examples. |
| P0 | Gate N/A/evidence/manual-vs-automatic policy | **Approved:** no general N/A; specific versioned exception + exact situation + reason only; never bypass mandatory condition. | Exact gate evidence/manual details remain rulebook inputs. |
| P0 | R measurement policy | **Approved:** Executed R primary; Planned-capital R and Maximum-risk R secondary with separate denominators. | Applied to metrics/tests; no action needed unless later configurable details change. |
| P0 | Grade override | **Approved:** calculated grade immutable at trade creation; confidence/note separate; corrections preserve original/corrected/explanation/audit. | Applied. |
| P0 | Trade permission | **Approved:** A+/A permitted; B review-only; C/Rejected blocked; override classifies Restricted setup taken anyway with basis. | Applied. |
| P0 | Instrument/session/account conventions | Approved universe, aliases, contract/tick/pip values, sessions, rollover, limits. | Required for correct prices/risk/import. |
| P0 | Batch A remaining controls | Session labels, 2%/1% policy, trade-thesis counting and add-on controls are approved. | Only resolve Q-A36 (account-risk basis), Q-A37 (`Other` reduced-risk condition), and Q-A43 (whether each add needs a complete new entry model). |
| P0 | Privacy/retention | Private by default, authenticated evidence, archive retains history, confirm deletion/anonymisation/export retention. | Required before sensitive records/files. |

## Can be validated through prototype testing

| Decision | Recommended default / test |
|---|---|
| Reduced navigation | **Approved:** Home, Plan, Journal, Review, Analytics, Strategy, Settings; Gate is global New Setup. |
| Fast gate density | One/paired Yes-No controls with first-failure save; test ≤90s without rule skipping. |
| Evidence burden | Start with policy-required gate evidence, test screenshot attachment/time under live conditions. |
| Dark/light direction | **Approved:** Evidence Ledger dark default; Technical Fieldbook light mode. |
| Dashboard defaults | Quality/adherence before P&L; test whether next action is obvious. |

## Technical decisions for implementation planning

| Decision | Recommended default / owner input needed |
|---|---|
| Authentication/deployment | Secure supported identity/session approach; owner confirms environment/recovery needs. |
| Screenshot storage | Private validated object storage with signed access, size/type quotas and malware scanning. |
| Currency conversion | R canonical; currency grouping by default; snapshot source/time required when conversion enabled. |
| CSV scope | Support agreed sample exports and saved mapping templates; use explicit row dedupe actions. |
| Audit/retention | Append-only redacted audit trail; define retention and deletion legal requirements. |

## Safely deferred

Broker sync, live market/news data, AI coach, replay/backtesting, social/mentor roles, native mobile, billing, public profiles, advanced dashboard customisation, and shared views. They must not be pulled into first-version implementation.

## Approval checklist

- [ ] Strategy Rulebook, gate N/A/evidence, and EM1–EM4 are operationally approved.
- [ ] Grade, permissions, R/fees/partials/adds/BE/import reconciliation test cases are approved.
- [ ] All lifecycle/status terms in [STATE_MODEL.md](STATE_MODEL.md) are approved.
- [ ] Navigation recommendation and prototype test are approved.
- [ ] Privacy, screenshots, import samples, export, backup, deletion, and currency requirements are approved.
- [ ] Acceptance Test Matrix is approved and release-quality expectations are understood.
- [ ] A clickable/high-fidelity core-flow prototype has been reviewed by the owner.

Implementation must not begin until the owner explicitly says: **“Design approved. Begin implementation.”**
