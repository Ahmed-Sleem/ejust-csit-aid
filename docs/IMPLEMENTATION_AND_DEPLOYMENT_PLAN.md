# EJUST CSIT AI & Data Science — Implementation and Deployment Plan

**Status:** Planning complete; implementation must proceed milestone by milestone.  
**Target:** Responsive website only. No native mobile app, desktop app, Electron app, or separate installable app.  
**Target stack:** Cloudflare Pages + Neon + GitHub.  
**Target public URL:** `https://ejust-csit-aid.pages.dev` or the closest available Cloudflare project name.  
**Companion requirements:** [`PRODUCT_REQUIREMENTS.md`](./PRODUCT_REQUIREMENTS.md)

---

## 1. Definition of ready

The system is ready for real deployment only when all of these are true:

- The static demo has been refactored into maintainable frontend modules without changing its approved design.
- Neon development and production branches exist and use separate credentials.
- Managed Better Auth, Data API, Object Storage, and required server functions are configured.
- Every Data API table has explicit grants and Row-Level Security (RLS).
- Registration rejects every address outside `@ejust.edu.eg` on both client and server/database paths.
- The one-time root-admin bootstrap works without email or manual verification and cannot be reused.
- Regular accounts require email verification and administrator verification.
- Admin privilege is separate from Student/Professor academic role.
- Users can edit only their own permitted profile fields.
- Professors and Admins can publish projects; ordinary Students cannot.
- Project mentions update profile project lists and computed project counts.
- Public people ranking uses project count descending.
- Upload validation and permissions are enforced.
- Audit records exist for all privileged actions.
- Automated unit, integration, RLS, function, browser, accessibility, and security tests pass.
- A clean production build deploys to Cloudflare Pages.
- Backup export and restore have been tested.
- Secrets have been scanned and none exist in source control, browser bundles, or logs.

---

## 2. Confirmed product boundaries

### Included

- Public department website
- EJUST-only registration
- Login/logout
- Email verification by OTP
- Password reset
- Admin review and academic-role assignment
- Student and Professor profiles
- Admin and root-admin privileges
- Profile self-service
- Public People and Projects directories
- Professors/Admin project publishing
- Project-person mentions
- Computed project count and ranking
- Image/file uploads
- Search
- Audit log
- Responsive desktop/mobile web interface

### Excluded

- Native mobile app
- Desktop app
- Electron app
- Separate PWA project
- Project workflow states
- Project Status field
- Notification center
- Mention notifications
- Likes
- Comments
- Chat
- Social feed
- Resume downloads
- Profile messaging
- News, Talks, Education, Awards, or Message profile sections

---

## 3. Architecture

```text
Browser
  |
  | HTTPS
  v
Cloudflare Pages
  |- Vite frontend bundle
  |- Generated pages.dev domain
  |- Security headers
  |- Git deployments and previews
  |
  | Managed Better Auth + Data API HTTPS
  v
Neon project
  |- Managed Better Auth
  |- PostgreSQL
  |- Data API
  |- Row-Level Security
  |- Object Storage
  |- Neon Functions for privileged operations
  |- Shared email provider for verification OTP/password reset
```

### Responsibility split

#### Cloudflare Pages

- Host HTML, CSS, JavaScript, SVG, and static assets.
- Serve the generated `pages.dev` domain over HTTPS.
- Build from the GitHub repository.
- Provide production and preview deployments.
- Apply security headers and SPA fallback behavior.

#### Neon

- Authenticate users.
- Send shared-provider email verification codes and password-reset email.
- Store application data in PostgreSQL.
- Enforce access using grants and RLS.
- Store profile and project media.
- Run trusted privileged server functions.
- Expose safe public and authenticated queries through the Data API.

#### GitHub

- Store source and migrations.
- Run CI checks.
- Review changes.
- Trigger Cloudflare builds.
- Never store production passwords, root-admin secrets, database URLs, service credentials, or storage keys in committed files.

---

## 4. Accounts the owner will eventually create

Do not create these until the local implementation reaches the account-setup milestone.

### Required

1. **Cloudflare account**
   - Workers & Pages access
   - GitHub repository authorization

