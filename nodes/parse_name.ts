import { ParseNameInput, ParsedName } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { rawParse, toParsedNameMessage, errorMessage } from './lib';

/**
 * Parse a full name string in any order/format into structured components:
 * title, first, middle, last, nick(name), suffix. Handles "Last, First"
 * order, multi-word family-name particles (von/van/de/della), a wide
 * single-word title/rank catalog ("Dr.", "Rev.", and with extended_lists
 * also "Col.", "Gen.", "Capt.", etc. — but NOT a multi-word abbreviated
 * rank like "Lt. Col.", since the underlying library matches titles
 * word-by-word, not as phrases), suffixes ("Jr.", "III", "PhD"), and
 * nicknames in quotes or parentheses. Non-fatal ambiguities surface as
 * `warnings`; `error` is set only for an internal fault.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parseName(ax: AxiomContext, input: ParseNameInput): ParsedName {
  const name = input.getName();
  try {
    const trimmed = name.trim();
    const raw = rawParse(name, {
      fixCase: input.getFixCase(),
      extendedLists: input.getExtendedLists(),
    });
    return toParsedNameMessage(raw, trimmed);
  } catch (e) {
    const out = new ParsedName();
    out.setError(errorMessage(e, 'parsing name'));
    return out;
  }
}
