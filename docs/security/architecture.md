# InfraConnect AI Security Architecture

To successfully navigate Tier-1 enterprise procurement, you must present the underlying architecture in a way that immediately addresses the CISO's primary fear: **Inbound Firewall Risk**.

Below is the hardened data-flow topology.

### Enterprise Deployment Topology

```mermaid
graph TD
    subgraph "Customer Virtual Private Cloud (VPC)"
        db[(PostgreSQL / Legacy DB)]
        agent["InfraConnectAI Universal Agent (GEN)"]
        
        db -- "Logical Replication (pglogrepl)" --> agent
    end

    subgraph "InfraConnectAI Control Plane (SaaS)"
        gateway["mTLS Ingress Gateway"]
        nats["NATS Streaming Backbone"]
        temporal["Workflow DAG Engine (Temporal)"]
        ai["Semantic Processing Layer"]
        client["Operator Dashboard / UI"]
        
        gateway --> nats
        nats <--> temporal
        temporal --> ai
        nats --> client
    end

    %% Key Security Mechanism: Outbound Only
    agent == "Outbound WebSocket (mTLS 1.3)" ==> gateway
    
    classDef secure fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef outbound fill:#1e1b4b,stroke:#a855f7,stroke-width:2px,color:#fff;
    classDef database fill:#450a0a,stroke:#ef4444,stroke-width:2px,color:#fff;
    
    class gateway,nats,temporal,ai,client secure;
    class agent outbound;
    class db database;
```

### Security Posture Highlights

1. **Zero Inbound Ports**: The edge agent (GEN) reaches out to the InfraConnectAI Control Plane. You never open a port on your firewall, immediately bypassing 90% of traditional security objections.
2. **Mutual TLS (mTLS) Authentication**: Every tunnel is authenticated with unique cryptographic identities securely preventing Man-in-the-Middle (MitM) attacks.
3. **Data Anonymization at The Edge**: Because the agent executes on the client network, it can strip PII/PCI data *before* it ever leaves the VPC boundary.
4. **Agent Ephemerality**: If the agent is compromised, it has absolutely no access returning to the SaaS platform, isolating the blast radius entirely.
