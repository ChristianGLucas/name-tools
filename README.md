# name-tools

Composable Axiom nodes for deterministic parsing, formatting, and normalization of human personal
names, wrapping [parse-full-name](https://www.npmjs.com/package/parse-full-name) (MIT, zero runtime
dependencies) — which owns the hard, ambiguous parsing problem via its configurable
title/prefix/suffix catalogs and tolerant format detection.

Built for the [Axiom](https://axiomide.com) marketplace, published under the `christiangeorgelucas` handle.

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
