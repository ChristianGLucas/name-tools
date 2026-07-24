// Shared bounds, parse-full-name bridge, and deterministic glue
// (capitalization normalization, formatting, initials, a person-vs-non-
// person heuristic, and name comparison) for the name-tools nodes. Not a
// node and not a test file, so it is neither registered nor collected by
// jest.
//
// The algorithmically hard part — splitting an arbitrary, ambiguous full-
// name string into title/first/middle/last/nick/suffix components — is
// entirely owned by parse-full-name; nothing here re-implements that.
// What lives here is: (a) a raw-object <-> proto bridge, (b) a small,
// deterministic, name-particle-aware capitalization normalizer (Mc/Mac/O'/
// van-der-von connectors) that the library does not itself apply generally,
// and (c) format/initials/likelihood/compare glue built on top of the
// library's own parsed components. Payload size is the platform's job, not
// this package's — no node here imposes a length cap on the input string.

import { parseFullName, RawParsedName } from 'parse-full-name';
import { ParsedName } from '../gen/messages_pb';

export function errorMessage(e: unknown, context: string): string {
  if (e instanceof Error) {
    return `${context}: ${e.message}`;
  }
  return `${context}: ${String(e)}`;
}

export interface ParseOptions {
  fixCase?: boolean;
  extendedLists?: boolean;
}

/** Runs parse-full-name with our fixed calling convention: always request
 * the full object, always non-throwing (ambiguities collect into `.error`),
 * and map our `fixCase` semantics onto the library's three-state parameter:
 * `false`/unset (our default) -> pass `undefined` to the library, which
 * auto-detects (fixes only all-upper/all-lower input); `true` -> pass
 * `true`, which always case-fixes. We never expose the library's third
 * state ("never fix, not even auto-detected all-caps input") since it has
 * no useful meaning as a public option here. */
export function rawParse(name: string, opts: ParseOptions = {}): RawParsedName {
  return parseFullName(
    name,
    undefined,
    opts.fixCase === true ? true : undefined,
    false,
    opts.extendedLists === true
  );
}

/** Converts parse-full-name's raw object into our canonical ParsedName
 * proto message. The library's own `error` array holds non-fatal parse
 * ambiguities (e.g. "2 middle names found") — mapped to `warnings`, never
 * to our `error` field, which is reserved for our own hard failures. */
export function toParsedNameMessage(raw: RawParsedName, original: string): ParsedName {
  const out = new ParsedName();
  out.setTitle(raw.title || '');
  out.setFirst(raw.first || '');
  out.setMiddle(raw.middle || '');
  out.setLast(raw.last || '');
  out.setNick(raw.nick || '');
  out.setSuffix(raw.suffix || '');
  out.setOriginal(original);
  out.setWarningsList(raw.error || []);
  return out;
}

function firstAlphaChar(s: string): string | null {
  const m = s.match(/[A-Za-z]/);
  return m ? m[0] : null;
}

// --- Capitalization normalization -----------------------------------------

// Curated common Scottish/Irish "Mac"-prefixed clan surnames. Used to
// disambiguate the "Mac + Capital" pattern from ordinary words that merely
// start with "mac" (Machine, Macro, Macaroni, Mace, Macy, Machination).
// "Mc" needs no such list — "Mc" is virtually always the clan prefix and
// essentially never the start of an ordinary English word. Not exhaustive;
// a documented, deterministic, testable limitation rather than a blanket
// heuristic that would mis-capitalize common words.
const MAC_SURNAMES = new Set([
  'macarthur', 'macbride', 'macdonald', 'macdougall', 'macfarlane',
  'macgregor', 'macintosh', 'macintyre', 'mackay', 'mackenzie',
  'mackinnon', 'maclean', 'macleod', 'macmillan', 'macneil', 'macpherson',
  'macqueen', 'macrae', 'macallister', 'macalister', 'maccormack',
  'maccarthy', 'macgowan', 'macgraw', 'mackie', 'macklin', 'maclachlan',
  'maclaren', 'macmahon', 'macnab', 'macnamara', 'macnaughton', 'macphail',
  'macray', 'macwilliam', 'macadam', 'maccabe', 'macewan', 'macfadyen',
]);

