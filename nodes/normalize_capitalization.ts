import { NameInput, NameResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { normalizeNameCapitalization, errorMessage } from './lib';

/**
 * Correctly re-case a name string using name-particle capitalization rules,
 * not naive Title Case: "mcdonald" -> "McDonald", "o'brien" -> "O'Brien",
 * "VAN DER BERG" -> "van der Berg" (connector particles lowercase
 * mid-name), "macleod" -> "MacLeod" (curated common Mac-clan-surname list,
 * to avoid false positives on ordinary words like "Machine" or "Mace").
 * Works on a single name component or a multi-word full name.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function normalizeCapitalization(ax: AxiomContext, input: NameInput): NameResult {
  const out = new NameResult();
  const name = input.getName();
  try {
    const trimmed = name.trim();
    if (!trimmed) {
      out.setFound(false);
      return out;
    }
    out.setValue(normalizeNameCapitalization(trimmed));
    out.setFound(true);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'normalizing capitalization'));
    return out;
  }
}
