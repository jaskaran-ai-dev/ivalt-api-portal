-- Migration: Add access control fields
-- Run this against your PostgreSQL database

-- Add status column to users table
ALTER TABLE "users" ADD COLUMN "status" VARCHAR(20) DEFAULT 'pending' NOT NULL;
ALTER TABLE "users" ADD COLUMN "approved_at" TIMESTAMP;

-- Create access_requests table
CREATE TABLE IF NOT EXISTS "access_requests" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "use_case" VARCHAR(500) NOT NULL,
  "requested_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "approved_at" TIMESTAMP,
  "admin_notes" VARCHAR(1000)
);

CREATE INDEX IF NOT EXISTS "access_requests_user_id_idx" ON "access_requests"("user_id");

-- Update existing users to have pending status
UPDATE "users" SET "status" = 'pending' WHERE "status" IS NULL;