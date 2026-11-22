# EJUST CSIT AI & Data Science — Product Requirements

**Status:** Confirmed scope  
**Purpose:** Turn the current static department website into a secure, maintainable platform for EJUST people and projects without changing its established visual language.

## 1. Product goals

- Provide a trusted public directory of department students, professors, and projects.
- Allow EJUST members to maintain their own profiles.
- Allow professors and administrators to publish department projects.
- Let administrators verify identities and manage access safely.
- Keep the current minimal responsive interface, koi intro, search, profile pages, and project pages.

## 2. Roles and account model

A person has one academic role and may separately have administrative privileges.

### Academic roles

- **Student**
- **Professor**

### Administrative privileges

- **Regular member:** no administrative access.
- **Admin:** can verify and manage accounts and content.
- **Root admin:** has all admin permissions and can create or remove other admins.

An admin must still be identified academically as either a student or professor. Admin is a permission level, not a replacement for the academic role.

## 3. Root administrator bootstrap

- The system has one preconfigured root-admin EJUST email address supplied through deployment secrets—not source code.
- On first use, the root admin completes the normal account-creation form.
- The root-admin account is immediately active and already verified.
- Root admin does not require email verification or manual account verification.
- No default password is stored in code, GitHub, or the database.
- Root privilege cannot be removed through ordinary admin actions.
- Creating or removing another admin requires recent root-admin authentication.

## 4. Registration and authentication

- Registration accepts only email addresses ending exactly in `@ejust.edu.eg`.
- New regular accounts must verify ownership through a single-use, expiring email link.
- After email verification, the account remains pending until an admin verifies it as Student or Professor.
- Pending users can sign in only to view their account status and complete limited profile information.
- Verified users can access all member features allowed by their academic role.
- Include login, logout, forgotten password, password reset, and session management.
- Password-reset and email-verification responses must not reveal whether an account exists.
- Changing an email address requires re-authentication and verification of the new EJUST address.
- Suspended or rejected accounts cannot use authenticated features.

## 5. Account states

- `email_pending`
- `admin_review_pending`
- `verified`
- `rejected`
- `suspended`

The root-admin bootstrap account starts as `verified`.

## 6. Admin capabilities

Admins can:

- Review pending accounts.
- Verify a person as Student or Professor.
- Reject, suspend, restore, or deactivate accounts.
- Correct academic roles.
- Review and edit any public profile.
- Edit or remove any project.
- View an audit history of sensitive actions.

Root admin can additionally:

- Grant admin privileges to a verified Student or Professor.
- Remove admin privileges.
- View all administrator privilege changes.

## 7. Profiles

Every verified member can edit only their own profile unless an admin intervenes.

Profile fields:

- Full name
- Academic role
- Profile photo
- Headline/title
- Biography
- Research interests
- Skills
- Education
- Publications
- Awards and honors
- Talks
- Public contact links
- EJUST email visibility preference
- Projects associated with the person
- `project_count`: computed number of published projects mentioning that person

Rules:

- Academic role and verification state are admin-managed fields.
- Users cannot grant themselves professor or admin access.
- Public profile pages keep the current site design.
- The homepage People section ranks verified people by `project_count` descending; ties use a stable editorial/alphabetical order.
- Search includes verified public profiles only.

## 8. Projects

Only Professors and Admins can create, edit, publish, or remove projects.

Project fields:

- Title
- Short summary
- Full description
- Cover image
- Topics/tags
- Year or start date
- Repository URL
- Demo URL
- Publications
- Attachments
- Mentioned people
- Created by
- Created and updated timestamps

Explicit exclusions:

- No project workflow states.
- No project Status field.
- No project-mention notifications.

Mention rules:

- A project can mention multiple registered people.
- Mentioned people appear on the project page.
- The project appears automatically on every mentioned person’s profile.
- Each mention contributes to that person’s computed `project_count`.
- Removing a mention updates the count automatically.
- Admins can correct project attribution.

## 9. Search and discovery

