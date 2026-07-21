import { ExtractInitialsInput } from '../gen/messages_pb';
import { extractInitials } from './extract_initials';
import { ctx } from './testkit';

function run(name: string, opts: { separator?: string; excludeMiddle?: boolean } = {}) {
  const input = new ExtractInitialsInput();
  input.setName(name);
  if (opts.separator !== undefined) input.setSeparator(opts.separator);
  if (opts.excludeMiddle !== undefined) input.setExcludeMiddle(opts.excludeMiddle);
  return extractInitials(ctx, input);
}

describe('ExtractInitials', () => {
  // INDEPENDENT ORACLE: initials are trivially hand-verifiable — first
  // letter of each named component.
  it('extracts JQP for "John Q. Public" (default, no separator)', () => {
    const r = run('John Q. Public');
    expect(r.getValue()).toBe('JQP');
    expect(r.getFound()).toBe(true);
  });

  it('applies a custom separator (joins BETWEEN letters, no trailing separator)', () => {
    const r = run('John Q. Public', { separator: '. ' });
    expect(r.getValue()).toBe('J. Q. P');
  });

  it('excludes the middle initial when exclude_middle is set', () => {
    const r = run('John Q. Public', { excludeMiddle: true });
    expect(r.getValue()).toBe('JP');
  });

  it('includes middle initials by default (exclude_middle unset -> false)', () => {
    const r = run('John Quincy Adams Public');
    // first=John, middle="Quincy Adams" (2 middle names, each contributes
    // an initial), last=Public.
    expect(r.getValue()).toBe('JQAP');
  });

  it('handles a multi-word last name as a single initial', () => {
    const r = run('Ludwig van der Berg');
    expect(r.getValue()).toBe('LV'); // first=Ludwig(L), last="van der Berg"(V)
  });

  it('found=false, not an error, on unparseable input', () => {
    const r = run('');
    expect(r.getError()).toBe('');
    expect(r.getFound()).toBe(false);
  });
});
