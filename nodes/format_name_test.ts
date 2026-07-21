import { FormatNameInput, ParsedName } from '../gen/messages_pb';
import { formatName } from './format_name';
import { ctx } from './testkit';
import { MAX_NAME_CHARS } from './lib';

function structured(fields: Partial<{ title: string; first: string; middle: string; last: string; suffix: string }>): ParsedName {
  const p = new ParsedName();
  if (fields.title) p.setTitle(fields.title);
  if (fields.first) p.setFirst(fields.first);
  if (fields.middle) p.setMiddle(fields.middle);
  if (fields.last) p.setLast(fields.last);
  if (fields.suffix) p.setSuffix(fields.suffix);
  return p;
}

describe('FormatName', () => {
  const jane = { first: 'Jane', middle: 'Quincy', last: 'Public', title: 'Dr.', suffix: 'PhD' };

  // INDEPENDENT ORACLE: hand-constructed expected strings for each order —
  // plain string concatenation any reader can verify by eye, not derived
  // from running this package's own formatting code.
  it('formats first_last (default)', () => {
    const input = new FormatNameInput();
    input.setName(structured(jane));
    const r = formatName(ctx, input);
    expect(r.getFormatted()).toBe('Jane Public');
  });

  it('formats last_first', () => {
    const input = new FormatNameInput();
    input.setName(structured(jane));
    input.setOrder('last_first');
    expect(formatName(ctx, input).getFormatted()).toBe('Public Jane');
  });

  it('formats last_comma_first', () => {
    const input = new FormatNameInput();
    input.setName(structured(jane));
    input.setOrder('last_comma_first');
    expect(formatName(ctx, input).getFormatted()).toBe('Public, Jane Quincy');
  });

  it('formats first_middle_last', () => {
    const input = new FormatNameInput();
    input.setName(structured(jane));
    input.setOrder('first_middle_last');
    expect(formatName(ctx, input).getFormatted()).toBe('Jane Quincy Public');
  });

  it('formats first_initial_last', () => {
    const input = new FormatNameInput();
    input.setName(structured(jane));
    input.setOrder('first_initial_last');
    expect(formatName(ctx, input).getFormatted()).toBe('Jane Q. Public');
  });

  it('formats formal', () => {
    const input = new FormatNameInput();
    input.setName(structured(jane));
    input.setOrder('formal');
    expect(formatName(ctx, input).getFormatted()).toBe('Dr. Jane Quincy Public, PhD');
  });

  it('omits empty components and their separators', () => {
    const input = new FormatNameInput();
    input.setName(structured({ first: 'Jane', last: 'Public' }));
    input.setOrder('formal');
    expect(formatName(ctx, input).getFormatted()).toBe('Jane Public');
  });

  it('falls back to first_last for an unrecognized order', () => {
    const input = new FormatNameInput();
    input.setName(structured(jane));
    input.setOrder('not_a_real_order');
    expect(formatName(ctx, input).getFormatted()).toBe('Jane Public');
  });

  it('parses name_raw internally when `name` is empty (convenience field)', () => {
    const input = new FormatNameInput();
    input.setNameRaw('Smith, Jane');
    input.setOrder('first_last');
    expect(formatName(ctx, input).getFormatted()).toBe('Jane Smith');
  });

  it('prefers structured `name` over `name_raw` when both are set', () => {
    const input = new FormatNameInput();
    input.setName(structured({ first: 'Alice', last: 'Anderson' }));
    input.setNameRaw('Smith, Jane');
    expect(formatName(ctx, input).getFormatted()).toBe('Alice Anderson');
  });

  it('errors when both name and name_raw are empty', () => {
    const input = new FormatNameInput();
    const r = formatName(ctx, input);
    expect(r.getError()).toContain('empty');
    expect(r.getFormatted()).toBe('');
  });

  it('rejects oversized name_raw as a structured error', () => {
    const input = new FormatNameInput();
    input.setNameRaw('A'.repeat(MAX_NAME_CHARS + 1));
    const r = formatName(ctx, input);
    expect(r.getError()).toContain('exceeds');
  });

  // REGRESSION (adversarial review, commit c11feef): the structured `name`
  // path never bound-checked its component fields (only name_raw was
  // checked), so an oversized field on the structured input path bypassed
  // the input-length contract every other node enforces.
  it('rejects an oversized structured component field as a structured error', () => {
    const input = new FormatNameInput();
    input.setName(structured({ first: 'A'.repeat(MAX_NAME_CHARS + 1), last: 'Smith' }));
    const r = formatName(ctx, input);
    expect(r.getError()).toContain('exceeds');
    expect(r.getFormatted()).toBe('');
  });
});
