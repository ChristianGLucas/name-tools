import { NameInput } from '../gen/messages_pb';
import { isLikelyPersonName } from './is_likely_person_name';
import { ctx } from './testkit';

function run(name: string) {
  const input = new NameInput();
  input.setName(name);
  return isLikelyPersonName(ctx, input);
}

describe('IsLikelyPersonName', () => {
  // INDEPENDENT ORACLE: hand-picked, unambiguous personal-name vs.
  // organization/garbage examples any reader would agree on.
  it('accepts ordinary personal names', () => {
    expect(run('Jane Public').getIsLikelyName()).toBe(true);
    expect(run('Dr. John Q. Smith Jr.').getIsLikelyName()).toBe(true);
    expect(run("Conan O'Brien").getIsLikelyName()).toBe(true);
  });

  it('rejects organization names with legal-entity keywords', () => {
    expect(run('Acme Corp LLC').getIsLikelyName()).toBe(false);
    expect(run('Global Solutions Inc').getIsLikelyName()).toBe(false);
    expect(run('Springfield University').getIsLikelyName()).toBe(false);
  });

  it('rejects placeholder values', () => {
    expect(run('N/A').getIsLikelyName()).toBe(false);
    expect(run('Unknown').getIsLikelyName()).toBe(false);
    expect(run('test').getIsLikelyName()).toBe(false);
  });

  it('rejects empty input', () => {
    const r = run('');
    expect(r.getIsLikelyName()).toBe(false);
    expect(r.getError()).toBe('');
  });

  it('rejects garbage / digit-heavy input', () => {
    expect(run('12345').getIsLikelyName()).toBe(false);
    expect(run('a1b2c3d4e5').getIsLikelyName()).toBe(false);
  });

  it('rejects email/URL-shaped input', () => {
    expect(run('jane@example.com').getIsLikelyName()).toBe(false);
  });

  it('always returns non-empty reasons', () => {
    expect(run('Jane Public').getReasonsList().length).toBeGreaterThan(0);
    expect(run('Acme Corp LLC').getReasonsList().length).toBeGreaterThan(0);
  });

  it('confidence is within [0, 1]', () => {
    for (const name of ['Jane Public', 'Acme Corp LLC', 'N/A', '']) {
      const c = run(name).getConfidence();
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(1);
    }
  });

  it('is deterministic', () => {
    const a = run('Jane Public');
    const b = run('Jane Public');
    expect(a.toObject()).toEqual(b.toObject());
  });

  it('handles a large input without crashing (no payload-length cap)', () => {
    const r = run('A'.repeat(2000));
    expect(r.getError()).toBe('');
  });
});
