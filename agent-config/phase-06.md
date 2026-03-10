# Phase 06 — Document Vault

**Status:** Not Started
**Estimated Duration:** 4–5 days
**Started:** —
**Completed:** —

---

## Description

Build a secure document vault with Uploadthing-powered admin uploads, inline PDF/image viewer for clients, signed URL access with 15-minute expiry, watermarking, and full access audit logging.

**Deliverable:** Secure, organized document vault with preview, download, and audit trail.

---

## Tasks

### Admin — Document Upload
- [ ] Install and configure Uploadthing (`createUploadthing()`, file routes)
- [ ] Drag-and-drop multi-file uploader component with progress bars
- [ ] Select project and category per file (11 predefined categories + custom)
- [ ] Bulk upload: assign categories to multiple files before uploading
- [ ] File validation: allowed types (PDF, PNG, JPG, DOCX, XLSX), max size (20 MB)
- [ ] Auto-generate thumbnail preview for PDF files (canvas or server-side)
- [ ] Replace/version documents: upload new version, keep old URL in history
- [ ] Delete document with confirmation (also deletes from Uploadthing storage)

### Document Categories (11 Predefined)
- [ ] Contract & Agreements
- [ ] Project Proposals
- [ ] Design Assets
- [ ] Technical Specifications
- [ ] Meeting Notes
- [ ] Invoices & Financials
- [ ] Progress Reports
- [ ] Test Reports & QA
- [ ] Deployment Guides
- [ ] Legal Documents
- [ ] Miscellaneous

### Signed URL & Access Control
- [ ] Generate 15-minute signed URLs for all document access (Uploadthing or custom signed tokens)
- [ ] Verify signed URL on download/view requests
- [ ] Block direct file URL access without valid signed token
- [ ] Track document access: record `viewed_at` and `downloaded_at` in DB per user

### Client — Document Viewer
- [ ] Document library page: grid/list toggle with animated transitions
- [ ] Each card: thumbnail preview, category badge, upload date, file size, status indicator
- [ ] Status indicators: `New` (not yet viewed), `Viewed`, `Downloaded`
- [ ] Inline PDF viewer using `react-pdf` (renders inside page, no download required to view)
- [ ] Inline image viewer with zoom controls
- [ ] Download button generates fresh signed URL, triggers browser download
- [ ] Search documents by name/keyword
- [ ] Filter by category, upload date range
- [ ] Sort by: newest, oldest, category, name

### Watermarking
- [ ] Overlay client name + timestamp watermark on viewed PDFs (CSS overlay or server-side stamp)
- [ ] Watermark applies in inline viewer and on printed pages

### Access Audit Log (Admin View)
- [ ] Per-document access history: user, action (viewed/downloaded), timestamp, IP
- [ ] Sortable, filterable log table in admin portal document section
- [ ] Highlight documents never accessed by client

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
