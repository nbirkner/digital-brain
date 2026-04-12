# connect-mcps: Building CLI Wrappers

How to build a bash CLI wrapper for a tool that has a REST or GraphQL API. This is the preferred integration method — CLIs have zero session overhead vs MCPs (~28K tokens injected at every session start).

## When to Build a CLI

Build a CLI if ALL of these are true:
- Tool has a public REST or GraphQL API
- API supports API key auth (not OAuth-only)
- The token can be stored in `~/.claude/settings.json` env vars

## Step 1: Find the Token

The token should already live in `~/.claude/settings.json` under `env`:

```json
{
  "env": {
    "LINEAR_API_KEY": "lin_api_...",
    "NOTION_WORK_TOKEN": "secret_...",
    "READWISE_API_KEY": "..."
  }
}
```

Ask the user to add the token there if it's not already present. **Never hardcode tokens in scripts.**

## Step 2: Find the API Endpoint

Web search: "[tool name] REST API documentation" or "[tool name] GraphQL API"

Key things to identify:
- Base URL (e.g., `https://api.linear.app/graphql`)
- Authentication header format (e.g., `Authorization: Bearer $TOKEN` or `Authorization: Token $TOKEN` — **no Bearer prefix** for some APIs like Linear)
- Key endpoints you'll need (list items, create item, search)

## Step 3: Build the Wrapper

Install location: `~/.local/bin/<toolname>` (must be in PATH; `~/.local/bin` is standard on macOS with zsh)

### Bash Template (REST API)

```bash
#!/usr/bin/env bash
# ~/.local/bin/<toolname>
# Usage: <toolname> <command> [args]

set -euo pipefail

TOKEN="${TOOLNAME_API_KEY:-}"
if [[ -z "$TOKEN" ]]; then
  echo "Error: TOOLNAME_API_KEY not set in ~/.claude/settings.json env"
  exit 1
fi

BASE_URL="https://api.tool.com/v1"

_get() {
  curl -s \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL/$1"
}

_post() {
  local endpoint="$1"; shift
  curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$1" \
    "$BASE_URL/$endpoint"
}

case "$1" in
  list)
    _get "items" | jq '.results[]'
    ;;
  get)
    _get "items/$2" | jq '.'
    ;;
  create)
    _post "items" "{\"title\": \"$2\"}" | jq '.id'
    ;;
  *)
    echo "Usage: $0 {list|get <id>|create <title>}"
    exit 1
    ;;
esac
```

### GraphQL Template (e.g., Linear)

GraphQL APIs need Python3 for JSON body construction — `jq --argjson` fails with multi-line queries on macOS bash 3.2.

```bash
#!/usr/bin/env bash
# ~/.local/bin/linear
set -euo pipefail

TOKEN="${LINEAR_API_KEY:-}"
[[ -z "$TOKEN" ]] && { echo "LINEAR_API_KEY not set"; exit 1; }

_gql() {
  python3 - "$TOKEN" "$@" <<'PYEOF'
import sys, json, urllib.request
token = sys.argv[1]
query = sys.argv[2]
variables = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
body = json.dumps({"query": query, "variables": variables}).encode()
req = urllib.request.Request(
  "https://api.linear.app/graphql",
  data=body,
  headers={"Authorization": token, "Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as r:
  print(r.read().decode())
PYEOF
}

case "$1" in
  my-issues)
    QUERY='query($userId: String!) { issues(filter: {assignee: {id: {eq: $userId}}, state: {type: {nin: ["completed","cancelled"]}}}) { nodes { id title state { name } priority } } }'
    VARS="{\"userId\": \"YOUR_USER_ID\"}"
    _gql "$QUERY" "$VARS" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"{n['id']}: {n['title']} [{n['state']['name']}]\") for n in d['data']['issues']['nodes']]"
    ;;
  *)
    echo "Usage: $0 {my-issues|...}"
    ;;
esac
```

**Critical notes for GraphQL CLIs:**
- Linear uses `Authorization: $TOKEN` with NO Bearer prefix — confirm per API
- Variable types must match GraphQL schema — use `String!` not `ID!` for user IDs unless schema says otherwise
- Use `case` statements not `declare -A` — macOS ships bash 3.2, no associative arrays

## Step 4: Make It Executable

```bash
chmod +x ~/.local/bin/<toolname>
```

Verify it's in PATH:
```bash
which <toolname>   # Should return ~/.local/bin/<toolname>
```

If not found, add to `~/.zshrc`:
```bash
export PATH="$HOME/.local/bin:$PATH"
```

## Step 5: Test It

Always test with the simplest read command before declaring success:

```bash
<toolname> list          # or my-issues, me, inbox, etc.
```

Check for:
- Valid JSON output (not an auth error)
- Data that looks right (not empty/null)
- No exit code errors

If it returns an auth error, check the authorization header format — some APIs don't use Bearer prefix.

## Step 6: Add Permission to settings.local.json

Claude needs explicit permission to run the CLI:

```json
{
  "permissions": {
    "allow": [
      "Bash(<toolname>:*)"
    ]
  }
}
```

Location: `/Users/nikibirkner/Code/Niklaude/.claude/settings.local.json`

Read the file first and merge — never overwrite the whole file.

## Step 7: Update Relevant Skills

Find which skills reference this tool (grep for the tool name) and update them to use CLI commands instead of MCP calls:

```bash
grep -r "toolname\|ToolMCP" .claude/skills/ --include="*.md" -l
```

For each skill found, replace MCP tool invocations with CLI commands. Example:

**Before (MCP):**
```
linear.create_issue({ title: "...", teamId: "..." })
```

**After (CLI):**
```bash
linear create IC "..." 2
```

## Multi-Account Separation

When a tool has work and personal accounts (e.g., Notion), build two separate wrappers with different env vars:

- `~/.local/bin/notion-work` — uses `NOTION_WORK_TOKEN`
- `~/.local/bin/notion-personal` — uses `NOTION_PERSONAL_TOKEN`

This makes cross-posting structurally impossible. The CLI wrappers enforce separation — no routing rules needed.

## Common Pitfalls

| Problem | Fix |
|---------|-----|
| `command not found` | Add `~/.local/bin` to PATH in `~/.zshrc` |
| Auth error despite valid token | Check auth header format — some APIs don't use Bearer |
| `jq: unbound variable` | Bash 3.2 compat issue — use `case` instead of `declare -A` |
| GraphQL "invalid JSON" error | Use Python3 for JSON construction, not jq --argjson |
| GraphQL type error | Check schema — user IDs may be `String!` not `ID!` |
| Output is null/empty | Check jq path — try `jq '.'` first to see raw structure |

## Real Examples Built for This Workspace

These CLIs are live and can be referenced as patterns:

| CLI | API Type | Auth | Key Commands |
|-----|----------|------|-------------|
| `notion-work` | REST | API key (no Bearer) | `search`, `query`, `fetch`, `create`, `append` |
| `notion-personal` | REST | API key (no Bearer) | `tasks`, `search`, `fetch`, `create` |
| `linear` | GraphQL | API key (no Bearer) | `my-issues`, `issue`, `create`, `search`, `projects` |
| `readwise` | REST | `Token $KEY` prefix | `search-highlights`, `search-docs`, `inbox`, `save` |

Source files: `~/.local/bin/` — read them for full implementation patterns.
