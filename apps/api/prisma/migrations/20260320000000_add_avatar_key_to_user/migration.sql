-- Add avatar_key column to users table for Uploadthing file management
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_key" TEXT;
