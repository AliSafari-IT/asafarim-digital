-- CreateTable
CREATE TABLE "ViontoProjectShare" (
    "id"               TEXT NOT NULL,
    "projectId"        TEXT NOT NULL,
    "sharedByUserId"   TEXT NOT NULL,
    "sharedWithUserId" TEXT,
    "email"            TEXT NOT NULL,
    "permission"       TEXT NOT NULL DEFAULT 'viewer',
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViontoProjectShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ViontoProjectShare_projectId_email_key" ON "ViontoProjectShare"("projectId", "email");

-- CreateIndex
CREATE INDEX "ViontoProjectShare_projectId_idx" ON "ViontoProjectShare"("projectId");

-- CreateIndex
CREATE INDEX "ViontoProjectShare_sharedWithUserId_idx" ON "ViontoProjectShare"("sharedWithUserId");

-- CreateIndex
CREATE INDEX "ViontoProjectShare_email_idx" ON "ViontoProjectShare"("email");

-- AddForeignKey
ALTER TABLE "ViontoProjectShare" ADD CONSTRAINT "ViontoProjectShare_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "ViontoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoProjectShare" ADD CONSTRAINT "ViontoProjectShare_sharedByUserId_fkey"
    FOREIGN KEY ("sharedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoProjectShare" ADD CONSTRAINT "ViontoProjectShare_sharedWithUserId_fkey"
    FOREIGN KEY ("sharedWithUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
