-- Add the new column to the tasks table
ALTER TABLE "public"."tasks"
ADD COLUMN "last_reminder_sent_at" TIMESTAMPTZ NULL;

-- Create an index on the new column for performance
CREATE INDEX "idx_tasks_last_reminder_sent_at" ON "public"."tasks" ("last_reminder_sent_at");
