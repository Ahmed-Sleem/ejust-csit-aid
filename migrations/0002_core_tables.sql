
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  email citext NOT NULL UNIQUE,
  full_name text NOT NULL,
  academic_role public.academic_role,
  account_state public.account_state NOT NULL DEFAULT 'email_pending',
  headline text,
  biography text,
  research_interests text[] NOT NULL DEFAULT '{}',
  skills text[] NOT NULL DEFAULT '{}',
  photo_object_key text,
  email_public boolean NOT NULL DEFAULT false,
  contact_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT profiles_user_id_length CHECK (char_length(user_id) BETWEEN 1 AND 255),
  CONSTRAINT profiles_email_ejust_domain CHECK (
    email::text = lower(btrim(email::text))
    AND email::text ~ '^[^@[:space:]]+@ejust[.]edu[.]eg$'
  ),
  CONSTRAINT profiles_full_name_length CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120),
  CONSTRAINT profiles_headline_length CHECK (headline IS NULL OR char_length(headline) <= 180),
  CONSTRAINT profiles_biography_length CHECK (biography IS NULL OR char_length(biography) <= 5000),
  CONSTRAINT profiles_research_interests_limit CHECK (cardinality(research_interests) <= 30),
  CONSTRAINT profiles_skills_limit CHECK (cardinality(skills) <= 50),
  CONSTRAINT profiles_contact_links_object CHECK (jsonb_typeof(contact_links) = 'object'),
  CONSTRAINT profiles_verified_state_consistency CHECK (
    (account_state = 'verified' AND academic_role IS NOT NULL AND verified_by IS NOT NULL AND verified_at IS NOT NULL)
    OR account_state <> 'verified'
  )
);

CREATE TABLE public.admin_privileges (
  user_id text PRIMARY KEY,
  is_root boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  granted_by text,
  granted_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  revoked_by text,
  revoked_at timestamptz,
  CONSTRAINT admin_privileges_user_id_fk FOREIGN KEY (user_id)
    REFERENCES public.profiles(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT admin_privileges_grantor_fk FOREIGN KEY (granted_by)
    REFERENCES public.profiles(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT admin_privileges_revoker_fk FOREIGN KEY (revoked_by)
    REFERENCES public.profiles(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT admin_privileges_root_active CHECK (NOT is_root OR active),
  CONSTRAINT admin_privileges_revocation_consistency CHECK (
    (active AND revoked_by IS NULL AND revoked_at IS NULL)
    OR (NOT active AND revoked_by IS NOT NULL AND revoked_at IS NOT NULL AND NOT is_root)
  )
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL,
  description text NOT NULL,
  cover_object_key text,
  repository_url text,
  publication_url text,
  demo_url text,
  year smallint,
  created_by text NOT NULL REFERENCES public.profiles(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT projects_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' AND char_length(slug) <= 100),
  CONSTRAINT projects_title_length CHECK (char_length(btrim(title)) BETWEEN 3 AND 180),
  CONSTRAINT projects_summary_length CHECK (char_length(btrim(summary)) BETWEEN 10 AND 500),
  CONSTRAINT projects_description_length CHECK (char_length(btrim(description)) BETWEEN 20 AND 30000),
  CONSTRAINT projects_repository_https CHECK (repository_url IS NULL OR repository_url ~ '^https://[^[:space:]]+$'),
  CONSTRAINT projects_publication_https CHECK (publication_url IS NULL OR publication_url ~ '^https://[^[:space:]]+$'),
  CONSTRAINT projects_demo_https CHECK (demo_url IS NULL OR demo_url ~ '^https://[^[:space:]]+$'),
  CONSTRAINT projects_year_range CHECK (year IS NULL OR year BETWEEN 1900 AND 2200),
  CONSTRAINT projects_publish_consistency CHECK (
    (published AND published_at IS NOT NULL) OR (NOT published AND published_at IS NULL)
  )
);

CREATE TABLE public.project_people (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  position integer NOT NULL DEFAULT 0,
  added_by text NOT NULL REFERENCES public.profiles(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  PRIMARY KEY (project_id, profile_id),
  CONSTRAINT project_people_position_nonnegative CHECK (position >= 0)
);

CREATE TABLE public.project_topics (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  topic citext NOT NULL,
  PRIMARY KEY (project_id, topic),
  CONSTRAINT project_topics_topic_length CHECK (char_length(btrim(topic::text)) BETWEEN 1 AND 60),
  CONSTRAINT project_topics_topic_trimmed CHECK (topic::text = btrim(topic::text))
);

CREATE TABLE public.publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  venue text,
  year smallint,
  url text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT publications_title_length CHECK (char_length(btrim(title)) BETWEEN 3 AND 500),
  CONSTRAINT publications_venue_length CHECK (venue IS NULL OR char_length(venue) <= 300),
  CONSTRAINT publications_year_range CHECK (year IS NULL OR year BETWEEN 1900 AND 2200),
  CONSTRAINT publications_url_https CHECK (url IS NULL OR url ~ '^https://[^[:space:]]+$'),
  CONSTRAINT publications_position_nonnegative CHECK (position >= 0)
);

CREATE TABLE public.uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL REFERENCES public.profiles(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  object_key text NOT NULL UNIQUE,
  purpose public.upload_purpose NOT NULL,
  mime_type text NOT NULL,
  byte_size bigint NOT NULL,
  sha256 text,
  created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT uploads_object_key_safe CHECK (
    char_length(object_key) BETWEEN 1 AND 1024
    AND object_key !~ '(^|/)[.][.](/|$)'
    AND object_key !~ '[[:cntrl:]]'
  ),
  CONSTRAINT uploads_mime_type_allowed CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  CONSTRAINT uploads_byte_size_positive CHECK (byte_size > 0 AND byte_size <= 15728640),
  CONSTRAINT uploads_sha256_format CHECK (sha256 IS NULL OR sha256 ~ '^[a-f0-9]{64}$'),
  CONSTRAINT uploads_purpose_type_size CHECK (
    (purpose = 'profile_photo' AND mime_type IN ('image/jpeg', 'image/png', 'image/webp') AND byte_size <= 3145728)
    OR (purpose = 'project_cover' AND mime_type IN ('image/jpeg', 'image/png', 'image/webp') AND byte_size <= 6291456)
    OR (purpose = 'publication_attachment' AND mime_type = 'application/pdf' AND byte_size <= 15728640)
  )
);

CREATE TABLE public.audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id text,
  operation text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  request_id uuid,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT audit_logs_operation_format CHECK (operation ~ '^[a-z][a-z0-9_.]{2,99}$'),
  CONSTRAINT audit_logs_target_type_format CHECK (target_type IS NULL OR target_type ~ '^[a-z][a-z0-9_]{0,49}$'),
  CONSTRAINT audit_logs_metadata_object CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT audit_logs_ip_hash_format CHECK (ip_hash IS NULL OR ip_hash ~ '^[a-f0-9]{64}$')
);

COMMENT ON TABLE public.audit_logs IS 'Append-only security and administrative event history; never store secrets or raw tokens.';

