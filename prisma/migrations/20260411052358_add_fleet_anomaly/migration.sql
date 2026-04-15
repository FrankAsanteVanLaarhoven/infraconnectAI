-- CreateTable
CREATE TABLE "AgentRegistration" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "deployTier" TEXT NOT NULL,
    "hardwareProfile" TEXT,
    "orgId" TEXT NOT NULL,
    "teamId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "simPaired" TEXT,
    "lastHeartbeat" TIMESTAMP(3),
    "heartbeatRateMs" INTEGER NOT NULL DEFAULT 5000,
    "capabilities" TEXT[],
    "modalitySet" TEXT[],
    "policyProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentTelemetry" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "tick" BIGINT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deployTier" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "latencyMs" DOUBLE PRECISION,

    CONSTRAINT "AgentTelemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstraintCheck" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "constraintId" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deployTier" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "latencyMs" DOUBLE PRECISION,

    CONSTRAINT "ConstraintCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferEvent" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "fromTier" TEXT NOT NULL,
    "toTier" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "outcome" TEXT,
    "deltaMetrics" JSONB,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentIncident" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgTeamProject" (
    "id" TEXT NOT NULL,
    "orgSlug" TEXT NOT NULL,
    "teamSlug" TEXT,
    "projectSlug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'dev',
    "agentQuota" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgTeamProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyConstraint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "domain" TEXT NOT NULL,

    CONSTRAINT "SafetyConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VLAExperimentRun" (
    "id" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "successRate" DOUBLE PRECISION NOT NULL,
    "avgDeadlineMs" DOUBLE PRECISION NOT NULL,
    "deadlineSatisfied" BOOLEAN NOT NULL,

    CONSTRAINT "VLAExperimentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VLAViolation" (
    "id" TEXT NOT NULL,
    "constraintId" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VLAViolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FleetNode" (
    "id" TEXT NOT NULL,
    "robotId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'online',
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memoryBytes" BIGINT NOT NULL DEFAULT 0,
    "anomalyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FleetNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anomaly" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "payload" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anomaly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentRegistration_slug_key" ON "AgentRegistration"("slug");

-- CreateIndex
CREATE INDEX "AgentTelemetry_agentId_modality_ts_idx" ON "AgentTelemetry"("agentId", "modality", "ts");

-- CreateIndex
CREATE INDEX "ConstraintCheck_agentId_constraintId_ts_idx" ON "ConstraintCheck"("agentId", "constraintId", "ts");

-- CreateIndex
CREATE INDEX "AgentIncident_severity_ts_idx" ON "AgentIncident"("severity", "ts");

-- CreateIndex
CREATE UNIQUE INDEX "OrgTeamProject_orgSlug_teamSlug_projectSlug_key" ON "OrgTeamProject"("orgSlug", "teamSlug", "projectSlug");

-- CreateIndex
CREATE UNIQUE INDEX "FleetNode_robotId_key" ON "FleetNode"("robotId");

-- AddForeignKey
ALTER TABLE "AgentTelemetry" ADD CONSTRAINT "AgentTelemetry_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstraintCheck" ADD CONSTRAINT "ConstraintCheck_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferEvent" ADD CONSTRAINT "TransferEvent_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentIncident" ADD CONSTRAINT "AgentIncident_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VLAViolation" ADD CONSTRAINT "VLAViolation_constraintId_fkey" FOREIGN KEY ("constraintId") REFERENCES "SafetyConstraint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "FleetNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
