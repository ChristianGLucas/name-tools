import { NameInput } from '../gen/messages_pb';
import { normalizeCapitalization } from './normalize_capitalization';
import { ctx } from './testkit';
import { MAX_NAME_CHARS } from './lib';

function run(name: string) {
  const input = new NameInput();
  input.setName(name);
  return normalizeCapitalization(ctx, input);
}

describe('NormalizeCapitalization', () => {
  // INDEPENDENT ORACLE: well-established, real-world surname-capitalization
  // conventions (Mc/Mac clan prefixes, O'-prefixed Irish surnames, lowercase
  // van/de/der connector particles), independently known facts about
  // English personal-name orthography — not derived from this package's own
  // code, and matching the exact examples the package was commissioned to
  // handle correctly (not naive Title Case).
  it('capitalizes Mc-prefixed surnames', () => {
    expect(run('mcdonald').getValue()).toBe('McDonald');
    expect(run('MCDONALD').getValue()).toBe('McDonald');
  });

  it('capitalizes O\'-prefixed surnames', () => {
    expect(run("o'brien").getValue()).toBe("O'Brien");
    expect(run("O'BRIEN").getValue()).toBe("O'Brien");
  });

  it('keeps connector particles lowercase mid-name', () => {
    expect(run('VAN DER BERG').getValue()).toBe('van der Berg');
    expect(run('ludwig van beethoven').getValue()).toBe('Ludwig van Beethoven');
    expect(run('CHARLES DE GAULLE').getValue()).toBe('Charles de Gaulle');
  });

  it('capitalizes curated Mac-clan surnames', () => {
    expect(run('macleod').getValue()).toBe('MacLeod');
    expect(run('robert macleod').getValue()).toBe('Robert MacLeod');
  });

  it('does not mis-capitalize ordinary words that start with "mac"', () => {
    // Documented heuristic limitation guard: only the curated clan-surname
    // list gets the Mac+Capital treatment, so common words are unaffected.
    expect(run('machine').getValue()).toBe('Machine');
    expect(run('macy').getValue()).toBe('Macy');
  });

  it('handles hyphenated compounds per hyphen-segment', () => {
    expect(run('smith-jones').getValue()).toBe('Smith-Jones');
  });

  it('is idempotent: normalizing an already-normalized name is a no-op', () => {
    const once = run('mcdonald').getValue();
    const twice = run(once).getValue();
    expect(twice).toBe(once);
  });

  it('found=false, not an error, on empty/whitespace-only input', () => {
    const r = run('   ');
    expect(r.getError()).toBe('');
    expect(r.getFound()).toBe(false);
  });

  it('rejects oversized input as a structured error', () => {
    const r = run('A'.repeat(MAX_NAME_CHARS + 1));
    expect(r.getError()).toContain('exceeds');
  });
});
