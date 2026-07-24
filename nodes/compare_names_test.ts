import { CompareNamesInput } from '../gen/messages_pb';
import { compareNames } from './compare_names';
import { ctx } from './testkit';

function run(a: string, b: string) {
  const input = new CompareNamesInput();
  input.setNameA(a);
  input.setNameB(b);
  return compareNames(ctx, input);
}

describe('CompareNames', () => {
  // INDEPENDENT ORACLE: hand-derived expected match level for each pair,
  // reasoned from the documented rules (last+first match -> exact; last +
  // initial-compatible first -> likely; only one component -> partial;
  // neither -> no_match), not from running this package's comparator.
  it('identical names -> exact', () => {
    const r = run('Jane Public', 'Jane Public');
    expect(r.getMatchLevel()).toBe('exact');
    expect(r.getScore()).toBe(1.0);
  });

  it('same name, different case/order -> exact', () => {
    const r = run('Jane Public', 'PUBLIC, JANE');
    expect(r.getMatchLevel()).toBe('exact');
  });

  it('last matches, first is an initial of the other -> likely', () => {
    const r = run('J. Public', 'Jane Public');
    expect(r.getMatchLevel()).toBe('likely');
    expect(r.getMatchedFieldsList()).toContain('last');
    expect(r.getMatchedFieldsList()).toContain('first_initial');
  });

  it('only last name matches -> partial', () => {
    const r = run('Jane Public', 'John Public');
    expect(r.getMatchLevel()).toBe('partial');
  });

  it('only first name matches -> partial', () => {
    const r = run('Jane Public', 'Jane Anderson');
    expect(r.getMatchLevel()).toBe('partial');
  });

  it('completely different names -> no_match', () => {
    const r = run('Jane Public', 'Robert Smith');
    expect(r.getMatchLevel()).toBe('no_match');
    expect(r.getScore()).toBe(0);
  });

  it('does NOT resolve nickname equivalence (documented limitation)', () => {
    const r = run('Bob Smith', 'Robert Smith');
    // "Bob" and "Robert" are unrelated as literal strings/initials, so this
    // is only a last-name partial match, not "likely"/"exact" — proves the
    // package is honest about not consulting a nickname dictionary.
    expect(r.getMatchLevel()).toBe('partial');
  });

  it('returns both parsed breakdowns', () => {
    const r = run('Jane Public', 'John Public');
    expect(r.getParsedA()?.getFirst()).toBe('Jane');
    expect(r.getParsedB()?.getFirst()).toBe('John');
  });

  it('errors when both inputs are empty', () => {
    const r = run('', '');
    expect(r.getError()).toContain('empty');
  });

  it('handles a large name_a without crashing (no payload-length cap)', () => {
    const r = run('A'.repeat(2000), 'Jane Public');
    expect(r.getError()).toBe('');
  });

  it('handles a large name_b without crashing (no payload-length cap)', () => {
    const r = run('Jane Public', 'A'.repeat(2000));
    expect(r.getError()).toBe('');
  });
});
