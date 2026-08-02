# Metric Test Cases

All figures use value-per-price-unit 1. `ER=Executed R`, `PCR=Planned-capital R`, `MRR=Maximum-risk R`. Net P&L includes stated costs only. Implementations must preserve all three denominators and results.

| ID | Scenario | Expected result |
|---|---|---|
| M-01 | Planned/fill 2 at 100, initial stop 95; exit 110; commission 2. | Net P&L 18. Initial filled/planned/max risk 10. ER=PCR=MRR=1.8. |
| M-02 | Planned fills 1 at 100, 1 at 98, stop95; exits104/102; no costs. | Net 8; initial filled/planned/max risk 8. ER=PCR=MRR=1.0. |
| M-03 | Planned 2 at100/stop95; only 1 filled; exit105. | Net 5; executed denominator 5, planned-capital 10, max 5. ER=1.0; PCR=0.5; MRR=1.0. |
| M-04 | Entry2 at100/stop95; exits1 at105 and1 at97; fee1. | Net1; all denominators10. ER=PCR=MRR=0.1; never average leg R. |
| M-05 | Entry1 at100/stop95; add1 at102 with stop95; both exit105. | Net8; executed initial denominator5; planned denominator5; maximum risk `5+7=12`. ER=1.6; PCR=1.6; MRR=0.667. |
| M-06 | Entry100/stop95; widen stop90; exit90. | Net -10; initial filled/planned risk5; maximum risk10. ER=-2; PCR=-2; MRR=-1. |
| M-07 | Entry100/stop95; move stop BE; exit100; fees1. | Net -1; all denominators5. ER=PCR=MRR=-0.2; not breakeven after costs. |
| M-08 | Entry100/stop95; exit105; commission1/spread0.5/slippage0.5. | Net3; denominator5 unless policy includes planned costs; ER=0.6. Cost source shown. |
| M-09 | EUR trade net100/initial risk50; EUR/USD1.10 close snapshot. | ER=2 independently of conversion. Currency display USD110/55 only with stored rate/source/time. |
| M-10 | Imported legs calculate100; broker net94; tolerance1. | Reconciliation exception; R Estimated/Unavailable until accepted basis. Preserve both values. |
| M-11 | Imported trade lacks stop/quantity. | ER/PCR/MRR Unavailable or Estimated with explicit basis; no fabricated denominator. |
| M-12 | Five ER values +2,-1,0,+1,-2. | Total0; expectancy `0/5=0`; win rate 2/4=50%; BE rate1/5=20%. |
| M-13 | CHASE has observed impact -0.3R and counterfactual estimate -1R. | Display separately; neither changes ER; estimate is never labelled causal fact. |
| M-14 | Hindsight missed setup estimated +3R. | Store provenance/basis; exclude from realised/prospective measures. |
| M-15 | First gate No, immediate save. | Gate result Rejected; diagnostics Partial; lock Draft; no score. |
| M-16 | Pending no-trade later finds A setup was skipped. | Change candidate disposition CorrectNoTrade→Missed; never Confirmed Correct No-Trade. |
| M-17 | Imported trade has enough fills for ER but no planned order schedule or management-risk history. | ER may be calculated; PCR/MRR are Unavailable or Estimated with source/basis. No denominator is substituted. |
| M-18 | Two partial fills occur in a single planned trade thesis after two executed daily theses already exist. | A partial first fill starts one thesis; add-on fills remain in that thesis. A third new live thesis is blocked; a historical third is permanently restricted. |
| M-19 | A planned 1% trade is B grade, or has a failed gate/unclear stop. | 1% does not cure restriction; live entry remains blocked or historical record becomes restricted override. Less than 2R may affect risk/tradeability scoring but is not a mandatory rejection by itself. |
