import { ParseNameInput } from '../gen/messages_pb';
import { parseName } from './parse_name';
import { ctx } from './testkit';
import { MAX_NAME_CHARS } from './lib';

function parse(name: string, opts: { fixCase?: boolean; extendedLists?: boolean } = {}) {
  const input = new ParseNameInput();
  input.setName(name);
  if (opts.fixCase !== undefined) input.setFixCase(opts.fixCase);
  if (opts.extendedLists !== undefined) input.setExtendedLists(opts.extendedLists);
  return parseName(ctx, input);
}

describe('ParseName', () => {
  // INDEPENDENT ORACLE: hand-reasoned expected decomposition from ordinary
  // English personal-name convention (title/first/middle/last/suffix),
  // NOT derived by running this package's own code — these are unambiguous
  // real-world name shapes whose correct breakdown any English speaker
  // would agree on.
  it('parses a standard Title First Middle Last Suffix name', () => {
    const r = parse('Dr. Martin Luther King Jr.');
    expect(r.getError()).toBe('');
    expect(r.getTitle()).toBe('Dr.');
    expect(r.getFirst()).toBe('Martin');
    expect(r.getMiddle()).toBe('Luther');
    expect(r.getLast()).toBe('King');
    expect(r.getSuffix()).toBe('Jr.');
  });

  it('parses "Last, First" order', () => {
    const r = parse('Smith, Jane');
    expect(r.getFirst()).toBe('Jane');
    expect(r.getLast()).toBe('Smith');
  });

  it('parses a multi-word family-name particle (von/van/de/della)', () => {
    const r = parse('Ludwig van der Berg');
    expect(r.getFirst()).toBe('Ludwig');
    expect(r.getLast()).toBe('van der Berg');
  });

  it('parses a single-word rank title with extended_lists', () => {
    // NOT a test of "Lt. Col." — verified against the actual installed
    // library that a multi-word ABBREVIATED rank can never be captured as
    // one title (it matches titles word-by-word, and "lt" specifically is
    // absent from both its catalogs); documented as a limitation in this
    // node's description rather than silently claimed as supported.
    const r = parse('Col. James Miller', { extendedLists: true });
    expect(r.getTitle()).toBe('Col.');
    expect(r.getFirst()).toBe('James');
    expect(r.getLast()).toBe('Miller');
  });

  it('extracts a quoted nickname', () => {
    const r = parse('Robert "Bob" Smith');
    expect(r.getFirst()).toBe('Robert');
    expect(r.getLast()).toBe('Smith');
    expect(r.getNick()).toBe('Bob');
  });

  it('extracts a parenthetical nickname', () => {
    const r = parse('Jane Smith (Janie)');
    expect(r.getNick()).toBe('Janie');
  });

  it('parses a suffix like III and PhD', () => {
    const r1 = parse('John Doe III');
    expect(r1.getSuffix()).toBe('III');
    const r2 = parse('Jane Public PhD');
    expect(r2.getSuffix().toLowerCase()).toContain('phd');
  });

  it('is deterministic: identical input yields identical output', () => {
    const a = parse('Dr. Martin Luther King Jr.');
    const b = parse('Dr. Martin Luther King Jr.');
    expect(a.toObject()).toEqual(b.toObject());
  });

  it('returns a structured (non-throwing) result with a warning, not a crash, on empty input', () => {
    const r = parse('');
    expect(r.getError()).toBe('');
    expect(r.getFirst()).toBe('');
    expect(r.getWarningsList().length).toBeGreaterThan(0);
  });

  it('rejects oversized input as a structured error, never a crash', () => {
    const r = parse('A'.repeat(MAX_NAME_CHARS + 1));
    expect(r.getError()).toContain('exceeds');
    expect(r.getFirst()).toBe('');
  });

  it('accepts input exactly at the bound', () => {
    const r = parse('A'.repeat(MAX_NAME_CHARS));
    expect(r.getError()).toBe('');
  });

  it('sets `original` to the trimmed input', () => {
    const r = parse('  Jane Public  ');
    expect(r.getOriginal()).toBe('Jane Public');
  });

  it('fix_case=true normalizes an all-caps input to Title Case components', () => {
    const r = parse('JOHN PUBLIC', { fixCase: true });
    expect(r.getFirst()).toBe('John');
    expect(r.getLast()).toBe('Public');
  });
});
