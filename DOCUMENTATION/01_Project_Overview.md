# Project Overview

## Problem Statement

Citizens of Kerala face significant challenges in accessing and effectively using government grievance redressal systems. Issues include lack of transparency, delayed responses, absence of tracking mechanisms, and difficulty in reaching the appropriate department.

## Objectives

1. Provide an accessible, transparent platform for citizens to submit grievances directly to the Chief Minister's Office
2. Automate routing and tracking of grievances through a structured workflow
3. Ensure accountability with SLA monitoring, escalation, and resolution tracking
4. Leverage AI to intelligently categorise and prioritise complaints
5. Enable data-driven decision making for CMO administrators through analytics

## Scope

| Feature | In Scope |
|---------|----------|
| Public website with static pages | ✅ |
| Citizen registration/login | ✅ |
| Grievance submission with AI assistance | ✅ |
| Grievance tracking (public) | ✅ |
| CMO admin dashboard with full workflow control | ✅ |
| Department officer dashboard | ✅ |
| AI-powered categorisation (Gemini + fallback) | ✅ |
| File attachments (jpg/png/pdf, max 5MB) | ✅ |
| Email notifications (console fallback) | ✅ |
| In-app notifications | ✅ |
| Analytics and charts | ✅ |
| Multi-language structure (EN + ML shell) | ✅ |
| WCAG AA accessibility | ✅ |

## Key Features

### Role-Based Access Control
- **CITIZEN**: Submit grievances, track, provide feedback, reopen
- **CMO_ADMIN**: Full oversight, assignment, escalation, resolution
- **DEPT_OFFICER**: View assigned grievances, update progress, submit action reports

### Workflow State Machine
Enforced server-side:
```
Submitted → Under Review → In Progress → Resolved
                                    ↑         ↓
                              Reopened ←←←←←←←
```

### AI Grievance Assistant
- Calls Google Gemini 1.5 Flash API
- Returns structured JSON: department, category, priority, summary
- Validates with zod schema
- Falls back to rule-based classifier if API fails
- PII masked before API call
- Duplicate detection via cosine similarity

### Reference ID Format
`CMK-YYYY-XXXXXX` (e.g., `CMK-2026-000123`)

### SLA Monitoring
- Default 15 days from submission
- Overdue flag auto-set
- Escalation workflow

## Prototype Disclaimer

> **This is a recruitment prototype for WhiteMatrix Software Solutions. It is NOT an official Government of Kerala or Chief Minister's Office website. All data, departments, officials, and grievances are entirely fictional.**
