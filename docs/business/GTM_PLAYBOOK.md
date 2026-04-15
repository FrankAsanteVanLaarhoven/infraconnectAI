# GTM Playbook: InfraConnect B2B Conversion Architecture

This document governs the official outbound sequencing and scoring mechanics for deploying InfraConnect.

## The Pitch Paradigm

> "We connect your infrastructure instantly — no APIs, no rebuilds."

## Target ICP Matrix
Focus exclusively on accounts capable of authorizing rapid deployment contracts.

### Tier 1 Profiles
- **Title**: CTO, Head of Engineering, VP Data
- **Scale**: 20–200 engineers
- **Indicators**: Mentions of Postgres, internal tool fatigue, legacy integration roadmaps.

---

## The Outbound Sequence (LinkedIn)

### Step 1 (The Hook)
*Connection Request*
> Quick one — Are you still dealing with pipelines / APIs to connect internal systems? We've been helping teams remove that layer completely.

### Step 2 (The Authority Play)
*Upon connection acceptance*
> Appreciate the connect. We built something that connects directly to infrastructure (Postgres, logs, etc.) without APIs or pipelines. Takes ~5 minutes to deploy. Worth showing you?

### Step 3 (The Close)
*Upon interest*
> I’ll keep it tight — 10 min. We literally run one command and your systems appear live. When works?

---

## Lead Scoring Architecture

The `/api/leads` system triages traffic using this qualitative scoring metric.

- **[+3 pts]**: Verified business domain, replies rapidly, mentions integration pain.
- **[+5 pts]**: C-Suite / VP title. Actively researching pipeline replacement.
- **[+8 pts] (PRIORITY)**: Asks "How does this work?", "What's pricing?", or "Can we try it?".

*Note: Demote Generic curiosity, non-enterprise domains, or standard student vectors.*

---

## Early Adopter GTM Deployment

**Target**: The first 5 Pilot Customers. Total focus is on Logo acquisition & Case Studies, not margin maximization.
- Build a manually sourced list of 20 high-fit SaaS/Fintech accounts.
- Initiate outbound protocols manually (no automation).
- Anchor Pilot offering at £1k–£3k for initial adoption.