- Search people and projects from desktop and mobile interfaces.
- Support matching by name, role, research field, project title, summary, and topic.
- Homepage People ordering prioritizes people with the highest `project_count`.
- Dedicated People and Projects pages support filters and pagination or incremental loading.
- Search results must contain only content the current visitor is allowed to view.

## 10. Media and files

- Support profile photos, project covers, publications, and approved attachments.
- Validate MIME type, extension, size, and image dimensions on the server.
- Generate optimized responsive image variants.
- Remove unsafe metadata where appropriate.
- Use private object-storage credentials and signed upload mechanisms.
- Define storage quotas and deletion behavior.

## 11. Security requirements

- Use a maintained authentication framework or managed identity system; do not build cryptography manually.
- Hash passwords with Argon2id or an equivalent current standard.
- Store sessions in `HttpOnly`, `Secure`, `SameSite` cookies.
- Enforce permissions on every server endpoint and database operation.
- Require MFA for root admin and all admins.
- Rate-limit registration, login, verification, password reset, uploads, and search abuse.
- Use single-use, short-lived, hashed verification and reset tokens.
- Invalidate sessions after password changes, account suspension, and privilege changes.
- Protect against CSRF, XSS, SQL injection, insecure direct object references, and account enumeration.
- Validate and sanitize all user-controlled content.
- Keep secrets in environment/deployment secret storage only.
- Log security-relevant events without logging passwords, tokens, or sensitive personal data.

## 12. Audit log

Record at minimum:

- Account verification, rejection, suspension, and restoration
- Academic-role changes
- Admin grants and removals
- Project creation, editing, and deletion
- Admin edits to another person’s profile
- Root-admin bootstrap completion

Each record includes actor, action, target, timestamp, and relevant safe metadata. Audit records are immutable to ordinary admins.

## 13. Email

Transactional email is limited to:

- Email-address verification
- Password reset
- Security confirmation after password or email changes
- Account approval, rejection, or suspension outcome

There is no general notification center and no project-mention notification system.

## 14. Privacy and account lifecycle

- Users control visibility of optional contact information.
- Provide account-deletion and personal-data export requests.
- Define retention rules for deactivated accounts, deleted projects, audit records, and uploaded files.
- Publish privacy and acceptable-use pages before production launch.

## 15. Reliability and operations

- Separate development, staging, and production environments.
- Use automated database migrations.
- Perform encrypted automatic database backups.
- Test restoration from backups.
- Add uptime monitoring, server error tracking, and structured logs.
- Add privacy-respecting analytics only if approved.
- Use CI checks for tests, type safety, migrations, and security scanning before deployment.

## 16. Accessibility and quality

- Meet WCAG 2.2 AA where practical.
- Maintain keyboard navigation, visible focus, semantic controls, reduced-motion support, and responsive layouts.
- Test current versions of Chrome, Safari, Firefox, and Edge, plus representative Android and iOS devices.
- Preserve the current design language and progressive enhancement behavior.

## 17. Deliberate scope exclusions

The first production version does not include:

- Project workflow or approval stages
- Project Status field
- Notification center
- Project-mention notifications
- Likes
- Comments
- Social feeds
- Real-time chat
- Public self-assignment of roles

## 18. Minimum data entities

- `users`
- `profiles`
- `admin_privileges`
- `sessions`
- `email_verification_tokens`
- `password_reset_tokens`
- `projects`
- `project_people`
- `project_topics`
- `publications`
- `uploads`
- `audit_logs`

`project_count` should normally be derived from published project-person relationships rather than manually edited.

## 19. Launch acceptance criteria

- Non-EJUST emails cannot register.
- Root admin can bootstrap once without verification and can create another admin.
- Regular accounts require email verification and admin verification.
- Admins can classify members as Student or Professor.
- Admin privileges remain separate from academic role.
- Users can edit their own permitted profile fields only.
- Students cannot publish projects unless they also have Admin privilege.
- Professors and Admins can publish projects.
- Mentioned people appear on projects and projects appear on their profiles.
- `project_count` updates correctly and controls homepage ordering.
- No workflow, Status, or notification features are present.
- Authorization, rate limiting, email flows, backups, audit logs, accessibility, and responsive behavior pass production testing.
