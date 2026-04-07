// NLP-based commentary analysis for price-commentary validation

export type Direction = 'increase' | 'decrease' | 'stable' | 'unknown';

export interface SentenceAnalysis {
  text: string;
  direction: Direction;
  confidence: number; // 0-1
  keywords: string[];
}

export interface PeriodValidation {
  fromLabel: string;
  toLabel: string;
  priceFrom: number;
  priceTo: number;
  priceChange: number; // percentage
  priceDirection: Direction;
  commentaryDirection: Direction;
  matchedSentences: SentenceAnalysis[];
  isConsistent: boolean;
  mismatchReason?: string;
  suggestion?: string;
}

const INCREASE_KEYWORDS = [
  'increase', 'increased', 'increasing', 'rise', 'risen', 'rising', 'rose',
  'growth', 'grew', 'grow', 'growing', 'upward', 'up', 'higher', 'highs',
  'surge', 'surged', 'surging', 'spike', 'spiked', 'rally', 'rallied',
  'gain', 'gained', 'gaining', 'appreciate', 'appreciated', 'climb', 'climbed',
  'escalate', 'escalated', 'strengthen', 'strengthened', 'bullish', 'uptick',
  'recover', 'recovered', 'recovery', 'rebound', 'rebounded', 'boost', 'boosted',
  'elevated', 'expand', 'expanded', 'inflation', 'inflationary', 'soar', 'soared',
];

const DECREASE_KEYWORDS = [
  'decrease', 'decreased', 'decreasing', 'decline', 'declined', 'declining',
  'drop', 'dropped', 'dropping', 'fall', 'fallen', 'falling', 'fell',
  'lower', 'lows', 'down', 'downward', 'reduce', 'reduced', 'reduction',
  'shrink', 'shrunk', 'shrinking', 'slump', 'slumped', 'crash', 'crashed',
  'plunge', 'plunged', 'tumble', 'tumbled', 'weaken', 'weakened', 'bearish',
  'dip', 'dipped', 'slide', 'slid', 'erode', 'eroded', 'deflation',
  'soften', 'softened', 'contract', 'contracted', 'contraction', 'depreciate',
  'loss', 'lost', 'losing', 'deteriorate', 'deteriorated', 'plummet',
];

const STABLE_KEYWORDS = [
  'stable', 'steady', 'flat', 'unchanged', 'unchanged', 'constant',
  'neutral', 'sideways', 'range-bound', 'equilibrium', 'maintain', 'maintained',
  'hold', 'held', 'holding', 'consistent', 'stagnant', 'stagnation',
  'plateau', 'level', 'leveled', 'balanced', 'moderate', 'modest',
];

// Quarter/half references to scope sentences to specific periods
const PERIOD_PATTERNS: Record<string, RegExp[]> = {
  'Q1': [/\bq1\b/i, /\bfirst\s+quarter\b/i, /\bjan(uary)?\s*(to|through|[-–])\s*mar(ch)?\b/i],
  'Q2': [/\bq2\b/i, /\bsecond\s+quarter\b/i, /\bapr(il)?\s*(to|through|[-–])\s*jun(e)?\b/i],
  'Q3': [/\bq3\b/i, /\bthird\s+quarter\b/i, /\bjul(y)?\s*(to|through|[-–])\s*sep(t|tember)?\b/i],
  'Q4': [/\bq4\b/i, /\bfourth\s+quarter\b/i, /\boct(ober)?\s*(to|through|[-–])\s*dec(ember)?\b/i],
  'H1': [/\bh1\b/i, /\bfirst\s+half\b/i, /\b1st\s+half\b/i],
  'H2': [/\bh2\b/i, /\bsecond\s+half\b/i, /\b2nd\s+half\b/i],
};

