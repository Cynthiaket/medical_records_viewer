# Error Budget & SLO Policy

Service Level Objective (SLO)
- Availability target: **99.9%** per 30-day window.

Error Budget
- Error budget = 100% - SLO = **0.1%** of time per 30 days.
- For a 30-day month (43,200 minutes), 0.1% ~= **43.2 minutes** of allowed downtime.

Policy
- If monthly error budget consumption > 25% (≈10.8 minutes), the team should:
  - Investigate root causes in the incident timeline.
  - Post a short retrospective in the project channel.
- If consumption > 50%:
  - Pause large non-critical releases until the budget is back under control.
  - Increase monitoring cadence and paging thresholds.
- If consumption reaches 100%:
  - Treat as critical incident; invoke incident response, rollback risky changes.

Measurement
- Availability measured by `/health` endpoint and external uptime checks.
- Record incidents with start/end timestamps and impact severity.
