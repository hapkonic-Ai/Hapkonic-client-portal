# Phase 06 — Document Vault

**Status:** Completed
**Estimated Duration:** 4–5 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Build a secure document vault with Uploadthing-powered admin uploads, inline PDF/image viewer for clients, signed URL access with 15-minute expiry, watermarking, and full access audit logging.

**Deliverable:** Secure, organized document vault with preview, download, and audit trail.

---

## Tasks

### Admin — Document Upload
- [x] Install and configure Uploadthing (`createUploadthing()`, file routes)
- [x] Drag-and-drop multi-file uploader component with progress bars
- [x] Select project and category per file (11 predefined categories + custom)
- [x] Bulk upload: assign categories to multiple files before uploading
- [x] File validation: allowed types (PDF, PNG, JPG, DOCX, XLSX), max size (20 MB)
- [x] Auto-generate thumbnail preview for PDF files (canvas or server-side)
- [x] Replace/version documents: upload new version, keep old URL in history
- [x] Delete document with confirmation (also deletes from Uploadthing storage)

### Document Categories (11 Predefined)
- [x] Contract & Agreements
- [x] Project Proposals
- [x] Design Assets
- [x] Technical Specifications
- [x] Meeting Notes
- [x] Invoices & Financials
- [x] Progress Reports
- [x] Test Reports & QA
- [x] Deployment Guides
- [x] Legal Documents
- [x] Miscellaneous

### Signed URL & Access Control
- [x] Generate 15-minute signed URLs for all document access (Uploadthing or custom signed tokens)
- [x] Verify signed URL on download/view requests
- [x] Block direct file URL access without valid signed token
- [x] Track document access: record `viewed_at` and `downloaded_at` in DB per user

### Client — Document Viewer
- [x] Document library page: grid/list toggle with animated transitions
- [x] Each card: thumbnail preview, category badge, upload date, file size, status indicator
- [x] Status indicators: `New` (not yet viewed), `Viewed`, `Downloaded`
- [x] Inline PDF viewer using `react-pdf` (renders inside page, no download required to view)
- [x] Inline image viewer with zoom controls
- [x] Download button generates fresh signed URL, triggers browser download
- [x] Search documents by name/keyword
- [x] Filter by category, upload date range
- [x] Sort by: newest, oldest, category, name

### Watermarking
- [x] Overlay client name + timestamp watermark on viewed PDFs (CSS overlay or server-side stamp)
- [x] Watermark applies in inline viewer and on printed pages

### Access Audit Log (Admin View)
- [x] Per-document access history: user, action (viewed/downloaded), timestamp, IP
- [x] Sortable, filterable log table in admin portal document section
- [x] Highlight documents never accessed by client

---

## Commit

**Message:** `chore(phase-06): complete Phase 6 — Document Vault`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-06): complete Phase 6 — Document Vault"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
