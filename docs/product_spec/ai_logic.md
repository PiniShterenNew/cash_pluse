# CashPulse AI Logic

## 1. AI Scope in MVP
AI in CashPulse is assistive, not autonomous. It provides predictions and drafting support while keeping humans in control.

MVP AI components:
1. Expected payment date prediction (debt-level)
2. Client reliability score (client-level)
3. AI-generated reminder message variants

## 2. Expected Payment Date Prediction

### 2.1 Objective
Estimate the most probable date a debt will be paid to improve cash planning and prioritization.

### 2.2 Feature Inputs
- Debt features: amount, due_date, debt age, reminder count.
- Client behavior: average days late, on-time ratio, historical amount sensitivity.
- Interaction signals: time since last reminder, reminder engagement.
- Calendar signals: weekends/holidays and local business cadence assumptions.

### 2.3 Baseline Heuristic (MVP-safe)
If data is limited, apply deterministic baseline:
- `predicted_date = due_date + client_avg_delay_days`
- If no client history: `due_date + company_avg_delay_days`
- If no company history: `due_date + 7 days`

### 2.4 Model-Assisted Enhancement
Optional LLM/statistical layer can adjust baseline based on textual and behavioral context. Final output should remain bounded by sanity rules.

### 2.5 Constraints
- Predicted date cannot be earlier than today for unpaid debt.
- Predicted date should not exceed configurable horizon (e.g., +120 days) without low-confidence flag.

### 2.6 Explainability Output
For each prediction provide explanation payload:
- top factors (e.g., "client pays ~5 days late")
- confidence level
- timestamp/model version

## 3. Client Reliability Score

### 3.1 Objective
Generate a compact risk indicator for payment punctuality.

### 3.2 Score Scale
- 0-39: high risk (chronic delays)
- 40-69: medium risk
- 70-100: reliable

### 3.3 Core Signals
- On-time payment ratio (weight high)
- Average days late (weight high)
- Reminder dependence (more reminders before payment lowers score)
- Partial payment prevalence (moderate weight)
- Recent trend (improving/declining)

### 3.4 Example Formula (Initial)
`score = 100 - lateness_penalty - reminder_penalty - volatility_penalty + trend_bonus`

Clamp to [0,100], round integer.

### 3.5 Recalculation Triggers
- payment succeeded
- payment failed
- debt transitions to overdue
- scheduled nightly recompute

### 3.6 Guardrails
- Minimum data requirement before high confidence.
- New client default score with low-confidence badge.
- No automated punitive actions based solely on score in MVP.

## 4. AI-Generated Reminder Messages

### 4.1 Objective
Improve response rates by producing concise, polite, context-aware reminder text.

### 4.2 Inputs
- Client name
- Debt amount and due context
- Business name
- Payment link
- Preferred tone template (friendly, neutral, firm)

### 4.3 Output Requirements
- Must include payment link.
- Must include clear call to action.
- Must avoid threats, legal claims, or discriminatory language.
- Must be editable by user before send.

### 4.4 Prompt Contract
System prompt defines:
- brand-safe tone
- maximum length boundaries
- required placeholders
- locale-aware phrasing expectations

### 4.5 Safety Filters
- Block personally sensitive inferred claims.
- Block coercive wording.
- Fallback to deterministic approved template if generation fails.

## 5. AI System Architecture Notes
- AI orchestration service fetches structured features from DB.
- Model calls are logged with token usage and latency.
- Outputs stored in PredictionSnapshot for auditability.
- Caching applied to avoid redundant generation within short windows.

## 6. Monitoring and Evaluation
- Prediction MAE (mean absolute error) on paid debts.
- Reminder draft acceptance rate.
- Reliability score calibration vs observed outcomes.
- Drift checks on behavior cohorts.
