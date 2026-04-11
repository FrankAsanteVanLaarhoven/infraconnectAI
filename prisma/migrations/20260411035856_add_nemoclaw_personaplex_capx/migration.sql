-- CreateEnum
CREATE TYPE "MemoryLevel" AS ENUM ('L0', 'L1', 'L2');

-- CreateEnum
CREATE TYPE "Plane" AS ENUM ('execution', 'memory', 'governance');

-- CreateEnum
CREATE TYPE "NodeKind" AS ENUM ('artifact', 'project', 'decision', 'concept', 'entity', 'pattern', 'standard', 'playbook', 'policy', 'constraint', 'experiment', 'benchmark_trace', 'report', 'persona_note');

-- CreateEnum
CREATE TYPE "NodeState" AS ENUM ('draft', 'active', 'pending_review', 'pending_promotion', 'canonical', 'conflicted', 'stale', 'archived', 'rejected');

-- CreateEnum
CREATE TYPE "SkillName" AS ENUM ('spec', 'plan', 'build', 'test', 'review', 'ship', 'constraint_audit', 'deadline_cert');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('queued', 'running', 'passed', 'failed', 'blocked', 'cancelled', 'timed_out', 'recovered');

-- CreateEnum
CREATE TYPE "PolicyScope" AS ENUM ('memory', 'governance', 'runtime', 'benchmark', 'persona');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('enabled', 'disabled', 'shadow');

-- CreateEnum
CREATE TYPE "ConflictType" AS ENUM ('semantic', 'duplicate', 'policy', 'temporal', 'version');