// Surname/given-name particles that stay lowercase wherever they appear in
// a personal name, matching established name-formatting convention
// (Ludwig van Beethoven, Vincent van Gogh, Charles de Gaulle) — this is a
// name normalizer, not sentence-case, so no position-based exception.
const LOWERCASE_PARTICLES = new Set([
  'van', 'von', 'der', 'den', 'de', 'la', 'le', 'di', 'du', 'da', 'dos',
  'das', 'af', 'av', 'ter', 'ten', 'vel', 'zu', 'y', 'e',
]);

// Roman-numeral / degree-style suffix tokens kept fully upper.
const UPPER_TOKENS = new Set(['ii', 'iii', 'iv', 'v', 'vi', 'md', 'phd', 'llb', 'llm']);

function capitalizeSegment(seg: string): string {
  if (!seg) return seg;
  return seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase();
}

function capitalizeWord(word: string): string {
  if (!word) return word;
  const lower = word.toLowerCase();
  const bareLower = lower.replace(/\.$/, '');

  if (UPPER_TOKENS.has(bareLower)) return lower.toUpperCase();
  // Particle check MUST run before the single-letter-initial check below:
  // two entries in LOWERCASE_PARTICLES ("y", "e") are themselves a single
  // bare letter (Spanish "y" / Portuguese "e", as in "Ortega y Gasset"),
  // and checking length first would always uppercase them as if they were
  // an initial. A real initial always keeps ITS distinguishing period
  // ("Y." / "E."), which is not in this set (only bare "y"/"e" are), so
  // there is no ambiguity between the two in practice.
  if (LOWERCASE_PARTICLES.has(lower)) return lower;

  const bare = word.replace(/\.$/, '');
  if (bare.length === 1) {
    return bare.toUpperCase() + (word.endsWith('.') ? '.' : '');
  }

  if (lower.length > 2 && lower.startsWith('mc')) {
    return 'Mc' + capitalizeSegment(word.slice(2));
  }
  if (lower.length > 3 && lower.startsWith('mac') && MAC_SURNAMES.has(lower)) {
    return 'Mac' + capitalizeSegment(word.slice(3));
  }
  if (/^o['’]/i.test(word)) {
    const aposIdx = word.indexOf("'") > -1 ? word.indexOf("'") : word.indexOf('’');
    return 'O' + word.charAt(aposIdx) + capitalizeSegment(word.slice(aposIdx + 1));
  }
  if (word.includes("'") || word.includes('’')) {
    const aposChar = word.includes("'") ? "'" : '’';
    return word.split(aposChar).map(capitalizeSegment).join(aposChar);
  }
  return capitalizeSegment(word);
}

/** Re-cases a name string using name-particle capitalization rules: Mc/Mac
 * clan prefixes, O'-prefixed surnames, van/von/der/de/la/le-style connector
 * particles (kept lowercase), and Title Case elsewhere. Hyphenated
 * compounds (Smith-Jones) are capitalized per hyphen-segment. Deterministic
 * and idempotent — normalizing an already-normalized name returns it
 * unchanged. */
export function normalizeNameCapitalization(name: string): string {
  const tokens = name.split(/(\s+)/); // keep whitespace runs as their own tokens
  return tokens
    .map((tok) => {
      if (tok === '' || /^\s+$/.test(tok)) return tok;
      if (tok.includes('-')) {
        return tok.split('-').map(capitalizeWord).join('-');
      }
      return capitalizeWord(tok);
    })
    .join('');
}

// --- Formatting -------------------------------------------------------------

function joinNonEmpty(parts: string[]): string {
  return parts.filter((s) => s && s.length > 0).join(' ');
}

/** Formats parsed name components into one of a fixed set of orders. An
 * unrecognized or empty `order` falls back to "first_last". Empty
 * components (and their separators) are omitted, never left as stray
 * punctuation/whitespace. */
export function buildFormattedName(p: RawParsedName, order: string): string {
  const first = p.first || '';
  const middle = p.middle || '';
  const last = p.last || '';
  const title = p.title || '';
  const suffix = p.suffix || '';
  const firstMiddleWord = middle ? middle.split(/\s+/)[0] : '';
  const middleInitialChar = firstMiddleWord ? firstAlphaChar(firstMiddleWord) : null;
  const middleInitial = middleInitialChar ? `${middleInitialChar.toUpperCase()}.` : '';

  switch (order) {
    case 'last_first':
      return joinNonEmpty([last, first]);
    case 'last_comma_first': {
      const rest = joinNonEmpty([first, middle]);
      if (last && rest) return `${last}, ${rest}`;
      return last || rest;
    }
    case 'first_middle_last':
      return joinNonEmpty([first, middle, last]);
    case 'first_initial_last':
      return joinNonEmpty([first, middleInitial, last]);
    case 'formal': {
      const core = joinNonEmpty([title, first, middle, last]);
      if (suffix) return core ? `${core}, ${suffix}` : suffix;
      return core;
    }
    case 'first_last':
    default:
      return joinNonEmpty([first, last]);
  }
}

// --- Initials -----------------------------------------------------------

export interface InitialsOptions {
  separator?: string;
  includeMiddle?: boolean;
}

/** Extracts one initial per first/middle-name-word/last, e.g.
 * "John Q. Public" -> "JQP" (default separator ""). `includeMiddle`
 * (default true) controls whether middle-name initials are included;
 * multiple middle names each contribute their own initial. The (possibly
 * multi-word, e.g. "van der Berg") last name contributes a single initial
 * from its first letter, since it is one family-name unit. */
export function computeInitials(p: RawParsedName, opts: InitialsOptions = {}): string {
  const sep = opts.separator ?? '';
  const includeMiddle = opts.includeMiddle !== false;
  const letters: string[] = [];

  if (p.first) {
    const c = firstAlphaChar(p.first);
    if (c) letters.push(c.toUpperCase());
  }
  if (includeMiddle && p.middle) {
    for (const word of p.middle.split(/\s+/).filter(Boolean)) {
      const c = firstAlphaChar(word);
      if (c) letters.push(c.toUpperCase());
    }
  }
  if (p.last) {
    const c = firstAlphaChar(p.last);
    if (c) letters.push(c.toUpperCase());
  }
  return letters.join(sep);
}

// --- Person-name likelihood --------------------------------------------

const ORG_KEYWORDS = new Set([
  'inc', 'llc', 'ltd', 'corp', 'corporation', 'co', 'company', 'gmbh',
  'plc', 'llp', 'group', 'holdings', 'foundation', 'association',
  'university', 'college', 'department', 'dept', 'agency', 'bureau',
  'committee', 'council', 'ministry', 'office', 'bank', 'trust',
  'partners', 'partnership', 'enterprises', 'industries', 'solutions',
  'services', 'systems', 'technologies', 'associates', 'institute',
  'society', 'organization', 'org', 'church', 'authority', 'union',
]);

const PLACEHOLDER_VALUES = new Set([
  'n/a', 'na', 'none', 'unknown', 'test', 'testing', 'sample', 'xxx',
  'null', 'undefined', 'anonymous', 'anon', 'tbd', 'nil', 'blank',
]);

export interface PersonLikelihood {
  isLikely: boolean;
  confidence: number;
  reasons: string[];
}

/** Heuristically judges whether `raw` plausibly represents a human personal
 * name, as opposed to an organization name, placeholder, or garbage
 * string. Deterministic and bounded — a fixed set of signals (legal-entity
 * keywords, placeholder values, digit density, email/URL shape, token
 * count), not a statistical or ML model. `confidence` is a relative
 * ranking signal, not a calibrated probability. */
export function assessPersonNameLikelihood(raw: string): PersonLikelihood {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { isLikely: false, confidence: 0.95, reasons: ['empty input'] };
  }

  const normalizedWhole = trimmed.toLowerCase().replace(/[.,]/g, '');
  if (PLACEHOLDER_VALUES.has(normalizedWhole)) {
    return { isLikely: false, confidence: 0.95, reasons: [`matches placeholder value: "${trimmed}"`] };
  }

  const reasons: string[] = [];

  const digitCount = (trimmed.match(/\d/g) || []).length;
  if (digitCount > 0 && digitCount / trimmed.length > 0.3) {
    reasons.push('more than 30% digit characters');
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const lowerTokens = tokens.map((t) => t.toLowerCase().replace(/[.,]/g, ''));
  const foundKeyword = [...ORG_KEYWORDS].find((kw) => lowerTokens.includes(kw));
  if (foundKeyword) {
    reasons.push(`contains legal-entity/organization keyword: "${foundKeyword}"`);
  }

  if (/@/.test(trimmed) || /https?:\/\//i.test(trimmed) || /\.(com|org|net|io|gov|edu)\b/i.test(trimmed)) {
    reasons.push('looks like an email address or URL');
  }

  const alphaTokenCount = tokens.filter((t) => /[A-Za-z]/.test(t)).length;
  if (alphaTokenCount === 0) {
    reasons.push('no alphabetic tokens');
  }

  if (tokens.length > 8) {
    reasons.push('more than 8 words (unusual for a personal name)');
  }

  const negativeSignalCount = reasons.length;
  const isLikely = negativeSignalCount === 0 && alphaTokenCount > 0 && tokens.length <= 8;

  let confidence: number;
  if (!isLikely) {
    confidence = Math.min(0.95, 0.5 + 0.15 * negativeSignalCount);
  } else {
    reasons.push(`matches personal-name shape (${tokens.length} word token(s), alphabetic, no organization/placeholder signals)`);
    confidence = tokens.length >= 1 && tokens.length <= 4 ? 0.85 : 0.6;
  }

  return { isLikely, confidence, reasons };
}

// --- Comparison -----------------------------------------------------------

export interface NameComparisonResult {
  matchLevel: 'exact' | 'likely' | 'partial' | 'no_match';
  score: number;
  matchedFields: string[];
}

/** Compares two parsed names by normalizing and comparing last/first
 * components. Deterministic and component-based: does NOT consult any
 * nickname-equivalence dictionary, so "Bob" will not match "Robert" unless
 * one string literally contains the other as a first name or initial.
 * - "exact": normalized last AND first both match.
 * - "likely": normalized last matches, and first names are compatible via
 *   a literal initial (one side is a single letter matching the other's
 *   first letter).
 * - "partial": only last OR only first matches.
 * - "no_match": neither matches. */
export function compareParsedNames(a: RawParsedName, b: RawParsedName): NameComparisonResult {
  const norm = (s: string) => normalizeNameCapitalization((s || '').trim()).toLowerCase();

  const lastA = norm(a.last);
  const lastB = norm(b.last);
  const firstA = norm(a.first);
  const firstB = norm(b.first);

  const matchedFields: string[] = [];
  const lastMatch = !!lastA && lastA === lastB;
  if (lastMatch) matchedFields.push('last');

  let firstMatch = false;
  let firstInitialMatch = false;
  if (firstA && firstB) {
    if (firstA === firstB) {
      firstMatch = true;
      matchedFields.push('first');
    } else if (
      // .replace strips a trailing period so a parsed initial like "J."
      // (length 2) is still recognized as a bare single-letter initial.
      firstA.charAt(0) === firstB.charAt(0) &&
      (firstA.replace(/\.$/, '').length === 1 || firstB.replace(/\.$/, '').length === 1)
    ) {
      firstInitialMatch = true;
      matchedFields.push('first_initial');
    }
  }

  let matchLevel: NameComparisonResult['matchLevel'];
  let score: number;
  if (lastMatch && firstMatch) {
    matchLevel = 'exact';
    score = 1.0;
  } else if (lastMatch && firstInitialMatch) {
    matchLevel = 'likely';
    score = 0.75;
  } else if (lastMatch || firstMatch) {
    matchLevel = 'partial';
    score = 0.4;
  } else {
    matchLevel = 'no_match';
    score = 0.0;
  }

  return { matchLevel, score, matchedFields };
}