2. **Neon account**
   - One Free project for this website
   - Managed Better Auth enabled
   - Data API enabled
   - Object Storage enabled
   - Functions enabled

3. **GitHub account/repository**
   - Existing `Ahmed-Sleem/ejust-csit-aid`
   - Branch protection and Actions enabled

### Information the owner must choose

- Exact root-admin EJUST email
- Cloudflare project name
- Public application name shown in Neon auth emails
- Whether EJUST email is public by default on profiles
- Allowed upload sizes
- Data-retention period for rejected/deactivated users

---

## 5. Repository target structure

```text
ejust-csit-aid/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── migration-check.yml
│       └── security.yml
├── docs/
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── IMPLEMENTATION_AND_DEPLOYMENT_PLAN.md
│   ├── DATA_MODEL.md
│   ├── SECURITY_MODEL.md
│   ├── OPERATIONS.md
│   └── TEST_PLAN.md
├── functions/
│   ├── admin-accounts/
│   │   ├── index.ts
│   │   └── index.test.ts
│   ├── bootstrap-root/
│   │   ├── index.ts
│   │   └── index.test.ts
│   ├── project-admin/
│   │   ├── index.ts
│   │   └── index.test.ts
│   ├── signed-upload/
│   │   ├── index.ts
│   │   └── index.test.ts
│   └── shared/
│       ├── auth.ts
│       ├── cors.ts
│       ├── errors.ts
│       ├── rate-limit.ts
│       ├── validation.ts
│       └── audit.ts
├── migrations/
│   ├── 0001_extensions.sql
│   ├── 0002_enums.sql
│   ├── 0003_profiles.sql
│   ├── 0004_admin_privileges.sql
│   ├── 0005_projects.sql
│   ├── 0006_project_people.sql
│   ├── 0007_uploads.sql
│   ├── 0008_audit_logs.sql
│   ├── 0009_public_views.sql
│   ├── 0010_rls.sql
│   ├── 0011_functions.sql
│   ├── 0012_indexes.sql
│   └── 0013_seed_reference_data.sql
├── scripts/
│   ├── verify.sh
│   ├── check-migrations.ts
│   ├── seed-development.ts
│   ├── create-test-users.ts
│   ├── export-backup.sh
│   └── restore-backup.sh
├── src/
│   ├── app/
│   │   ├── router.ts
│   │   ├── session.ts
│   │   └── bootstrap.ts
│   ├── auth/
│   │   ├── auth-client.ts
│   │   ├── domain-policy.ts
│   │   ├── guards.ts
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── verify-email.ts
│   │   ├── pending-review.ts
│   │   └── reset-password.ts
│   ├── admin/
│   │   ├── dashboard.ts
│   │   ├── account-review.ts
│   │   ├── role-management.ts
│   │   ├── admin-management.ts
│   │   └── audit-log.ts
│   ├── profiles/
│   │   ├── profile-api.ts
│   │   ├── profile-editor.ts
│   │   ├── profile-page.ts
│   │   ├── people-directory.ts
│   │   └── profile-validation.ts
│   ├── projects/
│   │   ├── project-api.ts
│   │   ├── project-editor.ts
│   │   ├── project-page.ts
│   │   ├── projects-directory.ts
│   │   ├── mentions.ts
│   │   └── project-validation.ts
│   ├── search/
│   │   ├── search-api.ts
│   │   └── search-ui.ts
│   ├── uploads/
│   │   ├── upload-api.ts
│   │   ├── image-validation.ts
│   │   └── image-preview.ts
│   ├── ui/
│   │   ├── dialog.ts
│   │   ├── form.ts
│   │   ├── loading.ts
│   │   ├── error-state.ts
│   │   ├── toast.ts
│   │   └── accessibility.ts
│   ├── koi/
│   │   └── existing intro modules
│   ├── lib/
│   │   ├── neon.ts
│   │   ├── env.ts
│   │   ├── errors.ts
│   │   ├── result.ts
│   │   └── validation.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   ├── components.css
│   │   └── responsive.css
│   └── main.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── rls/
│   ├── security/
│   ├── accessibility/
│   └── e2e/
├── public/
│   └── approved static assets
├── neon.ts
├── wrangler.jsonc
├── vite.config.ts
├── playwright.config.ts
├── vitest.config.ts
├── package.json
└── .env.example
```

