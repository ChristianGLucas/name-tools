import { NameInput } from '../gen/messages_pb';
import { extractLastName } from './extract_last_name';
import { ctx } from './testkit';
import { MAX_NAME_CHARS } from './lib';

function run(name: string) {
  const input = new NameInput();
  input.setName(name);
  return extractLastName(ctx, input);
}

describe('ExtractLastName', () => {
  // INDEPENDENT ORACLE: hand-reasoned expected last name for unambiguous
  // real-world name shapes, including a multi-word particle.
  it('extracts the last name from a standard name', () => {
    const r = run('Dr. Jane Q. Public');
    expect(r.getFound()).toBe(true);
    expect(r.getValue()).toBe('Public');
  });

  it('extracts a multi-word family-name particle', () => {
    const r = run('Ludwig van der Berg');
    expect(r.getValue()).toBe('van der Berg');
  });

  it('extracts the last name from "Last, First" order', () => {
    const r = run('Public, Jane');
    expect(r.getValue()).toBe('Public');
  });

  it('found=false, not an error, when no last name identifiable', () => {
    const r = run('');
    expect(r.getError()).toBe('');
    expect(r.getFound()).toBe(false);
  });

  it('rejects oversized input as a structured error', () => {
    const r = run('A'.repeat(MAX_NAME_CHARS + 1));
    expect(r.getError()).toContain('exceeds');
  });
});