function analyzeSentence(sentence: string): SentenceAnalysis {
  const lower = sentence.toLowerCase();
  const words = lower.split(/\s+/);

  let incScore = 0;
  let decScore = 0;
  let stabScore = 0;
  const foundKeywords: string[] = [];

  // Check for negation patterns
  const hasNegation = /\b(not|didn't|didn't|don't|no longer|never|hardly|barely|fail|failed)\b/i.test(lower);

  for (const w of words) {
    const cleanWord = w.replace(/[^a-z-]/g, '');
    if (INCREASE_KEYWORDS.includes(cleanWord)) {
      incScore++;
      foundKeywords.push(cleanWord);
    }
    if (DECREASE_KEYWORDS.includes(cleanWord)) {
      decScore++;
      foundKeywords.push(cleanWord);
    }
    if (STABLE_KEYWORDS.includes(cleanWord)) {
      stabScore++;
      foundKeywords.push(cleanWord);
    }
  }

  // Negation flips the primary direction
  if (hasNegation && incScore > 0 && decScore === 0) {
    decScore = incScore;
    incScore = 0;
  } else if (hasNegation && decScore > 0 && incScore === 0) {
    incScore = decScore;
    decScore = 0;
  }

  const total = incScore + decScore + stabScore;
  let direction: Direction = 'unknown';
  let confidence = 0;

  if (total > 0) {
    if (incScore > decScore && incScore > stabScore) {
      direction = 'increase';
      confidence = incScore / total;
    } else if (decScore > incScore && decScore > stabScore) {
      direction = 'decrease';
      confidence = decScore / total;
    } else if (stabScore > 0 && stabScore >= incScore && stabScore >= decScore) {
      direction = 'stable';
      confidence = stabScore / total;
    }
  }

  return { text: sentence.trim(), direction, confidence, keywords: foundKeywords };
}

function sentenceReferencePeriod(sentence: string, fromPeriod: string, toPeriod: string): boolean {
  const lower = sentence.toLowerCase();

  // Check if sentence mentions either period
  const fromPatterns = PERIOD_PATTERNS[fromPeriod] || [];
  const toPatterns = PERIOD_PATTERNS[toPeriod] || [];

  const mentionsFrom = fromPatterns.some(p => p.test(lower));
  const mentionsTo = toPatterns.some(p => p.test(lower));

  // Also check for transition phrases
  const transitionPattern = new RegExp(`${fromPeriod}\\s*(to|→|->|through|into|versus|vs)\\s*${toPeriod}`, 'i');
  if (transitionPattern.test(sentence)) return true;

  // If it mentions either period or the transition
  return mentionsFrom || mentionsTo;
}

export function getPriceDirection(change: number): Direction {
  if (Math.abs(change) < 0.5) return 'stable'; // less than 0.5% considered stable
  return change > 0 ? 'increase' : 'decrease';
}

export function validatePriceCommentary(
  prices: { label: string; value: number }[],
  commentary: string
): PeriodValidation[] {
  // Split commentary into sentences
  const sentences = commentary
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10); // skip very short fragments

  const results: PeriodValidation[] = [];

  for (let i = 0; i < prices.length - 1; i++) {
    const from = prices[i];
    const to = prices[i + 1];
    const change = from.value !== 0 ? ((to.value - from.value) / Math.abs(from.value)) * 100 : 0;
    const priceDir = getPriceDirection(change);

    // Find sentences relevant to this period transition
    const relevantSentences = sentences
      .map(s => analyzeSentence(s))
      .filter(s => {
        // Include if it references the periods, or if no period-specific sentences exist, include all directional ones
        const references = sentenceReferencePeriod(s.text, from.label, to.label);
        return references || s.direction !== 'unknown';
      });

    // Period-specific sentences take priority
    const periodSpecific = relevantSentences.filter(s => sentenceReferencePeriod(s.text, from.label, to.label));
    const matchedSentences = periodSpecific.length > 0 ? periodSpecific : relevantSentences;

    // Determine overall commentary direction for this period
    let commentaryDir: Direction = 'unknown';
    if (matchedSentences.length > 0) {
      const dirCounts = { increase: 0, decrease: 0, stable: 0, unknown: 0 };
      matchedSentences.forEach(s => {
        dirCounts[s.direction] += s.confidence;
      });

      const maxDir = Object.entries(dirCounts)
        .filter(([k]) => k !== 'unknown')
        .sort((a, b) => b[1] - a[1])[0];

      if (maxDir && maxDir[1] > 0) {
        commentaryDir = maxDir[0] as Direction;
      }
    }

    // Check consistency
    let isConsistent = true;
    let mismatchReason: string | undefined;
    let suggestion: string | undefined;

    if (commentaryDir !== 'unknown' && priceDir !== 'stable' && commentaryDir !== 'stable') {
      if (priceDir === 'increase' && commentaryDir === 'decrease') {
        isConsistent = false;
        mismatchReason = `Price increased ${change.toFixed(1)}% (${from.label} → ${to.label}), but commentary indicates a decline.`;
        suggestion = `Consider revising commentary to reflect the upward price movement from ${from.label} to ${to.label}.`;
      } else if (priceDir === 'decrease' && commentaryDir === 'increase') {
        isConsistent = false;
        mismatchReason = `Price decreased ${change.toFixed(1)}% (${from.label} → ${to.label}), but commentary indicates growth.`;
        suggestion = `Consider revising commentary to reflect the downward price movement from ${from.label} to ${to.label}.`;
      }
    }

    results.push({
      fromLabel: from.label,
      toLabel: to.label,
      priceFrom: from.value,
      priceTo: to.value,
      priceChange: change,
      priceDirection: priceDir,
      commentaryDirection: commentaryDir,
      matchedSentences,
      isConsistent,
      mismatchReason,
      suggestion,
    });
  }

  return results;
}

export function getOverallStatus(validations: PeriodValidation[]): 'consistent' | 'partial' | 'major' {
  const mismatches = validations.filter(v => !v.isConsistent);
  if (mismatches.length === 0) return 'consistent';
  if (mismatches.length <= 1) return 'partial';
  return 'major';
}