No secret values belong in `.env.example`.

---

## 6. Data model

Use UUID primary keys unless a Neon-managed auth identifier must remain text. Store timestamps as `timestamptz` in UTC.

### 6.1 `profiles`

```text
id                    uuid primary key
user_id               text unique not null
email                 citext unique not null
full_name             text not null
academic_role          enum(student, professor) not null
account_state          enum(email_pending, admin_review_pending, verified, rejected, suspended)
headline               text
biography              text
research_interests     text[]
skills                 text[]
photo_object_key       text
email_public           boolean default false
contact_links          jsonb
verified_by            text nullable
verified_at            timestamptz nullable
created_at             timestamptz
updated_at             timestamptz
```

Rules:

- Email must pass a database check for lowercase `@ejust.edu.eg` suffix.
- `academic_role` and `account_state` cannot be changed by the profile owner.
- Public profile queries return only verified profiles.
- Contact JSON is validated against an allowed schema and URL protocols.

### 6.2 `admin_privileges`

```text
user_id               text primary key
is_root               boolean default false
active                boolean default true
granted_by            text nullable
granted_at            timestamptz
revoked_by            text nullable
revoked_at             timestamptz nullable
```

Rules:

- Admin is separate from `academic_role`.
- Exactly one active root admin is allowed.
- Ordinary admins cannot grant/revoke admin privilege.
- Root cannot revoke its own root status through normal UI/API.

### 6.3 `projects`

```text
id                    uuid primary key
slug                  text unique not null
title                 text not null
summary               text not null
description           text not null
cover_object_key      text
repository_url        text
publication_url       text
demo_url              text
year                   smallint
created_by            text not null
published             boolean default false
published_at           timestamptz nullable
created_at             timestamptz
updated_at             timestamptz
```

There is no workflow column and no Status field.

### 6.4 `project_people`

```text
project_id            uuid references projects on delete cascade
profile_id            uuid references profiles on delete cascade
position              integer default 0
added_by              text not null
created_at             timestamptz
primary key(project_id, profile_id)
```

`project_count` is derived from published projects joined through this table. It is not editable profile data.

### 6.5 `project_topics`

```text
project_id            uuid references projects on delete cascade
topic                 text
primary key(project_id, topic)
```

### 6.6 `publications`

```text
id                    uuid primary key
profile_id            uuid references profiles on delete cascade
project_id            uuid nullable references projects on delete set null
title                 text not null
venue                 text
year                   smallint
url                    text
position              integer default 0
created_at             timestamptz
updated_at             timestamptz
```

### 6.7 `uploads`

```text
id                    uuid primary key
owner_user_id         text not null
object_key            text unique not null
purpose               enum(profile_photo, project_cover, publication_attachment)
mime_type             text not null
byte_size             bigint not null
sha256                 text
created_at             timestamptz
```

### 6.8 `audit_logs`

```text
id                    bigint generated always as identity primary key
actor_user_id         text
operation             text not null
target_type           text
target_id             text
metadata              jsonb
request_id            uuid
ip_hash               text
created_at             timestamptz
```

Audit logs are append-only. Do not store passwords, raw tokens, database credentials, or uploaded-file secrets.

---

## 7. Database constraints and derived views

Create:

- Case-insensitive unique email constraint.
- EJUST domain check constraint.
- Unique root-admin partial index where `is_root = true and active = true`.
- URL protocol checks allowing only `https:` where practical.
- Year checks with sensible lower and upper bounds.
- Length checks for title, summary, biography, and description.
- Indexes on profile state, academic role, name, project publication, year, and join keys.

Create safe public views:

- `public_profiles`
- `public_projects`
- `public_project_people`
- `people_ranked`
- `search_people`
- `search_projects`

Views exposed to the Data API must use security-invoker behavior where supported and must not expose auth tables or private profile fields.

`people_ranked` computes:

```sql
count(distinct published_project_id) as project_count
```

Ordering:

1. `project_count desc`
2. editorial position if later approved
3. `full_name asc`

