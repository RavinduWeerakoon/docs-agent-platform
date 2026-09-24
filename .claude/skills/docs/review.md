# Full Review

Runs a complete review of one page (whole-file mode) or of every changed doc file (diff mode), combining `check.md`, `style.md`, and `tech.md` into one report.

## Usage

Read when the user asks for a full or complete review of a page, or a review before merging a docs PR.

- **A file path is given** → whole-file mode.
- **No path, and the user says "review my changes", "review the diff", or similar** → diff mode.
- **No path and nothing changed** → ask which file.

For any page under `docs/reference/cli/`, also run the verification in `cli-reference.md`; its mismatches count as `tech.md` CRITICAL issues.

## Diff mode

Reviews every changed `.md`/`.mdx` file, including uncommitted work.

### Step 1: Base ref

Default to `main` (or `upstream/main` if the local `main` is stale and an `upstream` remote exists). Use another branch if the user names one.

```bash
BASE_REF=main
MERGE_BASE=$(git merge-base "$BASE_REF" HEAD)
```

### Step 2: Changed files

```bash
git diff --name-only --diff-filter=ACMR "$MERGE_BASE" -- '*.md' '*.mdx' ':!.claude/**' ':!.agent/**'
git status --porcelain -- '*.md' '*.mdx' | awk '$1=="??"{print $2}' | grep -v '^\.claude/'
```

Combine and de-duplicate. Also note whether `sidebars.ts` or `versioned_sidebars/*` changed; `check.md` → Sidebar applies to those edits. If the set is empty, say so and stop.

### Step 3: Build

```bash
npm run build
```

A failure here (broken link, bad doc ID, MDX compile error) is a `check.md` FAIL for the file it names.

### Step 4: Review each file, scoped to the diff

- **New file** (absent at the merge base): apply every check in full.
- **Existing file**: read `git diff -U3 "$MERGE_BASE" -- <file>` and apply the checks to changed lines and the sections containing them. Report pre-existing issues elsewhere in the file only under "Pre-existing (not blocking)", if at all.
- **Generated file** (`docs/reference/helm-charts/`): report it as hand-edited (see `check.md` → Generated pages) and skip the rest.

### Step 5: Report per file, then a rollup

Use the combined format below once per file, headed `Reviewing diff: <path> (vs <base ref>, includes uncommitted changes)`, then a final rollup: files reviewed, totals, overall PASS/FAIL.

Also list, for each changed page in `docs/`, whether a copy exists in `versioned_docs/` that may need the same fix (do not edit it; `edit.md` → Versions explains when it applies).

## Review sequence

Run each fully, in order, before writing the report:

1. `check.md`: frontmatter, headings, code blocks, lists, links, images, admonitions, MDX safety, sidebar.
2. `style.md`: terminology, voice, formatting, AI patterns, specificity, page-type rules.
3. `tech.md`: every technical claim against `wso2/agent-manager` at the right ref (read `source.md` first).
4. `cli-reference.md` when the page is under `docs/reference/cli/`.

## Combined output

```text
Reviewing: <path>
Page type: <type>
Verified against: wso2/agent-manager @ <ref> (<short sha>)

─────────────────────────────────────
CHECK
<failures and warnings only>

STYLE
<findings only>

TECH
<findings, plus the category coverage summary>

─────────────────────────────────────
OVERALL RESULT: PASS / FAIL
Confidence: High / Medium / Low
Hard gate failures: <n> (<which reference>)
Failures: <n>
Warnings: <n>
```

## Confidence

- **High**: every reference passes with at most two low-severity warnings.
- **Medium**: non-gating failures or warnings remain, or some claims are UNVERIFIED.
- **Low**: any hard gate failed.

## Hard gates

The overall review FAILS if any of these hold:

- `check.md`: any FAIL, including a failed `npm run build`.
- `style.md`: 5 or more AI-vocabulary occurrences; any templated rhetorical pivot; 2 or more symmetric contrasts.
- `tech.md` (and `cli-reference.md`): any CRITICAL; 3 or more HIGH; an example UNVERIFIED without reason; an unconfirmed security claim; an unresolved cross-page contradiction; a CRITICAL or HIGH verdict based on memory rather than source.
