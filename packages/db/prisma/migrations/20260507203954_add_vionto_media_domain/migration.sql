-- CreateTable
CREATE TABLE "ViontoProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'story',
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "aspectRatio" TEXT NOT NULL DEFAULT '16:9',
    "targetDurationSeconds" INTEGER,
    "retentionPolicy" TEXT NOT NULL DEFAULT 'soft_delete',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViontoProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViontoAsset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'source_image',
    "originalUrl" TEXT,
    "thumbnailUrl" TEXT,
    "storageKey" TEXT,
    "thumbnailStorageKey" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "fileSizeBytes" INTEGER,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViontoAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViontoScript" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptVersion" TEXT,
    "provider" TEXT,
    "narrationText" TEXT,
    "srtText" TEXT,
    "isUserEdited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViontoScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViontoAudioTrack" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'narration',
    "source" TEXT NOT NULL DEFAULT 'tts',
    "voiceId" TEXT,
    "voiceName" TEXT,
    "durationSeconds" INTEGER,
    "storageKey" TEXT,
    "mixSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViontoAudioTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViontoRenderJob" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "queueId" TEXT,
    "state" TEXT NOT NULL DEFAULT 'queued',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "logs" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorSummary" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViontoRenderJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViontoExport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "renderJobId" TEXT,
    "userId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "fileSizeBytes" INTEGER,
    "format" TEXT NOT NULL DEFAULT 'mp4',
    "resolution" TEXT,
    "signedUrl" TEXT,
    "signedUrlExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViontoExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViontoAuditEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "prevState" TEXT,
    "nextState" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViontoAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ViontoProject_userId_idx" ON "ViontoProject"("userId");

-- CreateIndex
CREATE INDEX "ViontoProject_tenantId_idx" ON "ViontoProject"("tenantId");

-- CreateIndex
CREATE INDEX "ViontoProject_status_idx" ON "ViontoProject"("status");

-- CreateIndex
CREATE INDEX "ViontoProject_createdAt_idx" ON "ViontoProject"("createdAt");

-- CreateIndex
CREATE INDEX "ViontoAsset_projectId_idx" ON "ViontoAsset"("projectId");

-- CreateIndex
CREATE INDEX "ViontoAsset_userId_idx" ON "ViontoAsset"("userId");

-- CreateIndex
CREATE INDEX "ViontoAsset_type_idx" ON "ViontoAsset"("type");

-- CreateIndex
CREATE INDEX "ViontoAsset_orderIndex_idx" ON "ViontoAsset"("orderIndex");

-- CreateIndex
CREATE INDEX "ViontoScript_projectId_idx" ON "ViontoScript"("projectId");

-- CreateIndex
CREATE INDEX "ViontoScript_userId_idx" ON "ViontoScript"("userId");

-- CreateIndex
CREATE INDEX "ViontoScript_isUserEdited_idx" ON "ViontoScript"("isUserEdited");

-- CreateIndex
CREATE INDEX "ViontoAudioTrack_projectId_idx" ON "ViontoAudioTrack"("projectId");

-- CreateIndex
CREATE INDEX "ViontoAudioTrack_userId_idx" ON "ViontoAudioTrack"("userId");

-- CreateIndex
CREATE INDEX "ViontoAudioTrack_type_idx" ON "ViontoAudioTrack"("type");

-- CreateIndex
CREATE INDEX "ViontoRenderJob_projectId_idx" ON "ViontoRenderJob"("projectId");

-- CreateIndex
CREATE INDEX "ViontoRenderJob_userId_idx" ON "ViontoRenderJob"("userId");

-- CreateIndex
CREATE INDEX "ViontoRenderJob_state_idx" ON "ViontoRenderJob"("state");

-- CreateIndex
CREATE INDEX "ViontoRenderJob_queueId_idx" ON "ViontoRenderJob"("queueId");

-- CreateIndex
CREATE INDEX "ViontoRenderJob_createdAt_idx" ON "ViontoRenderJob"("createdAt");

-- CreateIndex
CREATE INDEX "ViontoExport_projectId_idx" ON "ViontoExport"("projectId");

-- CreateIndex
CREATE INDEX "ViontoExport_renderJobId_idx" ON "ViontoExport"("renderJobId");

-- CreateIndex
CREATE INDEX "ViontoExport_userId_idx" ON "ViontoExport"("userId");

-- CreateIndex
CREATE INDEX "ViontoExport_format_idx" ON "ViontoExport"("format");

-- CreateIndex
CREATE INDEX "ViontoAuditEvent_actorId_idx" ON "ViontoAuditEvent"("actorId");

-- CreateIndex
CREATE INDEX "ViontoAuditEvent_entity_idx" ON "ViontoAuditEvent"("entity");

-- CreateIndex
CREATE INDEX "ViontoAuditEvent_entityId_idx" ON "ViontoAuditEvent"("entityId");

-- CreateIndex
CREATE INDEX "ViontoAuditEvent_action_idx" ON "ViontoAuditEvent"("action");

-- CreateIndex
CREATE INDEX "ViontoAuditEvent_createdAt_idx" ON "ViontoAuditEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "ViontoProject" ADD CONSTRAINT "ViontoProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoProject" ADD CONSTRAINT "ViontoProject_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoAsset" ADD CONSTRAINT "ViontoAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ViontoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoScript" ADD CONSTRAINT "ViontoScript_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ViontoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoAudioTrack" ADD CONSTRAINT "ViontoAudioTrack_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ViontoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoRenderJob" ADD CONSTRAINT "ViontoRenderJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ViontoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoExport" ADD CONSTRAINT "ViontoExport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ViontoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoExport" ADD CONSTRAINT "ViontoExport_renderJobId_fkey" FOREIGN KEY ("renderJobId") REFERENCES "ViontoRenderJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoAuditEvent" ADD CONSTRAINT "ViontoAuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
