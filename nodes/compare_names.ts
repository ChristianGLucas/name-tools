import { CompareNamesInput, NameComparison } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkBounds, rawParse, toParsedNameMessage, compareParsedNames, errorMessage } from './lib';

/**
 * Compare two name strings for likely-same-person by normalizing and
 * comparing their parsed components (last name, first name or
 * first-initial match). Returns a `match_level`
 * ("exact"/"likely"/"partial"/"no_match"), a heuristic `score` in [0,1],
 * which fields matched, and both parsed breakdowns for inspection.
 * Comparison is deterministic and component-based — it does not consult
 * any nickname-equivalence dictionary (e.g. it will not match "Bob" to
 * "Robert" unless one string literally contains the other as a
 * first-name/initial).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function compareNames(ax: AxiomContext, input: CompareNamesInput): NameComparison {
  const out = new NameComparison();
  const nameA = input.getNameA();
  const nameB = input.getNameB();

  if (!nameA.trim() && !nameB.trim()) {
    out.setError('both name_a and name_b were empty');
    return out;
  }
  const boundsA = checkBounds(nameA);
  if (boundsA) {
    out.setError(`name_a: ${boundsA}`);
    return out;
  }
  const boundsB = checkBounds(nameB);
  if (boundsB) {
    out.setError(`name_b: ${boundsB}`);
    return out;
  }

  try {
    const rawA = rawParse(nameA);
    const rawB = rawParse(nameB);
    const parsedA = toParsedNameMessage(rawA, nameA.trim());
    const parsedB = toParsedNameMessage(rawB, nameB.trim());
    const result = compareParsedNames(rawA, rawB);

    out.setMatchLevel(result.matchLevel);
    out.setScore(result.score);
    out.setMatchedFieldsList(result.matchedFields);
    out.setParsedA(parsedA);
    out.setParsedB(parsedB);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'comparing names'));
    return out;
  }
}
