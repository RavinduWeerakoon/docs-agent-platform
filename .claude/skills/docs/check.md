# Docs Standards Checker

Validate one `.mdx` file against this repo's structural standards and report every violation. Writing quality is `style.md`'s job; technical accuracy is `tech.md`'s.

## Usage

Read when the user asks to check, lint, or verify a doc page, or before merging any `.mdx`. If no path is given, ask which file. Read the full file once, then evaluate each rule.

## Checks

### 1. Frontmatter

- The file starts with a `---` YAML block. Missing → FAIL.
- `sidebar_position` present → OK; missing → WARN (siblings almost always set it).
- `title`, `sidebar_label`, `description`, `hide_table_of_contents` are optional. If `description` is present: under 70 or over 200 characters → WARN; starts with "This page/guide/document" → FAIL.
- Any other key → WARN (not used on this site; confirm it is intentional).

### 2. Exactly one H1, matching the page

One `# ` heading, directly after frontmatter and imports. Zero or more than one → FAIL.

### 3. Heading hierarchy

A jump of more than one level downward (H2 → H4) → FAIL, with line numbers. Going back up is fine. Ignore `#` lines inside fenced code blocks.

### 4. Code blocks

Every opening fence needs a language tag (` ```bash `, `yaml`, `json`, `python`, `go`, `ts`, `text`, `mermaid`, ...). Unlabeled → WARN with line number. New blocks always need one; retrofitting untouched old blocks is out of scope.

Commands the reader runs should be copy-pasteable: no leading `$ ` prompt inside a `bash` block unless output is shown in the same block → WARN.

### 5. Nested list indentation

A sub-list under a list item must be indented so its marker lines up with the parent item's text (4 spaces under `1. ` or `- ` is safe). 1 to 3 spaces of indentation for a nested marker often renders as a flat paragraph in MDX → FAIL, with line numbers.

### 6. Ordered vs. unordered lists

Actions the reader performs in sequence must be a numbered list. Bullets are for unordered sets: options, prerequisites, properties. A bulleted sequence of imperative steps → FAIL.

### 7. Internal links

- Links to other docs are **relative file paths with the `.mdx` extension** (`./register-mcp-proxy.mdx`, `../concepts/gateway.mdx`, `./gateway.mdx#how-the-egress-gateway-is-selected`). Docusaurus resolves these at build time and they stay correct across versions.
- An absolute site path (`/docs/...`, `/next/...`, `/v1.0.0/...`, `/latest/...`) or a full URL to this docs site for an internal page → FAIL.
- A relative link without `.mdx` → WARN (works only by URL resolution and breaks easily).
- The only reliable link check is the build: `npm run build` (`onBrokenLinks: 'throw'`). Do not mark link fixes done without it.

### 8. Images

- Every image has descriptive alt text. `![](...)` → WARN.
- Image paths are relative and point at a file that exists under `docs/img/` (for `docs/`) or the matching `versioned_docs/version-<v>/img/`. Missing file → FAIL:
    ```bash
    grep -o '](\.\./img/[^)]*)' <file> | sed 's/^](//; s/)$//' | while read p; do [ -f "$(dirname <file>)/$p" ] || echo "missing: $p"; done
    ```

### 9. Admonitions

Only Docusaurus types: `:::note`, `:::tip`, `:::info`, `:::warning`, `:::caution`, `:::danger`. Each opened `:::` is closed. Unknown type or unclosed block → FAIL.

### 10. MDX safety

Bare `<` or `{` in prose outside code (for example `<namespace>` or `{orgName}` written as plain text) breaks MDX compilation. They must be in `inline code` or a code block → FAIL, with line numbers. Imports (`import Tabs from '@theme/Tabs';`, partials from `./_partials/...`) must be used, and every used component must be imported → FAIL otherwise.

### 11. Sidebar registration and placement

Every page (except partials under `_partials/` and files starting with `_`) must be referenced in `sidebars.ts` (for `docs/`) or `versioned_sidebars/version-<v>-sidebars.json` (for a snapshot). The doc ID is the path relative to `docs/` (or `versioned_docs/version-<v>/`) without `.mdx`.

```bash
grep -n "'<doc-id>'" sidebars.ts
```

No match → FAIL.

**Placement** (judgment, WARN only): does the category match the page's folder, topic, and type? If clearly wrong (an installation guide under "Agent Identity and Access Management"), propose a better section → category → position as a suggestion.

### 12. Generated pages

If the file is under `docs/reference/helm-charts/` and the diff touches it by hand → FAIL: these are generated (see `source.md` → Generated content).

### 13. Versioned docs

If the file is under `versioned_docs/`:
- Links and images must resolve inside that version's folder.
- The content must describe the product at that version's tag, not `main`. Flag any wording about a feature added after the release → WARN, for `tech.md` to verify.

## Output format

```text
Checking: docs/guides/register-mcp-proxy.mdx

FRONTMATTER
  ✅  sidebar_position: 6

HEADINGS
  ✅  single H1, hierarchy sequential

CODE BLOCKS
  ⚠️   line 88: unlabeled code block

LISTS
  ❌  line 54: bulleted list describes sequential steps; use a numbered list

INTERNAL LINKS
  ❌  line 17: absolute link /next/concepts/gateway; use ../concepts/gateway.mdx

IMAGES
  ✅  all images have alt text and exist

MDX SAFETY
  ✅  no bare < or { in prose

SIDEBAR
  ✅  guides/register-mcp-proxy registered (Guides → Platform Administration)

─────────────────────────────────────
2 failures · 1 warning
```

If everything passes, end with `✅  All checks passed`.
