-- CreateTable
CREATE TABLE "EduVerificationMessage" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EduVerificationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EduVerificationMessage_tutorId_idx" ON "EduVerificationMessage"("tutorId");

-- CreateIndex
CREATE INDEX "EduVerificationMessage_senderId_idx" ON "EduVerificationMessage"("senderId");

-- CreateIndex
CREATE INDEX "EduVerificationMessage_createdAt_idx" ON "EduVerificationMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "EduVerificationMessage" ADD CONSTRAINT "EduVerificationMessage_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EduVerificationMessage" ADD CONSTRAINT "EduVerificationMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
