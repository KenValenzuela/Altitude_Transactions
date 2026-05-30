# MCP Development Tooling Plan

**Project:** Altitude Transactions  
**Date:** 2026-05-30

---

## Current MCP Configuration

No `.mcp.json` is present in the repository root.  
The `.claude/settings.local.json` file configures permission allowlists for Bash commands
(uv, npm, python, pytest) but does not configure any MCP servers.

**Active MCP servers (from session context):**
- Gmail integration
- Google Calendar integration  
- Google Drive integration

These are personal/account-level MCPs connected to the Claude session, not project-level MCPs.

---

## Recommended Project-Level MCP Servers

### 1. Filesystem / Project Navigation MCP

**Purpose:** Allow Claude Code to navigate the repository efficiently without re-reading files.  
**Server:** Built-in `@modelcontextprotocol/server-filesystem`  
**Configuration:**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/kenvalenzuela/PycharmProjects/Altitude_Transactions_PT"],
      "description": "Navigate the Altitude repo — read files, list directories, search patterns"
    }
  }
}
```

**Use cases:**
- Fast file lookup without Bash
- Codebase search during development
- Architecture audit across multiple files

---

### 2. PostgreSQL MCP (Phase 3+)

**Purpose:** Inspect the production/staging database directly from Claude sessions.  
**When:** After PostgreSQL migration in Phase 3.  
**Server:** `@modelcontextprotocol/server-postgres`

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/altitude_dev"],
      "description": "Query extraction runs, audit events, and transaction state"
    }
  }
}
```

**Use cases:**
- Verify extraction metrics after a new provider integration
- Query audit events during debugging
- Check N/A exclusion logic in production data
- Inspect field confidence distributions

**Security note:** Connect to dev/staging only. Never connect to production database in development sessions.

---

### 3. GitHub MCP

**Purpose:** Manage issues, PRs, and code review workflow.  
**Server:** `@modelcontextprotocol/server-github`

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PAT}"
      },
      "description": "Create/manage GitHub issues and PRs for Altitude repo"
    }
  }
}
```

**Use cases:**
- Create issues for productionization roadmap items
- Review PRs with inline comments
- Link ADR decisions to GitHub issues

---

### 4. Playwright / Browser MCP

**Purpose:** Visual QA and screenshot regression testing.  
**Server:** `@modelcontextprotocol/server-playwright` or Playwright-based MCP  
**When:** When the frontend is running locally.

**Use cases:**
- Screenshot the dashboard after UI changes
- Verify hover states and transitions
- Test the upload → extract → review → confirm flow end-to-end visually
- Catch CSS regressions

---

### 5. Google Drive MCP (Active)

**Status:** Already connected in this Claude session.  
**Use cases:**
- Access the Altitude business plan PDF
- Access the Click-to-Complete charts
- Access the Contact Information charts
- Access the Thank You Card Tracking charts
- Cross-reference source documents during implementation

---

## What MCP Does NOT Replace

MCP servers are development and QA tools only.

| MCP Use | Does NOT Replace |
|---|---|
| Query DB for field data | Business logic in services/ |
| Screenshot UI | Automated test suite |
| Read repo files | Code review judgment |
| Access Google Drive | Source-truth documentation |
| GitHub PR workflow | Engineering decisions |

---

## Suggested `.mcp.json` (when ready)

Create at repo root: `/Users/kenvalenzuela/PycharmProjects/Altitude_Transactions_PT/.mcp.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
      "description": "Altitude repo navigation"
    }
  }
}
```

Add database and GitHub MCPs as those services come online.

---

## Notes on Current Dev Workflow

The existing `.claude/settings.local.json` already streamlines common operations:
- `uv run *` — backend test runs
- `npm run *` — frontend build/dev/lint
- `python3 *` — direct Python scripts
- `uv sync *` — dependency management

These permission allowlists are sufficient for the current Phase 1/2 development workflow.
MCP servers add value at Phase 3+ when there is a running database to query and a deployed
frontend to screenshot.
