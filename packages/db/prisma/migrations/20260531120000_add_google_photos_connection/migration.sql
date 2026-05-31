-- CreateTable
CREATE TABLE "GooglePhotosConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleAccountEmail" TEXT,
    "googleAccountSub" TEXT,
    "accessTokenEnc" TEXT NOT NULL,
    "refreshTokenEnc" TEXT,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastError" TEXT,
    "lastRefreshAt" TIMESTAMP(3),
    "lastImportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GooglePhotosConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GooglePhotosConnection_userId_key" ON "GooglePhotosConnection"("userId");

-- CreateIndex
CREATE INDEX "GooglePhotosConnection_userId_idx" ON "GooglePhotosConnection"("userId");

-- CreateIndex
CREATE INDEX "GooglePhotosConnection_status_idx" ON "GooglePhotosConnection"("status");

-- AddForeignKey
ALTER TABLE "GooglePhotosConnection" ADD CONSTRAINT "GooglePhotosConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
