-- iVALT Portal initial migration
-- Run this against your PostgreSQL database

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "phone_number" VARCHAR(20) NOT NULL UNIQUE,
  "name" VARCHAR(255),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_login_at" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "aws_key_id" VARCHAR(255) NOT NULL,
  "key_name" VARCHAR(255) NOT NULL,
  "key_value" VARCHAR(512),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "usage_plan_id" VARCHAR(255),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_used_at" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "api_keys_user_id_idx" ON "api_keys"("user_id");
