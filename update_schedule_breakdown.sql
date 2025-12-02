ALTER TABLE training_schedules ADD COLUMN IF NOT EXISTS student_breakdown JSONB DEFAULT '[]'::jsonb;
