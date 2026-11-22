\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE missing text[];
BEGIN
  SELECT array_agg(required.name ORDER BY required.name)
  INTO missing
  FROM (VALUES ('profiles'), ('admin_privileges'), ('projects'), ('project_people'),
               ('project_topics'), ('publications'), ('uploads'), ('audit_logs')) AS required(name)
  WHERE to_regclass('public.' || required.name) IS NULL;
  IF missing IS NOT NULL THEN RAISE EXCEPTION 'missing tables: %', missing; END IF;
END $$;

INSERT INTO profiles(user_id,email,full_name,account_state)
VALUES ('pending-1','pending@ejust.edu.eg','Pending Member','email_pending');

DO $$ BEGIN
  BEGIN
    INSERT INTO profiles(user_id,email,full_name) VALUES ('bad-1','person@example.com','Bad Domain');
    RAISE EXCEPTION 'non-EJUST email was accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO profiles(user_id,email,full_name) VALUES ('bad-2','UPPER@ejust.edu.eg','Upper Email');
    RAISE EXCEPTION 'non-normalized email was accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

INSERT INTO profiles(user_id,email,full_name,academic_role,account_state,verified_by,verified_at)
VALUES
 ('root-1','root@ejust.edu.eg','Root Admin','professor','verified','root-1',now()),
 ('prof-1','prof@ejust.edu.eg','Professor One','professor','verified','root-1',now());
INSERT INTO admin_privileges(user_id,is_root,granted_by) VALUES ('root-1',true,'root-1');
DO $$ BEGIN
  BEGIN
    INSERT INTO admin_privileges(user_id,is_root,granted_by) VALUES ('prof-1',true,'root-1');
    RAISE EXCEPTION 'second active root was accepted';
  EXCEPTION WHEN unique_violation THEN NULL; END;
END $$;

INSERT INTO projects(slug,title,summary,description,created_by,published,published_at)
VALUES ('secure-ai','Secure AI','A sufficiently long summary','A sufficiently long project description','prof-1',true,now());
DO $$ BEGIN
  BEGIN
    INSERT INTO projects(slug,title,summary,description,created_by,repository_url)
    VALUES ('bad-url','Bad URL','A sufficiently long summary','A sufficiently long project description','prof-1','javascript:alert(1)');
    RAISE EXCEPTION 'unsafe URL was accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

INSERT INTO uploads(owner_user_id,object_key,purpose,mime_type,byte_size)
VALUES ('prof-1','profiles/prof-1/photo.webp','profile_photo','image/webp',1024);
DO $$ BEGIN
  BEGIN
    INSERT INTO uploads(owner_user_id,object_key,purpose,mime_type,byte_size)
    VALUES ('prof-1','../escape.svg','profile_photo','image/svg+xml',1024);
    RAISE EXCEPTION 'unsafe upload metadata was accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

INSERT INTO audit_logs(actor_user_id,operation,target_type,target_id)
VALUES ('root-1','account.verify','profile','prof-1');
DO $$ BEGIN
  BEGIN
    UPDATE audit_logs SET operation = 'tampered';
    RAISE EXCEPTION 'audit mutation was accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;

DO $$
DECLARE before_ts timestamptz; after_ts timestamptz;
BEGIN
  SELECT updated_at INTO before_ts FROM profiles WHERE user_id='prof-1';
  PERFORM pg_sleep(0.01);
  UPDATE profiles SET headline='AI Professor' WHERE user_id='prof-1';
  SELECT updated_at INTO after_ts FROM profiles WHERE user_id='prof-1';
  IF after_ts <= before_ts THEN RAISE EXCEPTION 'updated_at trigger failed'; END IF;
END $$;
ROLLBACK;
