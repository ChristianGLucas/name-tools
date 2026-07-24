import { NameInput } from '../gen/messages_pb';
import { extractNickname } from './extract_nickname';
import { ctx } from './testkit';

function run(name: string) {
  const input = new NameInput();
  input.setName(name);
  return extractNickname(ctx, input);
}

describe('ExtractNickname', () => {
  // INDEPENDENT ORACLE: hand-verified expected nickname extraction from
  // the well-established convention (used consistently across name-parsing
  // tools, not tied to this package's implementation) that a nickname is
  // set off by quotes or parentheses.
  it('extracts a double-quoted nickname', () => {
    const r = run('Robert "Bob" Smith');
    expect(r.getFound()).toBe(true);
    expect(r.getValue()).toBe('Bob');
  });

  it('extracts a parenthetical nickname', () => {
    const r = run('Jane Smith (Janie)');
    expect(r.getFound()).toBe(true);
    expect(r.getValue()).toBe('Janie');
  });

  it('found=false, not an error, when no nickname is present', () => {
    const r = run('Jane Smith');
    expect(r.getError()).toBe('');
    expect(r.getFound()).toBe(false);
    expect(r.getValue()).toBe('');
  });

  it('is deterministic', () => {
    expect(run('Robert "Bob" Smith').getValue()).toBe(run('Robert "Bob" Smith').getValue());
  });

  it('handles a large input without crashing (no payload-length cap)', () => {
    const r = run('A'.repeat(2000));
    expect(r.getError()).toBe('');
  });
});
