
-- Drop tables if they exist (for clean start)
DROP TABLE IF EXISTS "Training";
DROP TABLE IF EXISTS "PaymentBlock";
DROP TABLE IF EXISTS "User";

-- Create table User
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enum for Status (used in Training)
DO $$ BEGIN
  CREATE TYPE "Status" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create table Training
CREATE TABLE "Training" (
  "id" TEXT PRIMARY KEY,
  "date" TIMESTAMP NOT NULL,
  "hour" INTEGER NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "Status" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create table PaymentBlock
CREATE TABLE "PaymentBlock" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "paidTrainings" INTEGER NOT NULL,
  "pricePerTraining" INTEGER NOT NULL,
  "paidAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_payment_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
