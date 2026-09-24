# New Doc Page Scaffold

Create a new `.mdx` page, register it in `sidebars.ts`, ground it in the Agent Manager source, and verify the site still builds. The page should be ready for content (or already contain verified content) and CI should pass with no follow-up steps.

## Usage

Read when the user asks to create, add, or write documentation for a new concept, guide, tutorial, or reference page, including "document this feature" or "write docs for X" when no existing page covers the topic. Read `source.md` first; this file assumes you have located `AM_REPO`.

## Phase 1: Collect Information

Collect everything up front. If anything is missing, ask for all of it in one message, not one question at a time.

1. **Page type**: `concept`, `guide`, `tutorial`, or `reference` (see Templates). A `get-started` page is rare; confirm with the user before creating one.
2. **Title**: used for the H1 and, if needed, `title:` frontmatter.
3. **Feature in the source repo**: the PR, issue, design proposal, or code area in `wso2/agent-manager` this page documents. If the user does not know, search for it (`source.md` → Source map) and confirm what you found. This is what the page will be verified against.
4. **File path**: under `docs/`. Infer from the type: concepts in `docs/concepts/`, guides in `docs/guides/` (or a subfolder such as `docs/guides/isolation-tiers/`), tutorials in `docs/tutorials/`, reference in `docs/reference/` (CLI pages: see `cli-reference.md`). File names are kebab-case and usually match the title (`Register an MCP Proxy` → `register-mcp-proxy.mdx`).
5. **Target versions**: new pages go in `docs/` (Next). Ask whether the feature also shipped in a released version and needs the page in `versioned_docs/version-<v>/` or in `version-cloud/`. Do not add it there unless the user confirms.

### Check for an existing page first

Before creating anything, search for a page that already covers this topic (2 or 3 significant title words, skipping generic ones like "guide" or "configure"):

```bash
grep -rli "{KEY_TERM}" docs --include='*.mdx'
grep -rn "^title:\|^# " docs --include='*.mdx' | grep -i "{KEY_TERM}"
grep -n "label:\|'[a-z-]*/" sidebars.ts | grep -i "{KEY_TERM}"
```

Read enough of each hit (H1, intro, headings) to judge genuine overlap, not a shared keyword. If a genuine match exists, stop and ask:

> I found an existing page that may already cover this: **{EXISTING_TITLE}** (`{EXISTING_PATH}`). Should I edit that page instead, or is this a genuinely different page?

**Edit existing** → stop this file and follow `edit.md`. **Different page** → continue.

## Phase 2: Gather the facts from source

Following `source.md`, read the aspect `AGENTS.md` and the implementing code for the feature. Build a short working list (not written to the page) of the facts the page needs, each with its `path:line` evidence: Console navigation and exact labels, fields and their defaults, endpoints, CLI commands, config keys, limits, error cases.

Anything the page needs that you cannot confirm from source goes into the Phase 1-style batched question in `edit.md` Step 3. Never fill a gap with a plausible guess.

## Phase 3: Create the MDX file

**Frontmatter**: this site does not use a `docType` field. Use only what the page needs:

- `sidebar_position`: include it, following siblings. Derive it:
    ```bash
    grep -h "sidebar_position:" docs/<target-dir>/*.mdx | awk '{print $2}' | sort -n | tail -1
    ```
    Use the highest value + 1, or `1` if there are none. The explicit `sidebars.ts` order is what actually controls the nav; `sidebar_position` just keeps the file consistent with its siblings.
- `title`: only when the sidebar or browser title should differ from the H1, or when siblings in the same folder use it.
- `sidebar_label`: only when the nav label should be shorter than the H1 (common in `docs/reference/cli/`).
- `description`: optional. If you add one, make it a complete sentence of roughly 70 to 200 characters that does not start with "This page/guide/document".

