# Frontend Skills

Reusable AI agent skills for frontend teams. Compatible with the universal [skills](https://github.com/vercel-labs/skills) CLI and works with Claude Code, Codex, Cursor, Copilot, Windsurf, and 40+ other agents.

## Quick start

### Claude Code

```bash
# Install all skills for Claude Code
npx skills add -a claude-code WingsDevelopment/frontend-skills

# Install globally (available across all projects)
npx skills add -g -a claude-code WingsDevelopment/frontend-skills
```

Skills are installed to `.claude/skills/` (project) or `~/.claude/skills/` (global). Claude Code automatically picks up `SKILL.md` files and uses them when relevant tasks are triggered.

### Codex (OpenAI)

```bash
# Install all skills for Codex
npx skills add -a codex WingsDevelopment/frontend-skills

# Install globally
npx skills add -g -a codex WingsDevelopment/frontend-skills
```

Skills are installed to `.codex/skills/` (project) or `~/.codex/skills/` (global). Codex reads `SKILL.md` files and `AGENTS.md` for routing.

### Both agents at once

```bash
# Install for both Claude Code and Codex in one command
npx skills add -a claude-code -a codex WingsDevelopment/frontend-skills

# Or install for all detected agents
npx skills add --all WingsDevelopment/frontend-skills
```

### Other options

```bash
# Install a specific skill only
npx skills add -s ui-components WingsDevelopment/frontend-skills

# Copy files instead of symlinking
npx skills add --copy WingsDevelopment/frontend-skills
```

## Available skills

| Skill | Description |
|-------|-------------|
| `ui-components` | App-specific UI component architecture and styling conventions |
| `ui-page-migration` | Migrate legacy pages with screenshot parity |
| `cell-migration` | Migrate legacy cells with parity and generic rule capture |
| `ui-tables-migration` | Migrate legacy tables with nuqs URL state and fetch-layer filtering |
| `web3-display-components` | Display-layer patterns for token/value/percentage rendering |
| `web3-robust-formatting` | Formatting/normalization with runtime-safe diagnostics |
| `react-compiler-practices` | React Compiler rules (no manual memoization by default) |
| `data-fetching-best-practice` | Fetch → Mapper → Hook → UI architecture |
| `legacy-mock-playwright` | Mock-first legacy rebuilds with Playwright coverage |
| `ui-forms-best-practice` | Provider-first forms with debounced state and mock-first migration |

## Managing skills

```bash
# List installed skills
npx skills list

# Check for updates
npx skills check

# Apply updates
npx skills update

# Remove a skill
npx skills remove <skill-name>
```

## How skills work

Each skill is a folder with a `SKILL.md` that defines when and how the agent should apply the skill. When you ask the agent to do a task (e.g., "migrate this table" or "build a deposit form"), it matches the request against installed skill descriptions and follows the guidance automatically.

Skills can reference additional files for detailed rules:

```
skills/<skill-name>/
├── SKILL.md           # Skill definition with YAML frontmatter (name + description)
├── references/        # Detailed guidance documents
├── rules/             # Rule files organized by topic
├── assets/            # Code templates and examples (optional)
└── scripts/           # Helper scripts (optional)
```

## Routing and usage

See [AGENTS.md](./AGENTS.md) for skill routing rules, trigger conditions, and cross-skill pairing recommendations.
