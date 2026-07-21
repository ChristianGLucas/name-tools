import { ExtractInitialsInput, NameResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkBounds, rawParse, computeInitials, errorMessage } from './lib';

/**
 * Extract initials from a full name string, e.g. "John Q. Public" -> "JQP"
 * (default). `separator` is placed BETWEEN initials, not appended after the
 * last one (e.g. ". " gives "J. Q. P", no trailing period); `exclude_middle`
 * (default false) can drop middle-name initials from the result.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractInitials(ax: AxiomContext, input: ExtractInitialsInput): NameResult {
  const out = new NameResult();
  const name = input.getName();
  const bounds = checkBounds(name);
  if (bounds) {
    out.setError(bounds);
    return out;
  }
  try {
    const raw = rawParse(name);
    const initials = computeInitials(raw, {
      separator: input.getSeparator(),
      includeMiddle: !input.getExcludeMiddle(),
    });
    if (initials) {
      out.setValue(initials);
      out.setFound(true);
    } else {
      out.setFound(false);
    }
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting initials'));
    return out;
  }
}