**Content**:
- If you verified facts in Phase 2, write them into the template now, following `edit.md` Step 4 (the style rules apply while drafting, not only at review).
- Anything still unverified stays as a literal `{PLACEHOLDER}`. Do not invent prerequisites, steps, field names, defaults, or links.
- A well-founded guess (for example, from a sibling page's structure) goes in your reply as a suggestion to confirm, never directly into the file.
- Screenshots go in `docs/img/<feature>/` and are referenced relatively (`../img/<feature>/<name>.png`) with descriptive alt text. Never invent image paths; leave `{SCREENSHOT: description}` if the user has not supplied the image.
- Diagrams use a fenced ` ```mermaid ` block (Mermaid is enabled site-wide), never ASCII art. No per-diagram `%%{init}%%` or `classDef` color overrides.

## Phase 4: Place in the sidebar

Mandatory: `docs/sidebars.ts` is explicit, so a page missing from it is unreachable from the nav. For a new version snapshot page, the equivalent file is `versioned_sidebars/version-<v>-sidebars.json`.

### Step 1: Read `sidebars.ts` in full

### Step 2: Pick the section

| File path starts with | Section |
|---|---|
| `docs/get-started/` | Get Started |
| `docs/concepts/` | Concepts |
| `docs/guides/` | Guides |
| `docs/tutorials/` | Tutorials |
| `docs/reference/` | References |

### Step 3: Pick the category (Guides and References have subcategories)

In priority order:
1. **Directory match**: the category already holds pages from the same folder (for example `guides/isolation-tiers/` → "Configure Sandboxing").
2. **Topic match**: existing Guides categories are Installation; Evaluation & Observability; Securing Agent Endpoints; Platform Administration; Agent Identity and Access Management. References has CLI, Helm Charts, and top-level pages.
3. **Reader task**: place by what the reader is doing at that moment, not a shared keyword.

If nothing fits, propose a new category shaped like the existing ones (`type: 'category'`, `label`, `collapsed: true`, `items: [...]`) and insert it in reading order, not alphabetically.

### Step 4: Position and label

- Insert after the pages this one depends on and before pages that build on it; otherwise at the end. Concepts are ordered in the sequence a reader meets them (organization → environment → project → agent → ...), not alphabetically.
- Items are usually bare doc IDs (`'guides/register-mcp-proxy'`). Use the object form only for a label that differs from the H1: `{type: 'doc', id: 'guides/register-mcp-proxy', label: 'MCP Proxies'}`.
- The doc ID is the path relative to `docs/` without `.mdx`.

### Step 5: Get approval before editing `sidebars.ts`

Present and wait for approval: section → category → position (after/before which item), the label, and the exact snippet. Revise if the user wants something else.

### Step 6: Apply the edit

Use Edit with a unique anchor (the preceding item plus enough context to be unambiguous) and insert the new entry, matching the surrounding indentation and quote style.

## Phase 5: Verify

```bash
npm run build
```

`onBrokenLinks` is `'throw'`, so this fails on any broken internal link or bad doc ID in `sidebars.ts`. It is the same check CI runs (`.github/workflows/pr-checks.yml`). If `node_modules/` is missing, run `npm ci` first. Then run `check.md` against the new file.

## Phase 6: Report

Tell the user: the file created; the sidebar entry (section → category → label) and snippet; the build result; which facts you verified and against what (`path:line @ ref`); every remaining `{PLACEHOLDER}` and what information it needs; and that `review.md` is available once content is filled in.

## Templates

Headings use Title Case, matching existing pages. Links to other docs are relative and include the `.mdx` extension.

### `concept`

Explains what something is and how it relates to the rest of the platform. No step-by-step instructions; link to the guide instead.

```mdx
---
sidebar_position: {POSITION}
---

# {TITLE}

{DEFINITION: one paragraph saying what it is, what scope it lives at (organization, project, environment), and why it exists}

## {HOW_IT_WORKS_SECTION}

{content}

## {SECOND_SECTION}

{content}

## Relationship to Other Concepts

- **[{RELATED_CONCEPT}](./{related-concept}.mdx)**: {one line on how they relate}
```

### `guide`

A task the reader performs, usually in the Console or with `amctl`. Numbered actions under `## Step N:` headings.

```mdx
---
sidebar_position: {POSITION}
---

# {TITLE}

{INTRO: one or two sentences stating the task and the outcome}

## Prerequisites

- {PREREQUISITE}

## Step 1: {IMPERATIVE_STEP_TITLE}

1. {action}
2. {action}

## Step 2: {IMPERATIVE_STEP_TITLE}

1. {action}

## Verify {THE_RESULT}

{content}

## Next Steps

- [{NEXT_PAGE_TITLE}](./{next-page}.mdx)
```

Add `## Troubleshooting` before `## Next Steps` only when you have verified failure modes to document.

### `tutorial`

An end-to-end learning path, usually built on a sample in `samples/` of the source repo.

```mdx
---
sidebar_position: {POSITION}
---

# {TITLE}

{INTRO: what the reader builds and what they learn}

## What You Will Build

{content}

## Prerequisites

- WSO2 Agent Manager installed. See the [Quick Start Guide](../get-started/quick-start.mdx).

## Step 1: {IMPERATIVE_STEP_TITLE}

{content}

## What's Next

- [{NEXT_PAGE_TITLE}]({RELATIVE_LINK})
```

### `reference`

Facts to look up, in tables. No narrative, no second person. For CLI command pages use the template in `cli-reference.md` instead; Helm chart pages are generated (see `source.md`).

```mdx
---
sidebar_position: {POSITION}
---

# {TITLE}

{ONE_LINE_SUMMARY}

## {FIRST_SECTION}

| Name | Type | Default | Description |
|------|------|---------|-------------|
| | | | |
```
