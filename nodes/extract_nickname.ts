import { NameInput, NameResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkBounds, rawParse, errorMessage } from './lib';

/**
 * Extract a nickname from a quoted or parenthetical segment of a full name
 * string, e.g. 'Robert "Bob" Smith' -> "Bob", "Jane Smith (Janie)" ->
 * "Janie". `found` is false (not an error) when no nickname segment is
 * present.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractNickname(ax: AxiomContext, input: NameInput): NameResult {
  const out = new NameResult();
  const name = input.getName();
  const bounds = checkBounds(name);
  if (bounds) {
    out.setError(bounds);
    return out;
  }
  try {
    const raw = rawParse(name);
    if (raw.nick) {
      out.setValue(raw.nick);
      out.setFound(true);
    } else {
      out.setFound(false);
    }
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting nickname'));
    return out;
  }
}
