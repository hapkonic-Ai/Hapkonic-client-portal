# Hapkonic Client Portal — Git Commit Guide

> **Read this before every commit.** All configuration is sourced from `github-config.json`.

---

## Git Identity Setup

Before committing, always apply the correct author identity:

```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
```

**Never add** `Co-Authored-By:` lines. The `no_claude_coauthor` flag in `github-config.json` is `true`.

---

## Commit Message Format

### Per-Phase Commits
```
chore(phase-NN): complete Phase N — <Phase Title>
```

Examples:
```
chore(phase-01): complete Phase 1 — Project Scaffolding & Design System
chore(phase-02): complete Phase 2 — Database Schema & API Foundation
chore(phase-03): complete Phase 3 — Hapkonic Admin Portal
```

### Planning / Meta Commits
```
chore(planning): <short description>
```

Example:
```
chore(planning): initialize project phase tracking system
```

### Feature Commits (within a phase)
```
feat(scope): <description>
fix(scope): <description>
refactor(scope): <description>
```

---

## Step-by-Step Commit Workflow (Per Phase)

```bash
# 1. Set git identity (always do this first)
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"

# 2. Stage relevant files (be specific — avoid `git add .` for sensitive files)
git add <files or folders>

# 3. Commit — use HEREDOC to preserve formatting
git commit -m "$(cat <<'EOF'
chore(phase-NN): complete Phase N — <Phase Title>
EOF
)"

# 4. Push to remote
git push origin main

# 5. Update overall-plan.md: mark phase [x] Completed, set progress to 100%
```

---

## Phase Commit Reference Table

| Phase | Commit Message |
|-------|----------------|
| 01    | `chore(phase-01): complete Phase 1 — Project Scaffolding & Design System` |
| 02    | `chore(phase-02): complete Phase 2 — Database Schema & API Foundation` |
| 03    | `chore(phase-03): complete Phase 3 — Hapkonic Admin Portal` |
| 04    | `chore(phase-04): complete Phase 4 — Authentication System & Login Page` |
| 05    | `chore(phase-05): complete Phase 5 — Landing Page with Scroll Animations & 3D` |
| 06    | `chore(phase-06): complete Phase 6 — Document Vault` |
| 07    | `chore(phase-07): complete Phase 7 — Meeting Scheduler + Google Calendar Sync` |
| 08    | `chore(phase-08): complete Phase 8 — Interactive Gantt Chart / Roadmap` |
| 09    | `chore(phase-09): complete Phase 9 — Progress Tracker + Comments` |
| 10    | `chore(phase-10): complete Phase 10 — Historical Milestone Timeline` |
| 11    | `chore(phase-11): complete Phase 11 — Invoice Management & Payment Reminders` |
| 12    | `chore(phase-12): complete Phase 12 — Real-Time Notification System` |
| 13    | `chore(phase-13): complete Phase 13 — Search, Filtering & Global Navigation` |
| 14    | `chore(phase-14): complete Phase 14 — Mobile Responsiveness & PWA` |
| 15    | `chore(phase-15): complete Phase 15 — Security Hardening & Audit` |
| 16    | `chore(phase-16): complete Phase 16 — Analytics & Admin Dashboard` |
| 17    | `chore(phase-17): complete Phase 17 — Testing & Quality Assurance` |
| 18    | `chore(phase-18): complete Phase 18 — Deployment & DevOps` |
| 19    | `chore(phase-19): complete Phase 19 — Client Onboarding & Documentation` |
| 20    | `chore(phase-20): complete Phase 20 — Launch, Feedback & Iteration` |

---

## Post-Commit Checklist

After each phase commit:
- [ ] `git log --oneline -1` confirms correct message
- [ ] `git log --format='%an <%ae>' -1` shows `Harsh Raj A <hraj20000@gmail.com>`
- [ ] No `Co-Authored-By:` line present in `git log --format='%B' -1`
- [ ] `agent-config/overall-plan.md` updated: phase marked `[x]`, progress `100%`
- [ ] Corresponding `agent-config/phase-NN.md` status updated to `Completed`

---

## Branch Strategy

| Branch  | Purpose                          |
|---------|----------------------------------|
| `main`  | Production — all phase commits   |
| `dev`   | Active development               |

All phase completion commits go to `main` after merging from `dev`.
