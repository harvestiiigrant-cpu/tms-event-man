-- Drop foreign key constraints from survey_responses table to allow preview tests
-- This allows inserting test responses without requiring valid beneficiary_id and training_id

-- Drop the beneficiary foreign key constraint
ALTER TABLE "survey_responses" 
DROP CONSTRAINT IF EXISTS "survey_responses_beneficiary_id_fkey";

-- Drop the training foreign key constraint
ALTER TABLE "survey_responses" 
DROP CONSTRAINT IF EXISTS "survey_responses_training_id_fkey";

-- Note: We keep the survey_id foreign key because it must always be valid
