import { NameInput } from '../gen/messages_pb';
import { extractFirstName } from './extract_first_name';
import { ctx } from './testkit';
import { MAX_NAME_CHARS } from './lib';

function run(name: string) {
  const input = new NameInput();
  input.setName(name);
  return extractFirstName(ctx, input);
}

describe('ExtractFirstName', () => {
  // INDEPENDENT ORACLE: hand-reasoned expected first name for unambiguous
  // real-world name shapes.
  it('extracts the first name from a standard name', () => {
    const r = run('Dr. Jane Q. Public');
    expect(r.getFound()).toBe(true);
    expect(r.getValue()).toBe('Jane');
  });

  it('extracts the first name from "Last, First" order', () => {
    const r = run('Public, Jane');
    expect(r.getValue()).toBe('Jane');
  });

  it('is deterministic', () => {
    expect(run('Dr. Jane Q. Public').getValue()).toBe(run('Dr. Jane Q. Public').getValue());
  });

  it('found=false, not an error, when no first name identifiable', () => {
    const r = run('');
    expect(r.getError()).toBe('');
    expect(r.getFound()).toBe(false);
  });

  it('rejects oversized input as a structured error', () => {
    const r = run('A'.repeat(MAX_NAME_CHARS + 1));
    expect(r.getError()).toContain('exceeds');
  });
});
