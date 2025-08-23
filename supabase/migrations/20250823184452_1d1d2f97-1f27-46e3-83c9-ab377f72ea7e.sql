-- Create missing enum types
CREATE TYPE module_content_type AS ENUM ('text', 'image', 'video', 'quiz');
CREATE TYPE cohort_status AS ENUM ('active', 'inactive', 'completed');

-- Learning Modules table
CREATE TABLE learning_modules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id uuid REFERENCES learning_plans(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text NOT NULL,
    is_personal boolean DEFAULT false,
    generated_by_ai boolean DEFAULT false,
    user_id uuid REFERENCES profiles(id),
    content_json jsonb,
    created_by uuid REFERENCES profiles(id) NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT unique_module_name_plan_id UNIQUE (name, plan_id)
);

CREATE TRIGGER update_learning_modules_timestamp BEFORE UPDATE ON learning_modules FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE INDEX idx_modules_planid ON learning_modules(plan_id);
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;

-- Module Steps table
CREATE TABLE module_steps (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id uuid REFERENCES learning_modules(id) ON DELETE CASCADE,
    step_order integer NOT NULL,
    content_type module_content_type NOT NULL,
    content jsonb NOT NULL,
    created_by uuid REFERENCES profiles(id) NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT unique_step_module_order UNIQUE (module_id, step_order)
);

CREATE TRIGGER update_module_steps_timestamp BEFORE UPDATE ON module_steps FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE INDEX idx_steps_module_order ON module_steps(module_id, step_order);
ALTER TABLE module_steps ENABLE ROW LEVEL SECURITY;

-- Cohorts table
CREATE TABLE cohorts (
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
    deleted_at timestamptz,
    CONSTRAINT unique_cohort_name_created_by UNIQUE (name, created_by)
);

CREATE TRIGGER update_cohorts_timestamp BEFORE UPDATE ON cohorts FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE INDEX idx_cohorts_status ON cohorts(status);
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

-- Cohort Sessions table
CREATE TABLE cohort_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id uuid REFERENCES cohorts(id) ON DELETE CASCADE,
    session_date timestamptz NOT NULL,
    description text,
    created_by uuid REFERENCES profiles(id) NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT unique_session_cohort_date UNIQUE (cohort_id, session_date)
);

CREATE TRIGGER update_cohort_sessions_timestamp BEFORE UPDATE ON cohort_sessions FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE INDEX idx_sessions_cohort_date ON cohort_sessions(cohort_id, session_date);
ALTER TABLE cohort_sessions ENABLE ROW LEVEL SECURITY;

-- Cohort Enrollments table
CREATE TABLE cohort_enrollments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id uuid REFERENCES cohorts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    enrolled_at timestamptz DEFAULT now(),
    enrolled_by uuid REFERENCES profiles(id),
    CONSTRAINT unique_cohort_user UNIQUE (cohort_id, user_id)
);

CREATE INDEX idx_cohort_enrollments_cohort_user ON cohort_enrollments(cohort_id, user_id);
ALTER TABLE cohort_enrollments ENABLE ROW LEVEL SECURITY;

-- API Keys table (admin only)
CREATE TABLE api_keys (
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

CREATE TRIGGER update_api_keys_timestamp BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_timestamp();
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- System Configurations table (admin only)
CREATE TABLE system_configs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

CREATE TRIGGER update_system_configs_timestamp BEFORE UPDATE ON system_configs FOR EACH ROW EXECUTE FUNCTION update_timestamp();
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;

-- Enrollments table
CREATE TABLE enrollments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES profiles(id) NOT NULL,
    plan_id uuid REFERENCES learning_plans(id) ON DELETE CASCADE,
    enrolled_at timestamptz DEFAULT now(),
    CONSTRAINT unique_enrollment_user_plan UNIQUE (user_id, plan_id)
);

CREATE INDEX idx_enrollments_user_plan ON enrollments(user_id, plan_id);
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;