# Gemini CLI Log

## Mandates
- **Swagger Documentation**: Always update or add Swagger/OpenAPI documentation for any new backend endpoints or changes to existing ones. All backend APIs must be fully documented and accessible via `/api-docs`.

## [2026-03-12] Session Initialization

- Initialized `GEMINI.md` to track all query results and changes.
- Workspace directory `C:\Main\Projects\FixMart-Backend` is currently empty.

## [2026-03-12] Brand Suggestion Feature

- Added `GET /api/devices/brands` endpoint to return a unique list of brands from the database.
- Updated Swagger documentation with the new brands endpoint.
- Integrated HTML5 `<datalist>` in `index.html` for both "Add" and "Edit" brand input fields.
- Enhanced `script.js` to:
    - Fetch unique brands dynamically from the backend.
    - Populate and refresh brand suggestions after every Create, Update, or Delete operation.
- Added `REASONING_SUGGESTIONS.md` in root to document architectural decisions for datalists.

## [2026-03-12] Models Suggestion Feature
- Added `GET /api/devices/models` endpoint to return unique models for a specific brand.
- Updated Swagger documentation with the new models endpoint.

## [2026-03-12] Device Types Integration
- Updated database schema with `device_types` table and `type_id` foreign key in `devices`.
- Added `GET`, `POST`, `PUT`, `DELETE` endpoints for `/api/device-types`.
- Updated `devices` endpoints to handle `type_id` and join with `device_types` for type names.
- Updated Swagger documentation for all new and modified endpoints.
- Added "Manage Device Types" section to frontend.
- Updated device add/edit forms with device type selection.

## [2026-03-16] Repair Tracking System
- Added `multer` dependency to resolve startup crash.
- Added `shops` and `repair_bookings` tables to `init.sql`.
- Created `GET`, `POST`, `PATCH` endpoints for `/api/repairs` to handle booking and status tracking.
- Integrated Swagger documentation for all new repair endpoints.

## [2026-03-17] CORS and Infrastructure Fixes
- Moved `cors` middleware to the top of the application stack.
- Configured CORS to allow all origins, methods, and credentials.
- Removed explicit `app.options` call to resolve `path-to-regexp` crash in Express 5. The `cors` middleware handles preflight automatically.
- Increased Global Rate Limit to 1000 requests per 15 minutes to prevent development blocking.
- Ensured CORS is applied before security headers and rate limiting.

## [2026-03-17] Profile Image Management
- Enhanced `AuthService.updateProfileImage` to delete the previous profile image from the server when a new one is uploaded.
- Added `fs` and `path` modules to `AuthService` for file system operations.
- Implemented path mapping and safety checks to ensure only different old images are deleted.

## [2026-03-19] Shop Activation Fix
- Fixed `POST /api/shops/{id}/activate` endpoint.
- Added missing `updateUserRole` and `updateShopId` methods to `AuthRepository`.
- Updated `ShopService.activateShop` and `RoleRequestService.handleAction` to correctly update owner role and shop link.

## [2026-04-30] Deployment Fix
- Resolved Docker container name conflict error in GitHub Actions.
- Updated `deploy.yml` to use `docker compose down --remove-orphans` and added a manual `docker rm -f fixmart-backend-api-1` step to ensure a clean slate before building.