---

## 8. Authorization and RLS matrix

Every exposed table must have RLS enabled. RLS enabled with no policy should deny access by default.

| Resource | Anonymous | Pending user | Verified Student | Verified Professor | Admin | Root |
|---|---|---|---|---|---|---|
| Public profiles | Read | Read | Read | Read | Read/write any | Read/write any |
| Own private profile | No | Limited read/update | Read/update permitted fields | Same | Any | Any |
| Other private profiles | No | No | No | No | Read/update | Read/update |
| Published projects | Read | Read | Read | Read | Read/write | Read/write |
| Unpublished projects | No | No | No | Own only if Admin | Any | Any |
| Create project | No | No | No | Yes | Yes | Yes |
| Manage mentions | No | No | No | Own projects | Any | Any |
| Account review | No | No | No | No | Yes | Yes |
| Grant admin | No | No | No | No | No | Yes |
| Audit log | No | No | No | No | Read | Read |

Never base authorization on user-editable authentication metadata. Use stable user ID plus application-owned `profiles` and `admin_privileges` tables.

### RLS tests required for every protected action

For every role, test:

- Allowed SELECT succeeds.
- Forbidden SELECT returns no rows or authorization error as designed.
- Allowed INSERT succeeds.
- Forged owner ID fails.
- Academic-role self-escalation fails.
- Admin self-grant fails.
- Student project publication fails.
- Professor editing another professor’s project fails.
- Suspended user writes fail.
- Anonymous writes fail.

Run Neon Data API security advisors before production. Zero ERROR-level findings are allowed.

---

## 9. Authentication flows

### 9.1 Regular registration

1. User submits full name, EJUST email, and password.
2. Client normalizes email to lowercase and performs an early domain check.
3. Server/auth configuration enforces the domain independently.
4. Managed Better Auth creates an unverified identity.
5. System sends a verification OTP through Neon’s shared provider.
6. User enters OTP.
7. Verified auth identity receives/creates a profile in `admin_review_pending`.
8. User sees pending-review screen.
9. Admin assigns Student or Professor and verifies account.
10. User receives access on next token/session refresh.

### 9.2 Root bootstrap

Required deployment secret:

```text
ROOT_ADMIN_EMAIL=<chosen @ejust.edu.eg address>
```

Flow:

1. Root email creates an account through the normal registration UI.
2. Trusted `bootstrap-root` function verifies the authenticated email equals the deployment secret.
3. Function checks that no root record exists.
4. Function marks auth email verified using trusted server capability where supported.
5. Function creates verified profile and active root privilege in one transaction.
6. Function writes immutable audit event.
7. Function becomes permanently unavailable after successful bootstrap except for an idempotent “already completed” response.

Security:

- No default password.
- Secret email is never included in browser JavaScript.
- Endpoint is rate-limited.
- Transaction uses database lock/advisory lock to prevent two roots.
- Root must enroll MFA before accessing admin management.

### 9.3 Login

- Generic error message for invalid email/password.
- No account-existence disclosure.
- Secure session cookies managed by supported auth integration.
- Suspended/rejected state checked after authentication.
- Redirect by state: pending, verified member, admin, or root.

### 9.4 Password reset

- Generic submission response.
- OTP/link expiration enforced by auth provider.
- Reset invalidates previous sessions where supported.
- Security audit event created without storing token.

---

## 10. Trusted server functions

Browser code must never contain database-owner credentials or storage credentials.

### `bootstrap-root`

- One-time root creation.
- Transactional and idempotent.
- Requires authenticated matching EJUST identity.

### `admin-accounts`

Operations:

- List pending accounts.
- Verify as Student/Professor.
- Reject/suspend/restore.
- Grant/revoke Admin (root only).

Every request:

- Validates JWT.
- Loads application-owned privileges.
- Checks account state.
- Validates body schema.
- Uses a database transaction.
- Writes audit record.
- Returns generic safe errors.

### `project-admin`

Operations needing server trust:

- Admin edit/delete override.
- Optional complex project transaction.
- Mention replacement in one transaction.
- Recompute/validate derived relationships.

### `signed-upload`

