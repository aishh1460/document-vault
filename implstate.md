# Digital Document Vault — Current State

## PURPOSE

Compact technical handoff and final architecture summary.

---

# CURRENT STATUS

Batch: ALL BATCHES COMPLETED (Account 1, Account 2, Account 3)

Status: FULLY OPERATIONAL & HARDENED

Completed Phases: 1 through 44 (excluding intentionally removed phases 14, 15, 20, 22, 42)

---

# FRONTEND ARCHITECTURE

## API Client
Single unified client: `src/services/apiClient.js`

## Feature Services
- `authService.js` — Authentication, registration, token storage
- `documentService.js` — Upload, CRUD, versioning, trash, favorites, tags, expiry
- `folderService.js` — Folder hierarchy, creation, rename, move, delete
- `shareService.js` — Public / secure document sharing, link management
- `accessControlService.js` — Permissions matrix, grants, revocation, access review
- `notificationService.js` — User notifications and unread badges
- `reminderService.js` — Document date-based reminders and notifications
- `searchService.js` — Multi-criteria advanced document search
- `tagService.js` — Tag creation, lookup, attachment
- `auditService.js` — Audit logs and compliance activities
- `adminService.js` — System administration and user management
- `analyticsService.js` — System and usage analytics
- `ocrService.js` — Text extraction from PDF, images, text files
- `versionService.js` — Document version history and version restore
- `activityService.js` — Audit trail and document interaction history
- `dashboardService.js` — Aggregated stats, storage usage, vault health metrics

---

# BACKEND ARCHITECTURE

## Controllers
- `UserAuthController` — `/api/auth` (login, register, profile)
- `DocumentController` — `/api/documents` (upload, download, rename, move, trash, archive, restore, versioning, search, tags, expired)
- `FolderController` — `/api/folders` (root folders, subfolders, tree, rename, delete)
- `ShareController` — `/api/share` (link creation, validation, access)
- `AccessControlController` — `/api/access` (matrix, grants, revocation, review)
- `NotificationController` — `/api/notifications` (user notifications, mark read)
- `ReminderController` — `/api/reminders` (create, list, dismiss, due reminders)
- `TagController` — `/api/tags` (create, search, document tags)
- `DashboardController` — `/api/dashboard` (aggregated stats, performance optimizations, health report)
- `BackupController` — `/api/backup` (export ZIP backup, import restore)
- `OcrController` — `/api/ocr` (extract text, trigger async processing)
- `DocumentActivityController` — `/api/activity` (timeline, user/doc activity)
- `FavoriteController` — `/api/favorites` (toggle favorite, list favorites)
- `DigitalSignatureController` — `/api/signatures` (sign, validate, revoke, check integrity)
- `SecurityClearanceController` — `/api/clearance` (get, grant, revoke, check clearance levels)
- `DocumentPreviewController` — `/api/preview` (thumbnail metadata, streaming preview, format descriptors)
- `FileIntegrityController` — `/api/integrity` (document verification, full scan, daily scheduled check)

## Core Security & Reliability Features
- **Security Clearance Gating**: Ordinal-based clearance level matching (`PUBLIC` to `TOP_SECRET`)
- **Folder Safety**: Max depth recursion limit (5 levels), sub-folder existence checks before deletion
- **Integrity Verification**: SHA-256 validation comparing physical file against database checksum
- **Daily Automated Scanners**: Scheduled cron jobs for trash retention, reminder triggering, and file integrity scanning
- **Document Versioning**: Immutable snapshot records on file overwrites with instant one-click rollback
- **Centralized Validation**: `FileValidationService` for size limits (100MB) and allowed MIME types

---

# BUILD & TEST VALIDATION STATUS

- **Frontend Tests**: 10/10 Passing (`npm test -- --watchAll=false`)
- **Frontend Production Build**: `npm run build` completed successfully (Exit Code 0)
- **Backend Tests**: 14/14 Passing (`mvn clean test`, Exit Code 0)
- **Backend Build**: `mvn clean compile` completed successfully with 88 compiled classes