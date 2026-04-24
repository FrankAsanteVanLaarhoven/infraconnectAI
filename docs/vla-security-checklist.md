## VLA Workbench Security Checklist (v3.0)

- [ ] All Isaac Lab runs use short-lived credentials
- [ ] Physics episodes stored with tenant isolation
- [ ] Curation decisions logged to immutable `AiAuditLog`
- [ ] Human approval required for L2 Canon promotion
- [ ] All external API calls (Cleanlab, W&B) go through proxy with mTLS
- [ ] GPU resource limits enforced on both Docker and K8s
- [ ] Sensitive assets (USD scenes) stored in encrypted volumes
- [ ] Full lineage tracking from raw data → trained policy
- [ ] Regular automated security scans on Isaac Lab container