- Verifies user and purpose.
- Validates expected MIME type and maximum size.
- Creates randomized object key.
- Returns short-lived presigned upload URL.
- Records completed upload after validation.

### Shared function protections

- Strict CORS allowlist for production and approved previews.
- Request size limits.
- JSON schema validation.
- Rate limits.
- Request IDs.
- Structured safe logs.
- No secret values in responses or logs.

---

## 11. Object Storage plan

Buckets/prefixes:

```text
profiles/{user-id}/{random-id}.webp
projects/{project-id}/{random-id}.webp
publications/{profile-id}/{random-id}.pdf
```

### Initial limits

- Profile image: 3 MB input maximum.
- Project cover: 6 MB input maximum.
- Publication attachment: 15 MB maximum.
- Images: JPEG, PNG, WebP; reject SVG uploads from users.
- Attachments: PDF only in first version.

### Validation

- Validate extension and MIME type.
- Inspect magic bytes server-side.
- Reject double extensions and executable content.
- Randomize object names.
- Strip image metadata where implementation permits.
- Do not trust client-reported dimensions or type.
- Delete replaced/abandoned objects.
- Prevent users from writing to another owner’s prefix.

---

## 12. Frontend implementation

### Phase A: refactor without behavior changes

- Move inline CSS into organized files.
- Move inline JavaScript into TypeScript modules.
- Preserve all approved visuals and koi behavior.
- Replace inline `onclick` attributes with event listeners.
- Add a small router abstraction for hash routes.
- Add centralized loading, error, dialog, and form behavior.
- Keep tests green after every extraction.

### Phase B: auth screens

Create:

- Register
- Verify email OTP
- Login
- Forgot password
- Reset password
- Pending admin review
- Rejected/suspended state
- MFA enrollment/challenge for admins

Requirements:

- Same minimal design language.
- Accessible labels and error summaries.
- Password manager compatibility.
- No password logging.
- Disable duplicate submissions.
- Graceful expired-code handling and resend cooldown.

### Phase C: session-aware navigation

States:

- Signed out: Sign in
- Pending: Account status
- Verified: Profile menu
- Admin: Profile menu + Admin

Desktop and mobile menus must share the same source of truth.

### Phase D: real profiles

- Replace hardcoded `P` array.
- Load public profiles from safe view.
- Add owner editor for permitted fields.
- Keep only About, Publications, Projects, and Contact Information.
- Add optimistic UI only where rollback is safe.
- Show explicit save success/failure.

### Phase E: real projects

- Replace hardcoded `J` array.
- Add project editor for Professor/Admin.
- Add people mention selector from verified profiles.
- Update all project data and mentions transactionally.
- Keep no workflow and no Status field.

### Phase F: search

- Search safe views only.
- Debounce requests.
- Minimum query length for remote search.
- Paginate or limit results.
- Escape all output.
- Preserve desktop auto-collapse and full-screen mobile search.

### Phase G: admin dashboard

Pages:

- Pending accounts
- User details
- Academic-role verification
- Suspensions/rejections
- Admin management (root only)
- Project management
- Audit log

Admin controls must not be the sole security boundary; server and RLS enforcement remain mandatory.

---

## 13. Environment configuration

### Public browser variables

Safe to expose:

```text
VITE_NEON_AUTH_URL=
VITE_NEON_DATA_API_URL=
VITE_APP_ENV=
VITE_APP_ORIGIN=
```

Only include values specifically designed to be public.

### Server-only variables

Never expose in Vite-prefixed variables:

```text
ROOT_ADMIN_EMAIL=
DATABASE_URL=
DATABASE_URL_UNPOOLED=
NEON_API_KEY=
NEON_AUTH_SERVER_SECRET=
OBJECT_STORAGE_SECRET=
```

### Files

- `.env.example`: names and explanations only.
- `.env.local`: local values, gitignored.
- Cloudflare encrypted secrets: production frontend/server bindings if required.
- Neon-injected function variables: database/auth/storage service credentials.
- GitHub Actions secrets: deployment automation only.

Add automated scans for known secret patterns and accidental `.env` commits.

---

## 14. Testing strategy