-- CreateEnum
CREATE TYPE "ConflictStatus" AS ENUM ('open', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "InterceptDecision" AS ENUM ('permit', 'deny', 'shadow_permit', 'shadow_deny');

-- CreateEnum
CREATE TYPE "PersonaRole" AS ENUM ('Mission_Commander', 'Safety_Auditor', 'Research_Copilot', 'Executive_Assistant');

-- CreateEnum
CREATE TYPE "PersonaSessionStatus" AS ENUM ('idle', 'listening', 'speaking', 'disconnected', 'closed');

-- CreateEnum
CREATE TYPE "BenchmarkName" AS ENUM ('CaP_X');

-- CreateEnum
CREATE TYPE "BenchmarkEpisodeStatus" AS ENUM ('pending', 'running', 'passed', 'failed', 'blocked', 'recovered');

-- CreateEnum
CREATE TYPE "AbstractionLayer" AS ENUM ('S1', 'S2', 'S3', 'S4');

-- CreateEnum
CREATE TYPE "AggregateType" AS ENUM ('node', 'edge', 'run', 'policy', 'conflict', 'intercept', 'persona', 'episode', 'health_projection', 'dashboard_projection');

-- CreateTable
CREATE TABLE "MemoryNode" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "bodyRef" TEXT,
    "level" "MemoryLevel" NOT NULL,
    "plane" "Plane" NOT NULL,
    "kind" "NodeKind" NOT NULL,
    "state" "NodeState" NOT NULL,
    "confidence" DOUBLE PRECISION,
    "promotionScore" DOUBLE PRECISION,
    "tags" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastReviewedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "sourceNodeIds" TEXT[],
    "externalSourceRefs" TEXT[],
    "metadata" JSONB,

    CONSTRAINT "MemoryNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryEdge" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "MemoryEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillRun" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "skill" "SkillName" NOT NULL,
    "status" "RunStatus" NOT NULL,
    "title" TEXT,
    "actorId" TEXT NOT NULL,
    "resultSummary" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "metrics" JSONB,
    "metadata" JSONB,
    "targetNodeIds" TEXT[],
    "readNodeIds" TEXT[],
    "writeNodeIds" TEXT[],

    CONSTRAINT "SkillRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyRule" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" "PolicyScope" NOT NULL,
    "status" "PolicyStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "appliesToLevels" "MemoryLevel"[],
    "appliesToPlanes" "Plane"[],
    "appliesToKinds" "NodeKind"[],
    "params" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "derivedFromNodeId" TEXT,

    CONSTRAINT "PolicyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conflict" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "type" "ConflictType" NOT NULL,
    "status" "ConflictStatus" NOT NULL,
    "severity" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Conflict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuntimeIntercept" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "policyProfile" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "decision" "InterceptDecision" NOT NULL,
    "matchedPolicyIds" TEXT[],
    "reason" TEXT NOT NULL,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "evidenceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "requestedByRunId" TEXT,

    CONSTRAINT "RuntimeIntercept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaSession" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "role" "PersonaRole" NOT NULL,
    "status" "PersonaSessionStatus" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "transport" TEXT NOT NULL DEFAULT 'ws',
    "actorId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "linkedRunIds" TEXT[],
    "pushedNodeIds" TEXT[],
    "metadata" JSONB,

    CONSTRAINT "PersonaSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchmarkEpisode" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "benchmark" "BenchmarkName" NOT NULL,
    "suite" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "abstractionLayer" "AbstractionLayer" NOT NULL,
    "status" "BenchmarkEpisodeStatus" NOT NULL,
    "success" BOOLEAN,
    "policyViolationCount" INTEGER NOT NULL DEFAULT 0,
    "recoveryCount" INTEGER NOT NULL DEFAULT 0,
    "traceNodeIds" TEXT[],
    "importedAt" TIMESTAMP(3),
    "metrics" JSONB,
    "metadata" JSONB,
    "runId" TEXT,

    CONSTRAINT "BenchmarkEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "aggregateType" "AggregateType" NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correlationId" TEXT,
    "causationId" TEXT,
    "payload" JSONB NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "DomainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthProjection" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "overall" DOUBLE PRECISION NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "coverage" DOUBLE PRECISION NOT NULL,
    "conflictDensity" DOUBLE PRECISION NOT NULL,
    "staleness" DOUBLE PRECISION NOT NULL,
    "redundancy" DOUBLE PRECISION NOT NULL,
    "byLevel" JSONB NOT NULL,
    "byPlane" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEventId" TEXT NOT NULL,

    CONSTRAINT "HealthProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardProjection" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "totalNodes" INTEGER NOT NULL,
    "completedSkills" INTEGER NOT NULL,
    "canonicalKnowledge" INTEGER NOT NULL,
    "scratchItems" INTEGER NOT NULL,
    "wikiEntries" INTEGER NOT NULL,
    "activeConflicts" INTEGER NOT NULL,
    "planeCounts" JSONB NOT NULL,
    "levelCounts" JSONB NOT NULL,
    "busStatus" TEXT NOT NULL,
    "busConnections" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEventId" TEXT NOT NULL,

    CONSTRAINT "DashboardProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceProjection" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "canonCount" INTEGER NOT NULL,
    "wikiCount" INTEGER NOT NULL,
    "scratchCount" INTEGER NOT NULL,
    "promotionPipeline" JSONB NOT NULL,
    "pendingPromotions" JSONB NOT NULL,
    "decayTimeline" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEventId" TEXT NOT NULL,

    CONSTRAINT "GovernanceProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityProjection" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "eventCount" INTEGER NOT NULL,
    "recentEvents" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEventId" TEXT NOT NULL,

    CONSTRAINT "ActivityProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentBusProjection" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "status" TEXT NOT NULL,
    "uptimeSeconds" INTEGER NOT NULL,
    "connectionCount" INTEGER NOT NULL,
    "topicCount" INTEGER NOT NULL,
    "subscriptionCount" INTEGER NOT NULL,
    "recentMessages" JSONB NOT NULL,
    "subscriptions" TEXT[],
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEventId" TEXT NOT NULL,

    CONSTRAINT "AgentBusProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExplorerProjection" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "totalNodes" INTEGER NOT NULL,
    "nodes" JSONB NOT NULL,
    "filters" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEventId" TEXT NOT NULL,

    CONSTRAINT "ExplorerProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaProjection" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "activeSession" JSONB,
    "availableRoles" TEXT[],
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEventId" TEXT NOT NULL,

    CONSTRAINT "PersonaProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchmarkProjection" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "benchmark" "BenchmarkName" NOT NULL,
    "ablationMode" BOOLEAN NOT NULL DEFAULT false,
    "loaded" BOOLEAN NOT NULL DEFAULT false,
    "taskSuccess" DOUBLE PRECISION,
    "policyViolations" DOUBLE PRECISION,
    "autoRecovery" DOUBLE PRECISION,
    "abstractionLayer" "AbstractionLayer",
    "episodes" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEventId" TEXT NOT NULL,

    CONSTRAINT "BenchmarkProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuntimeProjection" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "profile" TEXT NOT NULL,
    "enforcing" BOOLEAN NOT NULL,
    "permittedCount" INTEGER NOT NULL,
    "blockedCount" INTEGER NOT NULL,
    "recentIntercepts" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEventId" TEXT NOT NULL,

    CONSTRAINT "RuntimeProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RunTargets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RunTargets_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RunReads" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RunReads_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RunWrites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RunWrites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MatchedPolicies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MatchedPolicies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemoryNode_shortId_key" ON "MemoryNode"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "MemoryNode_slug_key" ON "MemoryNode"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MemoryEdge_shortId_key" ON "MemoryEdge"("shortId");

-- CreateIndex
CREATE INDEX "MemoryEdge_fromNodeId_idx" ON "MemoryEdge"("fromNodeId");

-- CreateIndex
CREATE INDEX "MemoryEdge_toNodeId_idx" ON "MemoryEdge"("toNodeId");

-- CreateIndex
CREATE INDEX "MemoryEdge_type_idx" ON "MemoryEdge"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SkillRun_shortId_key" ON "SkillRun"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyRule_shortId_key" ON "PolicyRule"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyRule_slug_key" ON "PolicyRule"("slug");

-- CreateIndex
CREATE INDEX "PolicyRule_scope_status_idx" ON "PolicyRule"("scope", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Conflict_shortId_key" ON "Conflict"("shortId");

-- CreateIndex
CREATE INDEX "Conflict_status_idx" ON "Conflict"("status");

-- CreateIndex
CREATE INDEX "Conflict_sourceNodeId_idx" ON "Conflict"("sourceNodeId");

-- CreateIndex
CREATE INDEX "Conflict_targetNodeId_idx" ON "Conflict"("targetNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "RuntimeIntercept_shortId_key" ON "RuntimeIntercept"("shortId");

-- CreateIndex
CREATE INDEX "RuntimeIntercept_decision_idx" ON "RuntimeIntercept"("decision");

-- CreateIndex
CREATE INDEX "RuntimeIntercept_requestedByRunId_idx" ON "RuntimeIntercept"("requestedByRunId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonaSession_shortId_key" ON "PersonaSession"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "BenchmarkEpisode_shortId_key" ON "BenchmarkEpisode"("shortId");

-- CreateIndex
CREATE INDEX "BenchmarkEpisode_benchmark_suite_idx" ON "BenchmarkEpisode"("benchmark", "suite");

-- CreateIndex
CREATE INDEX "BenchmarkEpisode_status_idx" ON "BenchmarkEpisode"("status");

-- CreateIndex
CREATE INDEX "DomainEvent_aggregateType_aggregateId_idx" ON "DomainEvent"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "DomainEvent_eventType_idx" ON "DomainEvent"("eventType");

-- CreateIndex
CREATE INDEX "DomainEvent_timestamp_idx" ON "DomainEvent"("timestamp");

-- CreateIndex
CREATE INDEX "_RunTargets_B_index" ON "_RunTargets"("B");

-- CreateIndex
CREATE INDEX "_RunReads_B_index" ON "_RunReads"("B");

-- CreateIndex
CREATE INDEX "_RunWrites_B_index" ON "_RunWrites"("B");

-- CreateIndex
CREATE INDEX "_MatchedPolicies_B_index" ON "_MatchedPolicies"("B");

-- AddForeignKey
ALTER TABLE "MemoryEdge" ADD CONSTRAINT "MemoryEdge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "MemoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryEdge" ADD CONSTRAINT "MemoryEdge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "MemoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyRule" ADD CONSTRAINT "PolicyRule_derivedFromNodeId_fkey" FOREIGN KEY ("derivedFromNodeId") REFERENCES "MemoryNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conflict" ADD CONSTRAINT "Conflict_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "MemoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conflict" ADD CONSTRAINT "Conflict_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "MemoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuntimeIntercept" ADD CONSTRAINT "RuntimeIntercept_requestedByRunId_fkey" FOREIGN KEY ("requestedByRunId") REFERENCES "SkillRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchmarkEpisode" ADD CONSTRAINT "BenchmarkEpisode_runId_fkey" FOREIGN KEY ("runId") REFERENCES "SkillRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RunTargets" ADD CONSTRAINT "_RunTargets_A_fkey" FOREIGN KEY ("A") REFERENCES "MemoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RunTargets" ADD CONSTRAINT "_RunTargets_B_fkey" FOREIGN KEY ("B") REFERENCES "SkillRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RunReads" ADD CONSTRAINT "_RunReads_A_fkey" FOREIGN KEY ("A") REFERENCES "MemoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RunReads" ADD CONSTRAINT "_RunReads_B_fkey" FOREIGN KEY ("B") REFERENCES "SkillRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RunWrites" ADD CONSTRAINT "_RunWrites_A_fkey" FOREIGN KEY ("A") REFERENCES "MemoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RunWrites" ADD CONSTRAINT "_RunWrites_B_fkey" FOREIGN KEY ("B") REFERENCES "SkillRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchedPolicies" ADD CONSTRAINT "_MatchedPolicies_A_fkey" FOREIGN KEY ("A") REFERENCES "PolicyRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchedPolicies" ADD CONSTRAINT "_MatchedPolicies_B_fkey" FOREIGN KEY ("B") REFERENCES "RuntimeIntercept"("id") ON DELETE CASCADE ON UPDATE CASCADE;
