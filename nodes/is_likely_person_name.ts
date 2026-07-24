import { NameInput, PersonNameLikelihood } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { assessPersonNameLikelihood, errorMessage } from './lib';

/**
 * Heuristically detect whether a string plausibly represents a human
 * personal name, as opposed to an organization/company name or garbage/
 * placeholder text (e.g. "Acme Corp LLC", "N/A", "12345"). Returns
 * `is_likely_name`, a heuristic `confidence` in [0,1] (a relative ranking
 * signal, not a calibrated probability), and human-readable `reasons`.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function isLikelyPersonName(ax: AxiomContext, input: NameInput): PersonNameLikelihood {
  const out = new PersonNameLikelihood();
  const name = input.getName();
  try {
    const result = assessPersonNameLikelihood(name);
    out.setIsLikelyName(result.isLikely);
    out.setConfidence(result.confidence);
    out.setReasonsList(result.reasons);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'assessing name likelihood'));
    return out;
  }
}