### 14.1 Unit tests

Test pure behavior:

- EJUST email normalization and validation
- Slug generation
- Profile/project form validation
- URL validation
- Project count sorting
- Mention de-duplication
- Upload-type and size validation
- Role/permission helper functions
- Search query normalization

### 14.2 Database migration tests

For every migration sequence:

1. Create empty test database/branch.
2. Apply all migrations.
3. Validate expected schema.
4. Roll forward from previous release schema.
5. Run constraints and seed checks.
6. Confirm migration is idempotent where designed.

Never test destructive migration first on production.

### 14.3 RLS tests

Create isolated test users:

- Anonymous
- Pending user
- Verified Student A/B
- Verified Professor A/B
- Admin Student
- Admin Professor
- Root Admin
- Suspended user

Test every matrix entry in Section 8.

### 14.4 Function tests

- Missing/invalid token
- Wrong role
- Suspended account
- Invalid request body
- EJUST domain bypass attempt
- Duplicate root bootstrap
- Concurrent root bootstrap
- Ordinary admin attempts admin grant
- Student attempts project publish
- Mention of nonexistent/unverified profile
- Upload path traversal and MIME mismatch
- Transaction rollback on partial failure
- Audit record created exactly once

### 14.5 Integration tests

Use development Neon branch:

- Register → OTP verify → pending
- Admin verifies → user access changes
- Root bootstrap
- Root grants Admin to Student and Professor
- Professor creates project with mentions
- Mentioned profiles show project
- Project counts update after add/remove/delete
- Password reset
- Account suspension invalidates writes
- Profile owner update
- Forbidden cross-user profile update
- Upload and cleanup

### 14.6 End-to-end tests

Desktop and mobile:

- Public intro and koi
- People and project directories
- Search open/close behavior
- Registration validation
- Verification form
- Login/logout
- Pending screen
- Profile editing
- Professor project creation
- Student project denial
- Admin verification
- Root admin management
- Mention rendering and ranking
- Responsive menus
- Keyboard-only navigation
- No console/page errors

### 14.7 Accessibility tests

- Automated axe checks on each primary route.
- Keyboard focus order.
- Dialog focus trap and restoration.
- Error announcements.
- Form labels.
- Contrast.
- Reduced motion.
- 200% zoom.
- Touch target sizes.

### 14.8 Security tests

- Dependency audit.
- Secret scan.
- Static code analysis.
- XSS payloads in every text field.
- CSRF/session checks.
- IDOR/cross-user access attempts.
- Role escalation.
- SQL injection strings.
- File polyglots and malicious filenames.
- Brute-force/rate-limit behavior.
- Account enumeration.
- Security header checks.
- RLS advisor has zero ERROR findings.

### 14.9 Performance tests

Targets for representative mobile connection:

- Avoid blocking the first render on authenticated APIs.
- Lazy-load authenticated/admin modules.
- Pause koi animation outside intro and when hidden.
- Paginate directories.
- Keep image payloads responsive.
- Test with maximum expected profile/project counts, not only demo data.

---

## 15. CI pipeline

Every pull request:

1. Install with lockfile.
2. Typecheck.
3. Format/lint.
4. Unit tests.
5. Build.
6. Secret scan.
7. Dependency audit.
8. Migration validation on temporary database/branch where available.
9. RLS integration suite.
10. Desktop/mobile browser tests.
11. Accessibility tests.

Production deployment gate:

- Main branch only.
- All required checks pass.
- Migration reviewed.
- Database backup/snapshot created before destructive migration.
- Cloudflare build succeeds.
- Smoke tests run against deployed URL.
- Rollback instructions attached to release.

---

## 16. Cloudflare configuration

### Pages project

```text
Repository: Ahmed-Sleem/ejust-csit-aid
Production branch: main
Build command: npm ci && npm run build
Output directory: dist
Node version: pinned supported LTS
```

### Required files

- `_headers` or equivalent for security headers.
- `_redirects` or SPA fallback if routing changes from hash routing.
- `robots.txt` appropriate to production.
- No indexing for preview deployments where possible.

### Security headers

