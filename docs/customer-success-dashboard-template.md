# VLA Workbench — Customer Success Dashboard Template

## Dashboard Overview (Recommended Layout)

### Top Row — Key Health Metrics
| Metric                        | Current | Target | Trend     | Status    |
|-------------------------------|---------|--------|-----------|-----------|
| GPU Hours Saved (30 days)     | 4,872   | 5,000  | ↑ 18%     | Green     |
| Average Physics Score         | 0.89    | 0.85   | ↑         | Green     |
| Data Quality Score            | 0.82    | 0.80   | →         | Green     |
| Prune Rate                    | 11.4%   | <15%   | ↓         | Green     |
| Training Iteration Speed      | 3.8×    | 3.0×   | ↑         | Green     |

### Middle Section — Training Activity
- **Active Runs**: 3
- **Total Episodes This Month**: 184,320
- **Episodes Pruned Automatically**: 21,048 (11.4%)
- **3D Replays Viewed**: 312

### Bottom Section — Health & Risks
**Green Zone** (Healthy):
- All active runs above quality thresholds

**Yellow Zone** (Watch):
- 2 runs with physics score variance > 0.10

**Red Zone** (Action Needed):
- None

### Recommended Widgets
1. Live Training Throughput (episodes/sec)
2. Physics Score Trend (last 30 days)
3. Top 5 Problematic Episode Types
4. Customer-specific ROI Calculator
5. Next Milestone Tracker

**Tool Recommendation**: Build in **Grafana** or **Metabase** connected to your Prisma database + Redis Streams.
