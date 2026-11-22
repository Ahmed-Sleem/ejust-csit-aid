
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.academic_role AS ENUM ('student', 'professor');
CREATE TYPE public.account_state AS ENUM (
  'email_pending',
  'admin_review_pending',
  'verified',
  'rejected',
  'suspended'
);
CREATE TYPE public.upload_purpose AS ENUM (
  'profile_photo',
  'project_cover',
  'publication_attachment'
);

