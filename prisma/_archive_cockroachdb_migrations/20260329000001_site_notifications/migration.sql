-- CreateTable
CREATE TABLE "SiteNotification" (
    "id" STRING NOT NULL,
    "message" STRING NOT NULL,
    "type" STRING NOT NULL DEFAULT 'info',
    "isActive" BOOL NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteNotification_isActive_createdAt_idx" ON "SiteNotification"("isActive", "createdAt");
