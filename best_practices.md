# 📘 Project Best Practices

## 1. Project Purpose
Supernova Event Management Platform is a full-stack TypeScript application for managing a technical fest. It enables organizers to create and manage events, handle participant registrations (including team workflows), assign judges, manage sponsors/institutions, run pre-qualifier tests, and administer payment links. The stack uses React (Vite) for the frontend and Convex for backend data, auth, and server functions.

## 2. Project Structure
- Root
  - convex/: Convex backend modules (queries, mutations, auth, schema, HTTP router)
    - schema.ts: Data model definitions using convex/values with indexes (by_*)
    - events.ts, participantRegistrations.ts, preQualifierTests.ts, participatingInstitutions.ts, files.ts, profiles.ts, superAdmin.ts: Domain-specific server functions
    - auth.ts, auth.config.ts: Convex Auth setup and helpers
    - router.ts: HTTP router entry (currently minimal)
  - src/: React frontend
    - App.tsx: App entry, routing, view-mode switching, background
    - components/: Feature UI (e.g., ParticipantLandingPage, EventCard, EventSelectionModal, EventSpecificRegistrationForm, SuperAdminDashboard, etc.)
    - lib/utils.ts: Client utilities
    - main.tsx, index.css: Vite bootstrapping
  - public/, index.html: Static assets and HTML template
  - Config: vite.config.ts, tailwind.config.js, eslint.config.js, tsconfig*.json, postcss.config.cjs
  - Docs/Guides: README.md, Render deployment files, Dockerfile, .env.* examples
  - dist/: Build output

Conventions
- Frontend components use PascalCase filenames, colocated in src/components with modal-style composition.
- Convex functions are grouped by domain file and exported as query/mutation.
- Table indexes follow by_* naming (e.g., by_event, by_status, by_user).

## 3. Test Strategy
Current State
- No tests are present.

Recommended Approach
- Frontend (unit + integration)
  - Framework: Vitest + React Testing Library
  - Structure: src/__tests__/** or colocate *.test.tsx next to components
  - Mocking: msw (Mock Service Worker) or module-level stubs for convex/react hooks
  - Guidelines:
    - Unit test pure UI logic and lib/utils.ts
    - Integration test key flows: event listing, selection modal, registration form (team/individual), super admin dashboards
    - Ensure accessibility attributes (labels, roles) to simplify queries in tests
- Backend (function behavior)
  - Strategy: Black-box integration tests against a local Convex dev instance
  - Use seed/fixtures for tables and run function calls via convex client in a test harness
  - Validate: permissions (auth/roles), index-backed queries, error paths, and data shape stability
- Coverage Expectations
  - Prioritize critical paths (registration, event CRUD, permissions, payment link updates) to ~80% coverage before expanding

## 4. Code Style
- Language & Types
  - TypeScript throughout; prefer strict typing over any
  - Use Convex Id<"table"> types on the client for stable references
  - In Convex functions, use v.object/v.union/v.optional for input validation and returns for stable contracts
- React
  - Functional components with hooks (useState, useEffect, useQuery/useMutation)
  - Keep components focused; extract complex forms or modals into dedicated components
  - Maintain controlled inputs; avoid commented-out onChange handlers in forms
- Naming
  - Components: PascalCase; functions/variables: camelCase; constants: UPPER_SNAKE_CASE
  - Files: ComponentName.tsx for components, domainName.ts for backend modules
- Styling
  - Tailwind utility-first classes; prefer semantic grouping and consistent color tokens
- Errors & UX
  - Server: throw Error with precise messages; validate required fields server-side even if client validates
  - Client: toast user-facing errors via sonner; avoid exposing raw server stack traces
- Data & Relations
  - Avoid duplicating fields unless required for denormalized display; maintain a single source of truth where possible
  - When enriching responses (e.g., organizer, judges), clearly document response shape with returns in Convex functions

## 5. Common Patterns
- Convex Function Design
  - Define args/returns with v.* for runtime validation
  - Use indexes in queries (withIndex) for efficient filtering and pagination readiness
  - Enforce authorization early using getAuthUserId; check roles via userProfiles or organizerCredentials
  - Enrich reads with related data (organizer info, judge profiles) before returning
- Registration Workflow
  - Flexible eventSpecificData object captures event-tailored fields; keep UI logic for field selection centralized
  - Validate agreement flags and deduplicate entries by event/email via indexed lookups
- Frontend Data Access
  - useQuery/useMutation from convex/react; import endpoints from convex/_generated/api
  - Maintain isSubmitting state and optimistic UX where appropriate
- UI Composition
  - Modal components handle focus and close; parent manages show/hide state
  - Reuse EventCard for grid listings; use EventSelectionModal to branch to specific registration flows
- Indexing & Schema
  - Name indexes by_* for clarity; add indexes when queries filter/sort by a field
  - Keep schema cohesive and avoid excessive optionality unless intentional for flexibility

## 6. Do's and Don'ts
- Do
  - Keep secrets and admin credentials in environment variables; read on the server only
  - Validate and authorize on the server; never trust client-sent role flags or emails
  - Prefer precise types and avoid any; keep return types stable via returns validators
  - Add indexes for frequent filters (status, category, eventId, emailId)
  - Use Id<"table"> types on the client; constrain eventId/registrationId types for safety
  - Ensure controlled form inputs and wire onChange handlers (avoid commented-out bindings)
  - Localize date/time formatting in the UI; store canonical timestamps/ISO strings in the DB
  - Keep UI accessible (labels for inputs, aria attributes for interactive elements)
- Don't
  - Don’t hardcode super admin email/password in code or pass credentials from client to server
  - Don’t perform sensitive authorization solely on the client
  - Don’t bypass indexes for large scans; avoid unbounded collect without filters on large tables
  - Don’t leak internal error details to users; transform to friendly toasts
  - Don’t mutate schema without updating validators and consumers

## 7. Tools & Dependencies
- Frontend
  - React 19 + Vite 6: UI and dev tooling
  - Tailwind CSS: Styling
  - react-router-dom: Routing
  - sonner: Toaster notifications
  - xlsx: Data export utilities
- Backend
  - Convex: Database, serverless functions, auth (@convex-dev/auth)
- Quality & Build
  - TypeScript, ESLint, Prettier

Setup & Commands
- Install: npm install
- Local dev (frontend + backend): npm run dev
- Build: npm run build (tsc && vite build)
- Preview build: npm run preview
- Lint/typecheck: npm run lint
- Environment: Use .env.local for local secrets; never commit real secrets. Ensure Convex project configuration is set for dev/production.
- Deployment: Dockerfile and render.yaml available; verify environment variables for Convex and any payment gateways.

## 8. Other Notes
- LLM Guidance for Contributions
  - Do not modify files in convex/_generated; import api from "../../convex/_generated/api"
  - When adding Convex functions, define args and returns, authorize early, and add indexes as needed
  - After schema changes, a local convex dev run updates generated types; keep client imports consistent with new endpoints
  - Maintain Tailwind theme consistency and the existing visual language (emojis/icons, gradients)
- Security & Auth
  - Replace hardcoded super admin credentials with server-side env vars; never accept admin credentials from the client. Implement role-based checks against stored profiles/credentials.
- Data Modeling
  - When extending eventSpecificData, keep UI field logic centralized and document expected keys
  - Prefer storing numeric timestamps for sorting; format on the client
- Known Cleanups
  - Event edit modal currently has commented-out onChange handlers; wire controlled inputs to state before enabling updates
  - Remove duplication between collegeUniversity and collegeName by consolidating write paths and documenting mapping