Plan and test:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy` where compatible
- `frame-ancestors` through CSP
- Strict transport behavior provided by HTTPS platform

CSP must explicitly allow only required Neon endpoints and approved asset sources. Avoid `unsafe-inline` by removing inline scripts/styles during refactor.

### Preview deployments

- Use isolated Neon development/preview branch where practical.
- Never point arbitrary pull-request previews at production write credentials.
- Mark preview URLs noindex.
- Do not load real production PII into previews.

---

## 17. Neon setup checklist

1. Create project in nearest appropriate region.
2. Protect production branch.
3. Create development branch.
4. Enable Managed Better Auth.
5. Set application name.
6. Enable email/password registration.
7. Require email verification OTP.
8. Configure trusted development and Cloudflare origins.
9. Enable Data API with Managed Better Auth.
10. Enable Object Storage.
11. Configure functions.
12. Apply migrations to development.
13. Apply grants and RLS.
14. Run Data API advisors.
15. Run integration/RLS tests.
16. Apply reviewed migrations to production.
17. Configure root-admin email as server-only secret.
18. Deploy functions.
19. Complete root bootstrap once.
20. Enroll root MFA.

---

## 18. Deployment sequence

### Milestone 0 — Baseline freeze

- Tag current static release.
- Save screenshots for visual regression.
- Confirm all current tests pass.

### Milestone 1 — Frontend refactor

- Modularize code.
- No backend yet.
- Preserve behavior and visuals.

**Exit:** visual/browser tests match baseline.

### Milestone 2 — Local schema and migrations

- Create SQL schema, constraints, indexes, views, grants, and RLS.
- Add migration and RLS tests.

**Exit:** fresh and upgrade migrations pass; RLS matrix passes locally/test branch.

### Milestone 3 — Neon development setup

Owner creates Neon account/project when instructed.

- Connect development branch.
- Enable auth/Data API/storage/functions.
- Apply migrations.

**Exit:** integration tests pass against Neon development.

### Milestone 4 — Authentication

- Register/login/OTP/reset/pending flows.
- Root bootstrap.
- Session-aware UI.

**Exit:** auth and root security tests pass.

### Milestone 5 — Profiles

- Real profile data and self-editing.
- Upload profile image.
- Public directories and search.

**Exit:** ownership/RLS tests pass.

### Milestone 6 — Projects and mentions

- Professor/Admin publishing.
- Mentions and project counts.
- Ranking.

**Exit:** role and count tests pass.

### Milestone 7 — Admin dashboard

- Account review.
- Role assignment.
- Suspensions.
- Root-only admin management.
- Audit log.

**Exit:** privilege escalation suite passes.

### Milestone 8 — Cloudflare staging

Owner creates Cloudflare account/project when instructed.

- Deploy preview/staging.
- Configure public environment variables.
- Configure trusted Neon origin.
- Run full staging tests.

**Exit:** staging acceptance passes.

### Milestone 9 — Production

- Snapshot/export database.
- Apply production migrations.
- Deploy functions.
- Deploy frontend.
- Bootstrap root admin.
- Enroll root MFA.
- Run production smoke tests.

**Exit:** launch checklist signed off.

---

## 19. Backup and recovery

Free services do not replace a tested backup plan.

Before launch:

- Document `pg_dump` export command.
- Encrypt backups before external storage.
- Do not commit dumps containing PII to GitHub.
- Define who can access backups.
- Test restore into a fresh Neon branch/project.

Schedule:

- Before every schema migration.
- Regular database export at an agreed interval.
- Media inventory/export at an agreed interval.

Recovery tests:

- Restore schema and data.
- Verify auth/profile linkage.
- Verify projects/mentions/counts.
- Verify audit log.
- Verify missing media is detected.

Record recovery time and steps in `docs/OPERATIONS.md`.

---

## 20. Monitoring and operational checks

At minimum:

- Cloudflare deployment status.
- Neon database/storage/function usage.
- Auth failure rate.
- Verification email failure rate.
- Function error rate.
- Slow queries.
- Storage quota.
- Database size.
- Security/audit anomalies.

Do not add user-facing notifications. Operational alerts go only to maintainers through provider dashboards/email.

---

## 21. Rollback plan

### Frontend failure

- Roll back to previous Cloudflare deployment.
- Confirm previous bundle uses compatible schema.

### Function failure

- Redeploy previous function version.
- Disable affected UI action if necessary.

### Migration failure

- Stop writes if integrity is uncertain.
- Restore snapshot/export to a clean branch.
- Verify checksums/counts.
- Repoint application only after validation.

### Security incident

- Suspend affected accounts.
- Revoke sessions.
- Rotate server credentials.
- Disable exposed function/API path.
- Preserve audit evidence.
- Restore from known-good version if required.

---

## 22. Launch checklist

### Product

- [ ] Website only; no app deliverables.
- [ ] Approved design preserved.
- [ ] Profile sections are About, Publications, Projects, Contact.
- [ ] No excluded features accidentally added.

### Authentication

- [ ] Only `@ejust.edu.eg` registration succeeds.
- [ ] OTP verification succeeds.
- [ ] Password reset succeeds.
- [ ] Account enumeration checks pass.
- [ ] Root bootstrap works once only.
- [ ] Admin MFA enforced.

### Authorization

- [ ] Student/Professor academic role separate from Admin.
- [ ] Pending users cannot use verified features.
- [ ] Students cannot publish unless Admin.
- [ ] Professors can manage only their projects unless Admin.
- [ ] Root-only admin grants enforced.
- [ ] Suspended users cannot write.

### Data

- [ ] All exposed tables have RLS.
- [ ] Data API advisors show zero ERROR findings.
- [ ] Project mentions and counts are correct.
- [ ] Ranking is deterministic.
- [ ] Search exposes only public data.

### Files

- [ ] Upload type/size checks enforced server-side.
- [ ] Object keys randomized.
- [ ] Cross-user uploads denied.
- [ ] Replacement/deletion cleanup works.

### Quality

- [ ] Unit/integration/RLS/function/E2E tests pass.
- [ ] Desktop and mobile pass.
- [ ] Accessibility checks pass.
- [ ] No console errors.
- [ ] No horizontal overflow.
- [ ] Koi animation pauses offscreen.

### Operations

- [ ] Backup export created.
- [ ] Restore tested.
- [ ] Rollback tested.
- [ ] Usage dashboards reviewed.
- [ ] Secrets scan clean.

### Deployment

- [ ] Production origins and CORS correct.
- [ ] Security headers correct.
- [ ] Cloudflare production deployment successful.
- [ ] Neon production functions successful.
- [ ] Smoke tests successful.

---

## 23. Information never to request in chat or commit

- Database passwords
- Neon API key
- Auth server secrets
- Object Storage secret keys
- Root-admin password
- MFA recovery codes
- Session tokens
- Password-reset tokens
- Email-verification codes
- Production database exports containing user data

Credentials must be entered directly into Neon, Cloudflare, or GitHub encrypted-secret interfaces when the relevant setup step begins.

---

## 24. Current next action

Do not create cloud accounts yet.

The first implementation session should execute **Milestone 0 and Milestone 1 only**:

1. Freeze the current visual baseline.
2. Refactor inline website code into maintainable TypeScript/CSS modules.
3. Preserve every approved interaction and visual.
4. Add visual regression and accessibility checks.
5. Finish with a clean static build and no backend credentials.

After that milestone passes, proceed to schema and security work locally. The owner should create Neon and Cloudflare accounts only when Milestones 2 and 3 require them.

---

## 25. Research basis

This plan follows the current documented platform behavior:

- Neon Data API authorization depends on PostgreSQL grants and RLS; missing RLS can expose data.
- Managed Better Auth JWT identity is available to RLS through `auth.user_id()`.
- Neon Data API advisors detect missing RLS, sensitive exposure, unsafe views, and policy errors.
- Neon supports shared-provider verification OTP without a custom domain.
- Neon Functions receive branch-scoped database/auth/storage variables and keep server credentials outside browser code.
- Cloudflare Pages supports Git integration, generated `pages.dev` addresses, build variables, encrypted secrets, preview deployments, and security header configuration.

Platform pricing and APIs can change. Recheck official pricing and limits immediately before creating production accounts and again before launch.
