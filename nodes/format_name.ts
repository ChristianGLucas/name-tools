import { FormatNameInput, FormatNameOutput, ParsedName } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkBounds, rawParse, buildFormattedName, errorMessage } from './lib';
import { RawParsedName } from 'parse-full-name';

function toRaw(p: ParsedName): RawParsedName {
  return {
    title: p.getTitle(),
    first: p.getFirst(),
    middle: p.getMiddle(),
    last: p.getLast(),
    nick: p.getNick(),
    suffix: p.getSuffix(),
    error: [],
  };
}

function isEmptyParsedName(p: ParsedName): boolean {
  return (
    !p.getTitle() &&
    !p.getFirst() &&
    !p.getMiddle() &&
    !p.getLast() &&
    !p.getNick() &&
    !p.getSuffix()
  );
}

/**
 * Format structured name components (or a raw name string, parsed
 * internally) into a chosen order: "first_last" -> "First Last",
 * "last_first" -> "Last First", "last_comma_first" -> "Last, First",
 * "first_middle_last" -> "First Middle Last", "first_initial_last" ->
 * "First M. Last", or "formal" -> "Title First Middle Last, Suffix". Empty
 * components and their separators are omitted automatically.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function formatName(ax: AxiomContext, input: FormatNameInput): FormatNameOutput {
  const out = new FormatNameOutput();
  const structured = input.getName();
  const raw = input.getNameRaw();
  const order = input.getOrder();

  try {
    let components: RawParsedName;
    if (structured && !isEmptyParsedName(structured)) {
      components = toRaw(structured);
    } else if (raw) {
      const bounds = checkBounds(raw);
      if (bounds) {
        out.setError(bounds);
        return out;
      }
      components = rawParse(raw);
    } else {
      out.setError('both name and name_raw were empty');
      return out;
    }
    out.setFormatted(buildFormattedName(components, order));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'formatting name'));
    return out;
  }
}
