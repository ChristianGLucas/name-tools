import { NameInput, NameResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { rawParse, errorMessage } from './lib';

/**
 * Extract just the last (family) name from a full name string of any
 * order/format, including multi-word particles, e.g. "Ludwig van der Berg"
 * -> "van der Berg". `found` is false (not an error) when no last name
 * could be identified.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractLastName(ax: AxiomContext, input: NameInput): NameResult {
  const out = new NameResult();
  const name = input.getName();
  try {
    const raw = rawParse(name);
    if (raw.last) {
      out.setValue(raw.last);
      out.setFound(true);
    } else {
      out.setFound(false);
    }
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting last name'));
    return out;
  }
}
