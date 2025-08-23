-- Create cohort_status enum if not exists
DO $$ BEGIN
    CREATE TYPE cohort_status AS ENUM ('active', 'inactive', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Cohorts table
CREATE TABLE IF NOT EXISTS cohorts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    start_date timestamptz NOT NULL,
    end_date timestamptz,
    status cohort_status NOT NULL DEFAULT 'active',
    created_by uuid REFERENCES profiles(id) NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

-- Add trigger and index for cohorts if table was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_cohorts_timestamp'
    ) THEN
        CREATE TRIGGER update_cohorts_timestamp 
        BEFORE UPDATE ON cohorts 
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cohorts_status ON cohorts(status);
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

-- Create API Keys table (admin only)
CREATE TABLE IF NOT EXISTS api_keys (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider text NOT NULL CHECK (provider IN ('gemini', 'azure_openai', 'grok', 'anthropic')),
    api_key text NOT NULL,
    added_by uuid REFERENCES profiles(id) NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

-- Add trigger for api_keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_api_keys_timestamp'
    ) THEN
        CREATE TRIGGER update_api_keys_timestamp 
        BEFORE UPDATE ON api_keys 
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;
END $$;

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create System Configurations table (admin only)
CREATE TABLE IF NOT EXISTS system_configs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

-- Add trigger for system_configs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_system_configs_timestamp'
    ) THEN
        CREATE TRIGGER update_system_configs_timestamp 
        BEFORE UPDATE ON system_configs 
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;
END $$;

ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;

-- Create Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES profiles(id) NOT NULL,
    plan_id uuid REFERENCES learning_plans(id) ON DELETE CASCADE,
    enrolled_at timestamptz DEFAULT now(),
    CONSTRAINT unique_enrollment_user_plan UNIQUE (user_id, plan_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_plan ON enrollments(user_id, plan_id);
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for cohorts
DROP POLICY IF EXISTS cohorts_select ON cohorts;
DROP POLICY IF EXISTS cohorts_crud_facilitator ON cohorts;

CREATE POLICY cohorts_select ON cohorts FOR SELECT USING (
    deleted_at IS NULL AND (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin'))
    )
);

CREATE POLICY cohorts_crud_facilitator ON cohorts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin'))
) WITH CHECK (created_by = auth.uid());

-- Add RLS policies for API Keys (admin only)
DROP POLICY IF EXISTS apikeys_admin ON api_keys;
CREATE POLICY apikeys_admin ON api_keys FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (added_by = auth.uid());

-- Add RLS policies for System Configs (admin only)
DROP POLICY IF EXISTS system_configs_admin ON system_configs;
CREATE POLICY system_configs_admin ON system_configs FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (updated_by = auth.uid());

-- Add RLS policies for Enrollments
DROP POLICY IF EXISTS enrollments_own ON enrollments;
DROP POLICY IF EXISTS enrollments_admin ON enrollments;

CREATE POLICY enrollments_own ON enrollments FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY enrollments_admin ON enrollments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);