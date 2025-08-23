-- Alberta AI Academy Database Schema
-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles for type safety
CREATE TYPE user_role AS ENUM ('public', 'government', 'facilitator', 'admin');
-- Content levels for news, resources, learning plans
CREATE TYPE content_level AS ENUM ('1', '2', '3', 'RED');
-- Content lifecycle statuses
CREATE TYPE content_status AS ENUM ('draft', 'review', 'published', 'archived');
-- Tool types
CREATE TYPE tool_type AS ENUM ('open_source', 'saas', 'commercial');
-- Module step content types
CREATE TYPE module_content_type AS ENUM ('text', 'image', 'video', 'quiz');
-- Cohort statuses
CREATE TYPE cohort_status AS ENUM ('active', 'inactive', 'completed');

-- Auto-update `updated_at` timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles table
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    role user_role NOT NULL DEFAULT 'public',
    organization text,
    department text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    last_login timestamptz,
    deleted_at timestamptz
);
CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE INDEX idx_profiles_role ON profiles(role);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allowed Domains
CREATE TABLE allowed_domains (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain text UNIQUE NOT NULL,
    added_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);
CREATE TRIGGER update_allowed_domains_timestamp BEFORE UPDATE ON allowed_domains FOR EACH ROW EXECUTE FUNCTION update_timestamp();
ALTER TABLE allowed_domains ENABLE ROW LEVEL SECURITY;

-- Insert default government domains
INSERT INTO allowed_domains (domain, added_by) VALUES 
('canada.ca', NULL),
('gov.ab.ca', NULL);

-- Media Assets
CREATE TABLE media_assets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    bucket_path text NOT NULL,
    content_type text NOT NULL,
    created_by uuid REFERENCES profiles(id) NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);
CREATE TRIGGER update_media_assets_timestamp BEFORE UPDATE ON media_assets FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE INDEX idx_media_assets_created_by ON media_assets(created_by);
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- News
CREATE TABLE news (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text NOT NULL,
    metadata jsonb,
    level content_level NOT NULL,
    status content_status NOT NULL DEFAULT 'draft',
    created_by uuid REFERENCES profiles(id) NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    language text DEFAULT 'English',
    stars_rating numeric DEFAULT 0,
    deleted_at timestamptz,
    CONSTRAINT unique_news_title_created_by UNIQUE (title, created_by)
);
CREATE TRIGGER update_news_timestamp BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE INDEX idx_news_level_status ON news(level, status, created_at DESC);
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Resources
CREATE TABLE resources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text NOT NULL,
    url text NOT NULL,
    screenshot_asset_id uuid REFERENCES media_assets(id),
    level content_level NOT NULL,
    status content_status NOT NULL DEFAULT 'draft',
    created_by uuid REFERENCES profiles(id) NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    language text DEFAULT 'English',
    stars_rating numeric DEFAULT 0,
    deleted_at timestamptz,
    CONSTRAINT unique_resource_name_created_by UNIQUE (name, created_by)
);
CREATE TRIGGER update_resources_timestamp BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE INDEX idx_resources_level_status ON resources(level, status, created_at DESC);
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Learning Plans
CREATE TABLE learning_plans (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text NOT NULL,
    steps jsonb,
    level content_level NOT NULL,
    status content_status NOT NULL DEFAULT 'draft',
    star_rating numeric DEFAULT 0,
    language text DEFAULT 'English',
    duration interval,
    learning_outcomes text[],
    created_by uuid REFERENCES profiles(id),
    updated_by uuid REFERENCES profiles(id),
    is_ai_generated boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT unique_plan_name_created_by UNIQUE (name, created_by)
);
CREATE TRIGGER update_learning_plans_timestamp BEFORE UPDATE ON learning_plans FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE INDEX idx_plans_level_status ON learning_plans(level, status, created_by);
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;

