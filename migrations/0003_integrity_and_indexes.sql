
CREATE UNIQUE INDEX admin_privileges_one_active_root_idx
  ON public.admin_privileges ((is_root)) WHERE is_root AND active;
CREATE INDEX profiles_account_state_idx ON public.profiles (account_state);
CREATE INDEX profiles_academic_role_idx ON public.profiles (academic_role) WHERE account_state = 'verified';
CREATE INDEX profiles_full_name_idx ON public.profiles (lower(full_name));
CREATE INDEX projects_published_year_idx ON public.projects (published, year DESC, created_at DESC);
CREATE INDEX projects_created_by_idx ON public.projects (created_by);
CREATE INDEX project_people_profile_idx ON public.project_people (profile_id, project_id);
CREATE INDEX publications_profile_position_idx ON public.publications (profile_id, position, year DESC);
CREATE INDEX uploads_owner_idx ON public.uploads (owner_user_id, created_at DESC);
CREATE INDEX audit_logs_actor_created_idx ON public.audit_logs (actor_user_id, created_at DESC);
CREATE INDEX audit_logs_target_created_idx ON public.audit_logs (target_type, target_id, created_at DESC);
CREATE INDEX audit_logs_created_idx ON public.audit_logs (created_at DESC);

CREATE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := statement_timestamp();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER projects_set_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER publications_set_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE FUNCTION public.reject_audit_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
BEGIN
  RAISE EXCEPTION 'audit logs are append-only' USING ERRCODE = '42501';
END;
$$;

CREATE TRIGGER audit_logs_reject_update_delete
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.reject_audit_log_mutation();

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_audit_log_mutation() FROM PUBLIC;

