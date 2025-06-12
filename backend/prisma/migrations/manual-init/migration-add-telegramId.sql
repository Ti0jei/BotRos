-- Manual migration to add telegramId (as in old structure)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "telegramId" TEXT;
