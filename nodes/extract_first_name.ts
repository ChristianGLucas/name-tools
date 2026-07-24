import { NameInput, NameResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { rawParse, errorMessage } from './lib';

/**
 * Extract just the first (given) name from a full name string of any
 * order/format, e.g. "Dr. Jane Q. Public" -> "Jane". `found` is false (not
 * an error) when no first name could be identified.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractFirstName(ax: AxiomContext, input: NameInput): NameResult {
  const out = new NameResult();
  const name = input.getName();
  try {
    const raw = rawParse(name);
    if (raw.first) {
      out.setValue(raw.first);
      out.setFound(true);
    } else {
      out.setFound(false);
    }
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting first name'));
    return out;
  }
}
