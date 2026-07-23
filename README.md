# name-tools

Composable Axiom nodes for deterministic parsing, formatting, and normalization of human personal
names, wrapping [parse-full-name](https://www.npmjs.com/package/parse-full-name) (MIT, zero runtime
dependencies) — which owns the hard, ambiguous parsing problem via its configurable
title/prefix/suffix catalogs and tolerant format detection.

Built for the [Axiom](https://axiomide.com) marketplace, published under the `christiangeorgelucas` handle.

## Use it from your agent or app

Every node in this package is a **live, auto-scaling API endpoint** on the
[Axiom](https://axiomide.com) marketplace — call it from an AI agent or your own
code, with nothing to self-host.

**📦 See it on the marketplace:**
https://dev.axiomide.com/marketplace/christiangeorgelucas/name-tools@0.1.0

**Hook it up to an AI agent (MCP).** Add Axiom's hosted MCP server to any MCP
client and every node becomes a typed tool your agent can call — search the
catalog, inspect a schema, and invoke it directly.

```bash
# Claude Code
claude mcp add --transport http axiom https://api.axiomide.com/mcp \
  --header "Authorization: Bearer $AXIOM_API_KEY"
```

Claude Desktop, Cursor, or any config-based client:

```json
{
  "mcpServers": {
    "axiom": {
      "type": "http",
      "url": "https://api.axiomide.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_AXIOM_API_KEY" }
    }
  }
}
```

**Call it from the CLI.**

```bash
axiom invoke christiangeorgelucas/name-tools/ParseName --input '{ ... }'
```

**Call it over HTTP.**

```bash
curl -X POST https://api.axiomide.com/invocations/v1/nodes/christiangeorgelucas/name-tools/0.1.0/ParseName \
  -H "Authorization: Bearer $AXIOM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ ... }'
```

> Input/output schema for each node is on the marketplace page above, or via
> `axiom inspect node christiangeorgelucas/name-tools/ParseName`.

### Get started free

Install the CLI:

```bash
# macOS / Linux — Homebrew
brew install axiomide/tap/axiom

# macOS / Linux — install script
curl -fsSL https://raw.githubusercontent.com/AxiomIDE/axiom-releases/main/install.sh | sh
```

**Windows:** download the `windows/amd64` `.zip` from the
[releases page](https://github.com/AxiomIDE/axiom-releases/releases), unzip it,
and put `axiom.exe` on your `PATH`.

Then `axiom version` to verify, `axiom login` (GitHub or Google) to authenticate,
and create an API key under **Console → API Keys**. Docs and sign-up at
**[axiomide.com](https://axiomide.com)**.

## What's here

Every node is a pure, stateless, deterministic function: a name string (or structured components) in,
a structured result out. Oversized input (over 500 characters) is rejected with a structured error,
never a crash.

- `ParseName` — split a full name string in any order/format ("Dr. John Q. Public Jr.", "Smith, Jane")
  into title/first/middle/last/nickname/suffix components.
- `FormatName` — format structured components (or a raw string, parsed internally) into a chosen
  order: `first_last`, `last_first`, `last_comma_first`, `first_middle_last`, `first_initial_last`,
  `formal`.
- `ExtractFirstName` / `ExtractLastName` — pull just the given or family name out of a full name string.
- `ExtractInitials` — e.g. "John Q. Public" -> "JQP", with a configurable separator.
- `NormalizeCapitalization` — correct surname capitalization using name-particle rules (McDonald,
  O'Brien, van der Berg, MacLeod), not naive Title Case.
- `IsLikelyPersonName` — heuristically distinguish a personal name from an organization/placeholder
  string.
- `ExtractNickname` — pull a quoted or parenthetical nickname out of a full name string.
- `CompareNames` — compare two name strings for likely-same-person by normalizing and comparing their
  parsed components.

### A documented limitation, not a silent gap

`parse-full-name`'s title catalog only matches single words, so a multi-word ABBREVIATED rank like
"Lt. Col." is never captured as one title (only "Col." would be, and "Lt." falls through into the
name itself). Single-word titles/ranks ("Dr.", "Rev.", and with `extended_lists` also "Col.", "Gen.",
"Capt.", etc.) are recognized from a wide, configurable catalog. See `ParseName`'s node description.

## License

MIT. See [LICENSE](./LICENSE).