-- Tools
CREATE TABLE tools (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text NOT NULL,
    type tool_type NOT NULL,
    cost_indicator text,
    url text,
    stars numeric DEFAULT 0,
    status content_status NOT NULL DEFAULT 'draft',
    created_by uuid REFERENCES profiles(id) NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT unique_tool_name_created_by UNIQUE (name, created_by)
);
CREATE TRIGGER update_tools_timestamp BEFORE UPDATE ON tools FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE INDEX idx_tools_type_status ON tools(type, status);
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Prompt Library
CREATE TABLE prompt_library (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text NOT NULL,
    purpose text NOT NULL,
    sample_output text,
    stars numeric DEFAULT 0,
    sector_tags jsonb,
    status content_status NOT NULL DEFAULT 'draft',
    created_by uuid REFERENCES profiles(id) NOT NULL,
    updated_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT unique_prompt_name_created_by UNIQUE (name, created_by)
);
CREATE TRIGGER update_prompt_library_timestamp BEFORE UPDATE ON prompt_library FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE INDEX idx_prompts_status ON prompt_library(status);
ALTER TABLE prompt_library ENABLE ROW LEVEL SECURITY;

-- Platform Statistics View
CREATE VIEW platform_statistics AS
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE deleted_at IS NULL) AS total_users,
    (SELECT COUNT(*) FROM learning_plans WHERE deleted_at IS NULL) AS total_plans,
    (SELECT COUNT(*) FROM news WHERE deleted_at IS NULL) AS total_news,
    (SELECT COUNT(*) FROM resources WHERE deleted_at IS NULL) AS total_resources,
    (SELECT COUNT(*) FROM tools WHERE deleted_at IS NULL) AS total_tools,
    (SELECT COUNT(*) FROM prompt_library WHERE deleted_at IS NULL) AS total_prompts;

-- RLS Policies
-- Profiles: Users see own profile; admins can update roles
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (
    id = auth.uid() AND 
    (role != 'government' OR EXISTS (
        SELECT 1 FROM allowed_domains ad 
        WHERE ad.deleted_at IS NULL 
        AND profiles.email LIKE '%@' || ad.domain
    ))
);
CREATE POLICY profiles_update_admin ON profiles FOR UPDATE USING (
    id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Allowed Domains: Admins only
CREATE POLICY allowed_domains_admin ON allowed_domains FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (added_by = auth.uid() OR added_by IS NULL);

-- News: Public read active; facilitators/admins CRUD
CREATE POLICY news_select_active ON news FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY news_crud_facilitator ON news FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin'))
) WITH CHECK (created_by = auth.uid());

-- Resources: Public read active; facilitators/admins CRUD
CREATE POLICY resources_select_active ON resources FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY resources_crud_facilitator ON resources FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin'))
) WITH CHECK (created_by = auth.uid());

-- Learning Plans: Public read; facilitators/admins CRUD
CREATE POLICY plans_select_all ON learning_plans FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY plans_crud_facilitator ON learning_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin'))
) WITH CHECK (created_by = auth.uid());

-- Tools: Public read active; facilitators/admins CRUD
CREATE POLICY tools_select_active ON tools FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY tools_crud_facilitator ON tools FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin'))
) WITH CHECK (created_by = auth.uid());

-- Prompt Library: Public read active; facilitators/admins CRUD
CREATE POLICY prompts_select_active ON prompt_library FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY prompts_crud_facilitator ON prompt_library FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('facilitator', 'admin'))
) WITH CHECK (created_by = auth.uid());

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_role user_role;
BEGIN
    -- Determine role based on email domain
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM allowed_domains ad 
            WHERE ad.deleted_at IS NULL 
            AND NEW.email LIKE '%@' || ad.domain
        ) THEN 'government'::user_role
        ELSE 'public'::user_role
    END INTO user_role;

    -- Insert profile
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        user_role
    );
    
    RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to promote user to admin (to be called by existing admin)
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN false;
    END IF;
    
    -- Update user role
    UPDATE profiles 
    SET role = 'admin', updated_at = now()
    WHERE email = target_email AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$;